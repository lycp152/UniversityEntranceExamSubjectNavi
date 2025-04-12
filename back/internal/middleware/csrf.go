package middleware

import (
	"crypto/rand"
	"encoding/base64"
	"net/http"
	"os"
	"sync"

	"github.com/labstack/echo/v4"
	echomiddleware "github.com/labstack/echo/v4/middleware"
)

var (
	CSRFTokenHeader = os.Getenv("CSRF_TOKEN_HEADER")
	CSRFTokenLength = 32
	TestCSRFToken   = os.Getenv("TEST_CSRF_TOKEN")
)

var (
	tokenStore = struct {
		sync.RWMutex
		tokens map[string]bool
	}{
		tokens: make(map[string]bool),
	}
)

// validateRequestToken はリクエストトークンを検証します
func validateRequestToken(c echo.Context) error {
	requestToken := c.Request().Header.Get(CSRFTokenHeader)
	if requestToken == "" {
		return c.JSON(http.StatusForbidden, map[string]string{
			"error": "CSRFトークンが必要です",
		})
	}

	if !validateCSRFToken(requestToken) {
		return c.JSON(http.StatusForbidden, map[string]string{
			"error": "不正なCSRFトークンです",
		})
	}

	return nil
}

// CSRFMiddleware はCSRF保護を行うミドルウェアです
func CSRFMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			if c.Request().Method == http.MethodGet {
				token := generateCSRFToken()
				if token == "" {
					return c.JSON(http.StatusInternalServerError, map[string]string{
						"error": "内部サーバーエラーが発生しました",
					})
				}

				tokenStore.Lock()
				tokenStore.tokens[token] = true
				tokenStore.Unlock()

				c.Response().Header().Set(CSRFTokenHeader, token)

				return next(c)
			}

			if err := validateRequestToken(c); err != nil {
				return err
			}

			newToken := generateCSRFToken()
			if newToken != "" {
				tokenStore.Lock()
				delete(tokenStore.tokens, c.Request().Header.Get(CSRFTokenHeader))
				tokenStore.tokens[newToken] = true
				tokenStore.Unlock()

				c.Response().Header().Set(CSRFTokenHeader, newToken)
			}

			return next(c)
		}
	}
}

// generateCSRFToken はCSRFトークンを生成します
func generateCSRFToken() string {
	b := make([]byte, CSRFTokenLength)
	if _, err := rand.Read(b); err != nil {
		return ""
	}

	return base64.StdEncoding.EncodeToString(b)
}

// validateCSRFToken はCSRFトークンを検証します
func validateCSRFToken(token string) bool {
	// テスト用のトークンを許可
	if TestCSRFToken != "" && token == TestCSRFToken {
		return true
	}

	tokenStore.RLock()
	defer tokenStore.RUnlock()

	return tokenStore.tokens[token]
}

// RefreshCSRFToken は新しいCSRFトークンを生成して返します
func RefreshCSRFToken(c echo.Context) error {
	token := generateCSRFToken()
	if token == "" {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "CSRFトークンの生成に失敗しました",
		})
	}

	tokenStore.Lock()
	tokenStore.tokens[token] = true
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
