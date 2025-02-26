# 開発環境のセットアップ

## 前提条件

以下のツールが必要です：

- Docker Desktop 4.x 以上
- Go 1.21 以上
- Node.js 20.x 以上
- Make（オプション）

## クイックスタート

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/UniversityEntranceExamSubjectNavi.git
cd UniversityEntranceExamSubjectNavi

# 環境変数の設定
cp back/.env.example back/.env
cp front/.env.example front/.env

# アプリケーションの起動
make start

# データベースのセットアップ
make migrate
make seed
```

## 詳細セットアップ手順

### 1. Docker 環境のセットアップ

```bash
# Dockerコンテナの起動
docker compose -f deployments/docker/development/docker-compose.yml up -d

# コンテナの状態確認
docker compose ps
```

### 2. バックエンド開発環境

```bash
cd back
go mod download
go run cmd/api/main.go
```

### 3. フロントエンド開発環境

```bash
cd front
npm install
npm run dev
```

## 開発用 URL

- フロントエンド: http://localhost:3000
- バックエンド API: http://localhost:8080
- API ドキュメント: http://localhost:8080/swagger/index.html
- Adminer（データベース管理）: http://localhost:8081

## 開発用コマンド

```bash
# アプリケーションの操作
make start    # 起動
make stop     # 停止
make restart  # 再起動
make clean    # クリーンアップ

# 開発補助
make test         # テストの実行
make lint         # リンターの実行
make docs         # APIドキュメントの生成
make update-deps  # 依存関係の更新
```

## デバッグ

### バックエンド

1. VS Code で Go のデバッグ設定
2. デバッグポート: 2345
3. `.vscode/launch.json`の設定例あり

### フロントエンド

1. Chrome DevTools の使用
2. React Developer Tools の活用
3. Next.js 開発サーバーのホットリロード

## 推奨開発ツール

- VSCode 拡張機能
  - Go
  - ESLint
  - Prettier
  - Docker
  - GitLens

## トラブルシューティング

### よくある問題

1. ポートの競合

   - 使用中のポートを確認
   - `docker-compose.yml`のポート設定を必要に応じて変更

2. データベース接続エラー

   - PostgreSQL コンテナの起動状態を確認
   - 環境変数の設定を確認

3. ホットリロードの問題
   - ボリュームのマウント設定を確認
   - Docker コンテナの再起動を試行

詳細な問題解決については[トラブルシューティングガイド](../../troubleshooting/common-issues/development.md)を参照してください。
