package main

import (
	"context"
	"crypto/rand"
	"encoding/json"
	"fmt"
	"log"

	"github.com/gorilla/websocket"

	kafka "github.com/segmentio/kafka-go"
)

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

func GenerateRandomBytes(n int) ([]byte, error) {
	b := make([]byte, n)
	_, err := rand.Read(b)
	if err != nil {
		return nil, err
	}

	return b, nil
}

func (k *KafkaRecordigRecording) RecordingEvent(event any) error {
	var jsonEvent []byte
	var err error

	switch v := event.(type) {
	case string:
		jsonEvent = []byte(v)
	default:
		jsonEvent, err = json.Marshal(event)
		if err != nil {
			return fmt.Errorf("failed to marshal event: %w", err)
		}
	}

	b, err := GenerateRandomBytes(32)
	if err != nil {
		return fmt.Errorf("failed to generate random bytes: %w", err)
	}

	fmt.Println("check")

	return k.writer.WriteMessages(context.Background(), kafka.Message{
		Key:   b,
		Value: jsonEvent,
	})
}

func (k *KafkaRecordigRecording) ReplayDrawingEvent() {

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
		return fmt.Errorf("failed to unmarshal message: %w", err)
	}

	if wsMessage.Type == "sendStroke" {
		dummyAppState := wsMessage.STROKE.AppState
		dummyAppState.Collaborators = []interface{}{}
		dummyAppState.ViewModelEnabled = true

		broadcastMessage := WebSocketMessage{
			Type: "strokeData",
			STROKE: StrokeData{
				Elements: wsMessage.STROKE.Elements,
				AppState: dummyAppState,
			},
		}
		fmt.Println("broadcastMessage", broadcastMessage)

		go func() {
			if err := app.KafkaRecordigRecording.RecordingEvent(broadcastMessage); err != nil {
				log.Printf("Failed to record event to Kafka: %v", err)
			}
		}()

		broadcastData, err := json.Marshal(broadcastMessage)
		if err != nil {
			return fmt.Errorf("failed to marshal broadcast message: %w", err)
		}

		app.webSocket.mu.RLock()
		roomClients, exists := app.webSocket.rooms[send.RoomId]

		if !exists {
			app.webSocket.mu.RUnlock()
			return fmt.Errorf("room %s not found", send.RoomId)
		}
		app.webSocket.mu.RUnlock()

		for client := range roomClients {
			if send.UserId == client.UserId {
				continue
			}

			if err := client.Conn.WriteMessage(websocket.TextMessage, broadcastData); err != nil {
				log.Printf("Failed to write to websocket: %v", err)
				client.Conn.Close()
			}
		}
	}

	return nil
}
