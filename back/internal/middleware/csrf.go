package middleware

import (
	"crypto/rand"
	"encoding/base64"
	"net/http"
	"os"
	"strconv"
	"sync"
	"time"

	"github.com/labstack/echo/v4"
	echomiddleware "github.com/labstack/echo/v4/middleware"
)

const (
	// DefaultTokenLength はデフォルトのトークン長を定義します
	DefaultTokenLength = 32
	// MinTokenLength は最小のトークン長を定義します
	MinTokenLength = 24
	// DefaultTokenExpiration はデフォルトのトークン有効期限を定義します
	DefaultTokenExpiration = 24 * time.Hour
	// MinTokenExpiration は最小のトークン有効期限を定義します
	MinTokenExpiration = 1 * time.Hour
)

var (
	// CSRFTokenHeader はCSRFトークンのヘッダー名を定義します
	CSRFTokenHeader = os.Getenv("CSRF_TOKEN_HEADER")
	// CSRFTokenLength はCSRFトークンの長さを定義します
	CSRFTokenLength = getTokenLength()
	// TestCSRFToken はテスト用のCSRFトークンを定義します
	TestCSRFToken   = os.Getenv("TEST_CSRF_TOKEN")
	// CSRFTokenExpiration はCSRFトークンの有効期限を定義します
	CSRFTokenExpiration = getTokenExpiration()
)

var (
	tokenStore = struct {
		sync.RWMutex
		tokens map[string]time.Time
	}{
		tokens: make(map[string]time.Time),
	}
)

// getTokenLength は環境変数からトークン長を取得します
func getTokenLength() int {
	length := os.Getenv("CSRF_TOKEN_LENGTH")
	if length == "" {
		return DefaultTokenLength
	}

	n, err := strconv.Atoi(length)
	if err != nil || n < MinTokenLength {
		return DefaultTokenLength
	}

	return n
}

// getTokenExpiration は環境変数からトークンの有効期限を取得します
func getTokenExpiration() time.Duration {
	expiration := os.Getenv("CSRF_TOKEN_EXPIRATION")
	if expiration == "" {
		return DefaultTokenExpiration
	}

	n, err := strconv.Atoi(expiration)
	if err != nil || n < 1 {
		return DefaultTokenExpiration
	}

	duration := time.Duration(n) * time.Hour
	if duration < MinTokenExpiration {
		return DefaultTokenExpiration
	}

	return duration
}

// validateRequestToken はリクエストトークンを検証します
func validateRequestToken(c echo.Context) error {
	requestToken := c.Request().Header.Get(CSRFTokenHeader)
	if requestToken == "" {
		return &echo.HTTPError{
			Code:    http.StatusForbidden,
			Message: "CSRFトークンが必要です",
		}
	}

	if !validateCSRFToken(requestToken) {
		return &echo.HTTPError{
			Code:    http.StatusForbidden,
			Message: "不正なCSRFトークンです",
		}
	}

	return nil
}

// CSRFMiddleware はCSRF保護を行うミドルウェアです
func CSRFMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			if c.Request().Method == http.MethodGet {
				token, err := generateCSRFToken()
				if err != nil {
					return &echo.HTTPError{
						Code:    http.StatusInternalServerError,
						Message: "内部サーバーエラーが発生しました",
					}
				}

				tokenStore.Lock()
				tokenStore.tokens[token] = time.Now().Add(CSRFTokenExpiration)
				tokenStore.Unlock()

				c.Response().Header().Set(CSRFTokenHeader, token)

				return next(c)
			}

			if err := validateRequestToken(c); err != nil {
				return err
			}

			newToken, err := generateCSRFToken()
			if err != nil {
				return &echo.HTTPError{
					Code:    http.StatusInternalServerError,
					Message: "内部サーバーエラーが発生しました",
				}
			}

			tokenStore.Lock()
			delete(tokenStore.tokens, c.Request().Header.Get(CSRFTokenHeader))
			tokenStore.tokens[newToken] = time.Now().Add(CSRFTokenExpiration)
			tokenStore.Unlock()

			c.Response().Header().Set(CSRFTokenHeader, newToken)

			return next(c)
		}
	}
}

// generateCSRFToken はCSRFトークンを生成します
func generateCSRFToken() (string, error) {
	b := make([]byte, CSRFTokenLength)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}

	return base64.URLEncoding.EncodeToString(b), nil
}

// validateCSRFToken はCSRFトークンを検証します
func validateCSRFToken(token string) bool {
	// テスト用のトークンを許可
	testToken := os.Getenv("TEST_CSRF_TOKEN")
	if testToken != "" && token == testToken {
		return true
	}

	tokenStore.RLock()
	expiration, exists := tokenStore.tokens[token]
	tokenStore.RUnlock()

	if !exists {
		return false
	}

	// 有効期限切れのトークンを削除
	if time.Now().After(expiration) {
		tokenStore.Lock()
		delete(tokenStore.tokens, token)
		tokenStore.Unlock()

		return false
	}

	return true
}

// RefreshCSRFToken は新しいCSRFトークンを生成して返します
func RefreshCSRFToken(c echo.Context) error {
	token, err := generateCSRFToken()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "CSRFトークンの生成に失敗しました",
		})
	}

	tokenStore.Lock()
	tokenStore.tokens[token] = time.Now().Add(CSRFTokenExpiration)
	tokenStore.Unlock()

	c.Response().Header().Set(CSRFTokenHeader, token)

	return c.JSON(http.StatusOK, map[string]string{
		"token": token,
	})
}

// ConfigureCSRF はCSRF保護を設定します
func ConfigureCSRF() echo.MiddlewareFunc {
	return echomiddleware.CSRFWithConfig(echomiddleware.CSRFConfig{
		TokenLookup:    "header:X-CSRF-Token",
		CookieName:     "csrf",
		CookiePath:     "/",
		CookieHTTPOnly: true,
		CookieSameSite: http.SameSiteStrictMode,
	})
}

// CSRFTokenHandler はCSRFトークンを生成して返すハンドラーです
func CSRFTokenHandler(c echo.Context) error {
	token := c.Get("csrf").(string)

	return c.JSON(http.StatusOK, map[string]string{
		"token": token,
	})
}
