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
	"university-exam-api/internal/database"
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
)

// DB はデータベース接続を表す構造体です
type DB struct {
	*gorm.DB
}

// setupEnvironment は環境変数の読み込みと検証を行います。
// 開発環境の場合は.envファイルから環境変数を読み込みます。
// cfg: アプリケーション設定
// 戻り値: エラー情報
func setupEnvironment(cfg *config.Config) error {
	if cfg.Env == "development" {
		if err := godotenv.Load(); err != nil {
			applogger.Error(context.Background(), "警告: .envファイルが見つかりません: %v", err)
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

	for _, envVar := range requiredVars {
		if os.Getenv(envVar) == "" {
			return fmt.Errorf("必須環境変数 %s が設定されていません", envVar)
		}
	}

	return nil
}

func checkDBHealth(db *gorm.DB) bool {
	sqlDB, err := db.DB()
	if err != nil {
		return false
	}
	return sqlDB.Ping() == nil
}

func checkMemoryHealth() bool {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)
	return m.Alloc <= 1000000000 // 1GB以下
}

// setupHealthCheck はヘルスチェックエンドポイントを設定します
func setupHealthCheck(db *gorm.DB) {
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		if !checkDBHealth(db) {
			w.WriteHeader(http.StatusServiceUnavailable)
			if _, err := w.Write([]byte("データベース接続に失敗しました")); err != nil {
				log.Printf(writeErrorMsg, err)
			}
			return
		}

		if !checkMemoryHealth() {
			w.WriteHeader(http.StatusServiceUnavailable)
			if _, err := w.Write([]byte("メモリ使用量が高すぎます")); err != nil {
				log.Printf(writeErrorMsg, err)
			}
			return
		}

		w.WriteHeader(http.StatusOK)
		if _, err := w.Write([]byte("正常")); err != nil {
			log.Printf(writeErrorMsg, err)
		}
	})
}

// setupMetrics はメトリクス収集のエンドポイントを設定します
func setupMetrics() {
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
	prometheus.MustRegister(httpRequestsTotal)
	prometheus.MustRegister(httpRequestDuration)
	prometheus.MustRegister(httpErrorResponses)
	prometheus.MustRegister(memoryUsage)

	// メトリクスエンドポイントの設定
	http.Handle("/metrics", promhttp.Handler())

	// メモリ使用量の定期的な更新
	go func() {
		for {
			var m runtime.MemStats
			runtime.ReadMemStats(&m)
			memoryUsage.Set(float64(m.Alloc))
			time.Sleep(10 * time.Second)
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
		log.Fatalf("ロガーの初期化に失敗しました: %v", err)
	}
	applogger.Info(ctx, "アプリケーションを起動しています...")

	// 設定の読み込み
	cfg, err := config.New()
	if err != nil {
		applogger.Error(ctx, "設定の読み込みに失敗しました: %v", err)
		log.Fatal(err)
	}

	// 環境変数の読み込みと検証
	if err := setupEnvironment(cfg); err != nil {
		applogger.Error(ctx, "環境変数の読み込みに失敗しました: %v", err)
		log.Fatal(err)
	}

	// データベース接続の確立
	db, cleanup, err := database.Setup(ctx, cfg)
	if err != nil {
		applogger.Error(ctx, "データベース接続の確立に失敗しました: %v", err)
		log.Fatal(err)
	}
	defer cleanup()

	// ヘルスチェックとメトリクスの設定
	setupHealthCheck(db)
	setupMetrics()

	// サーバーの初期化
	srv := server.New(cfg)
	if err := srv.SetupRoutes(db); err != nil {
		applogger.Error(ctx, "ルーティングの設定に失敗しました: %v", err)
		log.Fatal(err)
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
		}
	}()

	// シグナル待機
	sig := <-sigChan
	applogger.Info(ctx, "シグナルを受信しました: %v", sig)

	// シャットダウンのタイムアウト設定
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
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
