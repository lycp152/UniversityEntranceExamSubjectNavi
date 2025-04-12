package middleware

import (
	"errors"
	"fmt"
	"os"
	"strconv"
	"time"
)

// デフォルト設定値の定数
const (
	DefaultTestNumRequests  = 100
	DefaultTestTimeWindow   = 1
	DefaultTestMaxRequests  = 50
	DefaultTestCooldownTime = time.Second
	DefaultTestNumGoroutines = 10
)

// エラー定義
var (
	ErrInvalidNumRequests  = errors.New("テスト時の総リクエスト数は正の値である必要があります")
	ErrInvalidTimeWindow   = errors.New("テスト時の時間枠は正の値である必要があります")
	ErrInvalidMaxRequests  = errors.New("テスト時の最大リクエスト数は正の値である必要があります")
	ErrInvalidCooldownTime = errors.New("テスト時のクールダウン時間は正の値である必要があります")
	ErrInvalidNumGoroutines = errors.New("テスト時の並行リクエスト数は正の値である必要があります")
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

// validateConfig は設定値の妥当性を検証します
func (c *RateLimitConfig) validateConfig() error {
	if c.TestNumRequests <= 0 {
		return ErrInvalidNumRequests
	}

	if c.TestTimeWindow <= 0 {
		return ErrInvalidTimeWindow
	}

	if c.TestMaxRequests <= 0 {
		return ErrInvalidMaxRequests
	}

	if c.TestCooldownTime <= 0 {
		return ErrInvalidCooldownTime
	}

	if c.TestNumGoroutines <= 0 {
		return ErrInvalidNumGoroutines
	}

	return nil
}

// DefaultTestConfig はテスト用のデフォルト設定を返します
func DefaultTestConfig() *RateLimitConfig {
	return &RateLimitConfig{
		TestNumRequests:   DefaultTestNumRequests,
		TestTimeWindow:    DefaultTestTimeWindow,
		TestMaxRequests:   DefaultTestMaxRequests,
		TestCooldownTime:  DefaultTestCooldownTime,
		TestNumGoroutines: DefaultTestNumGoroutines,
	}
}

// loadEnvInt は環境変数から整数値を読み込みます
func loadEnvInt(envName string) (int, error) {
	value := os.Getenv(envName)
	if value == "" {
		return 0, nil
	}

	n, err := strconv.Atoi(value)
	if err != nil {
		return 0, fmt.Errorf("%sの値が不正です: %w", envName, err)
	}

	if n < 0 {
		return 0, fmt.Errorf("%sは負の値を設定できません", envName)
	}

	return n, nil
}

// loadEnvDuration は環境変数から時間値を読み込みます
func loadEnvDuration(envName string) (time.Duration, error) {
	value := os.Getenv(envName)
	if value == "" {
		return 0, nil
	}

	d, err := time.ParseDuration(value)
	if err != nil {
		return 0, fmt.Errorf("%sの値が不正です: %w", envName, err)
	}

	if d < 0 {
		return 0, fmt.Errorf("%sは負の値を設定できません", envName)
	}

	return d, nil
}

// LoadTestConfig は環境変数からテスト設定を読み込みます
func LoadTestConfig() (*RateLimitConfig, error) {
	config := DefaultTestConfig()

	if n, err := loadEnvInt("TEST_RATE_LIMIT_NUM_REQUESTS"); err != nil {
		return nil, fmt.Errorf("総リクエスト数の読み込みに失敗: %w", err)
	} else if n != 0 {
		config.TestNumRequests = n
	}

	if t, err := loadEnvInt("TEST_RATE_LIMIT_TIME_WINDOW"); err != nil {
		return nil, fmt.Errorf("時間枠の読み込みに失敗: %w", err)
	} else if t != 0 {
		config.TestTimeWindow = t
	}

	if m, err := loadEnvInt("TEST_RATE_LIMIT_MAX_REQUESTS"); err != nil {
		return nil, fmt.Errorf("最大リクエスト数の読み込みに失敗: %w", err)
	} else if m != 0 {
		config.TestMaxRequests = m
	}

	if d, err := loadEnvDuration("TEST_RATE_LIMIT_COOLDOWN_TIME"); err != nil {
		return nil, fmt.Errorf("クールダウン時間の読み込みに失敗: %w", err)
	} else if d != 0 {
		config.TestCooldownTime = d
	}

	if n, err := loadEnvInt("TEST_RATE_LIMIT_NUM_GOROUTINES"); err != nil {
		return nil, fmt.Errorf("並行リクエスト数の読み込みに失敗: %w", err)
	} else if n != 0 {
		config.TestNumGoroutines = n
	}

	if err := config.validateConfig(); err != nil {
		return nil, fmt.Errorf("設定値の検証に失敗: %w", err)
	}

	return config, nil
}
