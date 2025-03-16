package main

import (
	"log"
	"net/http"
)

func main() {
	http.HandleFunc("/ws", HandleWebSocket)
	log.Println("Server starting on port 8000")
	log.Fatal(http.ListenAndServe(":8000", nil))
}
