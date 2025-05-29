package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"strings"
	"sync"
	"syscall"
	"time"
	"university-exam-api/internal/config"
	"university-exam-api/internal/infrastructure/database"
	applogger "university-exam-api/internal/logger"
	"university-exam-api/internal/server"

	"runtime"

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

func validateEnvVars() error {
	requiredVars := []string{
		"DB_HOST",
		"DB_PORT",
		"DB_USER",
		"DB_PASSWORD",
		"DB_NAME",
	}

	var missingVars []string

	var emptyVars []string

	for _, envVar := range requiredVars {
		value, exists := os.LookupEnv(envVar)
		if !exists {
			missingVars = append(missingVars, envVar)
		} else if strings.TrimSpace(value) == "" {
			emptyVars = append(emptyVars, envVar)
		}
	}

	if len(missingVars) > 0 || len(emptyVars) > 0 {
		var errMsg strings.Builder
		if len(missingVars) > 0 {
			errMsg.WriteString("以下の必須環境変数が設定されていません: ")
			errMsg.WriteString(strings.Join(missingVars, ", "))
		}

		if len(emptyVars) > 0 {
			if errMsg.Len() > 0 {
				errMsg.WriteString("\n")
			}

			errMsg.WriteString("以下の必須環境変数が空です: ")
			errMsg.WriteString(strings.Join(emptyVars, ", "))
		}

		return fmt.Errorf("%s", errMsg.String())
	}

	return nil
}

func setupEnvironment(_ context.Context, _ *config.Config) error {
	return validateEnvVars()
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

	// メモリ使用量が1GBを超えた場合に警告をログに記録し、falseを返す
	if m.Alloc > 1024*1024*1024 { // 1GB
		applogger.Warn(ctx, "メモリ使用量が高くなっています: %d bytes", m.Alloc)
		return false
	}

	return true
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

// initializeApp はアプリケーションの初期化を行います
func initializeApp(ctx context.Context) (*config.Config, *gorm.DB, error) {
	// プロジェクトルートを特定
	wd, err := os.Getwd()
	if err != nil {
		return nil, nil, fmt.Errorf("カレントディレクトリの取得に失敗しました: %w", err)
	}

	projectRoot := wd

	for {
		if _, err := os.Stat(filepath.Join(projectRoot, "go.mod")); err == nil {
			break
		}

		parent := filepath.Dir(projectRoot)

		if parent == projectRoot {
			return nil, nil, fmt.Errorf("プロジェクトルートが見つかりません")
		}

		projectRoot = parent
	}

	// ログディレクトリのパスを構築
	logDir := filepath.Join(projectRoot, "logs")

	// ログディレクトリの作成
	if err := os.MkdirAll(logDir, 0750); err != nil {
		return nil, nil, fmt.Errorf("ログディレクトリの作成に失敗しました: %w", err)
	}

	// ロガーの設定
	cfg := applogger.DefaultConfig()
	cfg.LogDir = logDir

	// ロガーの初期化
	if err := applogger.InitLoggers(cfg); err != nil {
		return nil, nil, fmt.Errorf("ロガーの初期化に失敗しました: %w", err)
	}

	applogger.Info(ctx, "アプリケーションを起動しています...")

	// 設定の読み込み
	appCfg, err := config.New()
	if err != nil {
		return nil, nil, fmt.Errorf("設定の読み込みに失敗しました: %w", err)
	}

	// 環境変数の読み込みと検証
	if err := setupEnvironment(ctx, appCfg); err != nil {
		return nil, nil, fmt.Errorf("環境変数の読み込みに失敗しました: %w", err)
	}

	// データベース接続の確立
	db, err := database.NewDB()
	if err != nil {
		return nil, nil, fmt.Errorf("データベース接続の確立に失敗しました: %w", err)
	}

	// データベース接続プールの設定
	sqlDB, err := db.DB()
	if err != nil {
		return nil, nil, fmt.Errorf("データベース接続プールの設定に失敗しました: %w", err)
	}

	// データベース接続プールのパラメータを設定
	sqlDB.SetMaxIdleConns(maxIdleConns)
	sqlDB.SetMaxOpenConns(maxOpenConns)
	sqlDB.SetConnMaxLifetime(connMaxLifetime)
	sqlDB.SetConnMaxIdleTime(connMaxIdleTime)

	// 新しいセッションを作成して安全性を確保
	db = db.Session(&gorm.Session{})

	return appCfg, db, nil
}

// setupServer はサーバーの初期化と設定を行います
func setupServer(ctx context.Context, cfg *config.Config, db *gorm.DB) (*server.Server, error) {
	// ヘルスチェックとメトリクスの設定
	setupHealthCheck(ctx, db)
	setupMetrics()

	// サーバーの初期化
	srv := server.New(cfg)
	if err := srv.SetupRoutes(db); err != nil {
		return nil, fmt.Errorf("ルーティングの設定に失敗しました: %w", err)
	}

	return srv, nil
}

// runServer はサーバーを起動し、シグナルハンドリングを行います
func runServer(ctx context.Context, srv *server.Server, sigChan chan os.Signal) error {
	// シグナルハンドリングの設定
	if sigChan == nil {
		sigChan = make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	}

	// シャットダウン用のWaitGroup
	var wg sync.WaitGroup

	wg.Add(1)

	// サーバーの起動
	go func() {
		defer wg.Done()

		if err := srv.Start(ctx); err != nil && err != http.ErrServerClosed {
			applogger.Error(ctx, "サーバーの実行中にエラーが発生しました: %v", err)
			sigChan <- syscall.SIGTERM
		}
	}()

	// シグナル待機
	sig := <-sigChan
	applogger.Info(ctx, "シグナルを受信しました: %v", sig)

	// シャットダウンのタイムアウト設定
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), shutdownTimeout)
	defer shutdownCancel()

	// シャットダウン処理
	if err := srv.Shutdown(shutdownCtx); err != nil {
		applogger.Error(ctx, "サーバーのシャットダウンに失敗しました: %v", err)
		return err
	}

	// シャットダウン完了待機
	done := make(chan struct{})
	go func() {
		wg.Wait()
		close(done)
	}()

	select {
	case <-done:
		applogger.Info(ctx, "シャットダウンが完了しました")
		return nil
	case <-shutdownCtx.Done():
		applogger.Warn(ctx, "シャットダウンがタイムアウトしました")
		return fmt.Errorf("シャットダウンがタイムアウトしました")
	}
}

// coverage:ignore
func main() {
	// コンテキストの作成
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// アプリケーションの初期化
	cfg, db, err := initializeApp(ctx)
	if err != nil {
		log.Printf("%v", err)
		return
	}

	defer func() {
		if err := database.CloseDB(db); err != nil {
			applogger.Error(ctx, "データベース接続のクローズに失敗しました: %v", err)
		}
	}()

	// サーバーの設定
	srv, err := setupServer(ctx, cfg, db)
	if err != nil {
		log.Printf("%v", err)
		return
	}

	// サーバーの起動と実行
	if err := runServer(ctx, srv, nil); err != nil {
		log.Printf("%v", err)
		return
	}

	applogger.Info(ctx, "アプリケーションを終了します")
}
