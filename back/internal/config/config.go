// Package config はアプリケーションの設定管理を提供します。
// 環境変数からの設定値の読み込み、デフォルト値の設定、設定値の検証などの機能を提供します。
package config

import (
	"errors"
	"fmt"
	"os"
)

// Config はアプリケーションの設定を保持する構造体です。
// データベース接続情報やサーバー設定など、アプリケーション全体で使用される設定値を管理します。
type Config struct {
	Port        string // サーバーのポート番号
	Env         string // 実行環境（development, production など）
	DBHost      string // データベースホスト名
	DBPort      string // データベースポート番号
	DBUser      string // データベースユーザー名
	DBPassword  string // データベースパスワード
	DBName      string // データベース名
	DBSSLMode   string // データベースSSLモード
}

const (
	defaultPort = "8080" // デフォルトのポート番号
)

// Validate は設定値の検証を行います。
// 必須項目が設定されているか、値が有効かどうかを確認します。
// エラーが発生した場合は、エラーメッセージを返します。
func (c *Config) Validate() error {
	if c.Port == "" {
		return errors.New("ポート番号が設定されていません")
	}
	if c.DBHost == "" || c.DBPort == "" || c.DBUser == "" || c.DBName == "" {
		return errors.New("データベース設定が不完全です")
	}
	return nil
}

// New は新しい設定インスタンスを作成します。
// 環境変数から設定値を読み込み、デフォルト値を設定し、設定値の検証を行います。
// エラーが発生した場合は、エラーメッセージを返します。
func New() (*Config, error) {
	config := &Config{
		Port:       getEnvOrDefault("PORT", defaultPort),
		Env:        getEnvOrDefault("ENV", "development"),
		DBHost:     getEnvOrDefault("DB_HOST", "localhost"),
		DBPort:     getEnvOrDefault("DB_PORT", "5432"),
		DBUser:     getEnvOrDefault("DB_USER", "postgres"),
		DBPassword: getEnvOrDefault("DB_PASSWORD", "postgres"),
		DBName:     getEnvOrDefault("DB_NAME", "university_exam_db"),
		DBSSLMode:  getEnvOrDefault("DB_SSL_MODE", "disable"),
	}

	if err := config.Validate(); err != nil {
		return nil, fmt.Errorf("設定の検証に失敗しました: %w", err)
	}

	return config, nil
}

// getEnvOrDefault は環境変数の値を取得し、値が存在しない場合はデフォルト値を返します。
// key: 環境変数のキー
// defaultValue: デフォルト値
// 戻り値: 環境変数の値またはデフォルト値
func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
