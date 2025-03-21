package server

import (
	"fmt"
	"strconv"
)

func Append(room *Room, char string, pos int) {
	content := []byte(room.Content)

	content = append(content[:pos], append([]byte(char), content[pos:]...)...)

	room.Content = string(content)
}

func Delete(room *Room, amount string, pos int) {
	// This needs to take in the amount to delete
	content := []byte(room.Content)

	amountInt, err := strconv.Atoi(amount)
	if err != nil {
		// Handle the error, e.g., print an error message and return
		fmt.Println("Invalid amount:", err)
		return
	}

	if amountInt < 0 {
		fmt.Println("Amount must be a non-negative integer")
		return
	}

	if pos < 0 || pos >= len(content) {
		fmt.Println("Position out of bounds")
		return
	}

	if amountInt == 0 {
		return // Nothing to delete
	}

	for i := 0; i < amountInt; i++ {
		if pos >= len(content) {
			break // Stop deleting if position exceeds the remaining content.
		}

		content = append(content[:pos], content[pos+1:]...)
	}

	room.Content = string(content)
}

func (room *Room) removeClient(client *Client) bool {
	room.mu.Lock()

	defer room.mu.Unlock()

	newClients := []*Client{}

	for _, c := range room.Clients {
		if c != client {
			newClients = append(newClients, c)
		}
	}

	room.Clients = newClients
	return len(newClients) == 0
}

func (room *Room) removeRoom() {
	roomsMutex.Lock()
	defer roomsMutex.Unlock()

	close(room.operationChan)
	delete(rooms, room.RoomName)
}
