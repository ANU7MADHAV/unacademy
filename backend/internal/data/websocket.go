package data

import (
	"encoding/json"
	"sync"

	"github.com/gorilla/websocket"
)

type DrawingMessage struct {
	Type      string  `json:"type"`
	RoomId    string  `json:"roomId"`
	X         float32 `json:"x"`
	Y         float32 `json:"y"`
	LineWidth float64 `json:"lineWidth"`
	IsDrawing bool    `json:"isDrawing"`
}

type Client struct {
	Conn     *websocket.Conn
	RoomID   string
	SendChan chan []byte
}

type RoomState struct {
	Clients map[*Client]bool
	Mu      sync.RWMutex
	History []json.RawMessage
}

type Hub struct {
	Rooms      map[string]*RoomState
	Register   chan *Client
	Unregister chan *Client
	Mutex      sync.RWMutex
}

func NewHub() *Hub {
	hub := &Hub{
		Rooms:      make(map[string]*RoomState),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
	}
	go hub.run()
	return hub
}

func NewWebSocketService() *WebSocketService {
	return &WebSocketService{
		hub: NewHub(),
	}
}

func (ws *WebSocketService) GetHub() *Hub {
	return ws.hub
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.registerClient(client)
		case client := <-h.Unregister:
			h.unregisterClient(client)
		}
	}
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.Register:
			h.registerClient(client)
		case client := <-h.Unregister:
			h.unregisterClient(client)
		}
	}
}

func (h *Hub) registerClient(client *Client) {
	h.Mutex.Lock()
	defer h.Mutex.Unlock()

	if _, exists := h.Rooms[client.RoomID]; !exists {
		h.Rooms[client.RoomID] = &RoomState{
			Clients: make(map[*Client]bool),
			History: []json.RawMessage{},
		}
	}

	room := h.Rooms[client.RoomID]
	room.Mu.Lock()
	room.Clients[client] = true
	room.Mu.Unlock()

	h.sendDrawHistory(client)
}

func (h *Hub) unregisterClient(client *Client) {
	h.Mutex.Lock()
	defer h.Mutex.Unlock()

	room, exists := h.Rooms[client.RoomID]
	if !exists {
		return
	}

	room.Mu.Lock()
	delete(room.Clients, client)
	room.Mu.Unlock()

	if len(room.Clients) == 0 {
		delete(h.Rooms, client.RoomID)
	}
}

func (h *Hub) Broadcast(roomId string, message []byte) {
	h.Mutex.RLock()
	room, exists := h.Rooms[roomId]
	h.Mutex.RUnlock()

	if !exists {
		return
	}

	room.Mu.Lock()
	room.History = append(room.History, message)
	if len(room.History) > 100 {
		room.History = room.History[len(room.History)-100:]
	}
	room.Mu.Unlock()

	room.Mu.Lock()
	defer room.Mu.Unlock()

	for client := range room.Clients {
		select {
		case client.SendChan <- message:
		default:
			close(client.SendChan)
			delete(room.Clients, client)
		}
	}
}

func (h *Hub) sendDrawHistory(client *Client) {
	room := h.Rooms[client.RoomID]
	room.Mu.Lock()
	defer room.Mu.Unlock()

	for _, event := range room.History {
		select {
		case client.SendChan <- event:
		default:
			close(client.SendChan)
			delete(room.Clients, client)
			return
		}
	}
}

type WebSocketService struct {
	hub *Hub
}
