// Package cache はキャッシュ機能を提供するパッケージです。
// このパッケージは、アプリケーション全体で使用されるキャッシュの実装を提供します。
// 主な機能：
// - キーバリューストアの実装
// - トランザクションのサポート
// - パフォーマンスメトリクスの収集
// - メモリ管理
// - スレッドセーフな操作
package cache

import (
	"context"
	"fmt"
	"sync"
	"time"
	appErrors "university-exam-api/internal/errors"
	applogger "university-exam-api/internal/logger"
	"unsafe"

	gocache "github.com/patrickmn/go-cache"
)

// Interface はキャッシュのインターフェースを定義します。
// このインターフェースは以下の操作を提供します：
// - キャッシュへのデータの保存
// - キャッシュからのデータの取得
// - キャッシュのクリア
// - トランザクションの管理
// - パフォーマンスメトリクスの取得
type Interface interface {
	Set(key string, value interface{}, duration time.Duration) error
	Get(key string) (interface{}, bool, error)
	Delete(key string) error
	GetStats() (hits, misses int64, err error)
	GetHitRate() (float64, error)
	ClearAll() error
	StartTransaction() error
	CommitTransaction() error
	RollbackTransaction() error
	RecordLatency(operation string, duration time.Duration) error
	GetPerformanceMetrics() (*PerformanceMetrics, error)
}

// cacheItem はキャッシュアイテムを表します。
// この構造体は以下の情報を保持します：
// - キャッシュされた値
// - 有効期限
// - 作成日時
// - アクセス回数
type cacheItem struct {
	value      interface{}
	expiration time.Time
	createdAt  time.Time
	accessCount int64
}

// PerformanceMetrics はキャッシュのパフォーマンスメトリクスを表します。
// この構造体は以下のメトリクスを保持します：
// - ヒット率
// - 平均レイテンシ
// - 総アイテム数
// - メモリ使用量
// - 削除されたアイテム数
// - トランザクション数
// - 失敗した操作数
type PerformanceMetrics struct {
	HitRate           float64
	AverageLatency    time.Duration
	TotalItems        int
	MemoryUsage       int64
	EvictionCount     int64
	TransactionCount  int64
	FailedOperations  int64
}

// Stats はキャッシュの統計情報を保持します。
// この構造体は以下の統計情報を保持します：
// - ヒット数
// - ミス数
// - 削除されたアイテム数
// - メモリ使用量
// - アイテム数
type Stats struct {
	Hits        int64
	Misses      int64
	Evictions   int64
	MemoryUsage int64
	ItemCount   int
}

// エラーコードの定義
const (
	ErrEmptyKey = "キャッシュキーは空にできません"
	ErrNilValue = "キャッシュ値はnilにできません"
	ErrKeyNotFound = "指定されたキーは存在しません"
	ErrInvalidDuration = "無効な有効期限が指定されました"
	ErrCacheFull = "キャッシュが最大サイズに達しました"
	ErrTransactionInProgress = "トランザクションが既に進行中です"
	ErrNoTransaction = "アクティブなトランザクションがありません"
	ErrInvalidOperation = "無効な操作が実行されました"
	ErrMemoryLimitExceeded = "メモリ制限を超えました"
)

// Cache はキャッシュの実装を提供します。
// この構造体は以下の機能を提供します：
// - アイテムの保存と取得
// - トランザクションの管理
// - 統計情報の収集
// - メモリ管理
// - クリーンアップ処理
type Cache struct {
	items       map[string]cacheItem
	mu          sync.RWMutex
	stats       Stats
	metrics     struct {
		latencies     []time.Duration
		evictions     int64
		transactions  int64
		failedOps     int64
	}
	maxSize      int64
	currentSize  int64
	transaction  *Transaction
}

// Transaction はキャッシュのトランザクションを表します。
// この構造体は以下の機能を提供します：
// - トランザクション内のアイテムの管理
// - トランザクションのコミットとロールバック
// - スレッドセーフな操作
type Transaction struct {
	items map[string]cacheItem
	mu    sync.RWMutex
}

var (
	cleanupInterval  = 10 * time.Minute
	instance         *Cache
	once            sync.Once
)

// NewTransaction は新しいトランザクションを作成します
func NewTransaction() *Transaction {
	return &Transaction{
		items: make(map[string]cacheItem),
	}
}

// GetInstance はキャッシュのシングルトンインスタンスを返します。
// この関数は以下の処理を行います：
// - キャッシュインスタンスの初期化
// - クリーンアップ処理の開始
// - スレッドセーフな初期化の保証
func GetInstance() Interface {
	once.Do(func() {
		instance = &Cache{
			items:      make(map[string]cacheItem),
			maxSize:    defaultMaxSize,
			stats:      Stats{},
		}
		go instance.startCleanup()
	})

	return instance
}

// Set はキャッシュにアイテムを保存します。
// この関数は以下の処理を行います：
// - 入力値の検証
// - メモリ使用量のチェック
// - トランザクションのサポート
// - エラーハンドリング
func (c *Cache) Set(key string, value interface{}, duration time.Duration) error {
	if key == "" {
		return appErrors.NewInvalidInputError("key", ErrEmptyKey, nil)
	}

	if value == nil {
		return appErrors.NewInvalidInputError("value", ErrNilValue, nil)
	}

	if duration < 0 {
		return appErrors.NewInvalidInputError("duration", ErrInvalidDuration, nil)
	}

	c.mu.Lock()
	defer c.mu.Unlock()

	// トランザクション中の場合
	if c.transaction != nil {
		c.transaction.mu.Lock()
		defer c.transaction.mu.Unlock()
		c.transaction.items[key] = cacheItem{
			value:      value,
			expiration: time.Now().Add(duration),
			createdAt:  time.Now(),
			accessCount: 0,
		}

		return nil
	}

	// メモリ使用量のチェック
	itemSize := calculateItemSize(value)
	currentSize := c.currentSize + itemSize

	if currentSize > c.maxSize {
		c.evictItems()

		if c.currentSize+itemSize > c.maxSize {
			return appErrors.NewSystemError(ErrCacheFull, nil, nil)
		}
	}

	expiration := time.Now().Add(duration)
	c.items[key] = cacheItem{
		value:      value,
		expiration: expiration,
		createdAt:  time.Now(),
		accessCount: 0,
	}
	c.currentSize += itemSize
	c.stats.ItemCount++

	applogger.Info(context.Background(), "キャッシュ: キー %s でアイテムを保存しました", key)

	return nil
}

// calculateItemSize はアイテムのサイズを計算します。
// この関数は以下の処理を行います：
// - 型に応じたサイズ計算
// - メモリ使用量の推定
// - 複雑な型のサイズ計算
func calculateItemSize(value interface{}) int64 {
	// より正確なサイズ計算
	switch v := value.(type) {
	case string:
		return int64(len(v))
	case []byte:
		return int64(len(v))
	case int, int8, int16, int32, int64:
		return 8
	case uint, uint8, uint16, uint32, uint64:
		return 8
	case float32, float64:
		return 8
	case bool:
		return 1
	default:
		// 複雑な型の場合は概算値を使用
		return int64(unsafe.Sizeof(value))
	}
}

// evictItems は古いアイテムを削除してメモリを解放します。
// この関数は以下の処理を行います：
// - 期限切れアイテムの検出
// - アクセス頻度の低いアイテムの削除
// - メモリ使用量の最適化
func (c *Cache) evictItems() {
	now := time.Now()
	for key, item := range c.items {
		if now.After(item.expiration) || item.accessCount == 0 {
			delete(c.items, key)
			c.currentSize -= calculateItemSize(item.value)
			c.metrics.evictions++
		}
	}
}

// Get はキャッシュからアイテムを取得します。
// この関数は以下の処理を行います：
// - キーの検証
// - トランザクションのサポート
// - ヒット率の更新
// - アクセス回数の更新
func (c *Cache) Get(key string) (interface{}, bool, error) {
	if key == "" {
		return nil, false, appErrors.NewInvalidInputError("key", ErrEmptyKey, nil)
	}

	c.mu.RLock()
	defer c.mu.RUnlock()

	// トランザクション中の場合
	if c.transaction != nil {
		c.transaction.mu.RLock()
		defer c.transaction.mu.RUnlock()

		item, exists := c.transaction.items[key]
		if exists {
			// 統計情報の更新をロックで保護
			c.mu.RUnlock()
			c.mu.Lock()
			c.stats.Hits++
			c.mu.Unlock()
			c.mu.RLock()
			return item.value, true, nil
		}
	}

	item, exists := c.items[key]
	if !exists {
		// 統計情報の更新をロックで保護
		c.mu.RUnlock()
		c.mu.Lock()
		c.stats.Misses++
		c.mu.Unlock()
		c.mu.RLock()
		return nil, false, nil
	}

	if time.Now().After(item.expiration) {
		// 統計情報の更新をロックで保護
		c.mu.RUnlock()
		c.mu.Lock()
		c.stats.Misses++
		c.mu.Unlock()
		c.mu.RLock()
		return nil, false, nil
	}

	// 統計情報の更新をロックで保護
	c.mu.RUnlock()
	c.mu.Lock()
	c.stats.Hits++
	item.accessCount++
	c.items[key] = item
	c.mu.Unlock()
	c.mu.RLock()

	applogger.Info(context.Background(), "キャッシュ: キー %s でヒットしました", key)

	return item.value, true, nil
}

// Delete はキャッシュからアイテムを削除します。
// この関数は以下の処理を行います：
// - キーの検証
// - アイテムの削除
// - メモリ使用量の更新
func (c *Cache) Delete(key string) error {
	if key == "" {
		return appErrors.NewInvalidInputError("key", ErrEmptyKey, nil)
	}

	c.mu.Lock()
	defer c.mu.Unlock()

	delete(c.items, key)
	applogger.Info(context.Background(), "キャッシュ: キー %s のアイテムを削除しました", key)

	return nil
}

// cleanup は期限切れのアイテムを削除します。
// この関数は以下の処理を行います：
// - 期限切れアイテムの検出
// - アイテムの削除
// - ログの記録
func (c *Cache) cleanup() {
	c.mu.Lock()
	defer c.mu.Unlock()

	now := time.Now()
	for key, item := range c.items {
		if now.After(item.expiration) {
			delete(c.items, key)
			applogger.Info(context.Background(), "キャッシュ: キー %s の期限切れアイテムを削除しました", key)
		}
	}
}

// startCleanup は定期的なクリーンアップを開始します。
// この関数は以下の処理を行います：
// - タイマーの設定
// - 定期的なクリーンアップの実行
// - リソースの解放
func (c *Cache) startCleanup() {
	ticker := time.NewTicker(cleanupInterval)
	for range ticker.C {
		c.cleanup()
	}
}

// GetStats はキャッシュの統計情報を返します。
// この関数は以下の処理を行います：
// - ヒット数の取得
// - ミス数の取得
// - スレッドセーフな操作
func (c *Cache) GetStats() (hits, misses int64, err error) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	return c.stats.Hits, c.stats.Misses, nil
}

// GetHitRate はキャッシュのヒット率を返します。
// この関数は以下の処理を行います：
// - 統計情報の取得
// - ヒット率の計算
// - エラーハンドリング
func (c *Cache) GetHitRate() (float64, error) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	total := c.stats.Hits + c.stats.Misses

	if total == 0 {
		return 0, nil
	}

	return float64(c.stats.Hits) / float64(total) * 100, nil
}

// ClearAll はキャッシュの全アイテムを削除します。
// この関数は以下の処理を行います：
// - キャッシュのクリア
// - 統計情報のリセット
// - メモリ使用量のリセット
func (c *Cache) ClearAll() error {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.items = make(map[string]cacheItem)
	c.stats.Hits = 0
	c.stats.Misses = 0

	return nil
}

// キャッシュキーの定義
const (
	// CacheKeyAllUniversities は全ての大学データのキャッシュキーを表します
	CacheKeyAllUniversities = "universities:all"
	CacheKeyUniversityFormat = "universities:%d"
	CacheKeyDepartmentFormat = "departments:%d:%d"
	maxCacheSize = 1000 // 最大キャッシュエントリ数
	maxLatencyHistory = 1000
	defaultMaxSize = 1000
	cacheDuration = 5 * time.Minute
	cacheCleanupInterval = 10 * time.Minute
)

// Manager はキャッシュ管理を担当します。
// この構造体は以下の機能を提供します：
// - キャッシュの初期化と管理
// - キャッシュのクリア
// - 統計情報の収集
// - スレッドセーフな操作
type Manager struct {
	cache *gocache.Cache
	mutex *sync.RWMutex
	stats *Stats
}

// NewCacheManager は新しいキャッシュマネージャーを作成します
func NewCacheManager() *Manager {
	return &Manager{
		cache: gocache.New(cacheDuration, cacheCleanupInterval),
		mutex: &sync.RWMutex{},
		stats: &Stats{},
	}
}

// GetFromCache はキャッシュから値を取得します
func (cm *Manager) GetFromCache(key string) (interface{}, bool) {
	cm.mutex.Lock()
	defer cm.mutex.Unlock()

	// キャッシュサイズチェック
	if cm.cache.ItemCount() >= maxCacheSize {
		applogger.Warn(context.Background(), "キャッシュサイズが上限に達しました: %d", maxCacheSize)
		return nil, false
	}

	value, found := cm.cache.Get(key)
	if found {
		cm.stats.Hits++
	} else {
		cm.stats.Misses++
	}

	return value, found
}

// SetCache はキャッシュに値を設定します
func (cm *Manager) SetCache(key string, value interface{}) {
	cm.mutex.Lock()
	defer cm.mutex.Unlock()

	// キャッシュサイズチェック
	if cm.cache.ItemCount() >= maxCacheSize {
		applogger.Warn(context.Background(), "キャッシュサイズが上限に達しました: %d", maxCacheSize)
		return
	}

	cm.cache.Set(key, value, cacheDuration)
}

// ClearAllRelatedCache は大学に関連する全てのキャッシュをクリアします
func (cm *Manager) ClearAllRelatedCache(universityID uint) {
	cm.mutex.Lock()
	defer cm.mutex.Unlock()

	// バッチ処理でキャッシュをクリア
	keys := []string{
		CacheKeyAllUniversities,
		fmt.Sprintf(CacheKeyUniversityFormat, universityID),
	}

	// 学部のキャッシュキーを追加
	keys = append(keys, fmt.Sprintf("departments:%d:*", universityID))

	for _, key := range keys {
		cm.cache.Delete(key)
	}

	applogger.Info(context.Background(), "大学ID %d に関連する全てのキャッシュをクリアしました", universityID)
}

// ClearSubjectsCache は科目のキャッシュをクリアします
func (cm *Manager) ClearSubjectsCache(testTypeID uint) {
	cm.mutex.Lock()
	defer cm.mutex.Unlock()

	// 科目のキャッシュキーをクリア
	cm.cache.Delete(fmt.Sprintf("subjects:%d:*", testTypeID))
}

// GetStats はキャッシュの統計情報を返します
func (cm *Manager) GetStats() (hits, misses int64) {
	cm.mutex.RLock()
	defer cm.mutex.RUnlock()

	return cm.stats.Hits, cm.stats.Misses
}

// GetHitRate はキャッシュのヒット率を返します
func (cm *Manager) GetHitRate() float64 {
	cm.mutex.RLock()
	defer cm.mutex.RUnlock()

	total := cm.stats.Hits + cm.stats.Misses

	if total == 0 {
		return 0
	}

	return float64(cm.stats.Hits) / float64(total) * 100
}

// StartTransaction はトランザクションを開始します。
// この関数は以下の処理を行います：
// - トランザクションの初期化
// - 重複開始の防止
// - エラーハンドリング
func (c *Cache) StartTransaction() error {
	c.mu.Lock()
	defer c.mu.Unlock()

	if c.transaction != nil {
		return appErrors.NewSystemError(ErrTransactionInProgress, nil, nil)
	}

	c.transaction = NewTransaction()
	c.metrics.transactions++

	return nil
}

// CommitTransaction はトランザクションをコミットします。
// この関数は以下の処理を行います：
// - トランザクションの検証
// - アイテムのコミット
// - メモリ使用量のチェック
func (c *Cache) CommitTransaction() error {
	c.mu.Lock()
	defer c.mu.Unlock()

	if c.transaction == nil {
		return appErrors.NewSystemError(ErrNoTransaction, nil, nil)
	}

	// トランザクションのアイテムをメインキャッシュに移動
	for key, item := range c.transaction.items {
		// メモリ使用量のチェック
		itemSize := calculateItemSize(item.value)
		if c.currentSize+itemSize > c.maxSize {
			// 一時的にロックを解放してevictItemsを実行
			c.mu.Unlock()
			c.evictItems()
			c.mu.Lock()

			if c.currentSize+itemSize > c.maxSize {
				c.transaction = nil
				return appErrors.NewSystemError(ErrCacheFull, nil, nil)
			}
		}

		c.items[key] = item
		c.currentSize += itemSize
		c.stats.ItemCount++
	}

	c.transaction = nil

	return nil
}

// RollbackTransaction はトランザクションをロールバックします。
// この関数は以下の処理を行います：
// - トランザクションの検証
// - トランザクションの破棄
// - リソースの解放
func (c *Cache) RollbackTransaction() error {
	c.mu.Lock()
	defer c.mu.Unlock()

	if c.transaction == nil {
		return appErrors.NewSystemError(ErrNoTransaction, nil, nil)
	}

	c.transaction = nil

	return nil
}

// GetPerformanceMetrics はキャッシュのパフォーマンスメトリクスを返します。
// この関数は以下の処理を行います：
// - メトリクスの収集
// - 統計情報の計算
// - スレッドセーフな操作
func (c *Cache) GetPerformanceMetrics() (*PerformanceMetrics, error) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	total := c.stats.Hits + c.stats.Misses
	hitRate := 0.0

	if total > 0 {
		hitRate = float64(c.stats.Hits) / float64(total) * 100
	}

	var avgLatency time.Duration

	var totalLatency time.Duration

	if len(c.metrics.latencies) > 0 {
		for _, latency := range c.metrics.latencies {
			totalLatency += latency
		}

		avgLatency = totalLatency / time.Duration(len(c.metrics.latencies))
	}

	return &PerformanceMetrics{
		HitRate:           hitRate,
		AverageLatency:    avgLatency,
		TotalItems:        c.stats.ItemCount,
		MemoryUsage:       c.currentSize,
		EvictionCount:     c.metrics.evictions,
		TransactionCount:  c.metrics.transactions,
		FailedOperations:  c.metrics.failedOps,
	}, nil
}

// RecordLatency は操作のレイテンシを記録します。
// この関数は以下の処理を行います：
// - レイテンシの記録
// - 履歴の管理
// - スレッドセーフな操作
func (c *Cache) RecordLatency(_ string, duration time.Duration) error {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.metrics.latencies = append(c.metrics.latencies, duration)
	if len(c.metrics.latencies) > maxLatencyHistory {
		c.metrics.latencies = c.metrics.latencies[1:]
	}

	return nil
}
