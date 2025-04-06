// Package main はアプリケーションのエントリーポイントを提供します。
// アプリケーションの初期化、設定の読み込み、サーバーの起動などの機能を提供します。
package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"university-exam-api/internal/config"
	"university-exam-api/internal/database"
	applogger "university-exam-api/internal/logger"
	"university-exam-api/internal/server"

	"github.com/joho/godotenv"
)

// setupEnvironment は環境変数の読み込みを行います。
// 開発環境の場合は.envファイルから環境変数を読み込みます。
// cfg: アプリケーション設定
// 戻り値: エラー情報
func setupEnvironment(cfg *config.Config) error {
	if cfg.Env == "development" {
		if err := godotenv.Load(); err != nil {
			applogger.Error(context.Background(), "警告: .envファイルが見つかりません: %v", err)
		}
	}
	return nil
}

// main はアプリケーションのエントリーポイントです。
// 以下の処理を順番に実行します：
// 1. コンテキストの作成
// 2. ロガーの初期化
// 3. 設定の読み込み
// 4. 環境変数の読み込み
// 5. データベース接続の確立
// 6. サーバーの初期化とルーティングの設定
// 7. シグナルハンドリングの設定
// 8. サーバーの起動
func main() {
	// コンテキストの作成
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// ロガーの初期化
	applogger.InitLoggers(applogger.DefaultConfig())
	applogger.Info(ctx, "アプリケーションを起動しています...")

	// 設定の読み込み
	cfg, err := config.New()
	if err != nil {
		applogger.Error(ctx, "設定の読み込みに失敗しました: %v", err)
		log.Fatal(err)
	}

	// 環境変数の読み込み
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

	// サーバーの初期化
	srv := server.New(cfg)
	if err := srv.SetupRoutes(db); err != nil {
		applogger.Error(ctx, "ルーティングの設定に失敗しました: %v", err)
		log.Fatal(err)
	}

	// シグナルハンドリングの設定
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
		<-sigChan
		applogger.Info(ctx, "シャットダウンシグナルを受信しました")
		cancel()
	}()

	// サーバーの起動
	if err := srv.Start(ctx); err != nil {
		applogger.Error(ctx, "サーバーの実行中にエラーが発生しました: %v", err)
		log.Fatal(err)
	}
}
