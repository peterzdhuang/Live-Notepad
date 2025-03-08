package handlers

import (
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

const (
	MessageTypeJoin     = "join"
	MessageTypeLeave    = "leave"
	MessageTypeText     = "text"
	MessageTypeCursor   = "cursor"
	MessageTypeSync     = "sync"
	MessageTypeRoomList = "room_list"
)

type Client struct {
	ID       uuid.UUID
	conn     *websocket.Conn
	docID    uuid.UUID
	username string
}

type Room struct {
	ID        uuid.UUID
	Content   string
	Clients   map[uuid.UUID]*Client
	CreatedAt time.Time
	UpdatedAt time.Time
	mu        sync.RWMutex
}

type TextOperation struct {
	Position int    `json:"position"`
	Insert   string `json:"insert,omitempty"`
	Delete   int    `json:"delete,omitempty"`
}
