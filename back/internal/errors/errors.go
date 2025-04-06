package errors

import (
	"fmt"
)

// Code はエラーコードを定義します
type Code string

const (
	// システムエラー
	System Code = "SYSTEM_ERROR"
	// 認証エラー
	Authentication Code = "AUTHENTICATION_ERROR"
	// 認可エラー
	Authorization Code = "AUTHORIZATION_ERROR"
	// リソースが見つからない
	NotFound Code = "NOT_FOUND"
	// 入力値が不正
	InvalidInput Code = "INVALID_INPUT"
	// データベースエラー
	Database Code = "DATABASE_ERROR"
	// バリデーションエラー
	Validation Code = "VALIDATION_ERROR"
	// 外部APIエラー
	ExternalAPI Code = "EXTERNAL_API_ERROR"
)

// ErrorDetails はエラーの詳細情報を保持する構造体
type ErrorDetails struct {
	Resource  string            `json:"resource,omitempty"`
	ID        uint             `json:"id,omitempty"`
	Field     string            `json:"field,omitempty"`
	Operation string            `json:"operation,omitempty"`
	Service   string            `json:"service,omitempty"`
	Extra     map[string]string `json:"extra,omitempty"`
}

// Error はアプリケーション全体で使用されるエラー型
type Error struct {
	Code    Code         `json:"code"`
	Message string       `json:"message"`
	Err     error        `json:"-"`
	Details ErrorDetails `json:"details,omitempty"`
}

// Error はerrorインターフェースを実装します
func (e *Error) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("%s: %s (%v)", e.Code, e.Message, e.Err)
	}
	return fmt.Sprintf("%s: %s", e.Code, e.Message)
}

// Unwrap はラップされたエラーを返します
func (e *Error) Unwrap() error {
	return e.Err
}

// WithDetails はエラーに詳細情報を追加します
func (e *Error) WithDetails(details ErrorDetails) *Error {
	e.Details = details
	return e
}

// NewNotFoundError は新しいNotFoundエラーを生成します
func NewNotFoundError(resource string, id uint, extra map[string]string) *Error {
	return &Error{
		Code:    NotFound,
		Message: fmt.Sprintf("%sが見つかりません", resource),
		Details: ErrorDetails{
			Resource: resource,
			ID:       id,
			Extra:    extra,
		},
	}
}

// NewInvalidInputError は新しいInvalidInputエラーを生成します
func NewInvalidInputError(field, message string, extra map[string]string) *Error {
	return &Error{
		Code:    InvalidInput,
		Message: fmt.Sprintf("フィールド %s の入力が不正です: %s", field, message),
		Details: ErrorDetails{
			Field: field,
			Extra: extra,
		},
	}
}

// NewDatabaseError は新しいデータベースエラーを生成します
func NewDatabaseError(operation string, err error, extra map[string]string) *Error {
	return &Error{
		Code:    Database,
		Message: fmt.Sprintf("データベース操作 '%s' に失敗しました", operation),
		Err:     err,
		Details: ErrorDetails{
			Operation: operation,
			Extra:     extra,
		},
	}
}

// NewValidationError は新しいバリデーションエラーを生成します
func NewValidationError(field, message string, extra map[string]string) *Error {
	return &Error{
		Code:    Validation,
		Message: fmt.Sprintf("フィールド %s のバリデーションに失敗しました: %s", field, message),
		Details: ErrorDetails{
			Field: field,
			Extra: extra,
		},
	}
}

// NewSystemError は新しいシステムエラーを生成します
func NewSystemError(message string, err error, extra map[string]string) *Error {
	return &Error{
		Code:    System,
		Message: message,
		Err:     err,
		Details: ErrorDetails{
			Extra: extra,
		},
	}
}

// NewAuthenticationError は新しい認証エラーを生成します
func NewAuthenticationError(message string, extra map[string]string) *Error {
	return &Error{
		Code:    Authentication,
		Message: message,
		Details: ErrorDetails{
			Extra: extra,
		},
	}
}

// NewAuthorizationError は新しい認可エラーを生成します
func NewAuthorizationError(message string, extra map[string]string) *Error {
	return &Error{
		Code:    Authorization,
		Message: message,
		Details: ErrorDetails{
			Extra: extra,
		},
	}
}

// NewExternalAPIError は新しい外部APIエラーを生成します
func NewExternalAPIError(service, message string, err error, extra map[string]string) *Error {
	return &Error{
		Code:    ExternalAPI,
		Message: fmt.Sprintf("外部API '%s' でエラーが発生しました: %s", service, message),
		Err:     err,
		Details: ErrorDetails{
			Service: service,
			Extra:   extra,
		},
	}
}
