// Package main はアプリケーションのエントリーポイントを提供します。
package main

import (
	"context"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
	"university-exam-api/internal/config"
	applogger "university-exam-api/internal/logger"

	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

const (
	// sqliteMemoryDSN はメモリ内SQLiteデータベースの接続文字列です
	sqliteMemoryDSN = "file::memory:?cache=shared"
	// dbConnectionErrorMsg はデータベース接続エラーのメッセージです
	dbConnectionErrorMsg = "データベース接続の確立に失敗しました: %v"
)

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

// verifyError はエラーチェックのロジックを分離した関数です
func verifyError(t *testing.T, err error, expectedErr bool, errContains string) {
	if expectedErr {
		if err == nil {
			t.Error("エラーが発生するはずでしたが、発生しませんでした")
		} else if errContains != "" && !strings.Contains(err.Error(), errContains) {
			t.Errorf("エラーメッセージに '%s' が含まれていません。実際のエラー: %v", errContains, err)
		}
	} else if err != nil {
		t.Errorf("予期しないエラーが発生しました: %v", err)
	}
}

// TestSetupEnvironment は環境変数の設定をテストします
func TestSetupEnvironment(t *testing.T) {
	// テストケースの定義
	tests := []struct {
		name        string
		envVars     map[string]string
		expectedErr bool
		errContains string
	}{
		{
			name: "正常系/全ての必須環境変数が設定されている",
			envVars: map[string]string{
				"DB_HOST":     "localhost",
				"DB_PORT":     "5432",
				"DB_NAME":     "testdb",
				"DB_USER":     "testuser",
				"DB_PASSWORD": "testpass",
			},
			expectedErr: false,
		},
		{
			name: "異常系/必須環境変数が不足している",
			envVars: map[string]string{
				"DB_HOST": "localhost",
				"DB_PORT": "5432",
				// DB_NAME, DB_USER, DB_PASSWORDが不足
			},
			expectedErr: true,
			errContains: "以下の必須環境変数が設定されていません",
		},
		{
			name: "異常系/必須環境変数が空",
			envVars: map[string]string{
				"DB_HOST":     "localhost",
				"DB_PORT":     "5432",
				"DB_NAME":     "",
				"DB_USER":     "",
				"DB_PASSWORD": "",
			},
			expectedErr: true,
			errContains: "以下の必須環境変数が空です",
		},
	}

	// 各テストケースの実行
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// 環境変数の設定
			for key, value := range tt.envVars {
				t.Setenv(key, value)
			}

			// 環境変数の設定を実行
			ctx := context.Background()
			cfg := &config.Config{}
			err := setupEnvironment(ctx, cfg)

			// エラーチェック
			verifyError(t, err, tt.expectedErr, tt.errContains)
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
				db, err := gorm.Open(sqlite.Open(sqliteMemoryDSN), &gorm.Config{
					TranslateError: true,
				})
				if err != nil {
					t.Fatalf(dbConnectionErrorMsg, err)
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
				db, err := gorm.Open(sqlite.Open(sqliteMemoryDSN), &gorm.Config{
					TranslateError: true,
				})
				if err != nil {
					t.Fatalf(dbConnectionErrorMsg, err)
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
					PrepareStmt: true,
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

// TestMain はmain関数のテストを行います
func TestMain(t *testing.T) {
	setupTestLogger(t)

	// テスト用のコンテキストを作成
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// テスト用のデータベース接続を作成
	db, err := gorm.Open(sqlite.Open(sqliteMemoryDSN), &gorm.Config{
		TranslateError: true,
	})
	if err != nil {
		t.Fatalf(dbConnectionErrorMsg, err)
	}

	// ヘルスチェックのテスト
	t.Run("ヘルスチェックの設定", func(t *testing.T) {
		setupHealthCheck(ctx, db)

		// ヘルスチェックエンドポイントへのリクエストをシミュレート
		req := httptest.NewRequest("GET", "/health", nil)
		w := httptest.NewRecorder()

		http.DefaultServeMux.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("ヘルスチェックのステータスコードが期待値と異なります: got %v, want %v", w.Code, http.StatusOK)
		}
	})

	// メトリクスのテスト
	t.Run("メトリクスの設定", func(t *testing.T) {
		setupMetrics()

		// メトリクスエンドポイントへのリクエストをシミュレート
		req := httptest.NewRequest("GET", "/metrics", nil)
		w := httptest.NewRecorder()

		http.DefaultServeMux.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("メトリクスのステータスコードが期待値と異なります: got %v, want %v", w.Code, http.StatusOK)
		}
	})

	// メモリヘルスチェックのテスト
	t.Run("メモリヘルスチェック", func(t *testing.T) {
		result := checkMemoryHealth(ctx)
		if !result {
			t.Error("メモリヘルスチェックが失敗しました")
		}
	})
}

// TestServerShutdown はサーバーのシャットダウン処理をテストします
func TestServerShutdown(t *testing.T) {
	setupTestLogger(t)

	// テスト用のサーバーを作成
	srv := &http.Server{
		Addr:              ":0",
		ReadHeaderTimeout: 5 * time.Second,
	}

	// シャットダウンのタイムアウト設定
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutdownCancel()

	// シャットダウン処理のテスト
	go func() {
		time.Sleep(100 * time.Millisecond)
		shutdownCancel()
	}()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		t.Errorf("サーバーのシャットダウンに失敗しました: %v", err)
	}
}
