package server

func Append(room *Room, char string, pos int) {
	content := []byte(room.Content)

	content = append(content[:pos], append([]byte(char), content[pos:]...)...)

	room.Content = string(content)
}

func Delete(room *Room, pos int) {
	content := []byte(room.Content)

	content = append(content[:pos], content[:pos+1]...)

	room.Content = string(content)

}

func (room *Room) removeClient(client *Client) {
	room.mu.Lock()

	defer room.mu.Unlock()

	newClients := []*Client{}

	for _, c := range room.Clients {
		if c != client {
			newClients = append(newClients, c)
		}
	}

	room.Clients = newClients
}
