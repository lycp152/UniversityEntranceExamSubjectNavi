// Package server はHTTPサーバーのテストを提供します。
// このパッケージは以下の機能のテストを提供します：
// - サーバーの初期化
// - ルーティングの設定
// - グレースフルシャットダウン
package server

import (
	"context"
	"fmt"
	"net"
	"testing"
	"time"
	"university-exam-api/internal/config"
	applogger "university-exam-api/internal/logger"

	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func init() {
	// テスト用のロガーを初期化
	applogger.InitTestLogger()
}

// setupTestLogger はテスト用のロガーを初期化します。
// この関数は以下の処理を行います：
// - テストロガーの初期化
// - ログレベルの設定
func setupTestLogger(t *testing.T) {
	t.Helper()
	applogger.InitTestLogger()
}

func getFreePort() string {
	// テスト用に空いているポートを取得
	l, err := net.Listen("tcp", "127.0.0.1:0") // localhostのみにバインド
	if err != nil {
		return "18080" // fallback
	}

	port := fmt.Sprintf("%d", l.Addr().(*net.TCPAddr).Port)
	_ = l.Close() // エラーは無視（テスト用の一時的なポートなので）

	return port
}

// TestNew はNew関数のテストを行います。
// このテストは以下のケースを検証します：
// - 正常な初期化
// - インスタンスのプロパティ
func TestNew(t *testing.T) {
	t.Parallel()
	setupTestLogger(t)

	cfg := &config.Config{
		Port: getFreePort(),
	}

	s := New(cfg)

	assert.NotNil(t, s)
	assert.NotNil(t, s.echo)
	assert.Equal(t, cfg, s.cfg)
}

// TestStart はStart関数のテストを行います。
// このテストは以下のケースを検証します：
// - サーバーの起動
// - コンテキストのキャンセル
// - グレースフルシャットダウン
func TestStart(t *testing.T) {
	t.Parallel()
	setupTestLogger(t)

	cfg := &config.Config{
		Port: getFreePort(),
	}

	s := New(cfg)
	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Millisecond)

	defer cancel()

	err := s.Start(ctx)
	assert.NoError(t, err)
}

// TestSetupRoutes はSetupRoutes関数のテストを行います。
// このテストは以下のケースを検証します：
// - ルーティングの設定
// - データベース接続
// - エンドポイントの定義
func TestSetupRoutes(t *testing.T) {
	t.Parallel()
	setupTestLogger(t)

	cfg := &config.Config{
		Port: getFreePort(),
	}

	s := New(cfg)
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})

	if err != nil {
		t.Fatalf("データベース接続の作成に失敗しました: %v", err)
	}

	err = s.SetupRoutes(db)
	assert.NoError(t, err)
}

func TestServerShutdown(t *testing.T) {
	t.Run("正常なシャットダウン", func(t *testing.T) {
		cfg := &config.Config{Port: getFreePort()}
		s := New(cfg)
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)

		defer cancel()

		err := s.Shutdown(ctx)
		assert.NoError(t, err)
	})
}

func TestServerStartShutdown(t *testing.T) {
	// サーバーの初期化
	cfg := &config.Config{
		Port: getFreePort(),
	}
	s := New(cfg)

	// コンテキストの作成
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// サーバー起動
	go func() {
		err := s.Start(ctx)
		assert.NoError(t, err)
	}()

	// 少し待機してサーバーが起動するのを待つ
	time.Sleep(100 * time.Millisecond)

	// シャットダウン
	err := s.Shutdown(ctx)
	assert.NoError(t, err)
}

func TestServerStartContextCancel(t *testing.T) {
	// サーバーの初期化
	cfg := &config.Config{
		Port: getFreePort(),
	}
	s := New(cfg)

	// コンテキストの作成
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)

	// サーバー起動
	go func() {
		err := s.Start(ctx)
		assert.NoError(t, err)
	}()

	// 少し待機してサーバーが起動するのを待つ
	time.Sleep(100 * time.Millisecond)

	// コンテキストのキャンセル
	cancel()

	// シャットダウンが完了するのを待つ
	time.Sleep(100 * time.Millisecond)
}

func TestServerStartError(t *testing.T) {
	t.Parallel()
	setupTestLogger(t)

	// 無効なポート番号を使用してエラーを発生させる
	cfg := &config.Config{
		Port: "invalid",
	}

	s := New(cfg)
	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Millisecond)

	defer cancel()

	err := s.Start(ctx)
	assert.Error(t, err)
}

func TestServerShutdownTimeout(t *testing.T) {
	t.Parallel()
	setupTestLogger(t)

	cfg := &config.Config{
		Port: getFreePort(),
	}

	s := New(cfg)
	// サーバーを起動
	go func() {
		_ = s.Start(context.Background())
	}()

	// 少し待機してサーバーが起動するのを待つ
	time.Sleep(100 * time.Millisecond)

	// 非常に短いタイムアウトを設定
	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Nanosecond)
	defer cancel()

	err := s.Shutdown(ctx)
	assert.Error(t, err)
}

func TestServerSetupRoutesError(t *testing.T) {
	t.Parallel()
	setupTestLogger(t)

	cfg := &config.Config{
		Port: getFreePort(),
	}

	s := New(cfg)
	// 無効なデータベース接続を渡してエラーを発生させる
	db, _ := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	sqlDB, _ := db.DB()
	_ = sqlDB.Close() // エラーは無視（テストの意図は無効なDB接続のテスト）

	err := s.SetupRoutes(db)
	assert.Error(t, err)
}

func TestRunServer(t *testing.T) {
	t.Parallel()
	setupTestLogger(t)

	cfg := &config.Config{
		Port: getFreePort(),
	}

	s := New(cfg)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)

	defer cancel()

	// サーバー起動用のチャネル
	serverReady := make(chan struct{})

	// サーバー起動
	go func() {
		err := s.Start(ctx)
		assert.NoError(t, err)
	}()

	// サーバーが起動するのを待つ
	go func() {
		// サーバーが起動するまで少し待機
		time.Sleep(100 * time.Millisecond)
		close(serverReady)
	}()

	// サーバーが起動するのを待つ
	<-serverReady

	// サーバーのアドレスを取得
	addr := s.GetActualAddr()
	assert.NotEmpty(t, addr)

	// シャットダウン
	err := s.Shutdown(ctx)
	assert.NoError(t, err)
}
