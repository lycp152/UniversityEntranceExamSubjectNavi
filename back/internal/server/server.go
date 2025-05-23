// Package server はHTTPサーバーの管理を提供します。
// このパッケージは以下の機能を提供します：
// - サーバーの初期化
// - ミドルウェアの設定
// - グレースフルシャットダウンの実装
// - セキュリティ設定の管理
// - ロギングの設定
package server

import (
	"context"
	"fmt"
	"net"
	"net/http"
	"sync"
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
// この構造体は以下の設定を管理します：
// - Echoインスタンス
// - アプリケーション設定
// - 実際のリッスンアドレス
// - リスナー
type Server struct {
	echo     *echo.Echo
	cfg      *config.Config
	listener net.Listener // 追加: 実際のリッスンアドレスを取得するため
	mu       sync.RWMutex // 追加: listenerへのアクセスを同期化
}

// New は新しいサーバーインスタンスを作成します。
// この関数は以下の処理を行います：
// - セキュリティ設定の初期化
// - ミドルウェアの適用
// - ロギングの設定
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
// この関数は以下の処理を行います：
// - サーバーの起動
// - コンテキストの監視
// - グレースフルシャットダウンの実行
// ctx: コンテキスト
// 戻り値: エラー情報
func (s *Server) Start(ctx context.Context) error {
	// net.Listenerを使って実際のアドレスを取得
	ln, err := net.Listen("tcp", ":"+s.cfg.Port)
	if err != nil {
		return fmt.Errorf("リッスンに失敗しました: %w", err)
	}

	s.mu.Lock()
	s.listener = ln
	s.mu.Unlock()

	errCh := make(chan error, 1)
	go func() {
		applogger.Info(context.Background(), "サーバーを起動しています。アドレス: %s", ln.Addr().String())

		if err := s.echo.Server.Serve(ln); err != nil && err != http.ErrServerClosed {
			errCh <- err
			applogger.Error(context.Background(), "サーバーの起動に失敗しました: %v", err)

			return
		}
		errCh <- nil
	}()

	select {
	case <-ctx.Done():
		// グレースフルシャットダウン
		applogger.Info(context.Background(), "サーバーを停止しています...")
		shutdownCtx, cancel := context.WithTimeout(context.Background(), shutdownTimeout)

		defer cancel()

		if err := s.echo.Shutdown(shutdownCtx); err != nil {
			return fmt.Errorf("サーバーのシャットダウンに失敗しました: %w", err)
		}

		applogger.Info(context.Background(), "サーバーが正常に停止しました")

		return nil
	case err := <-errCh:
		if err != nil {
			return fmt.Errorf("サーバーの起動に失敗しました: %w", err)
		}

		return nil
	}
}

// GetActualAddr は実際のリッスンアドレス（host:port）を返します
func (s *Server) GetActualAddr() string {
	s.mu.RLock()
	defer s.mu.RUnlock()

	if s.listener != nil {
		return s.listener.Addr().String()
	}

	return ""
}

// SetupRoutes はルーティングを設定します。
// この関数は以下の処理を行います：
// - ルーティングの初期化
// - データベース接続の設定
// - エンドポイントの定義
// db: データベース接続
// 戻り値: エラー情報
func (s *Server) SetupRoutes(db *gorm.DB) error {
	if db == nil {
		return fmt.Errorf("データベース接続がnilです")
	}

	sqlDB, err := db.DB()

	if err != nil {
		return fmt.Errorf("データベース接続の取得に失敗しました: %w", err)
	}

	if err := sqlDB.Ping(); err != nil {
		return fmt.Errorf("データベース接続が無効です: %w", err)
	}

	routes := NewRoutes(s.echo, db, s.cfg)

	return routes.Setup()
}

// Shutdown はサーバーをシャットダウンします。
// この関数は以下の処理を行います：
// - グレースフルシャットダウンの実行
// - リソースの解放
// ctx: コンテキスト
// 戻り値: エラー情報
func (s *Server) Shutdown(ctx context.Context) error {
	applogger.Info(context.Background(), "サーバーを停止しています...")

	err := s.echo.Shutdown(ctx)
	if err != nil {
		return fmt.Errorf("サーバーのシャットダウンに失敗しました: %w", err)
	}

	if ctx.Err() == context.DeadlineExceeded {
		return fmt.Errorf("シャットダウンがタイムアウトしました")
	}

	applogger.Info(context.Background(), "サーバーが正常に停止しました")

	return nil
}
