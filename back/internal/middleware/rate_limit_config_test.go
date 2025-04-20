// Package middleware はアプリケーションのミドルウェアのテストを提供します。
// このパッケージは以下のテストを提供します：
// - レート制限設定のデフォルト値
// - 環境変数からの設定読み込み
// - 設定値の検証
package middleware

import (
	"os"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

// TestDefaultTestConfig はデフォルト設定のテストを行います。
// このテストは以下のケースを検証します：
// - 総リクエスト数のデフォルト値
// - 時間枠のデフォルト値
// - 最大リクエスト数のデフォルト値
// - クールダウン時間のデフォルト値
// - 並行リクエスト数のデフォルト値
func TestDefaultTestConfig(t *testing.T) {
	config := DefaultTestConfig()

	assert.Equal(t, DefaultTestNumRequests, config.TestNumRequests)
	assert.Equal(t, DefaultTestTimeWindow, config.TestTimeWindow)
	assert.Equal(t, DefaultTestMaxRequests, config.TestMaxRequests)
	assert.Equal(t, DefaultTestCooldownTime, config.TestCooldownTime)
	assert.Equal(t, DefaultTestNumGoroutines, config.TestNumGoroutines)
}

// setupEnvVars はテスト用の環境変数を設定します。
// この関数は以下の処理を行います：
// 1. 環境変数の設定
// 2. エラーハンドリング
func setupEnvVars(t *testing.T, envVars map[string]string) {
	for key, value := range envVars {
		if err := os.Setenv(key, value); err != nil {
			t.Fatalf("環境変数の設定に失敗しました: %v", err)
		}
	}
}

// clearEnvVars はテスト用の環境変数をクリアします。
// この関数は以下の処理を行います：
// 1. 環境変数のクリア
// 2. エラーハンドリング
func clearEnvVars(t *testing.T, envVars map[string]string) {
	for key := range envVars {
		if err := os.Unsetenv(key); err != nil {
			t.Fatalf("環境変数のクリアに失敗しました: %v", err)
		}
	}
}

// TestLoadTestConfig は環境変数からの設定読み込みをテストします。
// このテストは以下のケースを検証します：
// - デフォルト設定の使用
// - 環境変数からの設定読み込み
// - 無効な環境変数の値
func TestLoadTestConfig(t *testing.T) {
	tests := []struct {
		name           string
		envVars        map[string]string
		expectedConfig *RateLimitConfig
		expectedError  string
	}{
		{
			name: "デフォルト設定を使用",
			envVars: map[string]string{},
			expectedConfig: &RateLimitConfig{
				TestNumRequests:   DefaultTestNumRequests,
				TestTimeWindow:    DefaultTestTimeWindow,
				TestMaxRequests:   DefaultTestMaxRequests,
				TestCooldownTime:  DefaultTestCooldownTime,
				TestNumGoroutines: DefaultTestNumGoroutines,
			},
		},
		{
			name: "環境変数から設定を読み込み",
			envVars: map[string]string{
				"TEST_RATE_LIMIT_NUM_REQUESTS":  "200",
				"TEST_RATE_LIMIT_TIME_WINDOW":   "2",
				"TEST_RATE_LIMIT_MAX_REQUESTS":  "100",
				"TEST_RATE_LIMIT_COOLDOWN_TIME": "2s",
				"TEST_RATE_LIMIT_NUM_GOROUTINES": "20",
			},
			expectedConfig: &RateLimitConfig{
				TestNumRequests:   200,
				TestTimeWindow:    2,
				TestMaxRequests:   100,
				TestCooldownTime:  2 * time.Second,
				TestNumGoroutines: 20,
			},
		},
		{
			name: "無効な環境変数の値",
			envVars: map[string]string{
				"TEST_RATE_LIMIT_NUM_REQUESTS": "-1",
			},
			expectedError: "総リクエスト数の読み込みに失敗: TEST_RATE_LIMIT_NUM_REQUESTSは負の値を設定できません",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			setupEnvVars(t, tt.envVars)
			defer clearEnvVars(t, tt.envVars)

			config, err := LoadTestConfig()

			if tt.expectedError != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedError)

				return
			}

			assert.NoError(t, err)
			assert.Equal(t, tt.expectedConfig.TestNumRequests, config.TestNumRequests)
			assert.Equal(t, tt.expectedConfig.TestTimeWindow, config.TestTimeWindow)
			assert.Equal(t, tt.expectedConfig.TestMaxRequests, config.TestMaxRequests)
			assert.Equal(t, tt.expectedConfig.TestCooldownTime, config.TestCooldownTime)
			assert.Equal(t, tt.expectedConfig.TestNumGoroutines, config.TestNumGoroutines)
		})
	}
}

// TestValidateConfig は設定値の検証をテストします。
// このテストは以下のケースを検証します：
// - 有効な設定
// - 無効な総リクエスト数
// - 無効な時間枠
// - 無効な最大リクエスト数
// - 無効なクールダウン時間
// - 無効な並行リクエスト数
func TestValidateConfig(t *testing.T) {
	tests := []struct {
		name          string
		config        *RateLimitConfig
		expectedError error
	}{
		{
			name: "有効な設定",
			config: &RateLimitConfig{
				TestNumRequests:   100,
				TestTimeWindow:    1,
				TestMaxRequests:   50,
				TestCooldownTime:  time.Second,
				TestNumGoroutines: 10,
			},
		},
		{
			name: "無効な総リクエスト数",
			config: &RateLimitConfig{
				TestNumRequests:   0,
				TestTimeWindow:    1,
				TestMaxRequests:   50,
				TestCooldownTime:  time.Second,
				TestNumGoroutines: 10,
			},
			expectedError: ErrInvalidNumRequests,
		},
		{
			name: "無効な時間枠",
			config: &RateLimitConfig{
				TestNumRequests:   100,
				TestTimeWindow:    0,
				TestMaxRequests:   50,
				TestCooldownTime:  time.Second,
				TestNumGoroutines: 10,
			},
			expectedError: ErrInvalidTimeWindow,
		},
		{
			name: "無効な最大リクエスト数",
			config: &RateLimitConfig{
				TestNumRequests:   100,
				TestTimeWindow:    1,
				TestMaxRequests:   0,
				TestCooldownTime:  time.Second,
				TestNumGoroutines: 10,
			},
			expectedError: ErrInvalidMaxRequests,
		},
		{
			name: "無効なクールダウン時間",
			config: &RateLimitConfig{
				TestNumRequests:   100,
				TestTimeWindow:    1,
				TestMaxRequests:   50,
				TestCooldownTime:  0,
				TestNumGoroutines: 10,
			},
			expectedError: ErrInvalidCooldownTime,
		},
		{
			name: "無効な並行リクエスト数",
			config: &RateLimitConfig{
				TestNumRequests:   100,
				TestTimeWindow:    1,
				TestMaxRequests:   50,
				TestCooldownTime:  time.Second,
				TestNumGoroutines: 0,
			},
			expectedError: ErrInvalidNumGoroutines,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.config.validateConfig()
			if tt.expectedError != nil {
				assert.Error(t, err)
				assert.Equal(t, tt.expectedError, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}
