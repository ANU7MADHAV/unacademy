package main

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/segmentio/kafka-go"
)

type DrawingEvent struct {
	ID        uuid.UUID `json:"id"`
	RoomID    string    `json:"room_id"`
	UserID    string    `json:"user_id"`
	TimeStamp time.Time `json:"time"`
	Type      string    `json:"type"`
	Payload   StrokeData
}

type KafkaRecordigRecording struct {
	writer *kafka.Writer
	reader *kafka.Reader
}

func NewRecodringDrawing(kafkaBrokers []string, topic string) *KafkaRecordigRecording {
	writer := &kafka.Writer{
		Addr:     kafka.TCP(kafkaBrokers...),
		Topic:    topic,
		Balancer: &kafka.LeastBytes{},
	}

	reader := kafka.NewReader(kafka.ReaderConfig{
		Brokers: kafkaBrokers,
		Topic:   topic,
		GroupID: "drawing-topic",
	})

	return &KafkaRecordigRecording{
		writer: writer,
		reader: reader,
	}

}

func (k *KafkaRecordigRecording) RecordingEvent(event DrawingEvent) error {
	jsonEvent, err := json.Marshal(event)

	if err != nil {
		fmt.Println("error", err.Error())
	}

	return k.writer.WriteMessages(context.Background(), kafka.Message{
		Key:   []byte(event.RoomID),
		Value: jsonEvent,
	})

}

func (k *KafkaRecordigRecording) ReplyDrawingEvent(roomID string) (<-chan DrawingEvent, error) {
	err := k.reader.SetOffset(kafka.FirstOffset)

	if err != nil {
		fmt.Println("error", err.Error())
	}

	eventChan := make(chan DrawingEvent)

	go func() {
		defer close(eventChan)

		for {
			message, err := k.reader.ReadMessage(context.Background())

			if err != nil {
				break
			}

			var eventDrawing DrawingEvent

			if err := json.Unmarshal(message.Value, &eventDrawing); err != nil {
				continue
			}

			if eventDrawing.RoomID == roomID {
				eventChan <- eventDrawing
			}
		}
	}()
	return eventChan, nil
}

func (app *Applications) HadleStrokeMessage(send *Client, message []byte) error {
	var wsMessage WebSocketMessage

	if err := json.Unmarshal(message, &wsMessage); err != nil {
		fmt.Println("error", err.Error())
	}
	if wsMessage.Type == "sendStroke" {
		drawingEvent := DrawingEvent{
			ID:        uuid.New(),
			RoomID:    send.RoomId,
			UserID:    send.UserId,
			TimeStamp: time.Now(),
			Type:      "stroke",
			Payload: StrokeData{
				Elements: wsMessage.STROKE.Elements,
				AppState: wsMessage.STROKE.AppState,
			},
		}

		fmt.Println("hello-ws", wsMessage)

		go func() {

			if err := app.KafkaRecordigRecording.RecordingEvent(drawingEvent); err != nil {
				fmt.Println("error", err.Error())
			}
		}()

		dummyAppState := wsMessage.STROKE.AppState
		dummyAppState.Collaborators = []interface{}{}
		dummyAppState.ViewModelEnabled = true

		broadcasteMessage := WebSocketMessage{
			Type: "strokeData",
			STROKE: StrokeData{
				Elements: wsMessage.STROKE.Elements,
				AppState: dummyAppState,
			},
		}
		fmt.Println("broadcastMessage", broadcasteMessage)
		broadcastData, err := json.Marshal(broadcasteMessage)

		if err != nil {
			fmt.Println("err", err.Error())
		}

		fmt.Println("broadcast", broadcastData)
		fmt.Println("client", send)

		app.webSocket.mu.RLock()

		roomClients, exists := app.webSocket.rooms[send.RoomId]

		fmt.Println("roomClients", roomClients)

		if !exists {
			fmt.Println("error", err.Error())
		}

		app.webSocket.mu.RUnlock()
		for client := range roomClients {
			fmt.Println("client", client)
			if send.UserId == client.UserId {
				continue
			}

			if err := client.Conn.WriteMessage(websocket.TextMessage, broadcastData); err != nil {
				fmt.Println("err", err.Error())
				client.Conn.Close()
			}

		}
	}

	return nil

}
