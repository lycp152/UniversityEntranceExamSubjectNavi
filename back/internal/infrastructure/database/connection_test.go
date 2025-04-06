package database

import (
	"os"
	"testing"
)

func TestDatabaseConnection(t *testing.T) {
	// テスト用の環境変数を設定
	os.Setenv("DB_HOST", "localhost")
	os.Setenv("DB_USER", "user")
	os.Setenv("DB_PASSWORD", "password")
	os.Setenv("DB_NAME", "university_exam_test_db")
	os.Setenv("DB_PORT", "5432")
	os.Setenv("DB_SCHEMA", "test_schema")

	// データベース接続のテスト
	db := NewDB()
	sqlDB, err := db.DB()
	if err != nil {
		t.Fatalf("Failed to get database instance: %v", err)
	}

	// 接続の確認
	if err := sqlDB.Ping(); err != nil {
		t.Fatalf("Failed to ping database: %v", err)
	}

	// スキーマの設定
	if err := db.Exec("SET search_path TO test_schema").Error; err != nil {
		t.Fatalf("Failed to set schema: %v", err)
	}

	// マイグレーションのテスト
	if err := RunMigrations(db); err != nil {
		t.Fatalf("Failed to run migrations: %v", err)
	}
}
