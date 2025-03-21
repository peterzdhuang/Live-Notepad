package server

import (
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

type Client struct {
	writeChan chan interface{}
	conn      *websocket.Conn
	username  string
	uuid      string
	done      chan struct{}
}

type Room struct {
	RoomName      string
	Content       string
	Clients       []*Client
	operationChan chan Operation
	mu            sync.Mutex
}

var (
	rooms      = make(map[string]*Room)
	roomsMutex sync.Mutex
)

type Operation struct {
	Type       string `json:"type"`      // "insert" or "delete"
	Position   int    `json:"position"`  // Position in the document
	Character  string `json:"character"` // Character to insert (for insert only)
	SenderUUID string `json:"senderUUID"`
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}
