.PHONY: all check typecheck lint format-check smoke build run test-db-up test-db-down test mutation

TEST_DB_URL ?= postgres://postgres:postgres_password@localhost:5436/habit_tracker_test

all: check build

typecheck:
	npm run typecheck

lint:
	npm run lint

format-check:
	npm run format:check

smoke:
	npm run test:smoke

build:
	npm run build

check: format-check lint typecheck build smoke
	@echo "All engineering checks passed successfully."

test-db-up:
	docker compose -f docker-compose.test.yml up -d --wait

test-db-down:
	docker compose -f docker-compose.test.yml down -v

test: test-db-up
	TEST_DATABASE_URL=$(TEST_DB_URL) npx vitest run --fileParallelism=false

mutation:
	npx stryker run

run: build
	GIT_SHA=$$(git rev-parse --short HEAD 2>/dev/null || echo "dev-local") node dist/src/index.js
