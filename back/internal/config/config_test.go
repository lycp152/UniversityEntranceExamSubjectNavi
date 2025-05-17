// Package config は設定関連のテストを提供します
// 以下のテストを含みます：
// - 環境変数の設定と取得
// - 設定のバリデーション
// - デフォルト値の適用
package config

import (
	"errors"
	"os"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// テストケースの定数定義
const (
	testCaseEnvSet    = "環境変数が設定されている場合"
	testCaseEnvNotSet = "環境変数が設定されていない場合"
	testCaseInvalid   = "環境変数が無効な値の場合"
	errMsgEnvUnset    = "環境変数の削除に失敗しました: %v"
)

// TestNew は設定の初期化をテストします
// 以下のケースをテストします：
// 1. デフォルト設定での初期化
// 2. カスタム設定での初期化
// 3. 無効なポート番号でのエラー
// 4. 必須環境変数不足でのエラー
func TestNew(t *testing.T) {
	tests := []struct {
		name        string
		envVars     map[string]string
		expectedErr bool
		errContains string
	}{
		{
			name: "正常系: デフォルト設定",
			envVars: map[string]string{
				"PORT":     "8080",
				"ENV":      "development",
				"DB_HOST":  "localhost",
				"DB_PORT":  "5432",
				"DB_USER":  "postgres",
				"DB_NAME":  "postgres",
			},
		},
		{
			name: "正常系: カスタム設定",
			envVars: map[string]string{
				"PORT":                "3000",
				"ENV":                 "production",
				"DB_HOST":             "localhost",
				"DB_PORT":             "5432",
				"DB_USER":             "testuser",
				"DB_PASSWORD":         "testpass",
				"DB_NAME":             "testdb",
				"DB_SSL_MODE":         "require",
				"DB_MAX_IDLE_CONNS":   "20",
				"DB_MAX_OPEN_CONNS":   "200",
				"DB_CONN_MAX_LIFETIME": "2h",
				"DB_CONN_MAX_IDLE_TIME": "1h",
			},
		},
		{
			name: "異常系: 無効なポート番号",
			envVars: map[string]string{
				"PORT":     "-1",
				"DB_HOST":  "localhost",
				"DB_PORT":  "5432",
				"DB_USER":  "postgres",
				"DB_NAME":  "postgres",
			},
			expectedErr: true,
			errContains: "ポート番号は1から65535の範囲で指定してください",
		},
		{
			name: "異常系: 必須環境変数が不足",
			envVars: map[string]string{
				"PORT": "8080",
			},
			expectedErr: true,
			errContains: "DBHost: データベースホストが設定されていません",
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			setupTestEnv(t, tt.envVars)

			cfg, err := New()
			validateTestResult(t, cfg, err, tt.expectedErr, tt.errContains)
		})
	}
}

// setupTestEnv はテスト環境をセットアップします
// 以下の処理を行います：
// 1. 既存の環境変数をクリア
// 2. 新しい環境変数を設定
// 3. テスト終了後のクリーンアップを登録
func setupTestEnv(t *testing.T, envVars map[string]string) {
	for key := range envVars {
		if err := os.Unsetenv(key); err != nil {
			t.Errorf(errMsgEnvUnset, err)
		}
	}

	for key, value := range envVars {
		require.NoError(t, os.Setenv(key, value))
		t.Cleanup(func() {
			if err := os.Unsetenv(key); err != nil {
				t.Errorf(errMsgEnvUnset, err)
			}
		})
	}
}

// validateTestResult はテスト結果を検証します
// 以下の処理を行います：
// 1. エラーが期待される場合の検証
// 2. エラーメッセージの内容確認
// 3. 正常系の場合の設定値検証
func validateTestResult(t *testing.T, cfg *Config, err error, expectedErr bool, errContains string) {
	if expectedErr {
		require.Error(t, err)

		if errContains != "" {
			assert.Contains(t, err.Error(), errContains)
		}

		return
	}

	require.NoError(t, err)
	require.NotNil(t, cfg)
	validateConfig(t, cfg)
}

// validateConfig は設定値の基本検証を行います
// 以下の項目を検証します：
// - ポート番号
// - 環境
// - データベース接続情報
func validateConfig(t *testing.T, cfg *Config) {
	assert.NotEmpty(t, cfg.Port)
	assert.NotEmpty(t, cfg.Env)
	assert.NotEmpty(t, cfg.DBHost)
	assert.NotEmpty(t, cfg.DBPort)
	assert.NotEmpty(t, cfg.DBUser)
	assert.NotEmpty(t, cfg.DBName)
}

// TestGetEnvOrDefault は環境変数の取得とデフォルト値の適用をテストします
// 以下のケースをテストします：
// 1. 環境変数が設定されている場合
// 2. 環境変数が設定されていない場合
func TestGetEnvOrDefault(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name         string
		key          string
		defaultValue string
		envValue     string
		expected     string
	}{
		{
			name:         testCaseEnvSet,
			key:          "TEST_KEY",
			defaultValue: "default",
			envValue:     "custom",
			expected:     "custom",
		},
		{
			name:         testCaseEnvNotSet,
			key:          "TEST_KEY_NOT_SET",
			defaultValue: "default",
			envValue:     "",
			expected:     "default",
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			// 環境変数を確実にクリア
			if err := os.Unsetenv(tt.key); err != nil {
				t.Errorf(errMsgEnvUnset, err)
			}

			if tt.envValue != "" {
				require.NoError(t, os.Setenv(tt.key, tt.envValue))
				t.Cleanup(func() {
					if err := os.Unsetenv(tt.key); err != nil {
						t.Errorf(errMsgEnvUnset, err)
					}
				})
			}

			result := getEnvOrDefault(tt.key, tt.defaultValue)
			assert.Equal(t, tt.expected, result)
		})
	}
}

// TestGetEnvOrDefaultInt は整数型の環境変数取得をテストします
// 以下のケースをテストします：
// 1. 環境変数が設定されている場合
// 2. 環境変数が設定されていない場合
// 3. 無効な値が設定されている場合
func TestGetEnvOrDefaultInt(t *testing.T) {
	tests := []struct {
		name         string
		key          string
		defaultValue int
		envValue     string
		expected     int
	}{
		{
			name:         testCaseEnvSet,
			key:          "TEST_KEY_INT",
			defaultValue: 10,
			envValue:     "20",
			expected:     20,
		},
		{
			name:         testCaseEnvNotSet,
			key:          "TEST_KEY_INT_NOT_SET",
			defaultValue: 10,
			envValue:     "",
			expected:     10,
		},
		{
			name:         testCaseInvalid,
			key:          "TEST_KEY_INT_INVALID",
			defaultValue: 10,
			envValue:     "invalid",
			expected:     10,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			// 環境変数を確実にクリア
			if err := os.Unsetenv(tt.key); err != nil {
				t.Errorf(errMsgEnvUnset, err)
			}

			if tt.envValue != "" {
				require.NoError(t, os.Setenv(tt.key, tt.envValue))
				t.Cleanup(func() {
					if err := os.Unsetenv(tt.key); err != nil {
						t.Errorf(errMsgEnvUnset, err)
					}
				})
			}

			result := getEnvOrDefaultInt(tt.key, tt.defaultValue)
			assert.Equal(t, tt.expected, result)
		})
	}
}

// TestGetEnvOrDefaultDuration は時間型の環境変数取得をテストします
func TestGetEnvOrDefaultDuration(t *testing.T) {
	tests := []struct {
		name         string
		key          string
		defaultValue time.Duration
		envValue     string
		expected     time.Duration
	}{
		{
			name:         testCaseEnvSet,
			key:          "TEST_KEY_DURATION",
			defaultValue: time.Hour,
			envValue:     "2h",
			expected:     2 * time.Hour,
		},
		{
			name:         testCaseEnvNotSet,
			key:          "TEST_KEY_DURATION_NOT_SET",
			defaultValue: time.Hour,
			envValue:     "",
			expected:     time.Hour,
		},
		{
			name:         "無効な時間形式の場合",
			key:          "TEST_KEY_DURATION_INVALID",
			defaultValue: time.Hour,
			envValue:     "invalid",
			expected:     time.Hour,
		},
		{
			name:         "複雑な時間形式の場合",
			key:          "TEST_KEY_DURATION_COMPLEX",
			defaultValue: time.Hour,
			envValue:     "1h30m",
			expected:     90 * time.Minute,
		},
		{
			name:         "負の時間の場合",
			key:          "TEST_KEY_DURATION_NEGATIVE",
			defaultValue: time.Hour,
			envValue:     "-1h",
			expected:     -1 * time.Hour,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// 環境変数を確実にクリア
			if err := os.Unsetenv(tt.key); err != nil {
				t.Errorf(errMsgEnvUnset, err)
			}

			if tt.envValue != "" {
				require.NoError(t, os.Setenv(tt.key, tt.envValue))
				t.Cleanup(func() {
					if err := os.Unsetenv(tt.key); err != nil {
						t.Errorf(errMsgEnvUnset, err)
					}
				})
			}

			result := getEnvOrDefaultDuration(tt.key, tt.defaultValue)
			assert.Equal(t, tt.expected, result)
		})
	}
}

// TestConfigValidate は設定の検証をテストします
func TestConfigValidate(t *testing.T) {
	tests := []struct {
		name        string
		config      *Config
		expectedErr bool
		errContains string
	}{
		{
			name: "正常系: 全ての必須項目が設定されている",
			config: &Config{
				Port:     "8080",
				DBHost:   "localhost",
				DBPort:   "5432",
				DBUser:   "postgres",
				DBName:   "testdb",
			},
			expectedErr: false,
		},
		{
			name: "異常系: ポート番号が未設定",
			config: &Config{
				Port:     "",
				DBHost:   "localhost",
				DBPort:   "5432",
				DBUser:   "postgres",
				DBName:   "testdb",
			},
			expectedErr: true,
			errContains: ErrMsgPortNotSet,
		},
		{
			name: "異常系: 無効なポート番号",
			config: &Config{
				Port:     "70000",
				DBHost:   "localhost",
				DBPort:   "5432",
				DBUser:   "postgres",
				DBName:   "testdb",
			},
			expectedErr: true,
			errContains: ErrMsgInvalidPort,
		},
		{
			name: "異常系: データベースホストが未設定",
			config: &Config{
				Port:     "8080",
				DBHost:   "",
				DBPort:   "5432",
				DBUser:   "postgres",
				DBName:   "testdb",
			},
			expectedErr: true,
			errContains: ErrMsgDBHostNotSet,
		},
		{
			name: "異常系: データベースポートが未設定",
			config: &Config{
				Port:     "8080",
				DBHost:   "localhost",
				DBPort:   "",
				DBUser:   "postgres",
				DBName:   "testdb",
			},
			expectedErr: true,
			errContains: ErrMsgDBPortNotSet,
		},
		{
			name: "異常系: データベースユーザーが未設定",
			config: &Config{
				Port:     "8080",
				DBHost:   "localhost",
				DBPort:   "5432",
				DBUser:   "",
				DBName:   "testdb",
			},
			expectedErr: true,
			errContains: ErrMsgDBUserNotSet,
		},
		{
			name: "異常系: データベース名が未設定",
			config: &Config{
				Port:     "8080",
				DBHost:   "localhost",
				DBPort:   "5432",
				DBUser:   "postgres",
				DBName:   "",
			},
			expectedErr: true,
			errContains: ErrMsgDBNameNotSet,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.config.Validate()
			if tt.expectedErr {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.errContains)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

// TestErrorMethods はError構造体のメソッドをテストします
func TestErrorMethods(t *testing.T) {
	tests := []struct {
		name           string
		err           *Error
		target        error
		expectedIs    bool
		expectedAs    bool
		expectedError string
	}{
		{
			name: "エラーが存在する場合",
			err: &Error{
				Field:   "TestField",
				Message: "TestMessage",
				Err:     errors.New("original error"),
				Code:    "TEST_ERROR",
			},
			target:        &Error{Code: "TEST_ERROR"},
			expectedIs:    true,
			expectedAs:    true,
			expectedError: "TestField: TestMessage: original error",
		},
		{
			name: "エラーが存在しない場合",
			err: &Error{
				Field:   "TestField",
				Message: "TestMessage",
				Code:    "TEST_ERROR",
			},
			target:        &Error{Code: "TEST_ERROR"},
			expectedIs:    true,
			expectedAs:    true,
			expectedError: "TestField: TestMessage",
		},
		{
			name: "異なるエラーコードの場合",
			err: &Error{
				Field:   "TestField",
				Message: "TestMessage",
				Code:    "TEST_ERROR",
			},
			target:        &Error{Code: "DIFFERENT_ERROR"},
			expectedIs:    false,
			expectedAs:    true,
			expectedError: "TestField: TestMessage",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Error()メソッドのテスト
			assert.Equal(t, tt.expectedError, tt.err.Error())

			// Unwrap()メソッドのテスト
			if tt.err.Err != nil {
				assert.Equal(t, tt.err.Err, tt.err.Unwrap())
			} else {
				assert.Nil(t, tt.err.Unwrap())
			}

			// Is()メソッドのテスト
			assert.Equal(t, tt.expectedIs, tt.err.Is(tt.target))

			// As()メソッドのテスト
			var target Error

			assert.Equal(t, tt.expectedAs, tt.err.As(&target))

			if tt.expectedAs {
				assert.Equal(t, tt.err.Code, target.Code)
				assert.Equal(t, tt.err.Field, target.Field)
				assert.Equal(t, tt.err.Message, target.Message)
			}
		})
	}
}
