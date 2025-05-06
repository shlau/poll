-- +goose Up
-- +goose StatementBegin
CREATE EXTENSION pgcrypto;
CREATE TABLE polls (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL
);

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP EXTENSION pgcrypto;
DROP TABLE polls;

-- +goose StatementEnd