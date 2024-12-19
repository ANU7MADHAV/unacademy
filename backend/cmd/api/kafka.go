package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	kafka "github.com/segmentio/kafka-go"
)

type ReplayResponse struct {
	Events []DrawingEvent `json:"events"`
}

func (app *Applications) HandleReplay(c *gin.Context) {
	roomID := c.Param("roomId")

	reader := kafka.NewReader(kafka.ReaderConfig{
		Brokers:   []string{"localhost:9092"},
		Topic:     "drawing",
		Partition: 0,
		MaxBytes:  10e6,
	})
	defer reader.Close()

	var events []DrawingEvent

	reader.SetOffset(0)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)

	defer cancel()

	for {
		m, err := reader.ReadMessage(ctx)
		if err != nil {
			fmt.Printf("Stopped reading messages due to: %v\n", err)
			break
		}

		if string(m.Key) == roomID {
			var event DrawingEvent
			if err := json.Unmarshal(m.Value, &event); err != nil {
				fmt.Printf("Failed to Unmarshal the message : %v\n", err.Error())
				continue
			}

			events = append(events, event)

		}
	}

	encoder := json.NewEncoder(c.Writer)
	if err := encoder.Encode(ReplayResponse{Events: events}); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send response"})
		return
	}
}
