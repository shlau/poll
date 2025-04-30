package application

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
)

type PollData struct {
	Name string `json:"name"`
}

func (app *Application) CreatePoll(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "error reading request body", http.StatusBadRequest)
		return
	}

	var data PollData
	err = json.Unmarshal(body, &data)
	if err != nil {
		http.Error(w, "error decoding request body", http.StatusBadRequest)
		return
	}

	insertedPoll, err := app.queries.CreatePoll(r.Context(), data.Name)
	if err != nil {
		http.Error(w, "error creating poll", http.StatusInternalServerError)
		return
	}
	log.Println(insertedPoll)
}
