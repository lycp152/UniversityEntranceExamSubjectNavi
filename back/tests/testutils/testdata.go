package testutils

// TestData はテスト用のデータを保持する構造体です
type TestData struct {
	// ここにテストで使用するデータ構造を定義
}

// NewTestData は新しいテストデータを作成します
func NewTestData() *TestData {
	return &TestData{
		// テストデータの初期化
	}
}

// Reset はテストデータをリセットします
func (td *TestData) Reset() {
	// テストデータのリセット処理
}

// LoadTestData はテストデータを読み込みます
func LoadTestData() (*TestData, error) {
	// テストデータの読み込み処理
	return NewTestData(), nil
}
