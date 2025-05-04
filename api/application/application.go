package application

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shlau/poll/db/generatedsql"
)

type Application struct {
	router  *chi.Mux
	queries *generatedsql.Queries
}

func NewServer(pool *pgxpool.Pool) {
	r := chi.NewRouter()
	queries := generatedsql.New(pool)
	app := Application{router: r, queries: queries}
	app.router.Mount("/", app.routes())
	http.ListenAndServe(":3000", r)
}
