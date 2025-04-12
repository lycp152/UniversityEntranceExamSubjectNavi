// Package config はアプリケーションの設定管理を提供します。
// 環境変数からの設定値の読み込み、デフォルト値の設定、設定値の検証などの機能を提供します。
package config

import (
	"fmt"
	"os"
	"strconv"
	"time"
)

// Error は設定関連のエラーを表すカスタムエラー型です。
// エラーの詳細な情報（フィールド名、メッセージ、エラーコード）を保持します。
type Error struct {
	Field   string // エラーが発生した設定フィールド名
	Message string // エラーメッセージ
	Err     error  // 元のエラー（存在する場合）
	Code    string // エラーコード
}

// Errorはエラーメッセージを文字列として返します。
// 元のエラーが存在する場合は、そのエラーも含めて返します。
func (e *Error) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("%s: %s: %v", e.Field, e.Message, e.Err)
	}

	return fmt.Sprintf("%s: %s", e.Field, e.Message)
}

// Unwrapは元のエラーを返します。
// エラーが存在しない場合はnilを返します。
func (e *Error) Unwrap() error {
	return e.Err
}

// Is はエラーが指定されたエラーと等しいかどうかを判定します。
func (e *Error) Is(target error) bool {
	t, ok := target.(*Error)
	if !ok {
		return false
	}

	return e.Code == t.Code
}

// As はエラーを指定された型に変換します。
func (e *Error) As(target interface{}) bool {
	if t, ok := target.(*Error); ok {
		*t = *e
		return true
	}

	return false
}

// エラーコードを定数として定義
const (
	ErrCodePortNotSet        = "PORT_NOT_SET"
	ErrCodeInvalidPort       = "INVALID_PORT"
	ErrCodeDBHostNotSet      = "DB_HOST_NOT_SET"
	ErrCodeDBPortNotSet      = "DB_PORT_NOT_SET"
	ErrCodeDBUserNotSet      = "DB_USER_NOT_SET"
	ErrCodeDBNameNotSet      = "DB_NAME_NOT_SET"
)

// エラーメッセージを定数として定義
const (
	ErrMsgPortNotSet        = "ポート番号が設定されていません"
	ErrMsgDBConfigIncomplete = "データベース設定が不完全です"
	ErrMsgDBHostNotSet      = "データベースホストが設定されていません"
	ErrMsgDBPortNotSet      = "データベースポートが設定されていません"
	ErrMsgDBUserNotSet      = "データベースユーザーが設定されていません"
	ErrMsgDBNameNotSet      = "データベース名が設定されていません"
	ErrMsgInvalidPort       = "ポート番号は1から65535の範囲で指定してください"
)

// Config はアプリケーションの設定を保持する構造体です。
// データベース接続情報やサーバー設定など、アプリケーション全体で使用される設定値を管理します。
type Config struct {
	Port              string        // サーバーのポート番号
	Env               string        // 実行環境（development, production など）
	DBHost            string        // データベースホスト名
	DBPort            string        // データベースポート番号
	DBUser            string        // データベースユーザー名
	DBPassword        string        // データベースパスワード
	DBName            string        // データベース名
	DBSSLMode         string        // データベースSSLモード
	DBMaxIdleConns    int           // データベースのアイドル接続の最大数
	DBMaxOpenConns    int           // データベースの同時接続の最大数
	DBConnMaxLifetime time.Duration // データベース接続の最大生存時間
	DBConnMaxIdleTime time.Duration // データベース接続のアイドル最大時間
}

const (
	defaultPort = "8080" // デフォルトのポート番号
)

// Validate は設定値の検証を行います。
// 必須項目が設定されているか、値が有効かどうかを確認します。
// エラーが発生した場合は、エラーメッセージを返します。
func (c *Config) Validate() error {
	if c.Port == "" {
		return &Error{Field: "Port", Message: ErrMsgPortNotSet, Code: ErrCodePortNotSet}
	}

	if port, err := strconv.Atoi(c.Port); err != nil {
		return &Error{Field: "Port", Message: ErrMsgInvalidPort, Err: err, Code: ErrCodeInvalidPort}
	} else if port < 1 || port > 65535 {
		return &Error{Field: "Port", Message: ErrMsgInvalidPort, Code: ErrCodeInvalidPort}
	}

	if c.DBHost == "" {
		return &Error{Field: "DBHost", Message: ErrMsgDBHostNotSet, Code: ErrCodeDBHostNotSet}
	}

	if c.DBPort == "" {
		return &Error{Field: "DBPort", Message: ErrMsgDBPortNotSet, Code: ErrCodeDBPortNotSet}
	}

	if c.DBUser == "" {
		return &Error{Field: "DBUser", Message: ErrMsgDBUserNotSet, Code: ErrCodeDBUserNotSet}
	}

	if c.DBName == "" {
		return &Error{Field: "DBName", Message: ErrMsgDBNameNotSet, Code: ErrCodeDBNameNotSet}
	}

	return nil
}

// New は新しい設定インスタンスを作成します。
// 環境変数から設定値を読み込み、デフォルト値を設定し、設定値の検証を行います。
// エラーが発生した場合は、エラーメッセージを返します。
func New() (*Config, error) {
	config := &Config{
		Port:              getEnvOrDefault("PORT", defaultPort),
		Env:               getEnvOrDefault("ENV", "development"),
		DBHost:            getEnvOrDefault("DB_HOST", "localhost"),
		DBPort:            getEnvOrDefault("DB_PORT", "5432"),
		DBUser:            getEnvOrDefault("DB_USER", "postgres"),
		DBPassword:        getEnvOrDefault("DB_PASSWORD", "postgres"),
		DBName:            getEnvOrDefault("DB_NAME", "university_exam_db"),
		DBSSLMode:         getEnvOrDefault("DB_SSL_MODE", "disable"),
		DBMaxIdleConns:    getEnvOrDefaultInt("DB_MAX_IDLE_CONNS", 10),
		DBMaxOpenConns:    getEnvOrDefaultInt("DB_MAX_OPEN_CONNS", 100),
		DBConnMaxLifetime: getEnvOrDefaultDuration("DB_CONN_MAX_LIFETIME", time.Hour),
		DBConnMaxIdleTime: getEnvOrDefaultDuration("DB_CONN_MAX_IDLE_TIME", 30*time.Minute),
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

// getEnvOrDefaultInt は環境変数の値を整数として取得し、値が存在しない場合はデフォルト値を返します。
// key: 環境変数のキー
// defaultValue: デフォルト値
// 戻り値: 環境変数の値またはデフォルト値
func getEnvOrDefaultInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}

	return defaultValue
}

// getEnvOrDefaultDuration は環境変数の値を時間として取得し、値が存在しない場合はデフォルト値を返します。
// key: 環境変数のキー
// defaultValue: デフォルト値
// 戻り値: 環境変数の値またはデフォルト値
func getEnvOrDefaultDuration(key string, defaultValue time.Duration) time.Duration {
	if value := os.Getenv(key); value != "" {
		if duration, err := time.ParseDuration(value); err == nil {
			return duration
		}
	}

	return defaultValue
}
