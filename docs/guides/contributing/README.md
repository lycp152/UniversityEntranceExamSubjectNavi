# コントリビューションガイド

このプロジェクトへの貢献を検討していただき、ありがとうございます。このガイドでは、プロジェクトへの貢献方法について説明します。

## 行動規範

このプロジェクトは[Contributor Covenant](https://www.contributor-covenant.org/version/2/0/code_of_conduct/)の行動規範に従います。プロジェクトに参加することにより、この規範に従うことに同意したものとみなされます。

## 開発プロセス

1. Issue の作成

   - バグ報告や機能要望は、まず Issue を作成してください
   - テンプレートに従って必要な情報を記入してください

2. ブランチの作成

   - `feature/*` - 新機能の開発
   - `fix/*` - バグ修正
   - `docs/*` - ドキュメントの更新
   - `refactor/*` - リファクタリング

3. 開発ガイドライン

   - [開発環境のセットアップ](../development/setup.md)に従って環境を構築
   - コーディング規約に従ってコードを記述
   - テストを追加し、既存のテストが通ることを確認

4. コミットメッセージ

   - [Conventional Commits](https://www.conventionalcommits.org/)に従う
   - 例:
     ```
     feat: 大学検索機能の追加
     fix: データベース接続エラーの修正
     docs: APIドキュメントの更新
     ```

5. プルリクエスト
   - テンプレートに従って必要な情報を記入
   - レビュー担当者を指定
   - CI チェックが通過することを確認

## テスト

```bash
# ユニットテスト
make test

# E2Eテスト
make test-e2e

# パフォーマンステスト
make test-performance
```

## コードの品質

- Linter を実行: `make lint`
- 型チェック: `make type-check`
- セキュリティチェック: `make security-check`

## ドキュメント

- API の変更時は、Swagger ドキュメントを更新
- 新機能の追加時は、ユーザーガイドを更新
- コードには JSDoc や GoDoc を適切に記述

## リリースプロセス

1. `develop`ブランチでの開発
2. リリース前に`release/*`ブランチを作成
3. テストとレビュー
4. `main`ブランチへのマージ
5. タグ付けとリリースノートの作成

## ヘルプが必要な場合

- [Issues](https://github.com/yourusername/UniversityEntranceExamSubjectNavi/issues)で質問
- プロジェクトメンテナーに連絡
- コミュニティチャットを利用
