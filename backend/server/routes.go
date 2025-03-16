package server

import (
	"html/template"
	"net/http"
)

func ServeEditor(w http.ResponseWriter, r *http.Request) {
	tmpl := template.Must(template.ParseFiles("web/templates/index.html"))
	tmpl.Execute(w, nil)
}
