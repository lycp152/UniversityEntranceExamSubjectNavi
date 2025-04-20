// Package errors はアプリケーションのエラー処理を管理するパッケージです。
// このパッケージは以下の機能を提供します：
// - エラーの生成とラップ
// - エラーコードの管理
// - HTTPレスポンスへの変換
// - エラーログの記録
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

// AppError はアプリケーションエラーを表す構造体です。
// この構造体は以下の情報を保持します：
// - エラーコード
// - エラーメッセージ
// - エラーの詳細情報
type AppError struct {
	Code    string
	Message string
}

// Error はAppErrorの文字列表現を返します。
// このメソッドは以下の形式でエラー情報を返します：
// "code=エラーコード, message=エラーメッセージ"
func (e *AppError) Error() string {
	return fmt.Sprintf("code=%s, message=%s", e.Code, e.Message)
}

// NewAppError は新しいAppErrorを生成します。
// この関数は以下の処理を行います：
// 1. エラーコードの設定
// 2. エラーメッセージの設定
func NewAppError(code string, message string) *AppError {
	return &AppError{
		Code:    code,
		Message: message,
	}
}

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

// WrapError はエラーをラップして詳細情報を追加します。
// この関数は以下の処理を行います：
// 1. エラーの存在確認
// 2. エラー情報のラップ
// 3. 詳細情報の追加
func WrapError(err error, code string, message string) error {
	if err == nil {
		return nil
	}

	return fmt.Errorf("%s: %w", message, &AppError{
		Code:    code,
		Message: message,
	})
}

// HandleError はエラーをHTTPレスポンスに変換します。
// この関数は以下の処理を行います：
// 1. エラータイプの判定
// 2. 適切なHTTPステータスコードの設定
// 3. エラーログの記録
// 4. JSONレスポンスの生成
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

// getStatusCode はエラーコードに対応するHTTPステータスコードを返します。
// この関数は以下の処理を行います：
// 1. エラーコードの判定
// 2. 対応するHTTPステータスコードの返却
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
