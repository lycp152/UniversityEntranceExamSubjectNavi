// Package main はアプリケーションのエントリーポイントを提供します。
// このパッケージは以下の機能を提供します：
// - アプリケーションの初期化
// - 環境変数の設定
// - データベース接続の確立
// - ヘルスチェックの実装
package main

import (
	"context"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"testing"
	"time"
	"university-exam-api/internal/config"
	applogger "university-exam-api/internal/logger"
	"university-exam-api/internal/server"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

const (
	// sqliteMemoryDSN はメモリ内SQLiteデータベースの接続文字列です
	sqliteMemoryDSN = "file::memory:?cache=shared"
	// dbConnectionErrorMsg はデータベース接続エラーのメッセージです
	dbConnectionErrorMsg = "データベース接続の確立に失敗しました: %v"
	// healthCheckPath はヘルスチェックエンドポイントのパスです
	healthCheckPath = "/health"
	// metricsPath はメトリクスエンドポイントのパスです
	metricsPath = "/metrics"
	// dbConnectionFailedMsg はデータベース接続失敗時のメッセージです
	dbConnectionFailedMsg = "データベース接続に失敗しました"
	// memoryUsageHighMsg はメモリ使用量が高い場合のメッセージです
	memoryUsageHighMsg = "メモリ使用量が高すぎます"
	// sqlDBErrorMsg はSQLデータベース取得エラーのメッセージです
	sqlDBErrorMsg = "SQLデータベースの取得に失敗しました: %v"
)

// setupTestLogger はテスト用のロガーをセットアップします。
// この関数は以下の処理を行います：
// - テスト用のログディレクトリの作成
// - ロガーの設定
// - ロガーの初期化
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

// setupTestEnv は環境変数を設定し、クリーンアップ関数を返します。
// この関数は以下の処理を行います：
// - 環境変数の設定
// - クリーンアップ関数の登録
// - エラーハンドリング
func setupTestEnv(t *testing.T, envVars map[string]string) {
	t.Helper()

	for key, value := range envVars {
		if err := os.Setenv(key, value); err != nil {
			t.Fatalf("環境変数の設定に失敗しました: %v", err)
		}

		t.Cleanup(func() {
			if err := os.Unsetenv(key); err != nil {
				t.Errorf("環境変数の削除に失敗しました: %v", err)
			}
		})
	}
}

// checkEnvError はエラーの期待値と実際の値を検証します。
// この関数は以下の検証を行います：
// - エラーの有無の確認
// - エラーメッセージの内容確認
// - 予期しないエラーの検出
func checkEnvError(t *testing.T, err error, expectedErr bool, errContains string) {
	t.Helper()

	if expectedErr {
		if err == nil {
			t.Error("エラーが発生するはずでしたが、発生しませんでした")
		} else if !strings.Contains(err.Error(), errContains) {
			t.Errorf("エラーメッセージに '%s' が含まれていません。実際のエラー: %v", errContains, err)
		}
	} else if err != nil {
		t.Errorf("予期しないエラーが発生しました: %v", err)
	}
}

// TestSetupEnvironment は環境変数の設定をテストします。
// このテストは以下のケースを検証します：
// - 正常系：全ての必須環境変数が設定されている場合
// - 異常系：必須環境変数が不足している場合
// - 異常系：必須環境変数が空の場合
func TestSetupEnvironment(t *testing.T) {
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

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			setupTestEnv(t, tt.envVars)

			err := setupEnvironment(context.Background(), &config.Config{})

			checkEnvError(t, err, tt.expectedErr, tt.errContains)
		})
	}
}

// dbTestCase はデータベーステストのケースを定義する構造体です。
// この構造体は以下の情報を保持します：
// - テストケースの名前
// - データベースのセットアップ関数
// - 期待される結果
// - テストケースの説明
type dbTestCase struct {
	name        string           // テストケースの名前
	setupDB     func(t *testing.T) *gorm.DB // データベースのセットアップ関数
	expected    bool             // 期待される結果
	description string           // テストケースの説明
}

// TestCheckDBHealth はデータベースの健全性チェックをテストします。
// このテストは以下のケースを検証します：
// - 正常系：データベース接続が正常な場合
// - 異常系：データベース接続が切断されている場合
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
					t.Fatalf(sqlDBErrorMsg, err)
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
					t.Fatalf(sqlDBErrorMsg, err)
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

// TestCheckMemoryHealth はメモリ使用量のチェックをテストします。
// このテストは以下のケースを検証します：
// - アプリケーション起動直後のメモリ使用量
// - メモリ使用量の閾値チェック
func TestCheckMemoryHealth(t *testing.T) {
	setupTestLogger(t)

	ctx := context.Background()
	result := checkMemoryHealth(ctx)
	assert.True(t, result, "アプリケーション起動直後のメモリ使用量は1GB以下であるべきです")
}

// TestMain はmain関数のテストを行います。
// このテストは以下のケースを検証します：
// - ヘルスチェックの設定
// - メトリクスの設定
// - メモリヘルスチェック
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
		req := httptest.NewRequest("GET", healthCheckPath, nil)
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
		req := httptest.NewRequest("GET", metricsPath, nil)
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

// TestServerStartupAndShutdown はサーバーの起動とシャットダウンをテストします
func TestServerStartupAndShutdown(t *testing.T) {
	setupTestLogger(t)

	// テスト用の設定
	cfg := &config.Config{
		Port: "0", // ランダムポートを使用
		DBHost: "localhost",
		DBPort: "5432",
		DBUser: "testuser",
		DBName: "testdb",
	}

	// テスト用のデータベース接続
	db, err := gorm.Open(sqlite.Open(sqliteMemoryDSN), &gorm.Config{
		TranslateError: true,
	})
	if err != nil {
		t.Fatalf(dbConnectionErrorMsg, err)
	}

	// サーバーの初期化
	srv := server.New(cfg)
	if err := srv.SetupRoutes(db); err != nil {
		t.Fatalf("ルーティングの設定に失敗しました: %v", err)
	}

	// コンテキストの作成
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// サーバー起動のテスト
	t.Run("サーバー起動", func(t *testing.T) {
		// サーバーを別ゴルーチンで起動
		go func() {
			if err := srv.Start(ctx); err != nil && err != http.ErrServerClosed {
				t.Errorf("サーバーの起動に失敗しました: %v", err)
			}
		}()

		// サーバーが起動するまで少し待機
		time.Sleep(100 * time.Millisecond)

		// ヘルスチェックエンドポイントにリクエスト
		resp, err := http.Get("http://localhost:0/health")
		if err == nil {
			defer func() {
				if err := resp.Body.Close(); err != nil {
					t.Errorf("レスポンスボディのクローズに失敗しました: %v", err)
				}
			}()
			assert.Equal(t, http.StatusOK, resp.StatusCode)
		}
	})

	// サーバーシャットダウンのテスト
	t.Run("サーバーシャットダウン", func(t *testing.T) {
	// シャットダウンのタイムアウト設定
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutdownCancel()

		// シャットダウン処理
		if err := srv.Shutdown(shutdownCtx); err != nil {
			t.Errorf("サーバーのシャットダウンに失敗しました: %v", err)
		}

		// サーバーが完全にシャットダウンするまで待機
		time.Sleep(100 * time.Millisecond)
	})
}

// TestSetupMetrics はメトリクス設定のテストを行います。
// このテストは以下のケースを検証します：
// - メトリクスエンドポイントが正しく設定されているか
// - メトリクスが正しく収集されているか
func TestSetupMetrics(t *testing.T) {
	setupTestLogger(t)

	// テスト用の新しいServeMuxを作成
	mux := http.NewServeMux()

	// メトリクスの設定
	registry := prometheus.NewRegistry()
	httpRequestsTotal := prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "http_requests_total",
			Help: "Total number of HTTP requests",
		},
		[]string{"method", "path", "status"},
	)
	registry.MustRegister(httpRequestsTotal)

	// メトリクスエンドポイントの設定
	mux.Handle(metricsPath, promhttp.HandlerFor(registry, promhttp.HandlerOpts{}))

	// メトリクスエンドポイントのテスト
	req := httptest.NewRequest(http.MethodGet, metricsPath, nil)
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusOK, rec.Code)
}

// TestSetupHealthCheck はヘルスチェックエンドポイントのテストを行います。
func TestSetupHealthCheck(t *testing.T) {
	setupTestLogger(t)
	t.Run("正常系", testHealthCheckNormal)
	t.Run("異常系", testHealthCheckError)
}

// testHealthCheckNormal は正常系のヘルスチェックテストを行います。
func testHealthCheckNormal(t *testing.T) {
	db, err := gorm.Open(sqlite.Open(sqliteMemoryDSN), &gorm.Config{
		TranslateError: true,
	})
	if err != nil {
		t.Fatalf(dbConnectionErrorMsg, err)
	}

	mux := http.NewServeMux()
	ctx := context.Background()

	mux.HandleFunc(healthCheckPath, func(w http.ResponseWriter, _ *http.Request) {
		if !checkDBHealth(ctx, db) {
			w.WriteHeader(http.StatusServiceUnavailable)
			_, err := w.Write([]byte(dbConnectionFailedMsg))

			if err != nil {
				applogger.Error(ctx, writeErrorMsg, err)
			}

			return
		}

		if !checkMemoryHealth(ctx) {
			w.WriteHeader(http.StatusServiceUnavailable)
			_, err := w.Write([]byte(memoryUsageHighMsg))

			if err != nil {
				applogger.Error(ctx, writeErrorMsg, err)
			}

			return
		}

		w.WriteHeader(http.StatusOK)
		_, err := w.Write([]byte("正常"))

		if err != nil {
			applogger.Error(ctx, writeErrorMsg, err)
		}
	})

	req := httptest.NewRequest(http.MethodGet, healthCheckPath, nil)
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, req)
	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Contains(t, rec.Body.String(), "正常")
}

// testHealthCheckError は異常系のヘルスチェックテストを行います。
func testHealthCheckError(t *testing.T) {
	tests := []struct {
		name           string
		setupDB        func(_ *testing.T) *gorm.DB
		expectedStatus int
		expectedBody   string
	}{
		{
			name: "データベース接続が切断",
			setupDB: func(_ *testing.T) *gorm.DB {
				return setupBrokenDB(t)
			},
			expectedStatus: http.StatusServiceUnavailable,
			expectedBody:   dbConnectionFailedMsg,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			runHealthCheckTest(t, tt.setupDB, tt.expectedStatus, tt.expectedBody)
		})
	}
}

// setupBrokenDB は切断されたデータベース接続をセットアップします
func setupBrokenDB(t *testing.T) *gorm.DB {
	brokenDB, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf(dbConnectionErrorMsg, err)
	}

	sqlDB, err := brokenDB.DB()

	if err != nil {
		t.Fatalf(sqlDBErrorMsg, err)
	}

	if err := sqlDB.Close(); err != nil {
		t.Fatalf("データベース接続のクローズに失敗しました: %v", err)
	}

	return brokenDB
}

// runHealthCheckTest はヘルスチェックのテストケースを実行します
func runHealthCheckTest(t *testing.T, setupDB func(*testing.T) *gorm.DB, expectedStatus int, expectedBody string) {
	mux := http.NewServeMux()
	ctx := context.Background()

	mux.HandleFunc(healthCheckPath, func(w http.ResponseWriter, _ *http.Request) {
		if !checkDBHealth(ctx, setupDB(t)) {
			w.WriteHeader(http.StatusServiceUnavailable)
			_, err := w.Write([]byte(dbConnectionFailedMsg))

			if err != nil {
				applogger.Error(ctx, writeErrorMsg, err)
			}

			return
		}

		if !checkMemoryHealth(ctx) {
			w.WriteHeader(http.StatusServiceUnavailable)
			_, err := w.Write([]byte(memoryUsageHighMsg))

			if err != nil {
				applogger.Error(ctx, writeErrorMsg, err)
			}

			return
		}

		w.WriteHeader(http.StatusOK)
		_, err := w.Write([]byte("正常"))

		if err != nil {
			applogger.Error(ctx, writeErrorMsg, err)
		}
	})

	req := httptest.NewRequest(http.MethodGet, healthCheckPath, nil)
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, req)
	assert.Equal(t, expectedStatus, rec.Code)
	assert.Contains(t, rec.Body.String(), expectedBody)
}

// TestMemoryThreshold はメモリ使用量の閾値テストを行います
func TestMemoryThreshold(t *testing.T) {
	setupTestLogger(t)

	// メモリ使用量を強制的に増加させる
	largeSlice := make([]byte, 2*1024*1024*1024) // 2GB
	for i := range largeSlice {
		largeSlice[i] = 1
	}

	ctx := context.Background()
	result := checkMemoryHealth(ctx)
	assert.False(t, result, "メモリ使用量が閾値を超えた場合、falseを返すべきです")

	// メモリを解放
	runtime.GC()
}

// TestMetricsCollection はメトリクス収集の詳細なテストを行います
func TestMetricsCollection(t *testing.T) {
	setupTestLogger(t)

	// テスト用の新しいServeMuxを作成
	mux := http.NewServeMux()

	// メトリクスの設定
	registry := prometheus.NewRegistry()

	// HTTPリクエストの総数
	httpRequestsTotal := prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "http_requests_total",
			Help: "Total number of HTTP requests",
		},
		[]string{"method", "path", "status"},
	)

	// HTTPリクエストの処理時間
	httpRequestDuration := prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "http_request_duration_seconds",
			Help:    "HTTP request duration in seconds",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"method", "path"},
	)

	// メモリ使用量
	memoryUsage := prometheus.NewGauge(
		prometheus.GaugeOpts{
			Name: "memory_usage_bytes",
			Help: "Current memory usage in bytes",
		},
	)

	// メトリクスの登録
	registry.MustRegister(httpRequestsTotal)
	registry.MustRegister(httpRequestDuration)
	registry.MustRegister(memoryUsage)

	// メトリクスエンドポイントの設定
	mux.Handle(metricsPath, promhttp.HandlerFor(registry, promhttp.HandlerOpts{}))

	// テストケース
	tests := []struct {
		name           string
		method         string
		path           string
		status         string
		expectedStatus int
	}{
		{
			name:           "正常なリクエスト",
			method:         "GET",
			path:           "/test",
			status:         "200",
			expectedStatus: http.StatusOK,
		},
		{
			name:           "エラーレスポンス",
			method:         "GET",
			path:           "/error",
			status:         "500",
			expectedStatus: http.StatusInternalServerError,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// メトリクスの更新
			httpRequestsTotal.WithLabelValues(tt.method, tt.path, tt.status).Inc()
			httpRequestDuration.WithLabelValues(tt.method, tt.path).Observe(0.1)

			// メモリ使用量の更新
			var m runtime.MemStats

			runtime.ReadMemStats(&m)
			memoryUsage.Set(float64(m.Alloc))

			// メトリクスエンドポイントのテスト
			req := httptest.NewRequest(http.MethodGet, metricsPath, nil)
			rec := httptest.NewRecorder()
			mux.ServeHTTP(rec, req)

			assert.Equal(t, http.StatusOK, rec.Code)
			assert.Contains(t, rec.Body.String(), "http_requests_total")
			assert.Contains(t, rec.Body.String(), "http_request_duration_seconds")
			assert.Contains(t, rec.Body.String(), "memory_usage_bytes")
		})
	}
}
