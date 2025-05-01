package application

import "github.com/go-chi/chi/v5"

func (app *Application) routes() *chi.Mux {
	r := chi.NewRouter()
	r.Post("/poll", app.createPoll)
	r.Get("/poll/{pollId}", app.getPoll)
	r.Post("/poll/{pollId}/questions", app.createQuestion)
	return r
}
