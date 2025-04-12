// Package main はアプリケーションのエントリーポイントを提供します。
package main

import (
	"context"
	"os"
	"path/filepath"
	"sync"
	"testing"
	"university-exam-api/internal/config"
	applogger "university-exam-api/internal/logger"

	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// setupTestEnv はテスト環境をセットアップするヘルパー関数です
func setupTestEnv(t *testing.T, envVars map[string]string) func() {
	t.Helper()

	var mu sync.Mutex

	mu.Lock()
	defer mu.Unlock()

	// 元の環境変数を保存
	originalEnv := make(map[string]string)
	for k := range envVars {
		originalEnv[k] = os.Getenv(k)
	}

	// テスト用の環境変数を設定
	for k, v := range envVars {
		if err := os.Setenv(k, v); err != nil {
			t.Fatalf("環境変数の設定に失敗しました: %v", err)
		}
	}

	// クリーンアップ関数を返す
	return func() {
		mu.Lock()
		defer mu.Unlock()

		for k, v := range originalEnv {
			if err := os.Setenv(k, v); err != nil {
				t.Errorf("環境変数の復元に失敗しました: %v", err)
			}
		}
	}
}

// setupTestLogger はテスト用のロガーをセットアップします
func setupTestLogger(t *testing.T) {
	t.Helper()

	// テスト用のログディレクトリを作成
	logDir := filepath.Join("..", "..", "logs", "tests")
	if err := os.MkdirAll(logDir, 0750); err != nil {
		t.Fatalf("ログディレクトリの作成に失敗しました: %v", err)
	}

	// ロガーの設定
	cfg := applogger.DefaultConfig()
	cfg.LogDir = logDir

	if err := applogger.InitLoggers(cfg); err != nil {
		t.Fatalf("ロガーの初期化に失敗しました: %v", err)
	}
}

// envTestCase は環境変数テストのケースを定義する構造体です
type envTestCase struct {
	name        string    // テストケースの名前
	envVars     map[string]string // テストする環境変数
	expectedErr bool      // 期待されるエラー状態
}

// TestSetupEnvironment は環境変数の設定をテストします
func TestSetupEnvironment(t *testing.T) {
	setupTestLogger(t)

	tests := []envTestCase{
		{
			name: "正常系/全ての必須環境変数が設定されている",
			envVars: map[string]string{
				"DB_HOST":     "localhost",
				"DB_PORT":     "5432",
				"DB_USER":     "user",
				"DB_PASSWORD": "password",
				"DB_NAME":     "testdb",
			},
			expectedErr: false,
		},
		{
			name: "異常系/必須環境変数が不足している",
			envVars: map[string]string{
				"DB_HOST": "localhost",
				"DB_PORT": "5432",
			},
			expectedErr: true,
		},
	}

	for _, tt := range tests {
		tt := tt // サブテストの並行実行のためのローカル変数
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel() // サブテストを並行実行

			cleanup := setupTestEnv(t, tt.envVars)

			defer cleanup()

			ctx := context.Background()
			cfg := &config.Config{Env: "test"}
			err := setupEnvironment(ctx, cfg)

			if tt.expectedErr {
				assert.Error(t, err, "環境変数が不足している場合はエラーが返されるべきです: %v", err)
			} else {
				assert.NoError(t, err, "全ての必須環境変数が設定されている場合はエラーが返されるべきではありません: %v", err)
			}
		})
	}
}

// dbTestCase はデータベーステストのケースを定義する構造体です
type dbTestCase struct {
	name        string           // テストケースの名前
	setupDB     func(t *testing.T) *gorm.DB // データベースのセットアップ関数
	expected    bool             // 期待される結果
	description string           // テストケースの説明
}

// TestCheckDBHealth はデータベースの健全性チェックをテストします
func TestCheckDBHealth(t *testing.T) {
	setupTestLogger(t)

	tests := []dbTestCase{
		{
			name: "正常系/データベース接続が正常",
			setupDB: func(t *testing.T) *gorm.DB {
				db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{
					TranslateError: true,
				})
				if err != nil {
					t.Fatalf("データベース接続の確立に失敗しました: %v", err)
				}

				sqlDB, err := db.DB()
				if err != nil {
					t.Fatalf("SQLデータベースの取得に失敗しました: %v", err)
				}
				sqlDB.SetMaxIdleConns(1)
				sqlDB.SetMaxOpenConns(1)

				return db.Session(&gorm.Session{
					PrepareStmt: true,
				})
			},
			expected:    true,
			description: "正常なデータベース接続では true を返すべきです",
		},
		{
			name: "異常系/データベース接続が切断されている",
			setupDB: func(t *testing.T) *gorm.DB {
				db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{
					TranslateError: true,
				})
				if err != nil {
					t.Fatalf("データベース接続の確立に失敗しました: %v", err)
				}

				sqlDB, err := db.DB()
				if err != nil {
					t.Fatalf("SQLデータベースの取得に失敗しました: %v", err)
				}

				if err := sqlDB.Close(); err != nil {
					t.Fatalf("データベース接続のクローズに失敗しました: %v", err)
				}

				// 新しいセッションを作成して安全性を確保
				return db.Session(&gorm.Session{
					PrepareStmt: true, // プリペアドステートメントを有効化
				})
			},
			expected:    false,
			description: "切断されたデータベース接続では false を返すべきです",
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := tt.setupDB(t)
			result := checkDBHealth(ctx, db)
			assert.Equal(t, tt.expected, result, tt.description)
		})
	}
}

// TestCheckMemoryHealth はメモリ使用量のチェックをテストします
func TestCheckMemoryHealth(t *testing.T) {
	setupTestLogger(t)

	ctx := context.Background()
	result := checkMemoryHealth(ctx)
	assert.True(t, result, "アプリケーション起動直後のメモリ使用量は1GB以下であるべきです")
}
