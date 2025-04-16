// Package main はアプリケーションのエントリーポイントを提供します。
// アプリケーションの初期化、設定の読み込み、サーバーの起動などの機能を提供します。
package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"
	"university-exam-api/internal/config"
	"university-exam-api/internal/infrastructure/database"
	applogger "university-exam-api/internal/logger"
	"university-exam-api/internal/server"

	"runtime"

	"github.com/joho/godotenv"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"gorm.io/gorm"
)

const (
	writeErrorMsg = "レスポンスの書き込みに失敗しました: %v"
	shutdownTimeout = 10 * time.Second
	maxIdleConns = 10
	maxOpenConns = 100
	connMaxLifetime = time.Hour
	connMaxIdleTime = 30 * time.Minute
)

// DB はデータベース接続を表す構造体です
type DB struct {
	*gorm.DB
}

// setupEnvironment は環境変数の読み込みと検証を行います。
// 開発環境の場合は.envファイルから環境変数を読み込みます。
// cfg: アプリケーション設定
// 戻り値: エラー情報
func setupEnvironment(ctx context.Context, cfg *config.Config) error {
	if cfg.Env == "development" {
		if err := godotenv.Load(); err != nil {
			applogger.Warn(ctx, "警告: .envファイルが見つかりません: %v", err)
		}
	}

	// 必須環境変数の検証
	requiredVars := []string{
		"DB_HOST",
		"DB_PORT",
		"DB_USER",
		"DB_PASSWORD",
		"DB_NAME",
	}

	var missingVars []string

	for _, envVar := range requiredVars {
		if value := os.Getenv(envVar); value == "" {
			missingVars = append(missingVars, envVar)
		}
	}

	if len(missingVars) > 0 {
		return fmt.Errorf("以下の必須環境変数が設定されていません: %v", missingVars)
	}

	return nil
}

// checkDBHealth はデータベースの健全性をチェックします
func checkDBHealth(ctx context.Context, db *gorm.DB) bool {
	// 新しいセッションを作成して安全性を確保
	session := db.Session(&gorm.Session{})

	sqlDB, err := session.DB()
	if err != nil {
		applogger.Error(ctx, "データベース接続の取得に失敗しました: %v", err)
		return false
	}

	if err := sqlDB.Ping(); err != nil {
		applogger.Error(ctx, "データベースの接続確認に失敗しました: %v", err)
		return false
	}

	return true
}

func checkMemoryHealth(ctx context.Context) bool {
	var m runtime.MemStats

	runtime.ReadMemStats(&m)

	// メモリ使用量が1GBを超えた場合に警告をログに記録
	if m.Alloc > 1000000000 {
		applogger.Warn(ctx, "メモリ使用量が高くなっています: %d bytes", m.Alloc)
	}

	return m.Alloc <= 1000000000 // 1GB以下
}

// setupHealthCheck はヘルスチェックエンドポイントを設定します
func setupHealthCheck(ctx context.Context, db *gorm.DB) {
	http.HandleFunc("/health", func(w http.ResponseWriter, _ *http.Request) {
		if !checkDBHealth(ctx, db) {
			w.WriteHeader(http.StatusServiceUnavailable)
			_, err := w.Write([]byte("データベース接続に失敗しました"))

			if err != nil {
				applogger.Error(ctx, writeErrorMsg, err)
			}

			return
		}

		if !checkMemoryHealth(ctx) {
			w.WriteHeader(http.StatusServiceUnavailable)
			_, err := w.Write([]byte("メモリ使用量が高すぎます"))

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
}

// setupMetrics はメトリクス収集のエンドポイントを設定します
func setupMetrics() {
	// メトリクスレジストリの作成
	registry := prometheus.NewRegistry()

	// HTTPリクエストの総数を計測するカウンター
	httpRequestsTotal := prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "http_requests_total",
			Help: "Total number of HTTP requests",
		},
		[]string{"method", "path", "status"},
	)

	// HTTPリクエストの処理時間を計測するヒストグラム
	httpRequestDuration := prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "http_request_duration_seconds",
			Help:    "HTTP request duration in seconds",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"method", "path"},
	)

	// HTTPエラーレスポンスを計測するカウンター
	httpErrorResponses := prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "http_error_responses_total",
			Help: "Total number of HTTP error responses",
		},
		[]string{"method", "path", "status"},
	)

	// メモリ使用量を計測するゲージ
	memoryUsage := prometheus.NewGauge(
		prometheus.GaugeOpts{
			Name: "memory_usage_bytes",
			Help: "Current memory usage in bytes",
		},
	)

	// メトリクスの登録
	registry.MustRegister(httpRequestsTotal)
	registry.MustRegister(httpRequestDuration)
	registry.MustRegister(httpErrorResponses)
	registry.MustRegister(memoryUsage)

	// メトリクスエンドポイントの設定
	http.Handle("/metrics", promhttp.HandlerFor(registry, promhttp.HandlerOpts{}))

	// メモリ使用量の定期的な更新
	go func() {
		ticker := time.NewTicker(10 * time.Second)
		defer ticker.Stop()

		for range ticker.C {
			var m runtime.MemStats

			runtime.ReadMemStats(&m)
			memoryUsage.Set(float64(m.Alloc))
		}
	}()
}

// main はアプリケーションのエントリーポイントです。
// 以下の処理を順番に実行します：
// 1. コンテキストの作成
// 2. ロガーの初期化
// 3. 設定の読み込み
// 4. 環境変数の読み込みと検証
// 5. データベース接続の確立
// 6. サーバーの初期化とルーティングの設定
// 7. ヘルスチェックとメトリクスの設定
// 8. シグナルハンドリングの設定
// 9. サーバーの起動
func main() {
	// コンテキストの作成
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// ロガーの初期化
	if err := applogger.InitLoggers(applogger.DefaultConfig()); err != nil {
		applogger.Error(ctx, "ロガーの初期化に失敗しました: %v", err)
		log.Printf("ロガーの初期化に失敗しました: %v", err)
		cancel()

		return
	}

	applogger.Info(ctx, "アプリケーションを起動しています...")

	// 設定の読み込み
	cfg, err := config.New()
	if err != nil {
		applogger.Error(ctx, "設定の読み込みに失敗しました: %v", err)
		log.Printf("設定の読み込みに失敗しました: %v", err)
		cancel()

		return
	}

	// 環境変数の読み込みと検証
	if err := setupEnvironment(ctx, cfg); err != nil {
		applogger.Error(ctx, "環境変数の読み込みに失敗しました: %v", err)
		log.Printf("環境変数の読み込みに失敗しました: %v", err)
		cancel()

		return
	}

	// データベース接続の確立
	db, err := database.NewDB()
	if err != nil {
		applogger.Error(ctx, "データベース接続の確立に失敗しました: %v", err)
		log.Printf("データベース接続の確立に失敗しました: %v", err)
		cancel()

		return
	}

	defer func() {
		if err := database.CloseDB(db); err != nil {
			applogger.Error(ctx, "データベース接続のクローズに失敗しました: %v", err)
		}
	}()

	// データベース接続プールの設定
	sqlDB, err := db.DB()
	if err != nil {
		applogger.Error(ctx, "データベース接続プールの設定に失敗しました: %v", err)
		cancel()

		return
	}

	// データベース接続プールのパラメータを設定
	sqlDB.SetMaxIdleConns(maxIdleConns)
	sqlDB.SetMaxOpenConns(maxOpenConns)
	sqlDB.SetConnMaxLifetime(connMaxLifetime)
	sqlDB.SetConnMaxIdleTime(connMaxIdleTime)

	// 新しいセッションを作成して安全性を確保
	db = db.Session(&gorm.Session{})

	// ヘルスチェックとメトリクスの設定
	setupHealthCheck(ctx, db)
	setupMetrics()

	// サーバーの初期化
	srv := server.New(cfg)
	if err := srv.SetupRoutes(db); err != nil {
		applogger.Error(ctx, "ルーティングの設定に失敗しました: %v", err)
		log.Printf("ルーティングの設定に失敗しました: %v", err)
		cancel()

		return
	}

	// シグナルハンドリングの設定
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	// シャットダウン用のWaitGroup
	var wg sync.WaitGroup

	wg.Add(1)

	// サーバーの起動
	go func() {
		defer wg.Done()

		if err := srv.Start(ctx); err != nil {
			applogger.Error(ctx, "サーバーの実行中にエラーが発生しました: %v", err)
			sigChan <- syscall.SIGTERM

			return
		}
	}()

	// シグナル待機
	sig := <-sigChan
	applogger.Info(ctx, "シグナルを受信しました: %v", sig)

	// シャットダウンのタイムアウト設定
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), shutdownTimeout)
	defer shutdownCancel()

	// コンテキストのキャンセル
	cancel()

	// シャットダウン完了待機
	done := make(chan struct{})
	go func() {
		wg.Wait()
		close(done)
	}()

	select {
	case <-done:
		applogger.Info(ctx, "シャットダウンが完了しました")
	case <-shutdownCtx.Done():
		applogger.Warn(ctx, "シャットダウンがタイムアウトしました")
	}

	applogger.Info(ctx, "アプリケーションを終了します")
}
