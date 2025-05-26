package application

import (
	"encoding/json"
	"fmt"
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
	ID   string `json:"id"`
	Name string `json:"name"`
}

type CommentRequest struct {
	Value  string `json:"value"`
	Author string `json:"author"`
}

type CommentsResponse struct {
	ID     int    `json:"id"`
	Value  string `json:"value"`
	Author string `json:"author"`
}

type UserRequest struct {
	Name     string `json:"name"`
	Password string `json:"password"`
}

func getPollId(r *http.Request) (uuid.UUID, error) {
	id := chi.URLParam(r, "pollId")
	if id == "" {
		return uuid.UUID{}, fmt.Errorf("missing poll id")
	}
	pollId, err := uuid.Parse(id)
	return pollId, err
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
	res := &PollResponse{ID: createdPoll.ID.String(), Name: createdPoll.Name}
	render.JSON(w, r, res)
}

func (app *Application) getPoll(w http.ResponseWriter, r *http.Request) {
	pollId, err := getPollId(r)
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

	res := &PollResponse{ID: pollId.String(), Name: pollResponse.Name}
	render.JSON(w, r, res)
}

func (app *Application) createQuestion(w http.ResponseWriter, r *http.Request) {
	pollId, err := getPollId(r)
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
	res := &QuestionResponse{ID: int(q.ID), Value: q.Value, Votes: int(q.Votes.Int32)}
	render.JSON(w, r, res)
}

func (app *Application) getQuestions(w http.ResponseWriter, r *http.Request) {
	pollId, err := getPollId(r)
	if err != nil {
		http.Error(w, "invalid poll id", http.StatusBadRequest)
		return
	}

	questionsResponse, err := app.queries.GetPollQuestions(r.Context(), pollId)
	if err != nil {
		http.Error(w, "error getting poll questions", http.StatusInternalServerError)
		return
	}
	questions := make([]QuestionResponse, len(questionsResponse))
	for i, question := range questionsResponse {
		questions[i] = QuestionResponse{ID: int(question.ID), Value: question.Value, Votes: int(question.Votes.Int32)}
	}
	render.JSON(w, r, &questions)
}

func (app *Application) toggleVote(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "questionId")
	if id == "" {
		http.Error(w, "missing question id", http.StatusBadRequest)
		return
	}
	questionId, err := strconv.Atoi(id)
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

	var updatedQuestion generatedsql.Question
	if data.Checked {
		updatedQuestion, err = app.queries.Upvote(r.Context(), int64(questionId))
	} else {
		updatedQuestion, err = app.queries.Downvote(r.Context(), int64(questionId))
	}
	if err != nil {
		http.Error(w, "error updating vote", http.StatusInternalServerError)
		return

	}
	res := &QuestionResponse{ID: questionId, Value: updatedQuestion.Value, Votes: int(updatedQuestion.Votes.Int32)}
	render.JSON(w, r, res)
}

func (app *Application) getQuestionComments(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "questionId")
	if id == "" {
		http.Error(w, "missing question id", http.StatusBadRequest)
		return
	}

	questionId, err := strconv.Atoi(id)
	if err != nil {
		http.Error(w, "invalid question id", http.StatusInternalServerError)
		return
	}
	commentsResponse, err := app.queries.GetQuestionComments(r.Context(), pgtype.Int8{Int64: int64(questionId), Valid: true})
	if err != nil {
		http.Error(w, "unable to get comments", http.StatusInternalServerError)
	}

	comments := make([]CommentsResponse, len(commentsResponse))
	for i, comment := range commentsResponse {
		comments[i] = CommentsResponse{ID: int(comment.ID), Value: comment.Value, Author: comment.Author}
	}
	render.JSON(w, r, &comments)
}

func (app *Application) createComment(w http.ResponseWriter, r *http.Request) {
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

	var data CommentRequest
	err = json.Unmarshal(body, &data)
	if err != nil {
		http.Error(w, "error decoding request body", http.StatusBadRequest)
		return
	}

	questionId := pgtype.Int8{Int64: int64(idNum), Valid: true}
	c, err := app.queries.CreateComment(r.Context(), generatedsql.CreateCommentParams{Value: data.Value, Author: data.Author, QuestionID: questionId})
	if err != nil {
		http.Error(w, "error creating comment", http.StatusInternalServerError)
		return
	}
	res := &CommentsResponse{ID: int(c.ID), Value: c.Value, Author: c.Author}
	render.JSON(w, r, res)
}

func (app *Application) createUser(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "error reading request body", http.StatusBadRequest)
		return
	}
	var data UserRequest
	err = json.Unmarshal(body, &data)
	if err != nil {
		http.Error(w, "error decoding request body", http.StatusInternalServerError)
		return
	}
	log.Println(data)
	u, err := app.queries.CreateUser(r.Context(), generatedsql.CreateUserParams{Name: pgtype.Text{String: data.Name, Valid: true}, Crypt: data.Password})
	if err != nil {
		http.Error(w, "error creating user", http.StatusInternalServerError)
		return
	}
	render.JSON(w, r, u)
}
