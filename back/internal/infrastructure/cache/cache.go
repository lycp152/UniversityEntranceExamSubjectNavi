package cache

import (
	"sync"
	"time"
	"university-exam-api/pkg/logger"
)

type cacheItem struct {
	value      interface{}
	expiration time.Time
}

type Cache struct {
	items map[string]cacheItem
	mu    sync.RWMutex
}

var (
	defaultExpiration = 5 * time.Minute
	cleanupInterval  = 10 * time.Minute
	instance         *Cache
	once            sync.Once
)

// GetInstance はキャッシュのシングルトンインスタンスを返します
func GetInstance() *Cache {
	once.Do(func() {
		instance = &Cache{
			items: make(map[string]cacheItem),
		}
		go instance.startCleanup()
	})
	return instance
}

// Set はキャッシュにアイテムを保存します
func (c *Cache) Set(key string, value interface{}, duration time.Duration) {
	c.mu.Lock()
	defer c.mu.Unlock()

	expiration := time.Now().Add(duration)
	c.items[key] = cacheItem{
		value:      value,
		expiration: expiration,
	}
	logger.Info("Cache: Set item with key: %s", key)
}

// Get はキャッシュからアイテムを取得します
func (c *Cache) Get(key string) (interface{}, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	item, exists := c.items[key]
	if !exists {
		return nil, false
	}

	if time.Now().After(item.expiration) {
		return nil, false
	}

	logger.Info("Cache: Hit for key: %s", key)
	return item.value, true
}

// Delete はキャッシュからアイテムを削除します
func (c *Cache) Delete(key string) {
	c.mu.Lock()
	defer c.mu.Unlock()

	delete(c.items, key)
	logger.Info("Cache: Deleted item with key: %s", key)
}

// cleanup は期限切れのアイテムを削除します
func (c *Cache) cleanup() {
	c.mu.Lock()
	defer c.mu.Unlock()

	now := time.Now()
	for key, item := range c.items {
		if now.After(item.expiration) {
			delete(c.items, key)
			logger.Info("Cache: Cleaned up expired item with key: %s", key)
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
