# 大学入試科目ナビゲーター (University Entrance Exam Subject Navigator)

[![Go Report Card](https://goreportcard.com/badge/github.com/yourusername/UniversityEntranceExamSubjectNavi)](https://goreportcard.com/report/github.com/yourusername/UniversityEntranceExamSubjectNavi)
[![PkgGoDev](https://pkg.go.dev/badge/github.com/yourusername/UniversityEntranceExamSubjectNavi)](https://pkg.go.dev/github.com/yourusername/UniversityEntranceExamSubjectNavi)
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red.svg)](./LICENSE)
[![Security Policy](https://img.shields.io/badge/Security-Policy-green.svg)](./SECURITY.md)

[English](./docs/README_en.md) | [日本語](./README.md)

## 概要

大学入試の科目選択を効率的にサポートする Web アプリケーション。受験生の志望に合わせた最適な科目選択をデータに基づいてガイドします。

### 主な特徴

- 🎯 志望校の入試科目を効率的に検索
- 📊 学部・学科ごとの配点を視覚的に表示
- 🔄 入試形式別の比較分析
- 📱 レスポンシブデザインで様々なデバイスに対応
- 🔒 教育機関向けのセキュリティ対策実装

## 機能

- 大学入試科目の割合から検索

  - 科目別の配点比率による絞り込み
  - 大学・学部・学科の横断的な比較
  - カスタム検索条件の保存

- 学部・学科ごとの入試科目の配点表示

  - 視覚的なグラフ表示
  - 年度別の変更点ハイライト
  - 配点の詳細な内訳

- 前期・中期・後期試験の情報管理

  - 試験日程のカレンダー表示
  - 出願期間のリマインダー機能
  - 試験形式別の要件一覧

- 入試形式別の配点比較
  - 一般入試と特別入試の比較
  - 科目別の重要度分析
  - 合格可能性のシミュレーション

## 技術スタック

### バックエンド

- Go 1.22
  - 高パフォーマンスな並行処理
  - 型安全性による堅牢性
- Echo Framework
  - 軽量で高速なルーティング
  - ミドルウェアの柔軟な拡張
- GORM
  - 直感的なデータベース操作
  - マイグレーション管理の自動化
- PostgreSQL
  - 信頼性の高いデータ永続化
  - 複雑なクエリの最適化

### フロントエンド

- Next.js
  - SSR による高速な初期表示
  - 最適化された画像処理
- TypeScript
  - 型安全性による開発効率向上
  - コード品質の維持
- TailwindCSS
  - カスタマイズ可能なデザイン
  - 高速な開発サイクル

### インフラ

- Docker
  - 環境の一貫性確保
  - スケーラブルな展開
- Docker Compose
  - 開発環境の統一
  - サービス間連携の簡素化
- Nginx
  - 高速なリバースプロキシ
  - セキュアな通信制御

## 開発環境のセットアップ

### 前提条件

- Go 1.22 以上
- Node.js 18 以上
- Docker & Docker Compose
- Make
- Git

### クイックスタート

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/UniversityEntranceExamSubjectNavi.git
cd UniversityEntranceExamSubjectNavi

# 環境変数の設定
make setup

# 依存関係のインストール
make install

# データベースの準備
make db-setup

# アプリケーションの起動
make dev
```

詳細な手順は[開発環境のセットアップガイド](docs/development/setup.md)を参照してください。

## トラブルシューティング

### よくある問題と解決方法

1. データベース接続エラー

   ```bash
   # データベースコンテナの状態確認
   make db-status

   # データベースの再起動
   make db-restart
   ```

2. マイグレーションエラー

   ```bash
   # マイグレーション状態の確認
   make migrate-status

   # マイグレーションのリセット
   make migrate-reset
   ```

3. 開発サーバーの問題

   ```bash
   # ログの確認
   make logs

   # 開発環境の完全リセット
   make clean dev
   ```

### デバッグモード

```bash
# デバッグモードでの起動
make dev-debug

# 詳細なログ出力
make dev-verbose
```

## セキュリティ

- [セキュリティポリシー](./SECURITY.md)に従って脆弱性を報告してください
- 定期的なセキュリティ監査を実施しています
- 教育データの取り扱いには特に注意を払っています

## パフォーマンス最適化

- フロントエンドの最適化

  - 画像の遅延読み込み
  - コードの分割
  - キャッシュ戦略

- バックエンドの最適化
  - クエリの最適化
  - キャッシュの活用
  - 非同期処理

## 貢献ガイドライン

1. [Issue](https://github.com/yourusername/UniversityEntranceExamSubjectNavi/issues)の作成
2. フィーチャーブランチの作成
3. コーディング規約に従った実装
4. テストの作成と実行
5. プルリクエストの作成

詳細は[CONTRIBUTING.md](./docs/contributing/CONTRIBUTING.md)を参照してください。

## ライセンス

本ソフトウェアは独自のライセンスの下で提供されています。詳細は[LICENSE](./LICENSE)を参照してください。

利用をご検討の教育機関の方は、以下の連絡先までお問い合わせください：

- ライセンスに関するお問い合わせ: license@example.com
- 価格に関するお問い合わせ: sales@example.com

## お問い合わせ

- 技術的な質問: [Discussions](https://github.com/yourusername/UniversityEntranceExamSubjectNavi/discussions)
- バグ報告: [Issues](https://github.com/yourusername/UniversityEntranceExamSubjectNavi/issues)
- セキュリティ関連: security@example.com
- その他の問い合わせ: contact@example.com

## 謝辞

- このプロジェクトに貢献してくださった全ての方々
- フィードバックを提供してくださった教育機関の皆様
- オープンソースコミュニティの皆様
