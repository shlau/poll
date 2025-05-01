-- name: CreatePoll :one
INSERT INTO
    polls (name)
VALUES
    ($1) RETURNING *;

-- name: CreateQuestion :one
INSERT INTO
    questions (value, poll_id)
VALUES
    ($1, $2) RETURNING *;

-- name: DeleteQuestion :exec
DELETE FROM questions WHERE questions.id = ($1);

-- name: GetPollQuestions :many
SELECT * FROM questions WHERE questions.poll_id = ($1);

-- name: GetPoll :one
SELECT * FROM polls WHERE id = ($1);

-- name: Upvote :exec
UPDATE questions SET votes = votes + 1 WHERE questions.id = ($1);

-- name: Downvote :exec
UPDATE questions SET votes = votes - 1 WHERE questions.id = ($1);