package main

import (
	"log"
	"net/http"
)

func main() {
	// Initialize database
	if err := storage.InitDB("documents.db"); err != nil {
		log.Fatal("Database initialization failed:", err)
	}
	defer storage.CloseDB()

	// Register handlers
	http.HandleFunc("/", handlers.ServeEditor)
	http.HandleFunc("/ws", handlers.HandleWebSocket)

	// Serve static files
	http.Handle("/static/", http.StripPrefix("/static/",
		http.FileServer(http.Dir("web/static"))))

	log.Println("Server starting on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
