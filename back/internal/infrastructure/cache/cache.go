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

// CacheInterface はキャッシュのインターフェースを定義します
type CacheInterface interface {
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

// cacheItem はキャッシュアイテムを表します
type cacheItem struct {
	value      interface{}
	expiration time.Time
	createdAt  time.Time
	accessCount int64
}

// PerformanceMetrics はキャッシュのパフォーマンスメトリクスを表します
type PerformanceMetrics struct {
	HitRate           float64
	AverageLatency    time.Duration
	TotalItems        int
	MemoryUsage       int64
	EvictionCount     int64
	TransactionCount  int64
	FailedOperations  int64
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
)

// CacheStats はキャッシュの統計情報を保持します
type CacheStats struct {
	Hits        int64
	Misses      int64
	Evictions   int64
	MemoryUsage int64
	ItemCount   int
}

// Cache はキャッシュの実装を提供します
type Cache struct {
	items       map[string]cacheItem
	mu          sync.RWMutex
	stats       CacheStats
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

// Transaction はキャッシュのトランザクションを表します
type Transaction struct {
	items map[string]cacheItem
	mu    sync.RWMutex
}

var (
	defaultExpiration = 5 * time.Minute
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

// GetInstance はキャッシュのシングルトンインスタンスを返します
func GetInstance() CacheInterface {
	once.Do(func() {
		instance = &Cache{
			items:      make(map[string]cacheItem),
			maxSize:    defaultMaxSize,
			stats:      CacheStats{},
		}
		go instance.startCleanup()
	})

	return instance
}

// Set はキャッシュにアイテムを保存します
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

	if c.currentSize+itemSize > c.maxSize {
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

// calculateItemSize はアイテムのサイズを計算します
func calculateItemSize(value interface{}) int64 {
	// 簡易的なサイズ計算
	return int64(unsafe.Sizeof(value))
}

// evictItems は古いアイテムを削除してメモリを解放します
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

// Get はキャッシュからアイテムを取得します
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
			c.stats.Hits++
			return item.value, true, nil
		}
	}

	item, exists := c.items[key]
	if !exists {
		c.stats.Misses++
		return nil, false, nil
	}

	if time.Now().After(item.expiration) {
		c.stats.Misses++
		return nil, false, nil
	}

	c.stats.Hits++
	item.accessCount++
	c.items[key] = item

	applogger.Info(context.Background(), "キャッシュ: キー %s でヒットしました", key)

	return item.value, true, nil
}

// Delete はキャッシュからアイテムを削除します
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

// cleanup は期限切れのアイテムを削除します
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

// startCleanup は定期的なクリーンアップを開始します
func (c *Cache) startCleanup() {
	ticker := time.NewTicker(cleanupInterval)
	for range ticker.C {
		c.cleanup()
	}
}

// GetStats はキャッシュの統計情報を返します
func (c *Cache) GetStats() (hits, misses int64, err error) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	return c.stats.Hits, c.stats.Misses, nil
}

// GetHitRate はキャッシュのヒット率を返します
func (c *Cache) GetHitRate() (float64, error) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	total := c.stats.Hits + c.stats.Misses

	if total == 0 {
		return 0, nil
	}

	return float64(c.stats.Hits) / float64(total) * 100, nil
}

// ClearAll はキャッシュの全アイテムを削除します
func (c *Cache) ClearAll() error {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.items = make(map[string]cacheItem)
	c.stats.Hits = 0
	c.stats.Misses = 0

	return nil
}

const (
	cacheDuration = 5 * time.Minute
	cacheCleanupInterval = 10 * time.Minute
	CacheKeyAllUniversities = "universities:all"
	CacheKeyUniversityFormat = "universities:%d"
	CacheKeyDepartmentFormat = "departments:%d:%d"
	maxCacheSize = 1000 // 最大キャッシュエントリ数
	maxLatencyHistory = 1000
	defaultMaxSize = 1000
)

// CacheManager はキャッシュ管理を担当します
type CacheManager struct {
	cache *gocache.Cache
	mutex *sync.RWMutex
	stats *CacheStats
}

// newCacheManager は新しいキャッシュマネージャーを作成します
func NewCacheManager() *CacheManager {
	return &CacheManager{
		cache: gocache.New(cacheDuration, cacheCleanupInterval),
		mutex: &sync.RWMutex{},
		stats: &CacheStats{},
	}
}

// GetFromCache はキャッシュから値を取得します
func (cm *CacheManager) GetFromCache(key string) (interface{}, bool) {
	cm.mutex.RLock()
	defer cm.mutex.RUnlock()

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
func (cm *CacheManager) SetCache(key string, value interface{}) {
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
func (cm *CacheManager) ClearAllRelatedCache(universityID uint) {
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
func (cm *CacheManager) ClearSubjectsCache(testTypeID uint) {
	cm.mutex.Lock()
	defer cm.mutex.Unlock()

	// 科目のキャッシュキーをクリア
	cm.cache.Delete(fmt.Sprintf("subjects:%d:*", testTypeID))
}

// GetStats はキャッシュの統計情報を返します
func (cm *CacheManager) GetStats() (hits, misses int64) {
	cm.mutex.RLock()
	defer cm.mutex.RUnlock()

	return cm.stats.Hits, cm.stats.Misses
}

// GetHitRate はキャッシュのヒット率を返します
func (cm *CacheManager) GetHitRate() float64 {
	cm.mutex.RLock()
	defer cm.mutex.RUnlock()

	total := cm.stats.Hits + cm.stats.Misses

	if total == 0 {
		return 0
	}

	return float64(cm.stats.Hits) / float64(total) * 100
}

// StartTransaction はトランザクションを開始します
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

// CommitTransaction はトランザクションをコミットします
func (c *Cache) CommitTransaction() error {
	c.mu.Lock()
	defer c.mu.Unlock()

	if c.transaction == nil {
		return appErrors.NewSystemError(ErrNoTransaction, nil, nil)
	}

	c.transaction.mu.Lock()
	defer c.transaction.mu.Unlock()

	for key, item := range c.transaction.items {
		c.items[key] = item
	}

	c.transaction = nil

	return nil
}

// RollbackTransaction はトランザクションをロールバックします
func (c *Cache) RollbackTransaction() error {
	c.mu.Lock()
	defer c.mu.Unlock()

	if c.transaction == nil {
		return appErrors.NewSystemError(ErrNoTransaction, nil, nil)
	}

	c.transaction = nil

	return nil
}

// GetPerformanceMetrics はキャッシュのパフォーマンスメトリクスを返します
func (c *Cache) GetPerformanceMetrics() (*PerformanceMetrics, error) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	total := c.stats.Hits + c.stats.Misses
	hitRate := 0.0

	if total > 0 {
		hitRate = float64(c.stats.Hits) / float64(total) * 100
	}

	var avgLatency time.Duration
	if len(c.metrics.latencies) > 0 {
		var totalLatency time.Duration
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

// RecordLatency は操作のレイテンシを記録します
func (c *Cache) RecordLatency(operation string, duration time.Duration) error {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.metrics.latencies = append(c.metrics.latencies, duration)
	if len(c.metrics.latencies) > maxLatencyHistory {
		c.metrics.latencies = c.metrics.latencies[1:]
	}
	return nil
}
