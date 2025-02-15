# University Entrance Exam API

このプロジェクトは大学入試科目情報を管理するための RESTful API です。

## 機能

- 大学情報の管理
- 学部・学科情報の管理
- 入試科目と配点の管理
- 入試日程の管理

## 技術スタック

- Go 1.21+
- Echo Framework
- GORM
- PostgreSQL
- Redis (キャッシュ)

## プロジェクト構造

```
/back
├── cmd/                     # アプリケーションのエントリーポイント
├── internal/               # プライベートなアプリケーションコード
├── pkg/                   # 公開可能な再利用可能なコード
├── scripts/              # データベース関連スクリプト
├── tests/               # テストファイル
├── configs/            # 設定ファイル
└── docs/              # ドキュメント
```

## セットアップ

1. 環境変数の設定

```bash
cp configs/.env.example .env
```

2. データベースの準備

```bash
make migrate
make seed
```

3. サーバーの起動

```bash
make run
```

## 開発

### 必要条件

- Go 1.21+
- PostgreSQL
- Make

### 便利なコマンド

```bash
make build      # バイナリのビルド
make test       # テストの実行
make migrate    # データベースマイグレーション
make seed       # テストデータの投入
make run        # 開発サーバーの起動
make lint       # コードの静的解析
```

## API ドキュメント

API の詳細な仕様は `docs/api` ディレクトリを参照してください。

## ライセンス

MIT
