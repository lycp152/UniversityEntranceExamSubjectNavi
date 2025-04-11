package database

import (
	"context"
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
	defaultMaxIdleConns    = 10
	defaultMaxOpenConns    = 100
	defaultConnMaxLifetime = time.Hour
	defaultRetryAttempts   = 3
	defaultRetryDelay      = 5 * time.Second

	// ロガー設定
	logSlowThreshold = time.Second
)

// Config はデータベース設定を保持します
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
	RetryAttempts   int
	RetryDelay      time.Duration
}

// getEnvInt は環境変数を整数として取得します
func getEnvInt(key string, defaultValue int) int {
	if v := os.Getenv(key); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			return n
		}
	}

	return defaultValue
}

// getEnvDuration は環境変数をDurationとして取得します
func getEnvDuration(key string, defaultValue time.Duration) time.Duration {
	if v := os.Getenv(key); v != "" {
		if d, err := time.ParseDuration(v); err == nil {
			return d
		}
	}

	return defaultValue
}

// NewConfig は環境変数からデータベース設定を作成します
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
		RetryAttempts:   getEnvInt("DB_RETRY_ATTEMPTS", defaultRetryAttempts),
		RetryDelay:      getEnvDuration("DB_RETRY_DELAY", defaultRetryDelay),
	}, nil
}

// connectWithRetry はリトライ付きでデータベース接続を試みます
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

// NewDB はデータベース接続を作成します
func NewDB() (*gorm.DB, error) {
	config, err := NewConfig()
	if err != nil {
		return nil, fmt.Errorf(errMsgConfigCreation, err)
	}

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s search_path=%s sslmode=disable TimeZone=Asia/Tokyo client_encoding=UTF8",
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

	sqlDB.SetMaxIdleConns(config.MaxIdleConns)
	sqlDB.SetMaxOpenConns(config.MaxOpenConns)
	sqlDB.SetConnMaxLifetime(config.ConnMaxLifetime)

	if err := db.Exec(fmt.Sprintf("SET search_path TO %s", config.Schema)).Error; err != nil {
		return nil, fmt.Errorf(errMsgSchemaSetting, err)
	}

	return db, nil
}

// CloseDB はデータベース接続を閉じます
func CloseDB(db *gorm.DB) error {
	sqlDB, err := db.DB()
	if err != nil {
		return fmt.Errorf(errMsgSQLDBClose, err)
	}

	return sqlDB.Close()
}

// AutoMigrate はデータベースのマイグレーションを実行します
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

// WithTransaction はトランザクションを実行します
func WithTransaction(ctx context.Context, db *gorm.DB, fn func(tx *gorm.DB) error) error {
	return db.WithContext(ctx).Transaction(fn)
}
