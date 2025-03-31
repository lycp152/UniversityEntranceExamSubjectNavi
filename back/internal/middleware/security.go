package middleware

import (
	"net/http"
	"time"
	"university-exam-api/pkg/logger"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"golang.org/x/time/rate"
)

// SecurityConfig はセキュリティ設定を保持する構造体です
type SecurityConfig struct {
	RateLimit  int
	BurstLimit int
}

// NewSecurityConfig はデフォルトのセキュリティ設定を返します
func NewSecurityConfig() *SecurityConfig {
	return &SecurityConfig{
		RateLimit:  100, // 1秒あたりのリクエスト数
		BurstLimit: 50,  // バーストリクエストの上限
	}
}

// SecurityMiddleware はセキュリティ関連のミドルウェアを設定します
func SecurityMiddleware(config *SecurityConfig) []echo.MiddlewareFunc {
	// レートリミッターの作成
	limiter := rate.NewLimiter(rate.Limit(config.RateLimit), config.BurstLimit)

	return []echo.MiddlewareFunc{
		// レート制限ミドルウェア
		func(next echo.HandlerFunc) echo.HandlerFunc {
			return func(c echo.Context) error {
				if !limiter.Allow() {
					logger.Error("Rate limit exceeded for IP: %s", c.RealIP())
					return c.JSON(http.StatusTooManyRequests, map[string]string{
						"error":   "Rate Limit Error",
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
			HSTSMaxAge:           31536000,
			HSTSExcludeSubdomains: false,
			ContentSecurityPolicy: "default-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' data:;",
		}),

		// CORS設定
		middleware.CORSWithConfig(middleware.CORSConfig{
			AllowOrigins: []string{"*"},
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
				"X-CSRF-Token", // CSRFトークン用のヘッダーを追加
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
func RequestValidationMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// Content-Typeのチェック（OPTIONS以外）
			if c.Request().Method != http.MethodOptions && c.Request().Header.Get(echo.HeaderContentType) != "" &&
				c.Request().Header.Get(echo.HeaderContentType) != echo.MIMEApplicationJSON {
				return c.JSON(http.StatusUnsupportedMediaType, map[string]string{
					"error": "Content-Type must be application/json",
				})
			}

			// リクエストサイズの制限（1MB）
			if c.Request().ContentLength > 1<<20 {
				return c.JSON(http.StatusRequestEntityTooLarge, map[string]string{
					"error": "Request body too large",
				})
			}

			return next(c)
		}
	}
}
