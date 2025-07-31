package application

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"time"

	"github.com/cloudinary/cloudinary-go/v2/api"
	"github.com/go-chi/render"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/shlau/poll/db/generatedsql"
)

type PollRequest struct {
	Name      string `json:"name"`
	CreatorID int    `json:"creator_id"`
}

type PollsRequest struct {
	Token string `json:"token"`
}

type PollResponse struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type SignResponse struct {
	Timestamp time.Time `json:"timestamp"`
	Signature string    `json:"signature"`
}

func (app *Application) createPoll(w http.ResponseWriter, r *http.Request) {
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

	var params generatedsql.CreatePollParams
	if data.CreatorID == 0 {
		params = generatedsql.CreatePollParams{Name: data.Name}
	} else {
		creatorId := pgtype.Int8{Int64: int64(data.CreatorID), Valid: true}
		params = generatedsql.CreatePollParams{Name: data.Name, CreatorID: creatorId}
	}

	createdPoll, err := app.queries.CreatePoll(r.Context(), params)
	if err != nil {
		http.Error(w, "error creating poll", http.StatusInternalServerError)
		return
	}

	res := &PollResponse{ID: createdPoll.ID.String(), Name: createdPoll.Name}
	render.JSON(w, r, res)
}

func (app *Application) getPolls(w http.ResponseWriter, r *http.Request) {
	token := r.URL.Query().Get("token")

	if token == "" {
		http.Error(w, "missing token", http.StatusBadRequest)
		return
	}
	creatorId := app.verifyToken(token)
	pollsResponse, err := app.queries.GetPolls(r.Context(), pgtype.Int8{Int64: int64(creatorId), Valid: true})
	if err != nil {
		http.Error(w, "error getting polls", http.StatusInternalServerError)
		return
	}

	polls := make([]PollResponse, len(pollsResponse))
	for i, poll := range pollsResponse {
		polls[i] = PollResponse{ID: poll.ID.String(), Name: poll.Name}
	}
	render.JSON(w, r, &polls)
}

func (app *Application) getPoll(w http.ResponseWriter, r *http.Request) {
	pollId, err := getPollId(r)
	if err != nil {
		http.Error(w, "invalid poll id", http.StatusBadRequest)
		return
	}

	pollResponse, err := app.queries.GetPoll(r.Context(), pollId)
	if err != nil {
		http.Error(w, "error getting poll", http.StatusInternalServerError)
		return
	}

	res := &PollResponse{ID: pollId.String(), Name: pollResponse.Name}
	render.JSON(w, r, res)
}

func (app *Application) signUpload(w http.ResponseWriter, r *http.Request) {
	currentTime := time.Now()
	timestamp := fmt.Sprintf("%d", currentTime.UnixMilli())
	apiSecret := os.Getenv("CLOUDINARY_API_SECRET")
	params := url.Values{
		"timestamp": {timestamp},
		"folder":    {"poll"},
	}
	resp, err := api.SignParameters(params, apiSecret)
	if err != nil {
		http.Error(w, "error signing upload", http.StatusInternalServerError)
		return
	}
	signResponse := SignResponse{Signature: resp, Timestamp: currentTime}
	render.JSON(w, r, &signResponse)
}
