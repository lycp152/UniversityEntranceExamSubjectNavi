// Package middleware はアプリケーションのミドルウェアを提供します。
// このパッケージは以下の機能を提供します：
// - レート制限
// - CORS設定
// - セキュリティヘッダー
// - リクエスト検証
package middleware

import (
	"errors"
	"fmt"
	"net/http"
	"time"
	applogger "university-exam-api/internal/logger"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"golang.org/x/time/rate"
)

// デフォルト設定値の定数
// これらの定数は以下の設定を定義します：
// - レート制限のデフォルト値
// - バースト制限のデフォルト値
// - 最大ボディサイズ
// - HSTSの最大有効期間
const (
	DefaultRateLimit  = 100
	DefaultBurstLimit = 50
	DefaultMaxBodySize = 1 << 20 // 1MB
	DefaultHSTSMaxAge = 31536000 // 1年
)

// エラー定義
// これらのエラーは以下の場合に使用されます：
// - レート制限超過
// - 無効なContent-Type
// - リクエストサイズ超過
var (
	ErrRateLimitExceeded = errors.New("レート制限を超えました")
	ErrInvalidContentType = errors.New("Content-Typeはapplication/jsonである必要があります")
	ErrRequestTooLarge = errors.New("リクエストボディが大きすぎます")
)

// SecurityConfig はセキュリティ設定を保持する構造体です
// この構造体は以下の設定を管理します：
// - レート制限
// - バースト制限
// - 許可されたオリジン
// - 最大ボディサイズ
type SecurityConfig struct {
	RateLimit  int
	BurstLimit int
	AllowedOrigins []string
	MaxBodySize int64
}

// NewSecurityConfig はデフォルトのセキュリティ設定を返します
// この関数は以下の処理を行います：
// 1. レート制限の設定
// 2. バースト制限の設定
// 3. 許可されたオリジンの設定
// 4. 最大ボディサイズの設定
func NewSecurityConfig() *SecurityConfig {
	return &SecurityConfig{
		RateLimit:  DefaultRateLimit,
		BurstLimit: DefaultBurstLimit,
		AllowedOrigins: []string{"http://localhost:3000"}, // デフォルトではローカル開発環境のみ許可
		MaxBodySize: DefaultMaxBodySize,
	}
}

// SecurityMiddleware はセキュリティ関連のミドルウェアを設定します
// この関数は以下の処理を行います：
// 1. レートリミッターの作成
// 2. レート制限ミドルウェアの設定
// 3. セキュリティヘッダーミドルウェアの設定
// 4. CORS設定の適用
func SecurityMiddleware(config *SecurityConfig) []echo.MiddlewareFunc {
	if config == nil {
		config = NewSecurityConfig()
	}

	// レートリミッターの作成
	limiter := rate.NewLimiter(rate.Limit(config.RateLimit), config.BurstLimit)

	return []echo.MiddlewareFunc{
		// レート制限ミドルウェア
		func(next echo.HandlerFunc) echo.HandlerFunc {
			return func(c echo.Context) error {
				if !limiter.Allow() {
					applogger.Error(c.Request().Context(), "IPアドレス %s のレート制限を超えました", c.RealIP())
					return c.JSON(http.StatusTooManyRequests, map[string]string{
						"error":   ErrRateLimitExceeded.Error(),
						"message": "リクエスト制限を超えました",
					})
				}
				return next(c)
			}
		},

		// CSRFミドルウェアは別途設定

		// セキュリティヘッダーミドルウェア
		middleware.SecureWithConfig(middleware.SecureConfig{
			XSSProtection:         "1; mode=block",
			ContentTypeNosniff:    "nosniff",
			XFrameOptions:         "SAMEORIGIN",
			HSTSMaxAge:           DefaultHSTSMaxAge,
			HSTSExcludeSubdomains: false,
			ContentSecurityPolicy: "default-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' data:;",
		}),

		// CORS設定
		middleware.CORSWithConfig(middleware.CORSConfig{
			AllowOrigins: config.AllowedOrigins,
			AllowMethods: []string{
				http.MethodGet,
				http.MethodPost,
				http.MethodPut,
				http.MethodDelete,
				http.MethodOptions,
			},
			AllowHeaders: []string{
				echo.HeaderOrigin,
				echo.HeaderContentType,
				echo.HeaderAccept,
				echo.HeaderAuthorization,
				echo.HeaderXRequestedWith,
				"X-CSRF-Token",
				"Cache-Control",
				"Pragma",
			},
			ExposeHeaders: []string{
				"Content-Length",
				"Content-Type",
				"X-Total-Count",
			},
			MaxAge: int(24 * time.Hour.Seconds()),
			AllowCredentials: true,
		}),
	}
}

// RequestValidationMiddleware はリクエストの検証を行います
// この関数は以下の処理を行います：
// 1. Content-Typeの検証
// 2. リクエストサイズの検証
func RequestValidationMiddleware(config *SecurityConfig) echo.MiddlewareFunc {
	if config == nil {
		config = NewSecurityConfig()
	}

	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// Content-Typeのチェック（OPTIONS以外）
			if c.Request().Method != http.MethodOptions {
				contentType := c.Request().Header.Get(echo.HeaderContentType)
				if contentType != "" && contentType != echo.MIMEApplicationJSON {
					return echo.NewHTTPError(http.StatusUnsupportedMediaType, map[string]string{
						"error":   ErrInvalidContentType.Error(),
						"message": "Content-Typeはapplication/jsonである必要があります",
					})
				}
			}

			// リクエストサイズの制限
			if c.Request().ContentLength > config.MaxBodySize {
				return echo.NewHTTPError(http.StatusRequestEntityTooLarge, map[string]string{
					"error":   ErrRequestTooLarge.Error(),
					"message": fmt.Sprintf("リクエストボディは%dバイト以下である必要があります", config.MaxBodySize),
				})
			}

			return next(c)
		}
	}
}
