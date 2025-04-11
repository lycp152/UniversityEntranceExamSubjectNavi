package testutils

import (
	"sync"
	"time"
)

// MockCache はキャッシュのモック実装です
type MockCache struct {
	mu    sync.RWMutex
	items map[string]cacheItem
}

type cacheItem struct {
	value      interface{}
	expiration time.Time
}

// NewMockCache は新しいモックキャッシュを作成します
func NewMockCache() *MockCache {
	return &MockCache{
		items: make(map[string]cacheItem),
	}
}

// Set はキャッシュに値を設定します
func (c *MockCache) Set(key string, value interface{}, expiration time.Duration) {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.items[key] = cacheItem{
		value:      value,
		expiration: time.Now().Add(expiration),
	}
}

// Get はキャッシュから値を取得します
func (c *MockCache) Get(key string) (interface{}, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	item, found := c.items[key]
	if !found {
		return nil, false
	}

	if time.Now().After(item.expiration) {
		delete(c.items, key)
		return nil, false
	}

	return item.value, true
}

// Delete はキャッシュから値を削除します
func (c *MockCache) Delete(key string) {
	c.mu.Lock()
	defer c.mu.Unlock()

	delete(c.items, key)
}

// Clear はキャッシュをクリアします
func (c *MockCache) Clear() {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.items = make(map[string]cacheItem)
}
