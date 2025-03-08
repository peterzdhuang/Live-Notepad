package handlers

import (
	"log"
	"net/http"

	"github.com/google/uuid"
)

func HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
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
