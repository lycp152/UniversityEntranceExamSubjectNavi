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
const (
	DefaultRateLimit  = 100
	DefaultBurstLimit = 50
	DefaultMaxBodySize = 1 << 20 // 1MB
	DefaultHSTSMaxAge = 31536000 // 1年
)

// エラー定義
var (
	ErrRateLimitExceeded = errors.New("レート制限を超えました")
	ErrInvalidContentType = errors.New("Content-Typeはapplication/jsonである必要があります")
	ErrRequestTooLarge = errors.New("リクエストボディが大きすぎます")
)

// SecurityConfig はセキュリティ設定を保持する構造体です
type SecurityConfig struct {
	RateLimit  int
	BurstLimit int
	AllowedOrigins []string
	MaxBodySize int64
}

// NewSecurityConfig はデフォルトのセキュリティ設定を返します
func NewSecurityConfig() *SecurityConfig {
	return &SecurityConfig{
		RateLimit:  DefaultRateLimit,
		BurstLimit: DefaultBurstLimit,
		AllowedOrigins: []string{"http://localhost:3000"}, // デフォルトではローカル開発環境のみ許可
		MaxBodySize: DefaultMaxBodySize,
	}
}

// SecurityMiddleware はセキュリティ関連のミドルウェアを設定します
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
