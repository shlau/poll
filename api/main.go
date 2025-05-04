package main

import (
	"context"
	"log"
	"os"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"github.com/shlau/poll/application"
	pgxUUID "github.com/vgarvardt/pgx-google-uuid/v5"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	connUrl := os.Getenv("DATABASE_URL")
	dbconfig, err := pgxpool.ParseConfig(connUrl)
	if err != nil {
		log.Fatal(err)
	}
	dbconfig.AfterConnect = func(ctx context.Context, conn *pgx.Conn) error {
		pgxUUID.Register(conn.TypeMap())
		return nil
	}
	ctx := context.Background()
	pool, err := pgxpool.New(ctx, connUrl)
	if err != nil {
		log.Fatal(err)
	}
	defer pool.Close()

	application.NewServer(pool)
}
