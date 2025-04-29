package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/jackc/pgx/v5"
	"github.com/joho/godotenv"
	"github.com/shlau/poll/db/generatedsql"
)

func main() {
	println("Hello world")
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	connUrl := os.Getenv("DATABASE_URL")
	ctx := context.Background()
	conn, err := pgx.Connect(ctx, connUrl)
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close(ctx)

	queries := generatedsql.New(conn)
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("welcome"))
	})
	r.Post("/poll", func(w http.ResponseWriter, r *http.Request) {
		insertedPoll, err := queries.CreatePoll(ctx, "new poll")
		if err != nil {
			log.Fatal(err)
		}
		log.Println(insertedPoll)
	})
	http.ListenAndServe(":3000", r)
}
