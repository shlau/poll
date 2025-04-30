package application

import (
	"encoding/json"
	"io"
	"log"
	"net/http"

	"github.com/go-chi/render"
)

type PollRequest struct {
	Name string `json:"name"`
}

type PollResponse struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

func (app *Application) CreatePoll(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "error reading request body", http.StatusBadRequest)
		return
	}

	var data PollRequest
	err = json.Unmarshal(body, &data)
	if err != nil {
		http.Error(w, "error decoding request body", http.StatusBadRequest)
		return
	}

	createdPoll, err := app.queries.CreatePoll(r.Context(), data.Name)
	if err != nil {
		http.Error(w, "error creating poll", http.StatusInternalServerError)
		return
	}
	log.Println(createdPoll)
	res := &PollResponse{ID: createdPoll.ID.String(), Name: createdPoll.Name}
	render.JSON(w, r, res)
}
