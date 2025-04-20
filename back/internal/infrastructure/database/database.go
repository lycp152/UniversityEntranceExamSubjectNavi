// Package database はデータベース接続と操作を管理するパッケージです。
// このパッケージは以下の機能を提供します：
// - データベース接続の管理
// - コネクションプールの設定
// - トランザクション管理
// - マイグレーション
package database

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"strconv"
	"time"
	"university-exam-api/internal/domain/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

const (
	// エラーメッセージ
	errMsgConfigCreation = "データベース設定の作成に失敗: %w"
	errMsgDBConnection  = "データベース接続に失敗: %w"
	errMsgDBInstance    = "データベースインスタンスの取得に失敗: %w"
	errMsgSchemaSetting = "スキーマの設定に失敗: %w"
	errMsgSQLDBClose    = "SQLデータベースの取得に失敗: %w"

	// デフォルト値
	defaultMaxIdleConns     = 10            // アイドル接続の最大数
	defaultMaxOpenConns     = 100           // 同時接続の最大数
	defaultConnMaxLifetime  = time.Hour     // 接続の最大生存時間
	defaultConnMaxIdleTime  = time.Minute * 30 // アイドル接続の最大時間
	defaultMigrationTimeout = 30 * time.Second // マイグレーションのタイムアウト時間
	defaultRetryAttempts    = 3            // 接続試行の最大回数
	defaultRetryDelay       = 5 * time.Second // 接続リトライの待機時間

	// ロガー設定
	logSlowThreshold = time.Second
)

// DBStats はデータベース接続の統計情報を保持する構造体です。
// この構造体は以下の情報を保持します：
// - 最大接続数
// - 現在の接続数
// - 使用中の接続数
// - アイドル接続数
// - 待機統計
type DBStats struct {
	MaxOpenConnections int           // 設定された最大オープン接続数
	OpenConnections    int           // 現在のオープン接続数
	InUse             int           // 使用中の接続数
	Idle              int           // アイドル状態の接続数
	WaitCount         int64         // 接続待ちの累積数
	WaitDuration      time.Duration // 接続待ちの累積時間
	MaxIdleClosed     int64         // アイドル最大数超過で閉じられた接続数
	MaxLifetimeClosed int64         // 生存期間超過で閉じられた接続数
}

// Config はデータベース接続の設定を保持する構造体です。
// この構造体は以下の設定を保持します：
// - 接続情報（ホスト、ポート、ユーザー、パスワード、データベース名）
// - スキーマ設定
// - コネクションプール設定
// - リトライ設定
type Config struct {
	Host            string
	Port            string
	User            string
	Password        string
	DBName          string
	Schema          string
	MaxIdleConns    int
	MaxOpenConns    int
	ConnMaxLifetime time.Duration
	ConnMaxIdleTime time.Duration
	RetryAttempts   int
	RetryDelay      time.Duration
}

// getEnvInt は環境変数を整数として取得します。
// この関数は以下の処理を行います：
// - 環境変数の取得
// - 整数への変換
// - デフォルト値の提供
func getEnvInt(key string, defaultValue int) int {
	if v := os.Getenv(key); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			return n
		}
	}

	return defaultValue
}

// getEnvDuration は環境変数をDurationとして取得します。
// この関数は以下の処理を行います：
// - 環境変数の取得
// - Durationへの変換
// - デフォルト値の提供
func getEnvDuration(key string, defaultValue time.Duration) time.Duration {
	if v := os.Getenv(key); v != "" {
		if d, err := time.ParseDuration(v); err == nil {
			return d
		}
	}

	return defaultValue
}

// NewConfig は環境変数からデータベース設定を作成します。
// この関数は以下の処理を行います：
// - 必須環境変数の検証
// - 設定値の取得
// - デフォルト値の設定
func NewConfig() (*Config, error) {
	requiredEnvVars := []string{
		"DB_HOST",
		"DB_PORT",
		"DB_USER",
		"DB_PASSWORD",
		"DB_NAME",
	}

	for _, envVar := range requiredEnvVars {
		if os.Getenv(envVar) == "" {
			return nil, fmt.Errorf("環境変数 %s が設定されていません", envVar)
		}
	}

	schema := os.Getenv("DB_SCHEMA")
	if schema == "" {
		schema = "public"
	}

	return &Config{
		Host:            os.Getenv("DB_HOST"),
		Port:            os.Getenv("DB_PORT"),
		User:            os.Getenv("DB_USER"),
		Password:        os.Getenv("DB_PASSWORD"),
		DBName:          os.Getenv("DB_NAME"),
		Schema:          schema,
		MaxIdleConns:    getEnvInt("DB_MAX_IDLE_CONNS", defaultMaxIdleConns),
		MaxOpenConns:    getEnvInt("DB_MAX_OPEN_CONNS", defaultMaxOpenConns),
		ConnMaxLifetime: getEnvDuration("DB_CONN_MAX_LIFETIME", defaultConnMaxLifetime),
		ConnMaxIdleTime: getEnvDuration("DB_CONN_MAX_IDLE_TIME", defaultConnMaxIdleTime),
		RetryAttempts:   getEnvInt("DB_RETRY_ATTEMPTS", defaultRetryAttempts),
		RetryDelay:      getEnvDuration("DB_RETRY_DELAY", defaultRetryDelay),
	}, nil
}

// connectWithRetry はリトライ付きでデータベース接続を試みます。
// この関数は以下の処理を行います：
// - データベース接続の試行
// - リトライ処理
// - エラーハンドリング
func connectWithRetry(dsn string, config *Config) (*gorm.DB, error) {
	var db *gorm.DB

	var err error

	for i := 0; i < config.RetryAttempts; i++ {
		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
			PrepareStmt: true,
			Logger: logger.New(
				log.New(os.Stdout, "\r\n", log.LstdFlags),
				logger.Config{
					SlowThreshold:             logSlowThreshold,
					LogLevel:                  logger.Info,
					IgnoreRecordNotFoundError: true,
					Colorful:                  true,
				},
			),
		})

		if err == nil {
			return db, nil
		}

		if i < config.RetryAttempts-1 {
			time.Sleep(config.RetryDelay)
		}
	}

	return nil, fmt.Errorf(errMsgDBConnection, err)
}

// NewDB はデータベース接続を作成します。
// この関数は以下の処理を行います：
// - 設定の取得
// - 接続文字列の生成
// - データベース接続の確立
// - コネクションプールの設定
func NewDB() (*gorm.DB, error) {
	config, err := NewConfig()
	if err != nil {
		return nil, fmt.Errorf(errMsgConfigCreation, err)
	}

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s "+
			"search_path=%s sslmode=disable TimeZone=Asia/Tokyo "+
			"client_encoding=UTF8",
		config.Host,
		config.User,
		config.Password,
		config.DBName,
		config.Port,
		config.Schema,
	)

	db, err := connectWithRetry(dsn, config)
	if err != nil {
		return nil, err
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf(errMsgDBInstance, err)
	}

	err = setupConnectionPool(sqlDB, config)
	if err != nil {
		return nil, err
	}

	if err := db.Exec(fmt.Sprintf("SET search_path TO %s", config.Schema)).Error; err != nil {
		return nil, fmt.Errorf(errMsgSchemaSetting, err)
	}

	return db, nil
}

// CloseDB はデータベース接続を閉じます。
// この関数は以下の処理を行います：
// - データベース接続のクローズ
// - エラーハンドリング
func CloseDB(db *gorm.DB) error {
	sqlDB, err := db.DB()
	if err != nil {
		return fmt.Errorf(errMsgSQLDBClose, err)
	}

	return sqlDB.Close()
}

// AutoMigrate はデータベースのマイグレーションを実行します。
// この関数は以下の処理を行います：
// - モデルのマイグレーション
// - エラーハンドリング
func AutoMigrate(ctx context.Context, db *gorm.DB) error {
	return db.WithContext(ctx).AutoMigrate(
		&models.University{},
		&models.Department{},
		&models.Major{},
		&models.AdmissionSchedule{},
		&models.AdmissionInfo{},
		&models.TestType{},
		&models.Subject{},
	)
}

// WithTransaction はトランザクションを実行します。
// この関数は以下の処理を行います：
// - トランザクションの開始
// - トランザクション内での処理実行
// - エラーハンドリング
func WithTransaction(ctx context.Context, db *gorm.DB, fn func(tx *gorm.DB) error) error {
	return db.WithContext(ctx).Transaction(fn)
}

// setupConnectionPool はコネクションプールの設定を行います。
// この関数は以下の処理を行います：
// - コネクションプールの設定
// - 設定値の検証
// - エラーハンドリング
func setupConnectionPool(sqlDB *sql.DB, cfg *Config) error {
	maxIdleConns := defaultMaxIdleConns
	if cfg.MaxIdleConns > 0 {
		maxIdleConns = cfg.MaxIdleConns
	}

	maxOpenConns := defaultMaxOpenConns
	if cfg.MaxOpenConns > 0 {
		maxOpenConns = cfg.MaxOpenConns
	}

	connMaxLifetime := defaultConnMaxLifetime
	if cfg.ConnMaxLifetime > 0 {
		connMaxLifetime = cfg.ConnMaxLifetime
	}

	connMaxIdleTime := defaultConnMaxIdleTime
	if cfg.ConnMaxIdleTime > 0 {
		connMaxIdleTime = cfg.ConnMaxIdleTime
	}

	sqlDB.SetMaxIdleConns(maxIdleConns)
	sqlDB.SetMaxOpenConns(maxOpenConns)
	sqlDB.SetConnMaxLifetime(connMaxLifetime)
	sqlDB.SetConnMaxIdleTime(connMaxIdleTime)

	// 設定の検証
	if sqlDB.Stats().MaxOpenConnections != maxOpenConns {
		return fmt.Errorf("コネクションプールの設定に失敗しました: MaxOpenConnsの設定が反映されていません")
	}

	return nil
}

// GetDBStats はデータベース接続の統計情報を取得します。
// この関数は以下の処理を行います：
// - 統計情報の取得
// - エラーハンドリング
func GetDBStats(db *gorm.DB) (*DBStats, error) {
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("データベース統計情報の取得に失敗しました: %w", err)
	}

	stats := sqlDB.Stats()

	return &DBStats{
		MaxOpenConnections: stats.MaxOpenConnections,
		OpenConnections:    stats.OpenConnections,
		InUse:             stats.InUse,
		Idle:              stats.Idle,
		WaitCount:         stats.WaitCount,
		WaitDuration:      stats.WaitDuration,
		MaxIdleClosed:     stats.MaxIdleClosed,
		MaxLifetimeClosed: stats.MaxLifetimeClosed,
	}, nil
}
