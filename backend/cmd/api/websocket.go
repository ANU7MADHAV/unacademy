package main

import (
	"log"
	"net/http"
	"uncademy-app/internals/data"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {

		return true
	},
}

func (app *Applications) WebsocketHandler(c *gin.Context) {
	roomId := c.Query("roomId")
	if roomId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "RoomId is required"})
		return
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		app.logger.Printf("WebSocket upgrade failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upgrade connection"})
		return
	}

	client := &data.Client{
		Conn:     conn,
		RoomID:   roomId,
		SendChan: make(chan []byte, 256),
	}

	hub := app.wsService.GetHub()
	hub.Register <- client

	go func() {
		defer func() {
			conn.Close()
			close(client.SendChan)
			hub.Unregister <- client
		}()

		for {
			_, message, err := conn.ReadMessage()
			if err != nil {
				log.Println("Read error:", err)
				break
			}

			hub.Broadcast(roomId, message)
		}
	}()

	go func() {
		for message := range client.SendChan {
			err := conn.WriteMessage(websocket.TextMessage, message)
			if err != nil {
				log.Println("Write error:", err)
				break
			}
		}
	}()
}
