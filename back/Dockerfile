# マルチステージビルドを使用してイメージサイズを最適化
# ビルドステージ
FROM golang:1.24.2-alpine AS builder

# 必要なビルドツールをインストール
RUN apk add --no-cache gcc git musl-dev

# 作業ディレクトリを設定
WORKDIR /app

# 依存関係をコピー
COPY go.mod go.sum ./

# 依存関係をダウンロード
RUN go mod download

# ソースコードをコピー
COPY . .

# ビルド
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o main ./cmd/api

# 実行ステージ
FROM alpine:3.21.3

# セキュリティ強化のための非rootユーザーを作成
RUN adduser -D -g '' appuser && \
    mkdir -p /app && \
    chown appuser:appuser /app

# 作業ディレクトリを設定
WORKDIR /app

# ビルドステージからバイナリをコピー
COPY --from=builder --chown=appuser:appuser /app/main .

# 必要な証明書をコピー
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# ユーザーを切り替え
USER appuser

# ポートを公開
EXPOSE 8080

# アプリケーションを実行
CMD ["./main"]
