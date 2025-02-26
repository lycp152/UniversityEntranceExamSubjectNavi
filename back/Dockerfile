# ビルドステージ
FROM golang:1.21-alpine AS builder

WORKDIR /app

# 必要なパッケージをインストール
RUN apk add --no-cache git

# 依存関係をコピーしてダウンロード
COPY go.mod go.sum ./
RUN go mod download

# ソースコードをコピー
COPY . .

# アプリケーションをビルド
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/api

# 実行ステージ
FROM alpine:3.21

WORKDIR /app

# タイムゾーンデータをコピー
COPY --from=builder /usr/local/go/lib/time/zoneinfo.zip /usr/local/go/lib/time/zoneinfo.zip

# ビルドしたバイナリをコピー
COPY --from=builder /app/main .
COPY --from=builder /app/.env .

# 必要な環境変数を設定
ENV TZ=Asia/Tokyo
ENV GO_ENVIRONMENT=production

EXPOSE 8080

CMD ["./main"]
