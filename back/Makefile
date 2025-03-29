.PHONY: build run test migrate seed lint clean test-coverage test-mock

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
	go test -v ./tests/...

test-coverage:
	@echo "Running tests with coverage..."
	go test -v -coverprofile=coverage/coverage.out ./tests/...
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
