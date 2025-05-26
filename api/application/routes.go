package application

import "github.com/go-chi/chi/v5"

func (app *Application) routes() *chi.Mux {
	r := chi.NewRouter()
	r.Post("/polls", app.createPoll)
	r.Get("/polls/{pollId}", app.getPoll)
	r.Get("/polls/{pollId}/questions", app.getQuestions)
	r.Post("/polls/{pollId}/questions", app.createQuestion)
	r.Patch("/questions/{questionId}/vote", app.toggleVote)
	r.Get("/questions/{questionId}/comments", app.getQuestionComments)
	r.Post("/questions/{questionId}/comments", app.createComment)
	r.Post("/users", app.createUser)
	return r
}
