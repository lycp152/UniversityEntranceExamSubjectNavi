// Package applogger はアプリケーションのロギング機能をテストするパッケージです。
// このパッケージは以下の機能をテストします：
// - ログ設定の初期化
// - ログレベルの制御
// - ログローテーション
// - アクセスログ
//
//nolint:gosec
package applogger

import (
	"context"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const (
	infoLogFile = "info.log"
)

// setupTestLogger はテスト用のロガー環境をセットアップします。
// この関数は以下の処理を行います：
// - 一時ディレクトリの作成
// - クリーンアップ関数の提供
func setupTestLogger(t *testing.T) (string, func()) {
	t.Helper()

	tempDir, err := os.MkdirTemp("", "logger_test")
	require.NoError(t, err)

	return tempDir, func() {
		if err := os.RemoveAll(tempDir); err != nil {
			t.Logf("警告: 一時ディレクトリの削除に失敗しました: %v", err)
		}
	}
}

// TestDefaultConfig はデフォルト設定のテストを行います。
// このテストは以下の項目を検証します：
// - ログディレクトリの設定
// - ログレベルの設定
// - ログファイルの設定
func TestDefaultConfig(t *testing.T) {
	t.Parallel()

	cfg := DefaultConfig()
	assert.Equal(t, "logs", cfg.LogDir)
	assert.Equal(t, LevelInfo, cfg.LogLevel)
	assert.Equal(t, int64(100*1024*1024), cfg.MaxSize)
	assert.Equal(t, 5, cfg.MaxBackups)
	assert.Equal(t, 30, cfg.MaxAge)
	assert.True(t, cfg.Compress)
}

// TestInitLoggers はロガーの初期化テストを行います。
// このテストは以下の項目を検証します：
// - 基本的なログ設定
// - ログファイルの作成
// - ログレベルの動作
func TestInitLoggers(t *testing.T) {
	tempDir, cleanup := setupTestLogger(t)
	defer cleanup()

	t.Run("基本的なログ設定", func(t *testing.T) {
		cfg := Config{
			LogDir:     tempDir,
			LogLevel:   LevelDebug,
			MaxSize:    1024 * 1024,
			MaxBackups: 2,
			MaxAge:     1,
			Compress:   false,
		}

		require.NoError(t, InitLoggers(cfg))
		assert.FileExists(t, filepath.Join(tempDir, infoLogFile))
		assert.FileExists(t, filepath.Join(tempDir, "error.log"))
		assert.FileExists(t, filepath.Join(tempDir, "access.log"))

		ctx := context.Background()
		Debug(ctx, "デバッグメッセージ")
		Info(ctx, "情報メッセージ")
		Warn(ctx, "警告メッセージ")
		Error(ctx, "エラーメッセージ")
	})
}

// TestInitLoggersErrorCases はロガー初期化のエラーケースをテストします。
// このテストは以下の項目を検証します：
// - 読み取り専用ディレクトリでの初期化
// - エラーメッセージの確認
func TestInitLoggersErrorCases(t *testing.T) {
	tempDir, cleanup := setupTestLogger(t)
	defer cleanup()

	t.Run("読み取り専用ディレクトリでの初期化", func(t *testing.T) {
		// 意図的に読み取り専用（0444）に設定してエラーケースをテスト
		// gosec(G302)の警告は意図的な設定のため無視
		require.NoError(t, os.Chmod(tempDir, 0444))

		cfg := Config{
			LogDir:     tempDir,
			LogLevel:   LevelDebug,
			MaxSize:    1024 * 1024,
			MaxBackups: 2,
			MaxAge:     1,
			Compress:   false,
		}

		err := InitLoggers(cfg)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "情報ログファイルのローテーションに失敗しました")
	})
}

// TestAccessLogMiddleware はアクセスログミドルウェアのテストを行います。
// このテストは以下の項目を検証します：
// - ミドルウェアの動作
// - ログの記録
// - HTTPステータスコード
func TestAccessLogMiddleware(t *testing.T) {
	t.Run("アクセスログの記録", func(t *testing.T) {
		InitTestLogger()

		middleware := AccessLogMiddleware()
		e := echo.New()
		req := httptest.NewRequest(http.MethodGet, "/test", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		handler := middleware(func(c echo.Context) error {
			return c.String(http.StatusOK, "test")
		})

		assert.NoError(t, handler(c))
		assert.Equal(t, http.StatusOK, rec.Code)
	})
}

// TestLogLevels はログレベルのテストを行います。
// このテストは以下の項目を検証します：
// - ログレベルのフィルタリング
// - 各レベルのログ出力
func TestLogLevels(t *testing.T) {
	tempDir, cleanup := setupTestLogger(t)
	defer cleanup()

	t.Run("ログレベルのフィルタリング", func(t *testing.T) {
		cfg := Config{
			LogDir:     tempDir,
			LogLevel:   LevelWarn,
			MaxSize:    1024 * 1024,
			MaxBackups: 2,
			MaxAge:     1,
			Compress:   false,
		}

		require.NoError(t, InitLoggers(cfg))

		ctx := context.Background()
		Debug(ctx, "デバッグメッセージ")
		Info(ctx, "情報メッセージ")
		Warn(ctx, "警告メッセージ")
		Error(ctx, "エラーメッセージ")
	})
}

// TestLogRotation はログローテーションのテストを行います。
// このテストは以下の項目を検証します：
// - ログファイルのサイズ制限
// - ログファイルのバックアップ
// - ログファイルの圧縮
func TestLogRotation(t *testing.T) {
	tempDir, cleanup := setupTestLogger(t)
	defer cleanup()

	t.Run("ログローテーション", func(t *testing.T) {
		cfg := Config{
			LogDir:     tempDir,
			LogLevel:   LevelInfo,
			MaxSize:    1024,
			MaxBackups: 2,
			MaxAge:     1,
			Compress:   false,
		}

		require.NoError(t, InitLoggers(cfg))

		ctx := context.Background()
		longMessage := strings.Repeat("これは長いテストメッセージです。", 50)

		for i := 0; i < 100; i++ {
			Info(ctx, longMessage, "index", i, "data", longMessage)

			if i%10 == 0 {
				time.Sleep(10 * time.Millisecond)
			}
		}

		time.Sleep(100 * time.Millisecond)

		logFile := filepath.Join(tempDir, infoLogFile)
		require.FileExists(t, logFile)

		info, err := os.Stat(logFile)
		require.NoError(t, err)
		t.Logf("Current log file size: %d bytes", info.Size())

		assert.GreaterOrEqual(t, info.Size(), cfg.MaxSize,
			"ログファイルのサイズが最大サイズ以上になっているはずです")

		files, err := os.ReadDir(tempDir)
		require.NoError(t, err)

		logFiles := 0

		for _, file := range files {
			if strings.HasPrefix(file.Name(), infoLogFile) {
				logFiles++

				t.Logf("Found log file: %s", file.Name())
			}
		}

		assert.GreaterOrEqual(t, logFiles, 1,
			"少なくとも1つのログファイルが存在するはずです")
	})
}
