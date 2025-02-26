# 開発環境セットアップガイド

## 前提条件

以下のツールがインストールされている必要があります：

- Node.js (v18 以上)
- Go (1.21 以上)
- Docker (24.0 以上)
- Docker Compose (v2.21.0 以上)
- Make

## セットアップ手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/your-org/UniversityEntranceExamSubjectNavi.git
cd UniversityEntranceExamSubjectNavi
```

### 2. 環境変数の設定

```bash
# フロントエンド
cp front/.env.example front/.env.local

# バックエンド
cp back/.env.example back/.env
```

必要に応じて環境変数を編集してください。詳細は[環境変数一覧](../reference/environment-variables.md)を参照。

### 3. 依存関係のインストール

```bash
# フロントエンド
cd front
npm install

# バックエンド
cd ../back
go mod download
```

### 4. 開発環境の起動

```bash
# プロジェクトルートで実行
make dev
```

### 5. マイグレーションの実行

```bash
make migrate
```

## 動作確認

以下の URL にアクセスして、アプリケーションが正常に動作していることを確認してください：

- フロントエンド: http://localhost:3000
- バックエンド: http://localhost:8080
- API ドキュメント: http://localhost:8080/docs

## 開発用コマンド

```bash
# 開発環境の起動
make dev

# 開発環境の停止
make down

# テストの実行
make test

# リントの実行
make lint

# ビルド
make build

# マイグレーション
make migrate

# マイグレーションのロールバック
make migrate-rollback
```

## トラブルシューティング

よくある問題については[トラブルシューティングガイド](../troubleshooting/common-issues.md)を参照してください。

## IDE 設定

### VSCode

推奨する拡張機能：

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "golang.go",
    "ms-azuretools.vscode-docker"
  ]
}
```

### 設定例

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "go.useLanguageServer": true,
  "go.lintTool": "golangci-lint"
}
```

## 次のステップ

- [コーディング規約](./coding-standards.md)を確認
- [Git 運用ルール](./git-workflow.md)を確認
- [アーキテクチャ概要](../architecture/overview.md)を理解
