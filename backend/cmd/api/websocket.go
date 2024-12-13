package main

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type Client struct {
	Conn   *websocket.Conn
	UserId string
}

type WebSocketServer struct {
	Client map[Client]bool
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
		Client: make(map[Client]bool),
	}
}

func (app *Applications) WebsocketHandler(c *gin.Context) {
	userId := c.Query("id")

	fmt.Println("userId", userId)

	// upgrade http connection to websocket connection
	connection, err := upgrade.Upgrade(c.Writer, c.Request, nil)

	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
	}

	client := &Client{
		Conn:   connection,
		UserId: userId,
	}

	app.webSocket.Client[*client] = true

	for {
		messageType, message, err := connection.ReadMessage()

		if err != nil {
			fmt.Println("err", err.Error())
			break
		}
		fmt.Println("message", string(message))
		app.BroadcastMessage(client, messageType, message)
		// go messageHandler(message)
	}
}

func (app *Applications) BroadcastMessage(sender *Client, messageType int, message []byte) {

	for client := range app.webSocket.Client {

		if client.UserId == sender.UserId {
			continue
		}
		fmt.Println("message", string(message))

		if err := client.Conn.WriteMessage(messageType, message); err != nil {
			fmt.Println("error", err.Error())
			client.Conn.Close()
			delete(app.webSocket.Client, client)
		}
	}
}
