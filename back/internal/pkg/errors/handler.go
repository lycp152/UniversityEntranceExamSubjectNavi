// Package errors はアプリケーションのエラー処理を管理するパッケージです
// エラーの生成、ラップ、HTTPレスポンスへの変換などの機能を提供します
package errors

import (
	"fmt"
	"net/http"
	"university-exam-api/internal/errors"
	applogger "university-exam-api/internal/logger"

	"github.com/labstack/echo/v4"
)

// エラーコードの定義
const (
	// バリデーションエラー
	Validation = "VALIDATION_ERROR"
	// リソースが見つからない
	NotFound = "NOT_FOUND"
	// 入力値が無効
	InvalidInput = "INVALID_INPUT"
	// 認証エラー
	Authentication = "AUTHENTICATION_ERROR"
	// 認可エラー
	Authorization = "AUTHORIZATION_ERROR"
	// レート制限エラー
	RateLimit = "RATE_LIMIT_ERROR"
	// リクエストサイズエラー
	RequestTooLarge = "REQUEST_TOO_LARGE"
	// コンテンツタイプエラー
	InvalidContentType = "INVALID_CONTENT_TYPE"
	// 内部サーバーエラー
	InternalServerError = "INTERNAL_SERVER_ERROR"
)

// NewValidationError はバリデーションエラーを生成
func NewValidationError(message string) error {
	return &errors.Error{
		Code:    Validation,
		Message: message,
	}
}

// NewRateLimitError はレート制限エラーを生成
func NewRateLimitError(message string) error {
	return &errors.Error{
		Code:    RateLimit,
		Message: message,
	}
}

// NewRequestTooLargeError はリクエストサイズエラーを生成
func NewRequestTooLargeError(message string) error {
	return &errors.Error{
		Code:    RequestTooLarge,
		Message: message,
	}
}

// NewInvalidContentTypeError はコンテンツタイプエラーを生成
func NewInvalidContentTypeError(message string) error {
	return &errors.Error{
		Code:    InvalidContentType,
		Message: message,
	}
}

// WrapError はエラーをラップして詳細情報を追加
func WrapError(err error, code string, message string) error {
	return fmt.Errorf("%s: %w", message, &errors.Error{
		Code:    errors.Code(code),
		Message: message,
		Details: errors.ErrorDetails{Extra: map[string]string{"error": err.Error()}},
	})
}

// HandleError はエラーをHTTPレスポンスに変換
func HandleError(c echo.Context, err error) error {
	ctx := c.Request().Context()

	switch e := err.(type) {
	case *errors.Error:
		statusCode := getStatusCode(string(e.Code))
		applogger.Error(ctx, "エラーが発生しました: %v", e)

		return c.JSON(statusCode, map[string]interface{}{
			"code":    e.Code,
			"message": e.Message,
			"details": e.Details,
		})
	default:
		applogger.Error(ctx, "予期せぬエラーが発生しました: %v", err)

		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    InternalServerError,
			"message": "サーバー内部でエラーが発生しました",
			"details": err.Error(),
		})
	}
}

// getStatusCode はエラーコードに対応するHTTPステータスコードを返す
func getStatusCode(code string) int {
	switch code {
	case NotFound:
		return http.StatusNotFound
	case InvalidInput, Validation:
		return http.StatusBadRequest
	case Authentication:
		return http.StatusUnauthorized
	case Authorization:
		return http.StatusForbidden
	case RateLimit:
		return http.StatusTooManyRequests
	case RequestTooLarge:
		return http.StatusRequestEntityTooLarge
	case InvalidContentType:
		return http.StatusUnsupportedMediaType
	default:
		return http.StatusInternalServerError
	}
}
