package database

import (
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// テスト用SQLiteインメモリDB生成ヘルパー
func newTestSQLiteDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("インメモリDBの作成に失敗: %v", err)
	}

	return db
}

// RunMigrationsの正常系
func TestRunMigrationsSuccess(t *testing.T) {
	db := newTestSQLiteDB(t)
	ctx := context.Background()
	config := DefaultMigrationConfig()
	config.Schema = "main" // SQLite用
	metrics, err := RunMigrations(ctx, db, config)
	assert.NoError(t, err)
	assert.NotNil(t, metrics)
	assert.Equal(t, 12, metrics.TotalTables) // モデル数
	assert.Equal(t, metrics.TotalTables, metrics.CompletedTables)
}

// RunMigrationsの異常系（タイムアウト）
func TestRunMigrationsTimeout(t *testing.T) {
	db := newTestSQLiteDB(t)
	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Nanosecond)

	defer cancel()

	config := DefaultMigrationConfig()
	config.Timeout = 1 * time.Nanosecond
	config.Schema = "main"
	_, err := RunMigrations(ctx, db, config)
	assert.Error(t, err)
}

// DefaultMigrationConfigのテスト
func TestDefaultMigrationConfig(t *testing.T) {
	cfg := DefaultMigrationConfig()
	assert.NotNil(t, cfg)
	assert.Equal(t, 3, cfg.RetryAttempts)
	assert.Equal(t, 100, cfg.BatchSize)
}

// createSavePoint/releaseSavePointの正常系
func TestCreateAndReleaseSavePoint(t *testing.T) {
	db := newTestSQLiteDB(t)
	tx := db.Begin()
	progress := &MigrationProgress{Metrics: &MigrationMetrics{}}
	err := createSavePoint(tx, 5, progress)
	assert.NoError(t, err)
	err = releaseSavePoint(tx, "sp_5")
	assert.NoError(t, err)
	tx.Rollback()
}

// createSavePointの異常系（index=0では作成されない）
func TestCreateSavePointNoSavePoint(t *testing.T) {
	db := newTestSQLiteDB(t)
	tx := db.Begin()
	progress := &MigrationProgress{Metrics: &MigrationMetrics{}}
	err := createSavePoint(tx, 0, progress)
	assert.NoError(t, err)
	tx.Rollback()
}

// handleMigrationErrorの異常系（ロールバック失敗）
func TestHandleMigrationErrorRollbackFail(t *testing.T) {
	db := newTestSQLiteDB(t)
	tx := db.Begin()
	progress := &MigrationProgress{Metrics: &MigrationMetrics{}}
	m := struct{ Model interface{}; Name string }{Model: nil, Name: "test"}
	err := handleMigrationError(tx, 5, m, progress, assert.AnError)
	assert.Error(t, err)
	tx.Rollback()
}
