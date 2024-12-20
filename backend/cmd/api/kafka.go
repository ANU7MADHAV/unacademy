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
	Events []WebSocketMessage `json:"events"`
}

type Element struct {
	Angle              float64       `json:"angle"`
	BackgroundColor    string        `json:"backgroundColor"`
	BoundElements      interface{}   `json:"boundElements"`
	FillStyle          string        `json:"fillStyle"`
	FrameID            interface{}   `json:"frameId"`
	GroupIds           []interface{} `json:"groupIds"`
	Height             float64       `json:"height"`
	ID                 string        `json:"id"`
	IsDeleted          bool          `json:"isDeleted"`
	LastCommittedPoint []float64     `json:"lastCommittedPoint"`
	Link               interface{}   `json:"link"`
	Locked             bool          `json:"locked"`
	Opacity            int           `json:"opacity"`
	Points             [][]float64   `json:"points"`
	Pressures          []interface{} `json:"pressures"`
	Roughness          int           `json:"roughness"`
	Roundness          interface{}   `json:"roundness"`
	Seed               int           `json:"seed"`
	SimulatePressure   bool          `json:"simulatePressure"`
	StrokeColor        string        `json:"strokeColor"`
	StrokeStyle        string        `json:"strokeStyle"`
	StrokeWidth        int           `json:"strokeWidth"`
	Type               string        `json:"type"`
	Updated            int64         `json:"updated"`
	Version            int           `json:"version"`
	VersionNonce       int64         `json:"versionNonce"`
	Width              float64       `json:"width"`
	X                  float64       `json:"x"`
	Y                  float64       `json:"y"`
}

func (app *Applications) HandleReplay(c *gin.Context) {
	// roomID := c.Param("roomId")

	reader := kafka.NewReader(kafka.ReaderConfig{
		Brokers:   []string{"localhost:9092"},
		Topic:     "drawing",
		Partition: 0,
		MaxBytes:  10e6,
	})
	defer reader.Close()

	var events []WebSocketMessage
	reader.SetOffset(0)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	for {
		m, err := reader.ReadMessage(ctx)
		if err != nil {
			fmt.Printf("Stopped reading messages due to: %v\n", err)
			break
		}

		// Debug: Print raw message
		fmt.Printf("Raw message: %s\n", string(m.Value))

		var event WebSocketMessage
		if err := json.Unmarshal(m.Value, &event); err != nil {
			fmt.Printf("Failed to Unmarshal the message: %v\n", err.Error())
			// Print the actual message that failed to unmarshal
			fmt.Printf("Message content: %s\n", string(m.Value))
			continue
		}

		// Debug: Print unmarshaled event
		fmt.Printf("Unmarshaled event: %+v\n", event)

		// Only append if the event has content
		if len(event.STROKE.Elements) > 0 || event.Type != "" {
			events = append(events, event)
		}
	}

	// Send response
	c.JSON(http.StatusOK, ReplayResponse{Events: events})
}
