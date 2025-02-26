# UniversityEntranceExamSubjectNavi ドキュメント

## 📚 目次

### 🚀 はじめに

- [クイックスタート](./guides/quickstart.md)
- [開発環境セットアップ](./guides/development-setup.md)
- [アーキテクチャ概要](./architecture/overview.md)

### 📖 ガイド

- [コーディング規約](./guides/coding-standards.md)
- [Git 運用ルール](./guides/git-workflow.md)
- [テスト方針](./guides/testing-strategy.md)

### 🔧 リファレンス

- [API 仕様書](./api/README.md)
- [データベース設計](./reference/database.md)
- [環境変数一覧](./reference/environment-variables.md)

### 🏗️ アーキテクチャ

- [システム構成図](./architecture/system-architecture.md)
- [認証・認可フロー](./architecture/auth-flow.md)
- [データフロー](./architecture/data-flow.md)

### 🔍 トラブルシューティング

- [よくある問題と解決方法](./troubleshooting/common-issues.md)
- [デバッグガイド](./troubleshooting/debugging-guide.md)

## 💡 開発環境セットアップ（クイックスタート）

1. リポジトリのクローン

```bash
git clone https://github.com/your-org/UniversityEntranceExamSubjectNavi.git
cd UniversityEntranceExamSubjectNavi
```

2. 環境変数の設定

```bash
cp front/.env.example front/.env.local
cp back/.env.example back/.env
```

3. 開発環境の起動

```bash
make dev
```

4. アプリケーションへのアクセス

- フロントエンド: http://localhost:3000
- バックエンド: http://localhost:8080
- API ドキュメント: http://localhost:8080/docs

## 🔑 必要な環境変数

主要な環境変数については[環境変数一覧](./reference/environment-variables.md)を参照してください。

## 🛠️ 開発用コマンド

```bash
# 開発環境の起動
make dev

# テストの実行
make test

# リントの実行
make lint

# ビルド
make build

# デプロイ（本番環境）
make deploy
```

## 📝 コントリビューション

1. Issue の作成
2. ブランチの作成（`feature/xx-xxx`）
3. 変更の実装
4. テストの実行
5. プルリクエストの作成

詳細は[コントリビューションガイド](./guides/contributing.md)を参照してください。
