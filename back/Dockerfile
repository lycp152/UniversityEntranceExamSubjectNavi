# Build stage
FROM golang:1.21-alpine AS builder
WORKDIR /build
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/api

# Development stage
FROM golang:1.21-alpine AS development
WORKDIR /app
RUN apk add --no-cache git
COPY go.mod go.sum ./
RUN go mod download
COPY . .
CMD ["go", "run", "./cmd/api/main.go"]

# Production stage
FROM alpine:3.19 AS production
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /build/main .
COPY configs ./configs
CMD ["./main"]
