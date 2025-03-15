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
