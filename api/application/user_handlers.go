package application

import (
	"crypto/ecdsa"
	"encoding/json"
	"io"
	"log"
	"net/http"

	"github.com/go-chi/render"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/shlau/poll/db/generatedsql"
)

type LoginResponse struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Token string `json:"token"`
}

type UserRequest struct {
	Name     string `json:"name"`
	Password string `json:"password"`
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
	u, err := app.queries.CreateUser(r.Context(), generatedsql.CreateUserParams{Name: pgtype.Text{String: data.Name, Valid: true}, Crypt: data.Password})
	if err != nil {
		http.Error(w, "error creating user", http.StatusInternalServerError)
		return
	}
	render.JSON(w, r, u)
}

func (app *Application) login(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "error reading request body", http.StatusBadRequest)
		return
	}
	var data UserRequest
	err = json.Unmarshal(body, &data)
	if err != nil {
		log.Println(err)
		http.Error(w, "error decoding request body", http.StatusInternalServerError)
		return
	}
	resp, err := app.queries.Login(r.Context(), generatedsql.LoginParams{Name: pgtype.Text{String: data.Name, Valid: true}, Crypt: data.Password})
	if err != nil {
		http.Error(w, "error logging in", http.StatusInternalServerError)
		return
	}
	var (
		key *ecdsa.PrivateKey
		t   *jwt.Token
		s   string
	)

	key = app.privateKey
	t = jwt.NewWithClaims(jwt.SigningMethodES256,
		jwt.MapClaims{
			"id": int(resp.ID),
		})

	s, err = t.SignedString(key)

	loginResponse := LoginResponse{ID: int(resp.ID), Name: resp.Name.String, Token: s}
	if err != nil {
		http.Error(w, "error signing token", http.StatusInternalServerError)
	}

	if resp.Success {
		render.JSON(w, r, loginResponse)
	} else {
		http.Error(w, "invalid password", http.StatusBadRequest)
	}
}

func (app *Application) verifyToken(tokenString string) int {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return app.publicKey, nil
	}, jwt.WithValidMethods([]string{jwt.SigningMethodES256.Alg()}))
	if err != nil {
		log.Fatal(err)
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		return int(claims["id"].(float64))
	} else {
		return -1
	}
}
