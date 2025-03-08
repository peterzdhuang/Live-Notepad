package db

import "database/sql"

var db *sql.DB

func InitDB(filepath string) error {
	var err error
	db, err = sql.Open("sqlite3", filepath)
	if err != nil {
		return err
	}

	createTable := `
    CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        content TEXT,
        created_at DATETIME,
        updated_at DATETIME
    )`

	_, err = db.Exec(createTable)
	return err
}

func SaveDocument(doc *models.Document) error {
	_, err := db.Exec(
		`INSERT OR REPLACE INTO documents 
        (id, content, created_at, updated_at)
        VALUES (?, ?, ?, ?)`,
		doc.ID, doc.Content, doc.CreatedAt, doc.UpdatedAt,
	)
	return err
}

func CloseDB() {
	db.Close()
}
