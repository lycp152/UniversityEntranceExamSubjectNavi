// Package applogger はアプリケーションのロギング機能を提供します。
// 構造化ロギング、ログローテーション、複数のログレベルをサポートします。
package applogger

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"path/filepath"
	"time"

	"github.com/labstack/echo/v4"
	"gopkg.in/natefinch/lumberjack.v2"
)

// Level はログレベルを表す型です。
// slog.Levelのエイリアスとして定義されています。
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
// ログファイルの保存場所、ログレベル、ローテーション設定などを管理します。
type Config struct {
	LogDir      string        // ログファイルを保存するディレクトリのパス
	LogLevel    Level         // ログの出力レベル
	MaxSize     int64         // ログファイルの最大サイズ（バイト単位）
	MaxBackups  int           // 保持する古いログファイルの最大数
	MaxAge      int           // ログファイルを保持する最大日数
	Compress    bool          // 古いログファイルを圧縮するかどうか
}

// DefaultConfig はデフォルトのロガー設定を返します。
// 開発環境での使用を想定した標準的な設定値が設定されています。
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
)

// InitLoggers はロガーを初期化します。
// 指定された設定に基づいて、各ロガー（情報、エラー、アクセス）を初期化します。
// ログディレクトリが存在しない場合は作成します。
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
// JSON形式でログを出力し、ログローテーションをサポートします。
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
// JSON形式でログを出力し、ログローテーションをサポートします。
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
// JSON形式でログを出力し、ログローテーションをサポートします。
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
// 開発時のデバッグ情報を記録するために使用します。
//
// 引数:
//   - ctx: コンテキスト
//   - msg: ログメッセージ
//   - args: 追加の引数（キーと値のペア）
func Debug(ctx context.Context, msg string, args ...any) {
	infoLogger.DebugContext(ctx, msg, args...)
}

// Info は情報レベルのログを記録します。
// 通常の操作情報を記録するために使用します。
//
// 引数:
//   - ctx: コンテキスト
//   - msg: ログメッセージ
//   - args: 追加の引数（キーと値のペア）
func Info(ctx context.Context, msg string, args ...any) {
	infoLogger.InfoContext(ctx, msg, args...)
}

// Warn は警告レベルのログを記録します。
// 注意が必要な状況を記録するために使用します。
//
// 引数:
//   - ctx: コンテキスト
//   - msg: ログメッセージ
//   - args: 追加の引数（キーと値のペア）
func Warn(ctx context.Context, msg string, args ...any) {
	errorLogger.WarnContext(ctx, msg, args...)
}

// Error はエラーレベルのログを記録します。
// エラーが発生した状況を記録するために使用します。
//
// 引数:
//   - ctx: コンテキスト
//   - msg: ログメッセージ
//   - args: 追加の引数（キーと値のペア）
func Error(ctx context.Context, msg string, args ...any) {
	errorLogger.ErrorContext(ctx, msg, args...)
}

// AccessLogMiddleware はHTTPリクエストのアクセスログを記録するミドルウェアを返します。
// リクエストの詳細情報（メソッド、URI、ステータスコードなど）を記録します。
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
