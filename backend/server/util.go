package server

import (
	"fmt"
	"math/rand/v2"
	"strconv"
)

func Append(room *Room, char string, pos int) {
	content := []byte(room.Content)

	content = append(content[:pos], append([]byte(char), content[pos:]...)...)

	room.Content = string(content)
}

func Delete(room *Room, amount int, pos int) {
	// This needs to take in the amount to delete
	content := []byte(room.Content)

	if amount < 0 {
		fmt.Println("Amount must be a non-negative integer")
		return
	}

	if pos < 0 || pos >= len(content) {
		fmt.Println("Position out of bounds")
		return
	}

	if amount == 0 {
		return // Nothing to delete
	}

	for i := 0; i < amount; i++ {
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

func GenerateColour() string {
	return fmt.Sprintf("hsl(%.0f, 70%%, 60%%)", rand.Float64()*360)
}
