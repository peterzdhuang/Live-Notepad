package server

import (
	"log"
	"net/http"
	"sync"

	"github.com/google/uuid"
)

func handleRoom(roomId string) *Room {
	roomsMutex.Lock()
	defer roomsMutex.Unlock()

	room, exist := rooms[roomId]

	if !exist {
		room = &Room{
			RoomName:      roomId,
			Content:       "",
			Clients:       []*Client{},
			operationChan: make(chan Operation),
			mu:            sync.Mutex{},
		}
		rooms[roomId] = room
		go room.runRoom()
	}
	return room
}

func (room *Room) runRoom() {
	for op := range room.operationChan {
		room.mu.Lock()
		if op.Type == "insert" && op.Position <= len(room.Content) {
			Append(room, op.Character, op.Position)
		} else if op.Type == "delete" && op.Position <= len(room.Content) {
			Delete(room, op.Position)
		}
		room.mu.Unlock()

		msg := map[string]interface{"type": "op", "operation": op}
	}

}
func HandleWebSocket(w http.ResponseWriter, r *http.Request) {

	roomId := r.URL.Query().Get("room")
	if roomId == "" {
		http.Error(w, "Missing room", http.StatusBadRequest)
		return
	}
	roomsMutex.Lock()

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	if !exist {
		room = &Room{}

	}
	rid := uuid.New()
	client := &Client{conn: conn, docID: rid}

	clientsMu.Lock()
	clients[rid] = client
	clientsMu.Unlock()

	defer func() {
		clientsMu.Lock()
		// implement delete functions
		clientsMu.Unlock()
		conn.Close()
	}()

	for {
		var msg map[string]interface{}
		if err := conn.ReadJSON(&msg); err != nil {
			return
		}
		processMessage(client, msg)
	}
}
