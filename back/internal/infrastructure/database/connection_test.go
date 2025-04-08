package database

import (
	"context"
	"fmt"
	"os"
	"testing"
	"time"
)

const (
	errDBConnection = "データベース接続に失敗しました: %v"
	errDBInstance = "データベースインスタンスの取得に失敗しました: %v"
	errDBPing = "データベースへの接続確認に失敗しました: %v"
	errSchemaSetting = "スキーマの設定に失敗しました: %v"
	errMigration = "マイグレーションの実行に失敗しました: %v"
)

func setupTestEnv() {
	os.Setenv("DB_HOST", "localhost")
	os.Setenv("DB_USER", "user")
	os.Setenv("DB_PASSWORD", "password")
	os.Setenv("DB_NAME", "university_exam_test_db")
	os.Setenv("DB_PORT", "5432")
	os.Setenv("DB_SCHEMA", "test_schema")
}

func TestNewDB(t *testing.T) {
	setupTestEnv()

	tests := []struct {
		name    string
		wantErr bool
	}{
		{
			name:    "正常な接続",
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			db, err := NewDB()
			if (err != nil) != tt.wantErr {
				t.Errorf("NewDB() error = %v, wantErr %v", err, tt.wantErr)
				return
			}

			sqlDB, err := db.DB()
			if err != nil {
				t.Fatalf(errDBInstance, err)
			}

			if err := sqlDB.Ping(); err != nil {
				t.Fatalf(errDBPing, err)
			}
		})
	}
}

func TestSchemaSetting(t *testing.T) {
	setupTestEnv()

	tests := []struct {
		name    string
		schema  string
		wantErr bool
	}{
		{
			name:    "正常なスキーマ設定",
			schema:  "test_schema",
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			db, err := NewDB()
			if err != nil {
				t.Fatalf(errDBConnection, err)
			}

			if err := db.Exec(fmt.Sprintf("SET search_path TO %s", tt.schema)).Error; (err != nil) != tt.wantErr {
				t.Errorf("スキーマ設定のエラー = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestMigrations(t *testing.T) {
	setupTestEnv()

	tests := []struct {
		name    string
		wantErr bool
	}{
		{
			name:    "正常なマイグレーション",
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			db, err := NewDB()
			if err != nil {
				t.Fatalf(errDBConnection, err)
			}

			ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
			defer cancel()

			if err := AutoMigrate(ctx, db); (err != nil) != tt.wantErr {
				t.Errorf("AutoMigrate() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}
