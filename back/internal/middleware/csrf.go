// Package middleware はアプリケーションのミドルウェアを提供します。
// このパッケージは以下の機能を提供します：
// - CSRFトークンの生成と検証
// - トークンの有効期限管理
// - セキュアなトークンストアの実装
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

// getTokenLength は環境変数からトークン長を取得します。
// 以下の優先順位で値を決定します：
// 1. 環境変数CSRF_TOKEN_LENGTHの値（有効な場合）
// 2. デフォルト値（DefaultTokenLength）
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

// getTokenExpiration は環境変数からトークンの有効期限を取得します。
// 以下の優先順位で値を決定します：
// 1. 環境変数CSRF_TOKEN_EXPIRATIONの値（有効な場合）
// 2. デフォルト値（DefaultTokenExpiration）
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

// validateRequestToken はリクエストトークンを検証します。
// 以下の検証を行います：
// 1. トークンの存在確認
// 2. トークンの有効性確認
// 3. エラーメッセージの生成
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

// CSRFMiddleware はCSRF保護を行うミドルウェアです。
// 以下の処理を行います：
// 1. GETリクエストの場合、新しいトークンを生成
// 2. その他のリクエストの場合、トークンの検証
// 3. トークンの更新とレスポンスヘッダーの設定
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

// generateCSRFToken はCSRFトークンを生成します。
// 以下の処理を行います：
// 1. ランダムバイトの生成
// 2. Base64エンコーディング
// 3. エラーハンドリング
func generateCSRFToken() (string, error) {
	b := make([]byte, CSRFTokenLength)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}

	return base64.URLEncoding.EncodeToString(b), nil
}

// validateCSRFToken はCSRFトークンを検証します。
// 以下の検証を行います：
// 1. テスト用トークンの確認
// 2. トークンの存在確認
// 3. 有効期限の確認
// 4. 期限切れトークンの削除
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

// RefreshCSRFToken は新しいCSRFトークンを生成して返します。
// 以下の処理を行います：
// 1. トークンの生成
// 2. トークンストアの更新
// 3. レスポンスヘッダーの設定
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

// ConfigureCSRF はCSRF保護を設定します。
// 以下の設定を行います：
// 1. トークンの検索方法
// 2. クッキーの設定
// 3. セキュリティオプション
func ConfigureCSRF() echo.MiddlewareFunc {
	return echomiddleware.CSRFWithConfig(echomiddleware.CSRFConfig{
		TokenLookup:    "header:X-CSRF-Token",
		CookieName:     "csrf",
		CookiePath:     "/",
		CookieHTTPOnly: true,
		CookieSameSite: http.SameSiteStrictMode,
	})
}

// CSRFTokenHandler はCSRFトークンを生成して返すハンドラーです。
// 以下の処理を行います：
// 1. トークンの取得
// 2. JSONレスポンスの生成
func CSRFTokenHandler(c echo.Context) error {
	token := c.Get("csrf").(string)

	return c.JSON(http.StatusOK, map[string]string{
		"token": token,
	})
}
