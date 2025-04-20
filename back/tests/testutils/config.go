// Package testutils はテストユーティリティを提供します。
// このパッケージは以下の機能を提供します：
// - テスト設定の管理
// - 環境変数の取得とデフォルト値の設定
// - テスト環境の設定
package testutils

import (
	"os"
	"testing"
)

// TestConfig はテスト用の設定を保持する構造体です
// この構造体は以下の情報を保持します：
// - データベース接続情報
// - テスト環境の設定
type TestConfig struct {
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
}

// LoadTestConfig はテスト用の設定を読み込みます
// この関数は以下の処理を行います：
// - 環境変数からの設定読み込み
// - デフォルト値の設定
// - 設定オブジェクトの生成
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
// この関数は以下の処理を行います：
// - 環境変数の取得
// - デフォルト値の設定
// - 値の返却
func getEnvOrDefault(t *testing.T, key, defaultValue string) string {
	t.Helper()

	value := os.Getenv(key)

	if value == "" {
		return defaultValue
	}

	return value
}
