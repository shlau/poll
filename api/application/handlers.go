package application

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/shlau/poll/db/generatedsql"
)

type VoteRequest struct {
	Checked bool `json:"checked"`
}
type QuestionRequest struct {
	Value string `json:"value"`
}
type QuestionResponse struct {
	ID    int    `json:"id"`
	Value string `json:"value"`
	Votes int    `json:"votes"`
}
type PollRequest struct {
	Name string `json:"name"`
}

type PollResponse struct {
	ID        string             `json:"id"`
	Name      string             `json:"name"`
	Questions []QuestionResponse `json:"questions"`
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

	createdPoll, err := app.queries.CreatePoll(r.Context(), data.Name)
	if err != nil {
		http.Error(w, "error creating poll", http.StatusInternalServerError)
		return
	}

	log.Println(createdPoll)
	res := &PollResponse{ID: createdPoll.ID.String(), Name: createdPoll.Name, Questions: []QuestionResponse{}}
	render.JSON(w, r, res)
}

func (app *Application) getPoll(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "pollId")
	if id == "" {
		http.Error(w, "missing poll id", http.StatusBadRequest)
		return
	}

	pollId, err := uuid.Parse(id)
	if err != nil {
		http.Error(w, "invalid poll id", http.StatusBadRequest)
		return
	}

	pollResponse, err := app.queries.GetPoll(r.Context(), pollId)
	if err != nil {
		log.Println(err)
		http.Error(w, "error getting poll", http.StatusInternalServerError)
		return
	}

	questionsResponse, err := app.queries.GetPollQuestions(r.Context(), pollId)
	if err != nil {
		http.Error(w, "error getting poll questions", http.StatusInternalServerError)
		return
	}
	questions := make([]QuestionResponse, len(questionsResponse))
	for i, question := range questionsResponse {
		questions[i] = QuestionResponse{ID: int(question.ID.Int64), Value: question.Value, Votes: int(question.Votes.Int32)}
	}

	res := &PollResponse{ID: pollId.String(), Name: pollResponse.Name, Questions: questions}
	render.JSON(w, r, res)
}

func (app *Application) createQuestion(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "pollId")
	if id == "" {
		http.Error(w, "missing poll id", http.StatusBadRequest)
		return
	}

	pollId, err := uuid.Parse(id)
	if err != nil {
		http.Error(w, "invalid poll id", http.StatusBadRequest)
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "error reading request body", http.StatusBadRequest)
		return
	}
	var data QuestionRequest
	err = json.Unmarshal(body, &data)
	if err != nil {
		http.Error(w, "error decoding request body", http.StatusBadRequest)
		return
	}

	q, err := app.queries.CreateQuestion(r.Context(), generatedsql.CreateQuestionParams{Value: data.Value, PollID: pollId})
	if err != nil {
		http.Error(w, "error creating question", http.StatusBadRequest)
		return
	}
	res := &QuestionResponse{ID: int(q.ID.Int64), Value: q.Value, Votes: int(q.Votes.Int32)}
	render.JSON(w, r, res)
}

func (app *Application) toggleVote(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "questionId")
	if id == "" {
		http.Error(w, "missing question id", http.StatusBadRequest)
		return
	}
	idNum, err := strconv.Atoi(id)
	if err != nil {
		http.Error(w, "invalid question id", http.StatusBadRequest)
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "error reading request body", http.StatusBadRequest)
		return
	}
	var data VoteRequest
	err = json.Unmarshal(body, &data)
	if err != nil {
		http.Error(w, "error decoding request body", http.StatusBadRequest)
		return
	}

	questionId := pgtype.Int8{Int64: int64(idNum), Valid: true}
	var updatedQuestion generatedsql.Question
	if data.Checked {
		updatedQuestion, err = app.queries.Upvote(r.Context(), questionId)
	} else {
		updatedQuestion, err = app.queries.Downvote(r.Context(), questionId)
	}
	if err != nil {
		http.Error(w, "error updating vote", http.StatusInternalServerError)
		return

	}
	res := &QuestionResponse{ID: idNum, Value: updatedQuestion.Value, Votes: int(updatedQuestion.Votes.Int32)}
	render.JSON(w, r, res)
}
