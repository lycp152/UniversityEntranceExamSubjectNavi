package database

import (
	"context"
	"fmt"
	"os"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

const errUnsetenvFmt = "os.Unsetenv failed: %v"
const errSetenvFmt = "os.Setenv failed: %v"

// getEnvIntのテスト
func TestGetEnvInt(t *testing.T) {
	err := os.Setenv("TEST_INT", "42")
	if err != nil {
		t.Fatalf(errSetenvFmt, err)
	}

	defer func() {
		if err := os.Unsetenv("TEST_INT"); err != nil {
			t.Fatalf(errUnsetenvFmt, err)
		}
	}()
	assert.Equal(t, 42, getEnvInt("TEST_INT", 10))
	assert.Equal(t, 10, getEnvInt("NOT_SET", 10))

	err = os.Setenv("TEST_INT", "invalid")
	if err != nil {
		t.Fatalf(errSetenvFmt, err)
	}

	assert.Equal(t, 10, getEnvInt("TEST_INT", 10))
}

// getEnvDurationのテスト
func TestGetEnvDuration(t *testing.T) {
	err := os.Setenv("TEST_DUR", "2s")
	if err != nil {
		t.Fatalf(errSetenvFmt, err)
	}

	defer func() {
		if err := os.Unsetenv("TEST_DUR"); err != nil {
			t.Fatalf(errUnsetenvFmt, err)
		}
	}()
	assert.Equal(t, 2*time.Second, getEnvDuration("TEST_DUR", time.Second))
	assert.Equal(t, time.Second, getEnvDuration("NOT_SET", time.Second))

	err = os.Setenv("TEST_DUR", "invalid")
	if err != nil {
		t.Fatalf(errSetenvFmt, err)
	}

	assert.Equal(t, time.Second, getEnvDuration("TEST_DUR", time.Second))
}

// テスト用：環境変数をまとめてセット
func setTestDBEnv(t *testing.T) {
	envs := map[string]string{
		"DB_HOST":     "localhost",
		"DB_PORT":     "5432",
		"DB_USER":     "user",
		"DB_PASSWORD": "pass",
		"DB_NAME":     "testdb",
	}
	for k, v := range envs {
		if err := os.Setenv(k, v); err != nil {
			t.Fatalf(errSetenvFmt, err)
		}
	}
}

// テスト用：環境変数をまとめてアンセット
func unsetTestDBEnv(t *testing.T) {
	envs := []string{"DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME"}
	for _, k := range envs {
		if err := os.Unsetenv(k); err != nil {
			t.Fatalf(errUnsetenvFmt, err)
		}
	}
}

// NewConfigの正常系・異常系
func TestNewConfig(t *testing.T) {
	setTestDBEnv(t)
	defer unsetTestDBEnv(t)

	cfg, err := NewConfig()
	assert.NoError(t, err)
	assert.Equal(t, "localhost", cfg.Host)

	if err := os.Unsetenv("DB_HOST"); err != nil {
		t.Fatalf(errUnsetenvFmt, err)
	}

	_, err = NewConfig()
	assert.Error(t, err)
}

// NewDBの異常系（環境変数不足）
func TestNewDBMissingEnv(t *testing.T) {
	if err := os.Unsetenv("DB_HOST"); err != nil {
		t.Fatalf(errUnsetenvFmt, err)
	}

	if err := os.Unsetenv("DB_PORT"); err != nil {
		t.Fatalf(errUnsetenvFmt, err)
	}

	if err := os.Unsetenv("DB_USER"); err != nil {
		t.Fatalf(errUnsetenvFmt, err)
	}

	if err := os.Unsetenv("DB_PASSWORD"); err != nil {
		t.Fatalf(errUnsetenvFmt, err)
	}

	if err := os.Unsetenv("DB_NAME"); err != nil {
		t.Fatalf(errUnsetenvFmt, err)
	}

	_, err := NewDB()
	assert.Error(t, err)
}

// AutoMigrate, WithTransactionの最低限の動作確認（SQLiteインメモリDB利用）
func TestAutoMigrateAndTransaction(t *testing.T) {
	if err := os.Setenv("DB_HOST", "localhost"); err != nil {
		t.Fatalf(errSetenvFmt, err)
	}

	if err := os.Setenv("DB_PORT", "5432"); err != nil {
		t.Fatalf(errSetenvFmt, err)
	}

	if err := os.Setenv("DB_USER", "user"); err != nil {
		t.Fatalf(errSetenvFmt, err)
	}

	if err := os.Setenv("DB_PASSWORD", "pass"); err != nil {
		t.Fatalf(errSetenvFmt, err)
	}

	if err := os.Setenv("DB_NAME", "testdb"); err != nil {
		t.Fatalf(errSetenvFmt, err)
	}

	defer func() {
		if err := os.Unsetenv("DB_HOST"); err != nil {
			t.Fatalf(errUnsetenvFmt, err)
		}

		if err := os.Unsetenv("DB_PORT"); err != nil {
			t.Fatalf(errUnsetenvFmt, err)
		}

		if err := os.Unsetenv("DB_USER"); err != nil {
			t.Fatalf(errUnsetenvFmt, err)
		}

		if err := os.Unsetenv("DB_PASSWORD"); err != nil {
			t.Fatalf(errUnsetenvFmt, err)
		}

		if err := os.Unsetenv("DB_NAME"); err != nil {
			t.Fatalf(errUnsetenvFmt, err)
		}
	}()
	// SQLiteインメモリDBを直接使う
	db, err := NewTestSQLiteDB()
	assert.NoError(t, err)

	ctx := context.Background()
	err = AutoMigrate(ctx, db)
	assert.NoError(t, err)
	err = WithTransaction(ctx, db, func(_ *gorm.DB) error {
		return nil
	})
	assert.NoError(t, err)
}

// テスト用SQLiteインメモリDB生成ヘルパー
func NewTestSQLiteDB() (*gorm.DB, error) {
	return gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
}

// CloseDBのテスト
func TestCloseDB(t *testing.T) {
	db, err := NewTestSQLiteDB()
	assert.NoError(t, err)
	sqlDB, err := db.DB()
	assert.NoError(t, err)
	assert.NoError(t, CloseDB(db))
	// 2回目以降はすでにcloseされているのでエラーになる可能性あり
	_ = sqlDB.Close()
}

// GetDBStatsのテスト
func TestGetDBStats(t *testing.T) {
	db, err := NewTestSQLiteDB()
	assert.NoError(t, err)
	stats, err := GetDBStats(db)
	assert.NoError(t, err)
	assert.NotNil(t, stats)
}

func TestSetupConnectionPoolInvalidConfig(t *testing.T) {
	db, err := NewTestSQLiteDB()
	assert.NoError(t, err)
	sqlDB, err := db.DB()
	assert.NoError(t, err)

	// MaxOpenConnsに異常値を入れてもエラーは返らない（デフォルト値にフォールバック）
	cfg := &Config{
		MaxOpenConns: -999,
	}
	err = setupConnectionPool(sqlDB, cfg)
	assert.NoError(t, err)
}

func TestWithTransactionError(t *testing.T) {
	db, err := NewTestSQLiteDB()
	assert.NoError(t, err)

	// トランザクション内でエラーが発生するケース
	err = WithTransaction(context.Background(), db, func(_ *gorm.DB) error {
			return fmt.Errorf("テストエラー")
	})
	assert.Error(t, err)

	// コンテキストがキャンセルされたケース
	ctx, cancel := context.WithCancel(context.Background())
	cancel()

	err = WithTransaction(ctx, db, func(_ *gorm.DB) error {
			return nil
	})
	assert.Error(t, err)
}

func TestAutoMigrateError(t *testing.T) {
	db, err := NewTestSQLiteDB()
	assert.NoError(t, err)

	// コンテキストがキャンセルされたケース
	ctx, cancel := context.WithCancel(context.Background())
	cancel()

	err = AutoMigrate(ctx, db)
	assert.Error(t, err)
}

func TestSetupConnectionPool(t *testing.T) {
	db, err := NewTestSQLiteDB()
	assert.NoError(t, err)
	sqlDB, err := db.DB()
	assert.NoError(t, err)

	tests := []struct {
			name    string
			config  *Config
			wantErr bool
	}{
			{
					name: "正常系：デフォルト設定",
					config: &Config{
							MaxIdleConns:    defaultMaxIdleConns,
							MaxOpenConns:    defaultMaxOpenConns,
							ConnMaxLifetime: defaultConnMaxLifetime,
							ConnMaxIdleTime: defaultConnMaxIdleTime,
					},
					wantErr: false,
			},
			{
					name: "正常系：カスタム設定",
					config: &Config{
							MaxIdleConns:    5,
							MaxOpenConns:    20,
							ConnMaxLifetime: time.Minute * 5,
							ConnMaxIdleTime: time.Minute * 2,
					},
					wantErr: false,
			},
	}

	for _, tt := range tests {
			t.Run(tt.name, func(t *testing.T) {
					err := setupConnectionPool(sqlDB, tt.config)
					if tt.wantErr {
							assert.Error(t, err)
					} else {
							assert.NoError(t, err)
					}
			})
	}
}
