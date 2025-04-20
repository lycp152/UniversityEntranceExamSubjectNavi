// Package server はHTTPサーバーのテストを提供します。
// このパッケージは以下の機能のテストを提供します：
// - サーバーの初期化
// - ルーティングの設定
// - グレースフルシャットダウン
package server

import (
	"context"
	"net/http"
	"testing"
	"time"
	"university-exam-api/internal/config"
	applogger "university-exam-api/internal/logger"

	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// setupTestLogger はテスト用のロガーを初期化します。
// この関数は以下の処理を行います：
// - テストロガーの初期化
// - ログレベルの設定
func setupTestLogger(t *testing.T) {
	t.Helper()
	applogger.InitTestLogger()
}

// TestNew はNew関数のテストを行います。
// このテストは以下のケースを検証します：
// - 正常な初期化
// - インスタンスのプロパティ
func TestNew(t *testing.T) {
	t.Parallel()
	setupTestLogger(t)

	cfg := &config.Config{
		Port: "8080",
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
		Port: "8080",
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
		Port: "8080",
	}

	s := New(cfg)
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})

	if err != nil {
		t.Fatalf("データベース接続の作成に失敗しました: %v", err)
	}

	err = s.SetupRoutes(db)
	assert.NoError(t, err)
}

// TestServerShutdown はサーバーのシャットダウン処理のテストを行います。
// このテストは以下のケースを検証します：
// - グレースフルシャットダウン
// - リソースの解放
// - エラーハンドリング
func TestServerShutdown(t *testing.T) {
	t.Parallel()
	setupTestLogger(t)

	cfg := &config.Config{
		Port: "8080",
	}

	s := New(cfg)
	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Millisecond)

	defer cancel()

	done := make(chan error)
	go func() {
		done <- s.Start(ctx)
	}()

	// サーバーが起動するまで少し待機
	time.Sleep(50 * time.Millisecond)

	// サーバーにリクエストを送信
	resp, err := http.Get("http://localhost:8080/health")
	if err == nil {
		if err := resp.Body.Close(); err != nil {
			t.Errorf("レスポンスボディのクローズに失敗しました: %v", err)
		}
	}

	// エラーを待機
	err = <-done
	assert.NoError(t, err)
}
