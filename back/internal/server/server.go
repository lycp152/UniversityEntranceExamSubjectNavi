// Package server はHTTPサーバーの管理を提供します。
// サーバーの初期化、ミドルウェアの設定、グレースフルシャットダウンの実装などの機能を提供します。
package server

import (
	"context"
	"fmt"
	"net/http"
	"time"
	"university-exam-api/internal/config"
	applogger "university-exam-api/internal/logger"
	custom_middleware "university-exam-api/internal/middleware"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"gorm.io/gorm"
)

const (
	shutdownTimeout = 10 * time.Second // シャットダウンのタイムアウト時間
)

// Server はHTTPサーバーを管理する構造体です。
// Echoインスタンスとアプリケーション設定を保持します。
type Server struct {
	echo *echo.Echo
	cfg  *config.Config
}

// New は新しいサーバーインスタンスを作成します。
// セキュリティ設定、ミドルウェアの適用、ロギングの設定などを行います。
// cfg: アプリケーション設定
// 戻り値: 新しいServerインスタンス
func New(cfg *config.Config) *Server {
	e := echo.New()

	// セキュリティ設定の初期化
	securityConfig := custom_middleware.NewSecurityConfig()

	// ミドルウェアの設定
	e.Use(middleware.Logger())                    // リクエストログ
	e.Use(middleware.Recover())                   // パニックリカバリー
	e.Use(applogger.AccessLogMiddleware())           // アクセスログ
	e.Use(custom_middleware.RequestValidationMiddleware(securityConfig)) // リクエストバリデーション

	// セキュリティミドルウェアの適用
	securityMiddlewares := custom_middleware.SecurityMiddleware(securityConfig)
	for _, m := range securityMiddlewares {
		e.Use(m)
	}

	return &Server{
		echo: e,
		cfg:  cfg,
	}
}

// Start はサーバーを起動し、グレースフルシャットダウンを実装します。
// ctx: コンテキスト
// 戻り値: エラー情報
func (s *Server) Start(ctx context.Context) error {
	// サーバーの起動
	go func() {
		applogger.Info(context.Background(), "サーバーを起動しています。ポート: %s", s.cfg.Port)
		if err := s.echo.Start(":" + s.cfg.Port); err != nil && err != http.ErrServerClosed {
			applogger.Error(context.Background(), "サーバーの起動に失敗しました: %v", err)
		}
	}()

	// コンテキストのキャンセルを待機
	<-ctx.Done()

	// グレースフルシャットダウン
	applogger.Info(context.Background(), "サーバーを停止しています...")
	shutdownCtx, cancel := context.WithTimeout(context.Background(), shutdownTimeout)
	defer cancel()

	if err := s.echo.Shutdown(shutdownCtx); err != nil {
		return fmt.Errorf("サーバーのシャットダウンに失敗しました: %w", err)
	}

	applogger.Info(context.Background(), "サーバーが正常に停止しました")
	return nil
}

// SetupRoutes はルーティングを設定します。
// db: データベース接続
// 戻り値: エラー情報
func (s *Server) SetupRoutes(db *gorm.DB) error {
	routes := NewRoutes(s.echo, db, s.cfg)
	return routes.Setup()
}
