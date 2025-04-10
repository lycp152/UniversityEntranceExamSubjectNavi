# テストドキュメント

## テストの種類

### ユニットテスト

- 個々のコンポーネントの動作を検証
- `tests/unit` ディレクトリに配置
- 命名規則: `*_test.go`

### 統合テスト

- 複数のコンポーネントの連携を検証
- `tests/integration` ディレクトリに配置
- 命名規則: `*_test.go`

### エンドツーエンドテスト

- システム全体の動作を検証
- `tests/e2e` ディレクトリに配置
- 命名規則: `*_test.go`

## テストの実行方法

```bash
# すべてのテストを実行
make test

# ユニットテストのみ実行
make test-unit

# 統合テストのみ実行
make test-integration

# エンドツーエンドテストのみ実行
make test-e2e

# カバレッジレポートを生成
make test-coverage
```

## テストデータ

テストデータは `test_data.go` で管理されています。
必要に応じて `NewTestData()` を使用して新しいテストデータを作成できます。

## テストヘルパー

以下のヘルパー関数が利用可能です：

- `createTestUser`: テスト用のユーザーを作成
- `createTestUsers`: 複数のテストユーザーを作成
- `assertUserEqual`: ユーザー情報の比較
- `waitForCondition`: 条件待機

## ベンチマークテスト

ベンチマークテストは `benchmarks_test.go` で定義されています。
以下のコマンドで実行できます：

```bash
go test -bench=. ./tests/unit/...
```

## カバレッジ

カバレッジレポートは `coverage` ディレクトリに生成されます。
HTML 形式のレポートを確認するには：

```bash
open coverage/coverage.html
```
