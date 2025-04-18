// Package testutils はテスト用のユーティリティ関数を提供します。
// このパッケージは以下の機能を提供します：
// - モックキャッシュの実装
// - スレッドセーフなキャッシュ操作
// - 有効期限付きキャッシュアイテムの管理
package testutils

import (
	"sync"
	"time"
)

// MockCache はキャッシュのモック実装です
// この構造体は以下の機能を提供します：
// - キーバリューストア
// - 有効期限管理
// - スレッドセーフな操作
type MockCache struct {
	mu    sync.RWMutex
	items map[string]cacheItem
}

// cacheItem はキャッシュアイテムの構造体です
// この構造体は以下の情報を保持します：
// - キャッシュされた値
// - 有効期限
type cacheItem struct {
	value      interface{}
	expiration time.Time
}

// NewMockCache は新しいモックキャッシュを作成します
// この関数は以下の処理を行います：
// - キャッシュアイテムマップの初期化
// - モックキャッシュインスタンスの生成
func NewMockCache() *MockCache {
	return &MockCache{
		items: make(map[string]cacheItem),
	}
}

// Set はキャッシュに値を設定します
// この関数は以下の処理を行います：
// - キーと値の設定
// - 有効期限の設定
// - スレッドセーフな操作
func (c *MockCache) Set(key string, value interface{}, expiration time.Duration) {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.items[key] = cacheItem{
		value:      value,
		expiration: time.Now().Add(expiration),
	}
}

// Get はキャッシュから値を取得します
// この関数は以下の処理を行います：
// - キーによる値の検索
// - 有効期限のチェック
// - スレッドセーフな操作
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
// この関数は以下の処理を行います：
// - キーによる値の削除
// - スレッドセーフな操作
func (c *MockCache) Delete(key string) {
	c.mu.Lock()
	defer c.mu.Unlock()

	delete(c.items, key)
}

// Clear はキャッシュをクリアします
// この関数は以下の処理を行います：
// - キャッシュアイテムの全削除
// - スレッドセーフな操作
func (c *MockCache) Clear() {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.items = make(map[string]cacheItem)
}
