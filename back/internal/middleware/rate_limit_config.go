package middleware

import (
	"os"
	"strconv"
	"time"
)

// RateLimitConfig はレート制限の設定値を保持します
type RateLimitConfig struct {
	// テスト用の設定値
	TestNumRequests  int           // テスト時の総リクエスト数
	TestTimeWindow   int           // テスト時の時間枠（秒）
	TestMaxRequests  int           // テスト時の最大リクエスト数
	TestCooldownTime time.Duration // テスト時のクールダウン時間
	TestNumGoroutines int         // テスト時の並行リクエスト数
}

// DefaultTestConfig はテスト用のデフォルト設定を返します
func DefaultTestConfig() *RateLimitConfig {
	return &RateLimitConfig{
		TestNumRequests:  100,  // 短時間での総リクエスト数
		TestTimeWindow:   1,    // 時間枠（秒）
		TestMaxRequests:  50,   // 時間枠内での最大リクエスト数
		TestCooldownTime: time.Second,
		TestNumGoroutines: 10,  // 並行リクエスト数
	}
}

// LoadTestConfig は環境変数からテスト設定を読み込みます
func LoadTestConfig() *RateLimitConfig {
	config := DefaultTestConfig()

	// 環境変数から設定を読み込む
	if numRequests := os.Getenv("TEST_RATE_LIMIT_NUM_REQUESTS"); numRequests != "" {
		if n, err := strconv.Atoi(numRequests); err == nil {
			config.TestNumRequests = n
		}
	}

	if timeWindow := os.Getenv("TEST_RATE_LIMIT_TIME_WINDOW"); timeWindow != "" {
		if t, err := strconv.Atoi(timeWindow); err == nil {
			config.TestTimeWindow = t
		}
	}

	if maxRequests := os.Getenv("TEST_RATE_LIMIT_MAX_REQUESTS"); maxRequests != "" {
		if m, err := strconv.Atoi(maxRequests); err == nil {
			config.TestMaxRequests = m
		}
	}

	if cooldownTime := os.Getenv("TEST_RATE_LIMIT_COOLDOWN_TIME"); cooldownTime != "" {
		if d, err := time.ParseDuration(cooldownTime); err == nil {
			config.TestCooldownTime = d
		}
	}

	if numGoroutines := os.Getenv("TEST_RATE_LIMIT_NUM_GOROUTINES"); numGoroutines != "" {
		if n, err := strconv.Atoi(numGoroutines); err == nil {
			config.TestNumGoroutines = n
		}
	}

	return config
}
