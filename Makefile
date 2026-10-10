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

check: format-check lint typecheck smoke
	@echo "All engineering checks passed successfully."

build:
	npm run build

run: build
	node dist/index.js
