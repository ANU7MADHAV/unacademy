package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type WebSocketServer struct {
	Client map[*websocket.Conn]bool
}

var upgrade = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func NewWebSocketService() *WebSocketServer {
	return &WebSocketServer{
		Client: make(map[*websocket.Conn]bool),
	}
}

func (app *Applications) WebsocketHandler(c *gin.Context) {
	// upgrade http connection to websocket connection
	connection, err := upgrade.Upgrade(c.Writer, c.Request, nil)

	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
	}

	for {
		messageType, message, err := connection.ReadMessage()

		if err != nil {
			fmt.Println("err", err.Error())
			break
		}

		if err := connection.WriteMessage(messageType, message); err != nil {
			log.Println(err)
			return
		}
		go messageHandler(message)
	}
}

func messageHandler(message []byte) {
	fmt.Println(string(message))
}
