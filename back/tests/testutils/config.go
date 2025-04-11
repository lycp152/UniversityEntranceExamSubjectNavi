package testutils

import (
	"os"
	"testing"
)

// TestConfig はテスト用の設定を保持する構造体です
type TestConfig struct {
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
}

// LoadTestConfig はテスト用の設定を読み込みます
func LoadTestConfig(t *testing.T) *TestConfig {
	t.Helper()

	// 環境変数から設定を読み込む
	config := &TestConfig{
		DBHost:     getEnvOrDefault(t, "TEST_DB_HOST", "localhost"),
		DBPort:     getEnvOrDefault(t, "TEST_DB_PORT", "5432"),
		DBUser:     getEnvOrDefault(t, "TEST_DB_USER", "postgres"),
		DBPassword: getEnvOrDefault(t, "TEST_DB_PASSWORD", "postgres"),
		DBName:     getEnvOrDefault(t, "TEST_DB_NAME", "test_db"),
	}

	return config
}

// getEnvOrDefault は環境変数を取得し、存在しない場合はデフォルト値を返します
func getEnvOrDefault(t *testing.T, key, defaultValue string) string {
	t.Helper()

	value := os.Getenv(key)

	if value == "" {
		return defaultValue
	}

	return value
}
