package config

import (
	"os"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const (
	testCaseEnvSet    = "環境変数が設定されている場合"
	testCaseEnvNotSet = "環境変数が設定されていない場合"
	testCaseInvalid   = "環境変数が無効な値の場合"
	errMsgEnvUnset    = "環境変数の削除に失敗しました: %v"
)

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

func validateConfig(t *testing.T, cfg *Config) {
	assert.NotEmpty(t, cfg.Port)
	assert.NotEmpty(t, cfg.Env)
	assert.NotEmpty(t, cfg.DBHost)
	assert.NotEmpty(t, cfg.DBPort)
	assert.NotEmpty(t, cfg.DBUser)
	assert.NotEmpty(t, cfg.DBName)
}

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
			key:          "TEST_KEY",
			defaultValue: "default",
			envValue:     "",
			expected:     "default",
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

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

func TestGetEnvOrDefaultInt(t *testing.T) {
	tests := []struct {
		name         string
		key          string
		defaultValue int
		envValue     string
		expected     int
	}{
		{
			name:         "環境変数が設定されている場合",
			key:          "TEST_KEY_INT",
			defaultValue: 10,
			envValue:     "20",
			expected:     20,
		},
		{
			name:         "環境変数が設定されていない場合",
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
			key:          "TEST_KEY_DURATION_SET",
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
			name:         testCaseInvalid,
			key:          "TEST_KEY_DURATION_INVALID",
			defaultValue: time.Hour,
			envValue:     "invalid",
			expected:     time.Hour,
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

			result := getEnvOrDefaultDuration(tt.key, tt.defaultValue)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestConfigValidate(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name        string
		config      *Config
		expectedErr bool
		errContains string
	}{
		{
			name: "正常系: 有効な設定",
			config: &Config{
				Port:       "8080",
				DBHost:     "localhost",
				DBPort:     "5432",
				DBUser:     "testuser",
				DBPassword: "testpass",
				DBName:     "testdb",
			},
			expectedErr: false,
		},
		{
			name: "異常系: 無効なポート番号",
			config: &Config{
				Port:       "-1",
				DBHost:     "localhost",
				DBPort:     "5432",
				DBUser:     "testuser",
				DBPassword: "testpass",
				DBName:     "testdb",
			},
			expectedErr: true,
			errContains: "ポート番号は1から65535の範囲で指定してください",
		},
		{
			name: "異常系: 必須項目が不足",
			config: &Config{
				Port: "8080",
				// DBHostが不足
				DBPort:     "5432",
				DBUser:     "testuser",
				DBPassword: "testpass",
				DBName:     "testdb",
			},
			expectedErr: true,
			errContains: "DBHost: データベースホストが設定されていません",
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			err := tt.config.Validate()
			if tt.expectedErr {
				assert.Error(t, err)

				if tt.errContains != "" {
					assert.Contains(t, err.Error(), tt.errContains)
				}

				return
			}

			assert.NoError(t, err)
		})
	}
}
