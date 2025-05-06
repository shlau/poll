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