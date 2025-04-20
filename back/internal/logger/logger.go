// Package applogger はアプリケーションのロギング機能を提供します。
// このパッケージは以下の機能を提供します：
// - 構造化ロギング
// - ログローテーション
// - 複数のログレベル
// - アクセスログ
package applogger

import (
	"context"
	"fmt"
	"io"
	"log/slog"
	"os"
	"path/filepath"
	"sync"
	"time"

	"github.com/labstack/echo/v4"
	"gopkg.in/natefinch/lumberjack.v2"
)

// Level はログレベルを表す型です。
// この型は以下のレベルをサポートします：
// - LevelDebug: デバッグ情報
// - LevelInfo: 通常の情報
// - LevelWarn: 警告情報
// - LevelError: エラー情報
type Level = slog.Level

const (
	// LevelDebug はデバッグレベルのログを表します。
	LevelDebug Level = slog.LevelDebug
	// LevelInfo は情報レベルのログを表します。
	LevelInfo Level = slog.LevelInfo
	// LevelWarn は警告レベルのログを表します。
	LevelWarn Level = slog.LevelWarn
	// LevelError はエラーレベルのログを表します。
	LevelError Level = slog.LevelError
)

// Config はロガーの設定を表す構造体です。
// この構造体は以下の設定を保持します：
// - ログディレクトリ
// - ログレベル
// - ログファイルの設定
// - ローテーション設定
type Config struct {
	LogDir      string        // ログファイルを保存するディレクトリのパス
	LogLevel    Level         // ログの出力レベル
	MaxSize     int64         // ログファイルの最大サイズ（バイト単位）
	MaxBackups  int           // 保持する古いログファイルの最大数
	MaxAge      int           // ログファイルを保持する最大日数
	Compress    bool          // 古いログファイルを圧縮するかどうか
}

// DefaultConfig はデフォルトのロガー設定を返します。
// この関数は以下の設定を提供します：
// - ログディレクトリ: "logs"
// - ログレベル: LevelInfo
// - 最大サイズ: 100MB
// - 最大バックアップ: 5
// - 最大保持日数: 30日
// - 圧縮: 有効
func DefaultConfig() Config {
	return Config{
		LogDir:      "logs",
		LogLevel:    LevelInfo,
		MaxSize:     100 * 1024 * 1024, // 100MB
		MaxBackups:  5,
		MaxAge:      30, // 30日
		Compress:    true,
	}
}

var (
	infoLogger   *slog.Logger   // 情報ログ用のロガー
	errorLogger  *slog.Logger   // エラーログ用のロガー
	accessLogger *slog.Logger   // アクセスログ用のロガー
	config       Config         // 現在のロガー設定
	initTestOnce sync.Once     // テストロガーの初期化を一度だけ実行するためのOnceオブジェクト
)

// InitLoggers はロガーを初期化します。
// この関数は以下の処理を行います：
// - ログディレクトリの作成
// - 各ロガーの初期化
// - エラーハンドリング
//
// 引数:
//   - cfg: ロガーの設定
//
// 戻り値:
//   - error: 初期化に失敗した場合のエラー
func InitLoggers(cfg Config) error {
	config = cfg

	// ログディレクトリの作成
	if err := os.MkdirAll(config.LogDir, 0750); err != nil {
		return fmt.Errorf("ログディレクトリの作成に失敗しました: %w", err)
	}

	// 各ロガーの初期化
	if err := initInfoLogger(); err != nil {
		return fmt.Errorf("情報ロガーの初期化に失敗しました: %w", err)
	}

	if err := initErrorLogger(); err != nil {
		return fmt.Errorf("エラーロガーの初期化に失敗しました: %w", err)
	}

	if err := initAccessLogger(); err != nil {
		return fmt.Errorf("アクセスロガーの初期化に失敗しました: %w", err)
	}

	return nil
}

// initInfoLogger は情報ログ用のロガーを初期化します。
// この関数は以下の処理を行います：
// - ログファイルの設定
// - ローテーションの設定
// - JSONハンドラーの設定
//
// 戻り値:
//   - error: 初期化に失敗した場合のエラー
func initInfoLogger() error {
	infoFile := &lumberjack.Logger{
		Filename:   filepath.Join(config.LogDir, "info.log"),
		MaxSize:    int(config.MaxSize / 1024 / 1024), // MBに変換
		MaxBackups: config.MaxBackups,
		MaxAge:     config.MaxAge,
		Compress:   config.Compress,
	}

	if err := infoFile.Rotate(); err != nil {
		return fmt.Errorf("情報ログファイルのローテーションに失敗しました: %w", err)
	}

	infoLogger = slog.New(slog.NewJSONHandler(infoFile, &slog.HandlerOptions{
		Level: config.LogLevel,
		ReplaceAttr: func(_ []string, a slog.Attr) slog.Attr {
			if a.Key == slog.TimeKey {
				a.Value = slog.StringValue(a.Value.Time().Format(time.RFC3339))
			}
			return a
		},
	}))

	return nil
}

// initErrorLogger はエラーログ用のロガーを初期化します。
// この関数は以下の処理を行います：
// - ログファイルの設定
// - ローテーションの設定
// - JSONハンドラーの設定
//
// 戻り値:
//   - error: 初期化に失敗した場合のエラー
func initErrorLogger() error {
	errorFile := &lumberjack.Logger{
		Filename:   filepath.Join(config.LogDir, "error.log"),
		MaxSize:    int(config.MaxSize / 1024 / 1024), // MBに変換
		MaxBackups: config.MaxBackups,
		MaxAge:     config.MaxAge,
		Compress:   config.Compress,
	}

	if err := errorFile.Rotate(); err != nil {
		return fmt.Errorf("エラーログファイルのローテーションに失敗しました: %w", err)
	}

	errorLogger = slog.New(slog.NewJSONHandler(errorFile, &slog.HandlerOptions{
		Level: config.LogLevel,
		ReplaceAttr: func(_ []string, a slog.Attr) slog.Attr {
			if a.Key == slog.TimeKey {
				a.Value = slog.StringValue(a.Value.Time().Format(time.RFC3339))
			}
			return a
		},
	}))

	return nil
}

// initAccessLogger はアクセスログ用のロガーを初期化します。
// この関数は以下の処理を行います：
// - ログファイルの設定
// - ローテーションの設定
// - JSONハンドラーの設定
//
// 戻り値:
//   - error: 初期化に失敗した場合のエラー
func initAccessLogger() error {
	accessFile := &lumberjack.Logger{
		Filename:   filepath.Join(config.LogDir, "access.log"),
		MaxSize:    int(config.MaxSize / 1024 / 1024), // MBに変換
		MaxBackups: config.MaxBackups,
		MaxAge:     config.MaxAge,
		Compress:   config.Compress,
	}

	if err := accessFile.Rotate(); err != nil {
		return fmt.Errorf("アクセスログファイルのローテーションに失敗しました: %w", err)
	}

	accessLogger = slog.New(slog.NewJSONHandler(accessFile, &slog.HandlerOptions{
		Level: config.LogLevel,
		ReplaceAttr: func(_ []string, a slog.Attr) slog.Attr {
			if a.Key == slog.TimeKey {
				a.Value = slog.StringValue(a.Value.Time().Format(time.RFC3339))
			}
			return a
		},
	}))

	return nil
}

// Debug はデバッグレベルのログを記録します。
// この関数は以下の処理を行います：
// - コンテキストの取得
// - ログメッセージの記録
// - 追加引数の処理
//
// 引数:
//   - ctx: コンテキスト
//   - msg: ログメッセージ
//   - args: 追加の引数（キーと値のペア）
func Debug(ctx context.Context, msg string, args ...any) {
	infoLogger.DebugContext(ctx, msg, args...)
}

// Info は情報レベルのログを記録します。
// この関数は以下の処理を行います：
// - コンテキストの取得
// - ログメッセージの記録
// - 追加引数の処理
//
// 引数:
//   - ctx: コンテキスト
//   - msg: ログメッセージ
//   - args: 追加の引数（キーと値のペア）
func Info(ctx context.Context, msg string, args ...any) {
	infoLogger.InfoContext(ctx, msg, args...)
}

// Warn は警告レベルのログを記録します。
// この関数は以下の処理を行います：
// - コンテキストの取得
// - ログメッセージの記録
// - 追加引数の処理
//
// 引数:
//   - ctx: コンテキスト
//   - msg: ログメッセージ
//   - args: 追加の引数（キーと値のペア）
func Warn(ctx context.Context, msg string, args ...any) {
	errorLogger.WarnContext(ctx, msg, args...)
}

// Error はエラーレベルのログを記録します。
// この関数は以下の処理を行います：
// - コンテキストの取得
// - ログメッセージの記録
// - 追加引数の処理
//
// 引数:
//   - ctx: コンテキスト
//   - msg: ログメッセージ
//   - args: 追加の引数（キーと値のペア）
func Error(ctx context.Context, msg string, args ...any) {
	errorLogger.ErrorContext(ctx, msg, args...)
}

// AccessLogMiddleware はアクセスログを記録するミドルウェアを返します。
// この関数は以下の処理を行います：
// - リクエスト情報の取得
// - レスポンス情報の取得
// - アクセスログの記録
//
// 戻り値:
//   - echo.MiddlewareFunc: Echoフレームワーク用のミドルウェア関数
func AccessLogMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			start := time.Now()

			err := next(c)
			if err != nil {
				c.Error(err)
			}

			req := c.Request()
			res := c.Response()

			accessLogger.InfoContext(req.Context(), "HTTPリクエスト",
				"method", req.Method,
				"uri", req.RequestURI,
				"remote_addr", req.RemoteAddr,
				"status", res.Status,
				"user_agent", req.UserAgent(),
				"duration", time.Since(start).String(),
				"error", err,
			)

			return err
		}
	}
}

// InitTestLogger はテスト用のロガーを初期化します。
// この関数は以下の処理を行います：
// - テスト用ハンドラーの設定
// - ロガーの初期化
// - スレッドセーフな初期化
func InitTestLogger() {
	initTestOnce.Do(func() {
		// テスト用のロガー設定
		handler := slog.NewTextHandler(io.Discard, &slog.HandlerOptions{
			Level: slog.LevelDebug,
		})

		// ロガーの初期化をスレッドセーフに行う
		infoLogger = slog.New(handler)
		errorLogger = slog.New(handler)
		accessLogger = slog.New(handler)
	})
}
