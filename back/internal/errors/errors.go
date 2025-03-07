package errors

import (
	"fmt"
)

// ErrorCode はエラーコードを定義します
type ErrorCode string

const (
	// システムエラー
	ErrorCodeSystem ErrorCode = "SYSTEM_ERROR"
	// 認証エラー
	ErrorCodeAuthentication ErrorCode = "AUTHENTICATION_ERROR"
	// 認可エラー
	ErrorCodeAuthorization ErrorCode = "AUTHORIZATION_ERROR"
	// リソースが見つからない
	ErrorCodeNotFound ErrorCode = "NOT_FOUND"
	// 入力値が不正
	ErrorCodeInvalidInput ErrorCode = "INVALID_INPUT"
	// データベースエラー
	ErrorCodeDatabase ErrorCode = "DATABASE_ERROR"
	// バリデーションエラー
	ErrorCodeValidation ErrorCode = "VALIDATION_ERROR"
	// 外部APIエラー
	ErrorCodeExternalAPI ErrorCode = "EXTERNAL_API_ERROR"
)

// AppError はアプリケーション全体で使用されるエラー型
type AppError struct {
	Code    ErrorCode
	Message string
	Err     error
	Details map[string]interface{}
}

func (e *AppError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("%s: %s (%v)", e.Code, e.Message, e.Err)
	}
	return fmt.Sprintf("%s: %s", e.Code, e.Message)
}

// WithDetails はエラーに詳細情報を追加します
func (e *AppError) WithDetails(details map[string]interface{}) *AppError {
	e.Details = details
	return e
}

// ErrNotFound はリソースが見つからない場合のエラー
type ErrNotFound struct {
	Resource string
	ID       interface{}
}

func (e *ErrNotFound) Error() string {
	return fmt.Sprintf("%s with ID %v not found", e.Resource, e.ID)
}

// ErrInvalidInput は入力値が不正な場合のエラー
type ErrInvalidInput struct {
	Field   string
	Message string
}

func (e *ErrInvalidInput) Error() string {
	return fmt.Sprintf("invalid input for field %s: %s", e.Field, e.Message)
}

// ErrDatabaseOperation はデータベース操作に失敗した場合のエラー
type ErrDatabaseOperation struct {
	Operation string
	Err       error
}

func (e *ErrDatabaseOperation) Error() string {
	return fmt.Sprintf("database operation '%s' failed: %v", e.Operation, e.Err)
}

// NewNotFoundError は新しいNotFoundエラーを生成します
func NewNotFoundError(resource string, id interface{}, details map[string]interface{}) *AppError {
	if details == nil {
		details = make(map[string]interface{})
	}
	details["resource"] = resource
	details["id"] = id

	return &AppError{
		Code:    ErrorCodeNotFound,
		Message: fmt.Sprintf("%s with ID %v not found", resource, id),
		Details: details,
	}
}

// NewInvalidInputError は新しいInvalidInputエラーを生成します
func NewInvalidInputError(field, message string, details map[string]interface{}) *AppError {
	if details == nil {
		details = make(map[string]interface{})
	}
	details["field"] = field
	details["message"] = message

	return &AppError{
		Code:    ErrorCodeInvalidInput,
		Message: fmt.Sprintf("invalid input for field %s: %s", field, message),
		Details: details,
	}
}

// NewDatabaseError は新しいデータベースエラーを生成します
func NewDatabaseError(operation string, err error, details map[string]interface{}) *AppError {
	if details == nil {
		details = make(map[string]interface{})
	}
	details["operation"] = operation

	return &AppError{
		Code:    ErrorCodeDatabase,
		Message: fmt.Sprintf("database operation '%s' failed", operation),
		Err:     err,
		Details: details,
	}
}

// NewValidationError は新しいバリデーションエラーを生成します
func NewValidationError(field, message string, details map[string]interface{}) *AppError {
	if details == nil {
		details = make(map[string]interface{})
	}
	details["field"] = field
	details["message"] = message

	return &AppError{
		Code:    ErrorCodeValidation,
		Message: fmt.Sprintf("validation failed for field %s: %s", field, message),
		Details: details,
	}
}

// NewSystemError は新しいシステムエラーを生成します
func NewSystemError(message string, err error, details map[string]interface{}) *AppError {
	if details == nil {
		details = make(map[string]interface{})
	}

	return &AppError{
		Code:    ErrorCodeSystem,
		Message: message,
		Err:     err,
		Details: details,
	}
}

// NewAuthenticationError は新しい認証エラーを生成します
func NewAuthenticationError(message string, details map[string]interface{}) *AppError {
	if details == nil {
		details = make(map[string]interface{})
	}

	return &AppError{
		Code:    ErrorCodeAuthentication,
		Message: message,
		Details: details,
	}
}

// NewAuthorizationError は新しい認可エラーを生成します
func NewAuthorizationError(message string, details map[string]interface{}) *AppError {
	if details == nil {
		details = make(map[string]interface{})
	}

	return &AppError{
		Code:    ErrorCodeAuthorization,
		Message: message,
		Details: details,
	}
}

// NewExternalAPIError は新しい外部APIエラーを生成します
func NewExternalAPIError(service, message string, err error, details map[string]interface{}) *AppError {
	if details == nil {
		details = make(map[string]interface{})
	}
	details["service"] = service

	return &AppError{
		Code:    ErrorCodeExternalAPI,
		Message: fmt.Sprintf("external API '%s' error: %s", service, message),
		Err:     err,
		Details: details,
	}
}
