# テストドキュメント

## テストの種類

### ユニットテスト

- 個々のコンポーネントの動作を検証
- `tests/unit` ディレクトリに配置
- 命名規則: `*_test.go`
- 主なテストファイル:
  - `benchmarks_test.go`: パフォーマンステスト
  - `edge_cases_test.go`: 境界値テスト
  - `example_test.go`: サンプルテスト
  - `load_test.go`: 負荷テスト
  - `memory_test.go`: メモリ使用量テスト
  - `user_test.go`: ユーザー関連テスト
  - `vulnerability_test.go`: セキュリティテスト

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

# 特定のテストファイルを実行
go test ./tests/unit/benchmarks_test.go
go test ./tests/unit/edge_cases_test.go
go test ./tests/unit/example_test.go
go test ./tests/unit/load_test.go
go test ./tests/unit/memory_test.go
go test ./tests/unit/user_test.go
go test ./tests/unit/vulnerability_test.go
```

## テストデータ

テストデータは `test_data.go` で管理されています。
必要に応じて `NewTestData()` を使用して新しいテストデータを作成できます。

### テストデータの構造

```go
type TestData struct {
    Users []*User
    // その他のテストデータ
}
```

### テストデータの使用方法

```go
data := NewTestData()
// テストデータの操作
data.Reset() // テストデータのリセット
```

## テストヘルパー

以下のヘルパー関数が利用可能です：

- `createTestUser`: テスト用のユーザーを作成
- `createTestUsers`: 複数のテストユーザーを作成
- `assertUserEqual`: ユーザー情報の比較
- `waitForCondition`: 条件待機
- `mock_db.go`: モックデータベースの実装

## ベンチマークテスト

ベンチマークテストは `benchmarks_test.go` で定義されています。
以下のコマンドで実行できます：

```bash
# すべてのベンチマークを実行
go test -bench=. ./tests/unit/...

# 特定のベンチマークを実行
go test -bench=BenchmarkUserCreation ./tests/unit/benchmarks_test.go
```

## カバレッジ

カバレッジレポートは `coverage` ディレクトリに生成されます。
HTML 形式のレポートを確認するには：

```bash
# カバレッジレポートの生成
make test-coverage

# レポートの表示
open coverage/coverage.html
```

## セキュリティテスト

セキュリティテストは `vulnerability_test.go` で定義されています。
以下の項目をテストします：

- SQL インジェクション対策
- XSS 対策
- タイミング攻撃対策
- 入力値の検証

## メモリテスト

メモリテストは `memory_test.go` で定義されています。
以下の項目をテストします：

- メモリ使用量の測定
- メモリリークの検出
- ガベージコレクションの動作確認
