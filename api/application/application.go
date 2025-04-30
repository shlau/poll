package application

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"github.com/shlau/poll/db/generatedsql"
)

type Application struct {
	router  *chi.Mux
	queries *generatedsql.Queries
}

func NewServer(conn *pgx.Conn) {
	r := chi.NewRouter()
	queries := generatedsql.New(conn)
	app := Application{router: r, queries: queries}
	app.router.Mount("/", app.routes())
	http.ListenAndServe(":3000", r)
}
