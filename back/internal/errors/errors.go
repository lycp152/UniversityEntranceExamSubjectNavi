package errors

import (
	"errors"
	"fmt"
	"runtime"
	"strings"
	"time"

	"gorm.io/gorm"
)

// Package errors はアプリケーション全体で使用されるエラー型とエラー処理機能を提供します。
// カスタムエラー型、エラーコード、エラーメッセージ、エラー変換機能を含みます。

// Code はエラーコードを表します
type Code string

// エラーコードの定数
const (
	CodeNotFound         Code = "NOT_FOUND"
	CodeInvalidInput     Code = "INVALID_INPUT"
	CodeDatabaseError    Code = "DATABASE_ERROR"
	CodeValidationError  Code = "VALIDATION_ERROR"
	CodeSystemError      Code = "SYSTEM_ERROR"
	CodeAuthError        Code = "AUTHENTICATION_ERROR"
	CodeAuthzError       Code = "AUTHORIZATION_ERROR"
	CodeExternalAPIError Code = "EXTERNAL_API_ERROR"
	CodeTimeoutError     Code = "TIMEOUT_ERROR"
	CodeRateLimitError   Code = "RATE_LIMIT_ERROR"
)

// ErrorDetails はエラーの詳細情報を保持する構造体
type ErrorDetails struct {
	Resource  string            `json:"resource,omitempty"`
	ID        uint             `json:"id,omitempty"`
	Field     string            `json:"field,omitempty"`
	Operation string            `json:"operation,omitempty"`
	Service   string            `json:"service,omitempty"`
	Extra     map[string]string `json:"extra,omitempty"`
	Stack     []string          `json:"stack,omitempty"`
}

// Error はアプリケーション全体で使用されるエラー型
type Error struct {
	Code      Code         `json:"code"`
	Message   string       `json:"message"`
	Err       error        `json:"-"`
	Details   ErrorDetails `json:"details,omitempty"`
	File      string       `json:"file,omitempty"`
	Line      int          `json:"line,omitempty"`
	LogLevel  string       `json:"log_level,omitempty"`
	Timestamp time.Time    `json:"timestamp,omitempty"`
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

// Is はエラーの比較を実装します
func (e *Error) Is(target error) bool {
	if target == nil {
		return e == nil
	}
	if t, ok := target.(*Error); ok {
		return e.Code == t.Code
	}
	return false
}

// WithDetails はエラーに詳細情報を追加します
func (e *Error) WithDetails(details ErrorDetails) *Error {
	e.Details = details
	return e
}

// WithStack はスタックトレースを追加します
func (e *Error) WithStack() *Error {
	const maxStackDepth = 32
	pc := make([]uintptr, maxStackDepth)
	n := runtime.Callers(2, pc)
	if n > 0 {
		frames := runtime.CallersFrames(pc[:n])
		for {
			frame, more := frames.Next()
			e.Details.Stack = append(e.Details.Stack, fmt.Sprintf("%s:%d %s", frame.File, frame.Line, frame.Function))
			if !more {
				break
			}
		}
	}
	return e
}

// NewNotFoundError は新しいNotFoundエラーを生成します
func NewNotFoundError(resource string, id uint, extra map[string]string) *Error {
	_, file, line, _ := runtime.Caller(1)
	err := &Error{
		Code:    CodeNotFound,
		Message: fmt.Sprintf("%s (ID: %d) が見つかりません", resource, id),
		Details: ErrorDetails{
			Resource: resource,
			ID:       id,
			Extra:    extra,
		},
		File:      file,
		Line:      line,
		Timestamp: time.Now(),
	}

	return err.WithStack()
}

// NewInvalidInputError は新しいInvalidInputエラーを生成します
func NewInvalidInputError(field, message string, extra map[string]string) *Error {
	_, file, line, _ := runtime.Caller(1)
	err := &Error{
		Code:    CodeInvalidInput,
		Message: fmt.Sprintf("%s: %s", field, message),
		Details: ErrorDetails{
			Field: field,
			Extra: extra,
		},
		File:      file,
		Line:      line,
		Timestamp: time.Now(),
	}

	return err.WithStack()
}

// NewDatabaseError は新しいデータベースエラーを生成します
func NewDatabaseError(operation string, err error, extra map[string]string) *Error {
	_, file, line, _ := runtime.Caller(1)
	dbErr := &Error{
		Code:    CodeDatabaseError,
		Message: fmt.Sprintf("データベース操作 '%s' でエラーが発生しました: %v", operation, err),
		Details: ErrorDetails{
			Operation: operation,
			Extra:     extra,
		},
		File:      file,
		Line:      line,
		Timestamp: time.Now(),
	}

	return dbErr.WithStack()
}

// NewValidationError は新しいバリデーションエラーを生成します
func NewValidationError(field, message string, extra map[string]string) *Error {
	_, file, line, _ := runtime.Caller(1)

	return &Error{
		Code:    CodeValidationError,
		Message: fmt.Sprintf("フィールド %s のバリデーションに失敗しました: %s", field, message),
		Details: ErrorDetails{
			Field: field,
			Extra: extra,
		},
		File:    file,
		Line:    line,
		LogLevel: "ERROR",
		Timestamp: time.Now(),
	}
}

// NewSystemError は新しいシステムエラーを生成します
func NewSystemError(message string, err error, extra map[string]string) *Error {
	_, file, line, _ := runtime.Caller(1)

	return &Error{
		Code:    CodeSystemError,
		Message: message,
		Err:     err,
		Details: ErrorDetails{
			Extra: extra,
		},
		File:      file,
		Line:      line,
		LogLevel:  "ERROR",
		Timestamp: time.Now(),
	}
}

// NewAuthenticationError は新しい認証エラーを生成します
func NewAuthenticationError(message string, extra map[string]string) *Error {
	_, file, line, _ := runtime.Caller(1)

	return &Error{
		Code:    CodeAuthError,
		Message: message,
		Details: ErrorDetails{
			Extra: extra,
		},
		File:      file,
		Line:      line,
		LogLevel:  "ERROR",
		Timestamp: time.Now(),
	}
}

// NewAuthorizationError は新しい認可エラーを生成します
func NewAuthorizationError(message string, extra map[string]string) *Error {
	_, file, line, _ := runtime.Caller(1)
	return &Error{
		Code:    CodeAuthzError,
		Message: message,
		Details: ErrorDetails{
			Extra: extra,
		},
		File:      file,
		Line:      line,
		LogLevel:  "ERROR",
		Timestamp: time.Now(),
	}
}

// NewExternalAPIError は新しい外部APIエラーを生成します
func NewExternalAPIError(service, message string, err error, extra map[string]string) *Error {
	_, file, line, _ := runtime.Caller(1)
	return &Error{
		Code:    CodeExternalAPIError,
		Message: fmt.Sprintf("外部API '%s' でエラーが発生しました: %s", service, message),
		Err:     err,
		Details: ErrorDetails{
			Service: service,
			Extra:   extra,
		},
		File:      file,
		Line:      line,
		LogLevel:  "ERROR",
		Timestamp: time.Now(),
	}
}

// NewTimeoutError は新しいタイムアウトエラーを生成します
func NewTimeoutError(operation string, extra map[string]string) *Error {
	_, file, line, _ := runtime.Caller(1)
	return &Error{
		Code:    CodeTimeoutError,
		Message: fmt.Sprintf("操作 '%s' がタイムアウトしました", operation),
		Details: ErrorDetails{
			Operation: operation,
			Extra:     extra,
		},
		File:      file,
		Line:      line,
		LogLevel:  "ERROR",
		Timestamp: time.Now(),
	}
}

// NewRateLimitError は新しいレート制限エラーを生成します
func NewRateLimitError(message string, extra map[string]string) *Error {
	_, file, line, _ := runtime.Caller(1)
	return &Error{
		Code:    CodeRateLimitError,
		Message: message,
		Details: ErrorDetails{
			Extra: extra,
		},
		File:      file,
		Line:      line,
		LogLevel:  "ERROR",
		Timestamp: time.Now(),
	}
}

// DBErrorType はデータベースエラーの種類を定義します
type DBErrorType int

const (
	// ErrorTypeNotFound はリソースが見つからないエラーを表します
	ErrorTypeNotFound DBErrorType = iota
	// ErrorTypeDuplicateKey は重複キーエラーを表します
	ErrorTypeDuplicateKey
	// ErrorTypeDeadlock はデッドロックエラーを表します
	ErrorTypeDeadlock
	// ErrorTypeUnexpected は予期せぬエラーを表します
	ErrorTypeUnexpected
	// ErrorTypeConnection は接続エラーを表します
	ErrorTypeConnection
	// ErrorTypeTimeout はタイムアウトエラーを表します
	ErrorTypeTimeout
)

// エラーメッセージの定数
const (
	errMsgNotFound     = "リソースが見つかりません"
	errMsgDuplicateKey = "重複するキーが存在します"
	errMsgDeadlock     = "デッドロックが発生しました: %w"
	errMsgUnexpectedDB = "予期せぬデータベースエラー: %w"
	errMsgConnection   = "データベース接続エラー: %w"
	errMsgTimeout      = "データベース操作がタイムアウトしました: %w"
)

// DBError はデータベースエラーの詳細情報を保持します
type DBError struct {
	Type    DBErrorType
	Message string
	Err     error
	File    string
	Line    int
}

// Error はエラーメッセージを返します
func (e *DBError) Error() string {
	return e.Message
}

// Unwrap は元のエラーを返します
func (e *DBError) Unwrap() error {
	return e.Err
}

// Is はエラーの比較を実装します
func (e *DBError) Is(target error) bool {
	if target == nil {
		return e == nil
	}

	if t, ok := target.(*DBError); ok {
		return e.Type == t.Type
	}

	return false
}

// NewDBError は新しいDBErrorを作成します
func NewDBError(errorType DBErrorType, err error) *DBError {
	_, file, line, _ := runtime.Caller(1)

	var message string

	switch errorType {
	case ErrorTypeNotFound:
		message = errMsgNotFound
	case ErrorTypeDuplicateKey:
		message = errMsgDuplicateKey
	case ErrorTypeDeadlock:
		message = fmt.Errorf(errMsgDeadlock, err).Error()
	case ErrorTypeConnection:
		message = fmt.Errorf(errMsgConnection, err).Error()
	case ErrorTypeTimeout:
		message = fmt.Errorf(errMsgTimeout, err).Error()
	default:
		message = fmt.Errorf(errMsgUnexpectedDB, err).Error()
	}

	return &DBError{
		Type:    errorType,
		Message: message,
		Err:     err,
		File:    file,
		Line:    line,
	}
}

// TranslateDBError はデータベースエラーを適切な日本語メッセージに変換します
func TranslateDBError(err error) error {
	if err == nil {
		return nil
	}

	// カスタムエラーの場合はそのまま返す
	var dbErr *Error
	if errors.As(err, &dbErr) {
		return dbErr
	}

	// エラーの種類を判定
	errorType := determineErrorType(err)

	// エラーの種類に応じて適切なエラーを返す
	switch errorType {
	case ErrorTypeNotFound:
		return NewNotFoundError("Resource", 0, nil)
	case ErrorTypeDuplicateKey:
		return NewInvalidInputError("key", errMsgDuplicateKey, nil)
	case ErrorTypeDeadlock:
		return NewDatabaseError("database_operation", fmt.Errorf(errMsgDeadlock, err), nil)
	case ErrorTypeConnection:
		return NewDatabaseError("database_connection", fmt.Errorf(errMsgConnection, err), nil)
	case ErrorTypeTimeout:
		return NewTimeoutError("database_operation", nil)
	default:
		return NewDatabaseError("database_operation", fmt.Errorf(errMsgUnexpectedDB, err), nil)
	}
}

// determineErrorType はエラーの種類を判定します
func determineErrorType(err error) DBErrorType {
	switch {
	case errors.Is(err, gorm.ErrRecordNotFound):
		return ErrorTypeNotFound
	case errors.Is(err, gorm.ErrDuplicatedKey):
		return ErrorTypeDuplicateKey
	case strings.Contains(err.Error(), "deadlock"):
		return ErrorTypeDeadlock
	case strings.Contains(err.Error(), "connection"):
		return ErrorTypeConnection
	case strings.Contains(err.Error(), "timeout"):
		return ErrorTypeTimeout
	default:
		return ErrorTypeUnexpected
	}
}
