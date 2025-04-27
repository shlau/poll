ifneq (,$(wildcard ./.env))
    include .env
    export
endif
DEV_COMPOSE_FILE=docker-compose-dev.yml

.PHONY: postgres
postgres:
	docker run -it --name poll-db-1 -p 5432:5432 -e POSTGRES_USER=${POSTGRES_USER} -e POSTGRES_PASSWORD=${POSTGRES_PASSWORD} -d postgres:12.19-alpine 

.PHONY: createdb
createdb:
	docker exec -it poll-db-1 createdb --username=${POSTGRES_USER} --owner=${POSTGRES_USER} poll-app

.PHONY: dropdb
dropdb:
	docker exec -it poll-db-1 dropdb --username=${POSTGRES_USER} poll-app

.PHONY: migrate-up
migrate-up:
	migrate -path api/db/migration/ -database postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/poll?sslmode=disable -verbose up

.PHONY: migrate-down
migrate-down:
	migrate -path api/db/migration/ -database postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/poll?sslmode=disable -verbose down

.PHONY: dev-compose-up
dev-compose-up:
	docker compose -f ${DEV_COMPOSE_FILE} up

.PHONY: dev-compose-up-build
dev-compose-up-build:
	docker compose -f ${DEV_COMPOSE_FILE} up --build

.PHONY: dev-compose-down
dev-compose-down:
	docker compose -f ${DEV_COMPOSE_FILE} down