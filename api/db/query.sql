-- name: CreatePoll :one
INSERT INTO
    polls (name)
VALUES
    ($1) RETURNING *;