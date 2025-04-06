package cache

import (
	"testing"
	"time"
)

func TestCacheOperations(t *testing.T) {
	c := GetInstance()

	// Setのテスト
	testKey := "test_key"
	testValue := "test_value"
	c.Set(testKey, testValue, 1*time.Minute)

	// Getのテスト
	value, found := c.Get(testKey)
	if !found {
		t.Error("Expected to find value in cache")
	}
	if value != testValue {
		t.Errorf("Expected %v, got %v", testValue, value)
	}

	// Deleteのテスト
	c.Delete(testKey)
	_, found = c.Get(testKey)
	if found {
		t.Error("Expected value to be deleted from cache")
	}

	// 有効期限切れのテスト
	c.Set(testKey, testValue, 1*time.Second)
	time.Sleep(2 * time.Second)
	_, found = c.Get(testKey)
	if found {
		t.Error("Expected value to be expired")
	}
}
