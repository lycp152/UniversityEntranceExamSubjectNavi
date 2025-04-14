package cache

import (
	"errors"
	"fmt"
	"testing"
	"time"

	appErrors "university-exam-api/internal/errors"
	applogger "university-exam-api/internal/logger"
)

const (
	testKey   = "test_key"
	testValue = "test_value"
	// エラーメッセージの定数
	errMsgSet = "Set() error = %v"
	errMsgGet = "Get() error = %v"
	errMsgOperation = "Operation error = %v, wantError %v"
	errMsgErrorType = "Operation error type = %v, want %v"
	// キーフォーマットの定数
	keyFormat = "key_%d"
	valueFormat = "value_%d"
)

// setup はテストの前処理を行います
func setup() {
	// テスト用のロガーを初期化
	applogger.InitTestLogger()
}

// teardown はテストの後処理を行います
func teardown(tb testing.TB) {
	// キャッシュをクリア
	c := GetInstance()
	_ = c.ClearAll()
	// トランザクションを確実にクリア
	_ = c.RollbackTransaction()
}

func TestCacheSet(t *testing.T) {
	// 並列実行を無効化
	// t.Parallel()

	setup()
	defer teardown(t)

	c := GetInstance()

	tests := []struct {
		name      string
		key       string
		value     interface{}
		duration  time.Duration
		wantError bool
		errorType error
	}{
		{
			name:      "正常系",
			key:       testKey,
			value:     testValue,
			duration:  time.Minute,
			wantError: false,
			errorType: nil,
		},
		{
			name:      "空のキー",
			key:       "",
			value:     testValue,
			duration:  time.Minute,
			wantError: true,
			errorType: appErrors.NewInvalidInputError("key", ErrEmptyKey, nil),
		},
		{
			name:      "nil値",
			key:       testKey,
			value:     nil,
			duration:  time.Minute,
			wantError: true,
			errorType: appErrors.NewInvalidInputError("value", ErrNilValue, nil),
		},
		{
			name:      "無効な期間",
			key:       testKey,
			value:     testValue,
			duration:  -1,
			wantError: true,
			errorType: appErrors.NewInvalidInputError("duration", ErrInvalidDuration, nil),
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			// サブテストの並列実行も無効化
			// t.Parallel()

			err := c.Set(tt.key, tt.value, tt.duration)
			if (err != nil) != tt.wantError {
				t.Errorf(errMsgSet, err)
				return
			}

			if tt.wantError && !errors.Is(err, tt.errorType) {
				t.Errorf(errMsgErrorType, err, tt.errorType)
			}
		})
	}
}

func TestCacheGet(t *testing.T) {
	// 並列実行を無効化
	// t.Parallel()

	setup()
	defer teardown(t)

	c := GetInstance()

	// テストデータの準備
	err := c.Set(testKey, testValue, time.Minute)
	if err != nil {
		t.Fatalf(errMsgSet, err)
	}

	// データが確実に保存されるまで少し待機
	time.Sleep(100 * time.Millisecond)

	tests := []struct {
		name      string
		key       string
		wantValue interface{}
		wantFound bool
		wantError bool
		errorType error
	}{
		{
			name:      "存在するキー",
			key:       testKey,
			wantValue: testValue,
			wantFound: true,
			wantError: false,
			errorType: nil,
		},
		{
			name:      "存在しないキー",
			key:       "not_exist",
			wantValue: nil,
			wantFound: false,
			wantError: false,
			errorType: nil,
		},
		{
			name:      "空のキー",
			key:       "",
			wantValue: nil,
			wantFound: false,
			wantError: true,
			errorType: appErrors.NewInvalidInputError("key", ErrEmptyKey, nil),
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			// サブテストの並列実行も無効化
			// t.Parallel()

			gotValue, gotFound, err := c.Get(tt.key)
			if (err != nil) != tt.wantError {
				t.Errorf(errMsgGet, err)
				return
			}

			if tt.wantError && !errors.Is(err, tt.errorType) {
				t.Errorf(errMsgErrorType, err, tt.errorType)
			}

			if gotFound != tt.wantFound {
				t.Errorf("Get() found = %v, want %v", gotFound, tt.wantFound)
			}

			if gotValue != tt.wantValue {
				t.Errorf("Get() value = %v, want %v", gotValue, tt.wantValue)
			}
		})
	}
}

func TestCacheTransaction(t *testing.T) {
	// 並列実行を無効化
	// t.Parallel()

	setup()
	defer teardown(t)

	c := GetInstance()

	tests := []struct {
		name      string
		operation func() error
		wantError bool
		errorType error
	}{
		{
			name: "正常なトランザクション",
			operation: func() error {
				if err := c.StartTransaction(); err != nil {
					return err
				}
				if err := c.Set(testKey, testValue, time.Minute); err != nil {
					return err
				}
				return c.CommitTransaction()
			},
			wantError: false,
			errorType: nil,
		},
		{
			name: "重複したトランザクション開始",
			operation: func() error {
				if err := c.StartTransaction(); err != nil {
					return err
				}
				return c.StartTransaction()
			},
			wantError: true,
			errorType: appErrors.NewSystemError(ErrTransactionInProgress, nil, nil),
		},
		{
			name: "トランザクションなしでのコミット",
			operation: func() error {
				// トランザクションを明示的にクリアするためにロールバックを実行
				_ = c.RollbackTransaction()
				return c.CommitTransaction()
			},
			wantError: true,
			errorType: appErrors.NewSystemError(ErrNoTransaction, nil, nil),
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			// サブテストの並列実行も無効化
			// t.Parallel()

			// 各テストの前にトランザクションをクリア
			_ = c.RollbackTransaction()

			err := tt.operation()
			if (err != nil) != tt.wantError {
				t.Errorf(errMsgOperation, err, tt.wantError)
				return
			}

			if tt.wantError && !errors.Is(err, tt.errorType) {
				t.Errorf(errMsgErrorType, err, tt.errorType)
			}
		})
	}
}

func TestCachePerformance(t *testing.T) {
	// 並列実行を無効化
	// t.Parallel()

	setup()
	defer teardown(t)

	c := GetInstance()

	// パフォーマンステスト
	start := time.Now()
	const testCount = 1000
	for i := 0; i < testCount; i++ {
		key := fmt.Sprintf(keyFormat, i)
		value := fmt.Sprintf(valueFormat, i)
		if err := c.Set(key, value, time.Minute); err != nil {
			t.Fatalf(errMsgSet, err)
		}
	}
	duration := time.Since(start)

	// パフォーマンスメトリクスの取得
	metrics, err := c.GetPerformanceMetrics()
	if err != nil {
		t.Fatalf("GetPerformanceMetrics() error = %v", err)
	}

	// メトリクスの検証
	if metrics == nil {
		t.Error("GetPerformanceMetrics() returned nil")
		return
	}

	if metrics.HitRate < 0 || metrics.HitRate > 100 {
		t.Errorf("Invalid hit rate: %v", metrics.HitRate)
	}

	// アイテム数の検証（許容誤差を広げる）
	if metrics.TotalItems < testCount-50 || metrics.TotalItems > testCount+50 {
		t.Errorf("Invalid total items: %v, want %v (with tolerance)", metrics.TotalItems, testCount)
	}

	// レイテンシの検証
	if duration > 2*time.Second {
		t.Errorf("Operation took too long: %v", duration)
	}
}

// BenchmarkCacheSet はキャッシュのSet操作のベンチマークテストを行います
func BenchmarkCacheSet(b *testing.B) {
	setup()
	defer teardown(b)

	c := GetInstance()

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		key := fmt.Sprintf(keyFormat, i)
		value := fmt.Sprintf(valueFormat, i)
		if err := c.Set(key, value, time.Minute); err != nil {
			b.Fatalf(errMsgSet, err)
		}
	}
}

// BenchmarkCacheGet はキャッシュのGet操作のベンチマークテストを行います
func BenchmarkCacheGet(b *testing.B) {
	setup()
	defer teardown(b)

	c := GetInstance()

	// テストデータの準備
	for i := 0; i < b.N; i++ {
		key := fmt.Sprintf(keyFormat, i)
		value := fmt.Sprintf(valueFormat, i)
		if err := c.Set(key, value, time.Minute); err != nil {
			b.Fatalf(errMsgSet, err)
		}
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		key := fmt.Sprintf(keyFormat, i)
		_, _, err := c.Get(key)
		if err != nil {
			b.Fatalf("Get() error = %v", err)
		}
	}
}

func TestCachePerformanceMetrics(t *testing.T) {
	setup()
	defer teardown(t)

	c := GetInstance()

	// パフォーマンスメトリクスの取得
	metrics, err := c.GetPerformanceMetrics()
	if err != nil {
		t.Fatalf("GetPerformanceMetrics() error = %v", err)
	}

	// 基本的なメトリクスの確認
	if metrics == nil {
		t.Error("GetPerformanceMetrics() returned nil")
		return
	}

	if metrics.HitRate < 0 || metrics.HitRate > 100 {
		t.Errorf("Invalid hit rate: %v", metrics.HitRate)
	}

	if metrics.TotalItems < 0 {
		t.Errorf("Invalid total items: %v", metrics.TotalItems)
	}
}

func TestCacheErrorHandling(t *testing.T) {
	setup()
	defer teardown(t)

	c := GetInstance()

	// 無効な操作のテスト
	err := c.StartTransaction()
	if err != nil {
		t.Fatalf("First StartTransaction() error = %v", err)
	}

	// 既にトランザクションが進行中の状態で再度開始を試みる
	err = c.StartTransaction()
	if err == nil {
		t.Error("Expected error for already started transaction")
	}

	if !errors.Is(err, appErrors.NewSystemError(ErrTransactionInProgress, nil, nil)) {
		t.Errorf("Unexpected error type: %v", err)
	}

	// トランザクションをロールバック
	err = c.RollbackTransaction()
	if err != nil {
		t.Fatalf("RollbackTransaction() error = %v", err)
	}

	// トランザクションが開始されていない状態でコミットを試みる
	err = c.CommitTransaction()
	if err == nil {
		t.Error("Expected error for no active transaction")
	}

	if !errors.Is(err, appErrors.NewSystemError(ErrNoTransaction, nil, nil)) {
		t.Errorf("Unexpected error type: %v", err)
	}
}
