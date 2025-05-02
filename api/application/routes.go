package application

import "github.com/go-chi/chi/v5"

func (app *Application) routes() *chi.Mux {
	r := chi.NewRouter()
	r.Post("/polls", app.createPoll)
	r.Get("/polls/{pollId}", app.getPoll)
	r.Post("/polls/{pollId}/questions", app.createQuestion)
	r.Patch("/questions/{questionId}/vote", app.toggleVote)
	return r
}
