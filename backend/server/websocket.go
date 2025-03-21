package server

import (
	"errors"
	"io"
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
		log.Printf("Created new room: %s", roomId)
	} else {
		log.Printf("Retrieved existing room: %s", roomId)
	}
	return room
}

func (room *Room) runRoom() {
	for op := range room.operationChan {
		log.Printf("Processing operation: type=%s, position=%d, character=%s, senderUUID=%s", op.Type, op.Position, op.Character, op.SenderUUID)
		room.mu.Lock()
		before := room.Content

		if op.Type == "insert" && op.Position <= len(room.Content) {
			Append(room, op.Character, op.Position)
		} else if op.Type == "delete" && op.Position <= len(room.Content) {
			Delete(room, op.Character, op.Position)
		}
		after := room.Content
		log.Printf("Content changed from '%s' to '%s'", before, after)
		room.mu.Unlock()

		msg := map[string]interface{}{"type": "op", "operation": op}
		for _, client := range room.Clients {
			if client.uuid != op.SenderUUID { // Exclude the sender
				select {
				case client.writeChan <- msg:
					log.Printf("Sent operation to client %s in room %s", client.username, room.RoomName)
				default:
					log.Println("Client write channel full")
				}
			}
		}
	}
}

func HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	roomId := r.URL.Query().Get("room")
	username := r.URL.Query().Get("username")
	if roomId == "" {
		log.Println("Missing room parameter in request")
		http.Error(w, "Missing room", http.StatusBadRequest)
		return
	}

	room := handleRoom(roomId)

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}

	client := &Client{
		conn:      conn,
		writeChan: make(chan interface{}, 100),
		username:  username,
		uuid:      uuid.New().String(), // Generate UUID for the client
		done:      make(chan struct{}),
	}

	room.mu.Lock()
	room.Clients = append(room.Clients, client)
	room.mu.Unlock()
	log.Printf("Client %s joined room %s with UUID %s", username, roomId, client.uuid)

	initMsg := map[string]interface{}{
		"type": "init", "content": room.Content,
	}

	client.writeChan <- initMsg
	log.Printf("Sent initial content to client %s", username)

	// Goroutine to write messages to the client
	go func() {
		defer client.conn.Close()
		for {
			select {
			case msg, ok := <-client.writeChan:
				if !ok {
					return
				}
				if err := client.conn.WriteJSON(msg); err != nil {
					log.Printf("Error writing to client %s: %v", username, err)
					return
				}
				log.Printf("Sent msg to client")

			case <-client.done:
				return
			}
		}
	}()

	// Goroutine to read messages from the client
	go func() {
		defer func() {
			close(client.writeChan)
			if room.removeClient(client) {
				room.removeRoom()
			}
			log.Printf("Client %s left room %s", username, roomId)
			close(client.done)
		}()

		for {
			select {
			case <-client.done:
				return // exit the goroutine gracefully
			default:
				var op Operation
				if err := client.conn.ReadJSON(&op); err != nil {
					if !errors.Is(err, io.EOF) {
						log.Printf("Error reading from client %s: %v", username, err)
					}
					return
				}
				op.SenderUUID = client.uuid
				log.Printf("Received operation from client %s: type=%s, position=%d, character=%s", username, op.Type, op.Position, op.Character)
				room.operationChan <- op
			}
		}
	}()
}
