package main

import (
	"log"
	"net/http"

	"github.com/peterzdhuang/RealTimeNoteEditor/server"
)

func main() {
	http.HandleFunc("/ws", server.HandleWebSocket)
	log.Println("Server starting on port 8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
