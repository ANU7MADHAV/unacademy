package main

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type StrokeData struct {
	Elements []interface{} `json:"elements"`
	AppState AppState      `json:"appState"`
}

type AppState struct {
	Collaborators     interface{} `json:"collaborators,omitempty"`
	ViewModelEnabled  bool        `json:"ViewModelEnabled,omitempty"`
	Theme             string      `json:"theme,omitempty"`
	CurrentItemColors string      `json:"currentItemColors,omitempty"`
}

type WebSocketMessage struct {
	Type   string     `json:"type"`
	STROKE StrokeData `json:"stroke"`
}

type Client struct {
	Conn   *websocket.Conn
	UserId string
	RoomId string
}

type WebSocketServer struct {
	Client map[Client]bool
	rooms  map[string]map[*Client]bool
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
		rooms:  make(map[string]map[*Client]bool),
	}
}

func (app *Applications) WebsocketHandler(c *gin.Context) {
	userId := c.Query("id")
	roomId := c.Param("roomId")

	fmt.Println("userId", userId)
	fmt.Println("roomId", roomId)

	if roomId == "" {
		app.logger.Println("roomId is missing")
	}

	// upgrade http connection to websocket connection
	connection, err := upgrade.Upgrade(c.Writer, c.Request, nil)

	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
	}

	client := &Client{
		Conn:   connection,
		UserId: userId,
		RoomId: roomId,
	}

	roomClients, exists := app.webSocket.rooms[roomId]

	if !exists {
		roomClients = make(map[*Client]bool)
		app.webSocket.rooms[roomId] = roomClients
	}

	roomClients[client] = true

	app.webSocket.Client[*client] = true

	for {
		_, message, err := connection.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				app.logger.Printf("WebSocket read error: %v", err)
			}
			break
		}

		fmt.Println("message", string(message))
		if err := app.HandleStrokeMessage(client, message); err != nil {
			app.logger.Printf("Error handling stroke message: %v", err)
		}

	}
}

func (app *Applications) HandleStrokeMessage(send *Client, message []byte) error {
	var wsMessage WebSocketMessage

	if err := json.Unmarshal(message, &wsMessage); err != nil {
		app.logger.Printf("Error parsing stroke message %v", err)
		return err
	}

	if wsMessage.Type == "sendStroke" {
		dummyAppState := wsMessage.STROKE.AppState
		dummyAppState.Collaborators = []interface{}{}
		dummyAppState.ViewModelEnabled = true

		broadCasteMessage := WebSocketMessage{
			Type: "strokeData",
			STROKE: StrokeData{
				Elements: wsMessage.STROKE.Elements,
				AppState: dummyAppState,
			},
		}

		fmt.Println("broadcastMessage", broadCasteMessage)

		broadcastData, err := json.Marshal(broadCasteMessage)
		if err != nil {
			app.logger.Printf("Error marshaling broadcast message: %v", err)
			return err
		}

		fmt.Println("client", send)

		roomClients, exists := app.webSocket.rooms[send.RoomId]

		fmt.Println("client", roomClients)

		if !exists {
			fmt.Println("error not exist")
		}

		for client := range roomClients {
			if client.UserId == send.UserId {
				continue
			}

			if err := client.Conn.WriteMessage(websocket.TextMessage, broadcastData); err != nil {
				fmt.Println("error", err.Error())
				client.Conn.Close()

			}

		}
	}
	return nil
}
