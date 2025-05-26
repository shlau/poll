package application

import (
	"crypto/ecdsa"
	"crypto/x509"
	"encoding/pem"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shlau/poll/db/generatedsql"
)

type Application struct {
	router     *chi.Mux
	queries    *generatedsql.Queries
	privateKey *ecdsa.PrivateKey
	publicKey  *ecdsa.PublicKey
}

func NewServer(pool *pgxpool.Pool) {
	r := chi.NewRouter()
	queries := generatedsql.New(pool)
	app := Application{router: r, queries: queries, privateKey: getPrivateKey(), publicKey: getPublicKey()}
	app.router.Mount("/", app.routes())
	http.ListenAndServe(":3000", r)
}

func getPrivateKey() *ecdsa.PrivateKey {
	filePath := os.Getenv("PRIV_KEY_PATH")
	keyData, err := os.ReadFile(filePath)
	if err != nil {
		log.Fatal("cant read file")
	}
	block, _ := pem.Decode(keyData)
	if block == nil || block.Type != "EC PRIVATE KEY" {
		log.Fatal("failed to decode PEM block containing private key")
	}

	priv, err := x509.ParseECPrivateKey(block.Bytes)
	if err != nil {
		log.Fatal(err)
	}
	return priv
}

func getPublicKey() *ecdsa.PublicKey {
	filePath := os.Getenv("PUB_KEY_PATH")
	keyData, err := os.ReadFile(filePath)
	if err != nil {
		log.Fatal("cant read data file")
	}
	block, _ := pem.Decode(keyData)
	if block == nil || block.Type != "PUBLIC KEY" {
		log.Fatal("failed to decode PEM block containing public key")
	}

	pub, err := x509.ParsePKIXPublicKey(block.Bytes)
	if err != nil {
		log.Fatal(err)
	}
	ecdsaPub, ok := pub.(*ecdsa.PublicKey)
	if !ok {
		log.Fatal("invalid public key type: not ECDSA")
	}

	return ecdsaPub
}
