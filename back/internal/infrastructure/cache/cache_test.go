package cache

import (
	"fmt"
	"strings"
	"sync"
	"testing"
	"time"
)

const (
	errGetStats = "GetStats() error = %v"
	errGetHitRate = "GetHitRate() error = %v"
	errGet = "Get() error = %v"
	errSet = "Set() error = %v"
	errDelete = "Delete() error = %v"
	errClearAll = "ClearAll() error = %v"
	errGetFound = "Get() found = %v, want false"
	errGetNotFound = "Get() found = %v, want true"
	errGetValue = "Get() = %v, want %v"
	errGetNil = "Get() = %v, want nil"
	errGetFoundValue = "Get() found = %v, want %v"
	testKey   = "test-key"
	testValue = "test-value"
)

// TestSetAndGet はキャッシュへの保存と取得をテストします
func TestSetAndGet(t *testing.T) {
	t.Parallel()

	c := GetInstance()

	// 基本的な保存と取得のテスト
	t.Run("基本的な保存と取得", func(t *testing.T) {
		testBasicSetAndGet(t, c)
	})

	// 空のキーと値のテスト
	t.Run("空のキーと値", func(t *testing.T) {
		testEmptyKeyAndValue(t, c)
	})

	// 期限切れのテスト
	t.Run("期限切れ", func(t *testing.T) {
		testExpiration(t, c)
	})

	// メモリ管理のテスト
	t.Run("メモリ管理", func(t *testing.T) {
		testMemoryManagement(t, c)
	})
}

func testBasicSetAndGet(t *testing.T, c CacheInterface) {
	key := testKey
	value := testValue
	duration := 1 * time.Minute

	if err := c.Set(key, value, duration); err != nil {
		t.Errorf(errSet, err)
	}

	got, found, err := c.Get(key)
	if err != nil {
		t.Errorf(errGet, err)
	}
	if !found {
		t.Errorf(errGetNotFound, found)
	}
	if got != value {
		t.Errorf(errGetValue, got, value)
	}
}

func testEmptyKeyAndValue(t *testing.T, c CacheInterface) {
	if err := c.Set("", "value", 1*time.Minute); err == nil {
		t.Error("空のキーでエラーが発生しませんでした")
	}

	if err := c.Set(testKey, nil, 1*time.Minute); err == nil {
		t.Error("nil値でエラーが発生しませんでした")
	}
}

func testExpiration(t *testing.T, c CacheInterface) {
	key := testKey
	value := testValue
	duration := 1 * time.Millisecond

	if err := c.Set(key, value, duration); err != nil {
		t.Errorf(errSet, err)
	}

	time.Sleep(2 * time.Millisecond)

	got, found, err := c.Get(key)
	if err != nil {
		t.Errorf(errGet, err)
	}
	if found {
		t.Errorf(errGetFound, found)
	}
	if got != nil {
		t.Errorf(errGetNil, got)
	}
}

// TestDelete はキャッシュからの削除をテストします
func TestDelete(t *testing.T) {
	t.Parallel()

	c := GetInstance()

	tests := []struct {
		name  string
		key   string
		value interface{}
	}{
		{
			name:  "正常系: 存在するキーの削除",
			key:   "test_key",
			value: "test_value",
		},
		{
			name:  "正常系: 存在しないキーの削除",
			key:   "non_existent_key",
			value: nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			testDeleteCase(t, c, tt.key, tt.value)
		})
	}
}

func testDeleteCase(t *testing.T, c CacheInterface, key string, value interface{}) {
	if value != nil {
		if err := c.Set(key, value, 1*time.Minute); err != nil {
			t.Errorf(errSet, err)
			return
		}
	}

	if err := c.Delete(key); err != nil {
		t.Errorf(errDelete, err)
		return
	}

	_, found, err := c.Get(key)
	if err != nil {
		t.Errorf(errGet, err)
		return
	}
	if found {
		t.Errorf(errGetFound, found)
	}
}

// TestExpiration はキャッシュの有効期限をテストします
func TestExpiration(t *testing.T) {
	t.Parallel()

	c := GetInstance()

	tests := []struct {
		name     string
		key      string
		value    interface{}
		duration time.Duration
		sleep    time.Duration
		wantFound bool
	}{
		{
			name:     "正常系: 有効期限切れ",
			key:      "test_key",
			value:    "test_value",
			duration: 1 * time.Second,
			sleep:    2 * time.Second,
			wantFound: false,
		},
		{
			name:     "正常系: 有効期限内",
			key:      "test_key_valid",
			value:    "test_value",
			duration: 2 * time.Second,
			sleep:    1 * time.Second,
			wantFound: true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			if err := c.Set(tt.key, tt.value, tt.duration); err != nil {
				t.Errorf(errSet, err)
				return
			}

			time.Sleep(tt.sleep)

			_, found, err := c.Get(tt.key)
			if err != nil {
				t.Errorf(errGet, err)
				return
			}

			if found != tt.wantFound {
				t.Errorf(errGetFoundValue, found, tt.wantFound)
			}
		})
	}
}

// TestStats はキャッシュの統計情報をテストします
func TestStats(t *testing.T) {
	t.Parallel()

	c := GetInstance()

	// キャッシュをクリア
	if err := c.ClearAll(); err != nil {
		t.Errorf(errClearAll, err)
		return
	}

	// テストデータを設定
	key := "test_key"
	value := "test_value"
	if err := c.Set(key, value, 1*time.Minute); err != nil {
		t.Errorf(errSet, err)
		return
	}

	// ヒットをテスト
	_, found, err := c.Get(key)
	if err != nil {
		t.Errorf(errGet, err)
		return
	}
	if !found {
		t.Errorf(errGetFound, found)
		return
	}

	// ミスをテスト
	_, found, err = c.Get("non_existent_key")
	if err != nil {
		t.Errorf(errGet, err)
		return
	}
	if found {
		t.Errorf(errGetFound, found)
		return
	}

	// 統計情報を取得
	hits, misses, err := c.GetStats()
	if err != nil {
		t.Errorf(errGetStats, err)
		return
	}

	if hits != 1 {
		t.Errorf("GetStats() hits = %v, want 1", hits)
	}
	if misses != 1 {
		t.Errorf("GetStats() misses = %v, want 1", misses)
	}

	// ヒット率をテスト
	hitRate, err := c.GetHitRate()
	if err != nil {
		t.Errorf(errGetHitRate, err)
		return
	}
	if hitRate != 50.0 {
		t.Errorf("GetHitRate() = %v, want 50.0", hitRate)
	}
}

// TestClearAll はキャッシュの全削除をテストします
func TestClearAll(t *testing.T) {
	t.Parallel()

	c := GetInstance()

	// テストデータを設定
	keys := []string{"key1", "key2", "key3"}
	for _, key := range keys {
		if err := c.Set(key, "value", 1*time.Minute); err != nil {
			t.Errorf(errSet, err)
			return
		}
	}

	// キャッシュをクリア
	if err := c.ClearAll(); err != nil {
		t.Errorf(errClearAll, err)
		return
	}

	// 全てのキーが削除されていることを確認
	for _, key := range keys {
		_, found, err := c.Get(key)
		if err != nil {
			t.Errorf(errGet, err)
			return
		}
		if found {
			t.Errorf(errGetFound, found)
		}
	}

	// 統計情報がリセットされていることを確認
	hits, misses, err := c.GetStats()
	if err != nil {
		t.Errorf(errGetStats, err)
		return
	}
	if hits != 0 || misses != 0 {
		t.Errorf("GetStats() = (%v, %v), want (0, 0)", hits, misses)
	}
}

// setupTest はキャッシュテスト用のセットアップを行います
func setupTest(t *testing.T) (CacheInterface, string) {
	t.Helper()
	cache := GetInstance()
	key := fmt.Sprintf("test_key_%d", time.Now().UnixNano())
	return cache, key
}

// TestCacheConsistency はキャッシュの整合性テストを行います
func TestCacheConsistency(t *testing.T) {
	cache, key := setupTest(t)
	value := "test_value"

	// キャッシュの設定と検証
	if err := cache.Set(key, value, time.Minute); err != nil {
		t.Fatalf(errSet, err)
	}

	// キャッシュの取得と検証
	got, found, err := cache.Get(key)
	if err != nil {
		t.Fatalf(errGet, err)
	}
	if !found || got != value {
		t.Errorf("キャッシュの取得に失敗: found=%v, got=%v, want=%v", found, got, value)
	}

	// キャッシュの削除と検証
	if err := cache.Delete(key); err != nil {
		t.Fatalf(errDelete, err)
	}
	_, found, err = cache.Get(key)
	if err != nil {
		t.Fatalf(errGet, err)
	}
	if found {
		t.Error("キャッシュが削除されていません")
	}
}

// TestCacheSizeLimit はキャッシュのサイズ制限のテストを行います
func TestCacheSizeLimit(t *testing.T) {
	cache, _ := setupTest(t)

	// キャッシュサイズ制限を超えるデータを追加
	for i := 0; i < maxCacheSize+1; i++ {
		key := fmt.Sprintf("test:%d", i)
		cache.Set(key, "value", time.Minute)
	}

	// キャッシュサイズが制限を超えていないことを確認
	hits, misses, err := cache.GetStats()
	if err != nil {
		t.Fatalf(errGetStats, err)
	}
	if hits+misses > maxCacheSize {
		t.Errorf("キャッシュサイズが制限を超えています: got %d, want <= %d",
			hits+misses, maxCacheSize)
	}
}

// TestCacheExpiration はキャッシュの有効期限のテストを行います
func TestCacheExpiration(t *testing.T) {
	cache, key := setupTest(t)

	// キャッシュにデータを追加（1秒の有効期限）
	cache.Set(key, "value", time.Second)

	// 有効期限を待つ
	time.Sleep(2 * time.Second)

	// キャッシュがクリアされていることを確認
	_, found, err := cache.Get(key)
	if err != nil {
		t.Fatalf(errGet, err)
	}
	if found {
		t.Error("キャッシュが有効期限切れになっていません")
	}
}

// testMemoryManagement はキャッシュのメモリ管理機能をテストします
func testMemoryManagement(t *testing.T, c CacheInterface) {
	// 大量のデータを追加
	for i := 0; i < 1000; i++ {
		key := fmt.Sprintf("test_key_%d", i)
		value := strings.Repeat("a", 1000) // 大きなデータ
		if err := c.Set(key, value, time.Minute); err != nil {
			t.Errorf(errSet, err)
		}
	}

	// メモリ使用量の確認
	metrics, err := c.GetPerformanceMetrics()
	if err != nil {
		t.Errorf("GetPerformanceMetrics() error = %v", err)
	}

	if metrics.MemoryUsage <= 0 {
		t.Error("メモリ使用量が0以下です")
	}

	if metrics.EvictionCount == 0 {
		t.Error("エビクションが発生していません")
	}
}

// TestPerformanceMetrics はパフォーマンスメトリクスのテストを行います
func TestPerformanceMetrics(t *testing.T) {
	c := GetInstance()
	duration := 5 * time.Minute

	// テストデータの準備
	for i := 0; i < 10; i++ {
		err := c.Set(fmt.Sprintf("%s-%d", testKey, i), testValue, duration)
		if err != nil {
			t.Errorf(errSet, err)
		}
	}

	// パフォーマンスメトリクスの取得
	metrics, err := c.GetPerformanceMetrics()
	if err != nil {
		t.Errorf("GetPerformanceMetrics() error = %v", err)
	}

	// メトリクスの検証
	if metrics.TotalItems != 10 {
		t.Errorf("TotalItems = %d, want 10", metrics.TotalItems)
	}
	if metrics.MemoryUsage <= 0 {
		t.Error("MemoryUsage should be greater than 0")
	}
}

// TestEdgeCases はエッジケースのテストを行います
func TestEdgeCases(t *testing.T) {
	c := GetInstance()

	// 空のキー
	_, _, err := c.Get("")
	if err == nil {
		t.Error("Get() with empty key should return error")
	}

	// nil値
	err = c.Set(testKey, nil, 5*time.Minute)
	if err == nil {
		t.Error("Set() with nil value should return error")
	}

	// 負の有効期限
	err = c.Set(testKey, testValue, -1*time.Minute)
	if err == nil {
		t.Error("Set() with negative duration should return error")
	}

	// 存在しないキーの削除
	err = c.Delete("non-existent-key")
	if err != nil {
		t.Errorf("Delete() error = %v", err)
	}
}

// TestConcurrentAccess は並行アクセスのテストを行います
func TestConcurrentAccess(t *testing.T) {
	c := GetInstance()
	duration := 5 * time.Minute

	// 並行アクセスのテスト
	var wg sync.WaitGroup
	for i := 0; i < 100; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			err := c.Set(testKey, testValue, duration)
			if err != nil {
				t.Errorf(errSet, err)
			}
		}()
	}
	wg.Wait()

	// 値の検証
	got, found, err := c.Get(testKey)
	if err != nil {
		t.Errorf(errGet, err)
	}
	if !found {
		t.Error("Get() found = false, want true")
	}
	if got != testValue {
		t.Errorf(errGetValue, got, testValue)
	}
}

// TestTransaction はトランザクションのテストを行います
func TestTransaction(t *testing.T) {
	c := GetInstance()
	key := testKey
	value := testValue
	duration := 5 * time.Minute

	// トランザクションの開始
	err := c.StartTransaction()
	if err != nil {
		t.Errorf("StartTransaction() error = %v", err)
	}

	// トランザクション中の操作
	err = c.Set(key, value, duration)
	if err != nil {
		t.Errorf(errSet, err)
	}

	// トランザクションのコミット
	err = c.CommitTransaction()
	if err != nil {
		t.Errorf("CommitTransaction() error = %v", err)
	}

	// 値の検証
	got, found, err := c.Get(key)
	if err != nil {
		t.Errorf(errGet, err)
	}
	if !found {
		t.Error("Get() found = false, want true")
	}
	if got != value {
		t.Errorf(errGetValue, got, value)
	}
}

// TestTransactionRollback はトランザクションのロールバックをテストします
func TestTransactionRollback(t *testing.T) {
	c := GetInstance()
	key := testKey
	value := testValue
	duration := 5 * time.Minute

	// トランザクションの開始
	err := c.StartTransaction()
	if err != nil {
		t.Errorf("StartTransaction() error = %v", err)
	}

	// トランザクション中の操作
	err = c.Set(key, value, duration)
	if err != nil {
		t.Errorf(errSet, err)
	}

	// トランザクションのロールバック
	err = c.RollbackTransaction()
	if err != nil {
		t.Errorf("RollbackTransaction() error = %v", err)
	}

	// 値が存在しないことを確認
	_, found, err := c.Get(key)
	if err != nil {
		t.Errorf(errGet, err)
	}
	if found {
		t.Error("Get() found = true, want false")
	}
}
