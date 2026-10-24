.PHONY: all check typecheck lint format-check smoke build run

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

run: build
	GIT_SHA=$$(git rev-parse --short HEAD 2>/dev/null || echo "dev-local") node dist/src/index.js
