# 大学入試科目ナビゲーター

大学入試の科目選択をサポートする Web アプリケーション

## 機能

- 大学入試科目の検索と比較
- 学部・学科ごとの入試科目の配点表示
- 前期・中期・後期試験の情報管理
- 共通テストと二次試験の配点比較

## 技術スタック

### バックエンド

- Go 1.21
- Echo Framework
- GORM
- PostgreSQL

### フロントエンド

- Next.js
- TypeScript
- TailwindCSS

### インフラ

- Docker
- Docker Compose
- Nginx

## プロジェクト構成

```
.
├── .github/                    # GitHub関連設定
│   ├── ISSUE_TEMPLATE/        # Issueテンプレート
│   ├── PULL_REQUEST_TEMPLATE/ # PRテンプレート
│   ├── workflows/             # GitHub Actions
│   └── config/                # GitHub設定
├── docs/                      # プロジェクトドキュメント
│   ├── README.md             # ドキュメント概要
│   ├── api/                  # API仕様
│   ├── architecture/         # アーキテクチャ設計
│   │   ├── diagrams/        # アーキテクチャ図
│   │   └── decisions/       # 設計決定記録
│   ├── contributing/         # コントリビューションガイド
│   └── development/         # 開発ガイド
├── back/                     # バックエンドアプリケーション
├── front/                    # フロントエンドアプリケーション
├── LICENSE                   # ライセンス
├── Makefile                 # ビルド/開発タスク
├── README.md                # プロジェクト概要
└── SECURITY.md              # セキュリティポリシー
```

## 開発環境のセットアップ

詳細な手順は[開発環境のセットアップガイド](docs/development/setup.md)を参照してください。

### クイックスタート

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/UniversityEntranceExamSubjectNavi.git
cd UniversityEntranceExamSubjectNavi

# 環境変数の設定
cp back/.env.example back/.env
cp front/.env.example front/.env

# アプリケーションの起動
make start
```

## 開発ガイドライン

### コーディング規約

- Go コード: [Effective Go](https://golang.org/doc/effective_go)に準拠
- TypeScript コード: ESLint と Prettier の設定に準拠
- コミットメッセージ: [Conventional Commits](https://www.conventionalcommits.org/)に準拠

### ブランチ戦略

- メインブランチ: `main`
- 開発ブランチ: `develop`
- 機能ブランチ: `feature/*`
- バグ修正: `fix/*`
- リリース: `release/*`

### テスト

```bash
# すべてのテストを実行
make test

# リンターを実行
make lint
```

## デプロイメント

### ステージング環境

- 自動デプロイ: `develop`ブランチへのマージ時

### 本番環境

- 自動デプロイ: `main`ブランチへのマージ時
- 手動承認プロセスあり

## ライセンス

MIT License - 詳細は[LICENSE](./LICENSE)ファイルを参照してください。

## コントリビューション

1. Issue の作成
2. ブランチの作成
3. 変更の実装
4. テストの実行
5. プルリクエストの作成

## お問い合わせ

- 管理者: [your-email@example.com]
- プロジェクトの課題: [Issues](https://github.com/yourusername/UniversityEntranceExamSubjectNavi/issues)
