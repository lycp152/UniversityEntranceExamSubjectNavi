package database

import (
	"os"
	"testing"
	"university-exam-api/internal/infrastructure/database"
	"university-exam-api/pkg/logger"
)

func TestDatabaseConnection(t *testing.T) {
	// ロガーの初期化
	logger.InitLoggers()

	// テスト用の環境変数を設定
	os.Setenv("DB_HOST", "localhost")
	os.Setenv("DB_USER", "user")
	os.Setenv("DB_PASSWORD", "password")
	os.Setenv("DB_NAME", "university_exam_test_db")
	os.Setenv("DB_PORT", "5432")  // 5433から5432に変更

	// データベース接続のテスト
	db := database.NewDB()
	sqlDB, err := db.DB()
	if err != nil {
		t.Fatalf("Failed to get database instance: %v", err)
	}

	// 接続の確認
	if err := sqlDB.Ping(); err != nil {
		t.Fatalf("Failed to ping database: %v", err)
	}

	// マイグレーションのテスト
	if err := database.AutoMigrate(db); err != nil {
		t.Fatalf("Failed to run migrations: %v", err)
	}
}
