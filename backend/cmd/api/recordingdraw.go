package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"

	kafka "github.com/segmentio/kafka-go"
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
		Brokers:   []string{"localhost:9092"},
		Topic:     "drawing",
		Partition: 0,
		MaxBytes:  10e6, // 10MB
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

func (k *KafkaRecordigRecording) ReplyDrawingEvent() {

	k.reader.SetOffset(1)

	for {
		m, err := k.reader.ReadMessage(context.Background())
		if err != nil {
			break
		}
		fmt.Printf("message at offset %d: %s = %s\n", m.Offset, string(m.Key), string(m.Value))
	}

	if err := k.reader.Close(); err != nil {
		log.Fatal("failed to close reader:", err)
	}

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

		broadcastData, err := json.Marshal(broadcasteMessage)

		if err != nil {
			fmt.Println("err", err.Error())
		}

		app.webSocket.mu.RLock()

		roomClients, exists := app.webSocket.rooms[send.RoomId]

		if !exists {
			fmt.Println("error", err.Error())
		}

		app.webSocket.mu.RUnlock()
		//
		// 		events, err := app.KafkaRecordigRecording.ReplyDrawingEvent(send.RoomId)
		//
		// 		if err != nil {
		// 			fmt.Println("error", err.Error())
		// 		}
		//
		// 		for event := range events {
		// 			fmt.Println("events", event)
		// 		}

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
