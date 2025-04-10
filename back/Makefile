.PHONY: build run test migrate seed lint clean test-coverage test-mock test-unit test-integration test-e2e

# Build variables
BINARY_NAME=university-exam-api
BUILD_DIR=./build

# Go variables
GOBASE=$(shell pwd)
GOBIN=$(GOBASE)/build

build:
	@echo "Building..."
	go build -o $(BUILD_DIR)/$(BINARY_NAME) ./cmd/api

run:
	@echo "Starting server..."
	go run ./cmd/api/main.go

test:
	@echo "Running tests..."
	go test -v ./...

test-unit:
	@echo "Running unit tests..."
	go test -v ./tests/unit/...

test-integration:
	@echo "Running integration tests..."
	go test -v ./tests/integration/...

test-e2e:
	@echo "Running end-to-end tests..."
	go test -v ./tests/e2e/...

test-coverage:
	@echo "Running tests with coverage..."
	go test -coverprofile=coverage/coverage.out ./...
	go tool cover -html=coverage/coverage.out -o coverage/coverage.html

test-mock:
	@echo "Generating mocks..."
	go generate ./...

migrate:
	@echo "Running migrations..."
	go run ./scripts/migrate/main.go

seed:
	@echo "Seeding database..."
	go run ./scripts/seed/main.go

lint:
	@echo "Running linter..."
	golangci-lint run

clean:
	@echo "Cleaning..."
	rm -rf $(BUILD_DIR)
	rm -rf coverage/

# Development helpers
dev: migrate seed run

.DEFAULT_GOAL := build
