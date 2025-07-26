-- +goose Up
-- +goose StatementBegin
ALTER TABLE polls ADD COLUMN creator_id bigint REFERENCES users(id) ON DELETE CASCADE;
-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
ALTER TABLE polls DROP COLUMN creator_id;
-- +goose StatementEnd
