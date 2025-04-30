package application

import "github.com/go-chi/chi/v5"

func (app *Application) routes() *chi.Mux {
	r := chi.NewRouter()
	r.Post("/poll", app.CreatePoll)
	return r
}
