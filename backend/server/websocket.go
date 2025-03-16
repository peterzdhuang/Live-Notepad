package server

import (
	"log"
	"net/http"
	"sync"
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

		msg := map[string]interface{}{"type": "op", "operation": op}
		for _, client := range room.Clients {
			select {
			case client.writeChan <- msg:

			default:
				log.Println("Client write channel full")

			}
		}
		room.mu.Lock()
	}

}
func HandleWebSocket(w http.ResponseWriter, r *http.Request) {

	roomId := r.URL.Query().Get("room")
	username := r.URL.Query().Get("username")
	if roomId == "" {
		http.Error(w, "Missing room", http.StatusBadRequest)
		return
	}

	room := handleRoom(roomId)

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Websocket upgrade error")
		return
	}

	client := &Client{
		conn:      conn,
		writeChan: make(chan interface{}, 100),
		username:  username,
	}

	room.mu.Lock()
	room.Clients = append(room.Clients, client)
	room.mu.Unlock()

	initMsg := map[string]interface{}{"type": "init", "content": room.Content}
	client.writeChan <- initMsg

	go func() {
		for msg := range client.writeChan {
			if err := client.conn.WriteJSON(msg); err != nil {
				break
			}
		}
		defer client.conn.Close()
	}()

	go func() {
		defer func() {
			close(client.writeChan)
			room.mu.Lock()
			room.removeClient(client)
			room.mu.Unlock()
		}()

		for {
			var op Operation
			if err := client.conn.ReadJSON(&op); err != nil {
				break
			}
			room.operationChan <- op

		}
	}()
}
