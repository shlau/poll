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

-- name: Upvote :one
UPDATE questions SET votes = votes + 1 WHERE questions.id = ($1) RETURNING *;

-- name: Downvote :one
UPDATE questions SET votes = votes - 1 WHERE questions.id = ($1) RETURNING *;

-- name: CreateComment :one
INSERT INTO comments (value, question_id, author) VALUES ($1, $2, $3) RETURNING *;

-- name: GetQuestionComments :many
SELECT * FROM comments WHERE comments.question_id = ($1);

-- name: DeleteComment :exec
DELETE FROM comments WHERE id = ($1);

-- name: CreateUser :one
INSERT INTO users (name, password_hash) VALUES ($1, crypt($2, gen_salt('md5'))) RETURNING id;

-- name: Login :one
SELECT password_hash = crypt($2, password_hash) AS success, users.id, users.name FROM users WHERE users.name = ($1);