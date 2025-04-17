// Package models は、データベース操作に関連するエラーを定義するパッケージです。
package models

import (
	"errors"
	"fmt"
	"runtime"
	"strings"
	"time"
)

// ErrorCode はエラーコードを表す型
type ErrorCode string

// エラーコードの定義
const (
	CodeNotFound        ErrorCode = "NOT_FOUND"
	CodeDuplicateKey    ErrorCode = "DUPLICATE_KEY"
	CodeValidationError ErrorCode = "VALIDATION_ERROR"
	CodeDatabaseError   ErrorCode = "DATABASE_ERROR"
	CodeInvalidYear     ErrorCode = "INVALID_YEAR"
	CodeTimeout         ErrorCode = "TIMEOUT"
	CodeDeadlock        ErrorCode = "DEADLOCK"
	CodeCustom          ErrorCode = "CUSTOM_ERROR"
)

// データベース操作で発生する一般的なエラー
var (
	// ErrRecordNotFound はレコードが存在しない場合のエラー
	ErrRecordNotFound = errors.New("レコードが見つかりません")
	// ErrDuplicateKey は一意制約違反が発生した場合のエラー
	ErrDuplicateKey = errors.New("重複するキーが存在します")
	// ErrValidationFailed はバリデーションに失敗した場合のエラー
	ErrValidationFailed = errors.New("バリデーションに失敗しました")
	// ErrDatabaseError はその他のデータベースエラー
	ErrDatabaseError = errors.New("データベースエラーが発生しました")
	// ErrInvalidAcademicYear は学年度が不正な場合のエラー
	ErrInvalidAcademicYear = errors.New("学年度は2000年から2100年の間である必要があります")
	// ErrTimeout は操作がタイムアウトした場合のエラー
	ErrTimeout = errors.New("操作がタイムアウトしました")
	// ErrDeadlock はデッドロックが発生した場合のエラー
	ErrDeadlock = errors.New("デッドロックが発生しました")
)

// ErrorDetail はエラーの詳細情報を保持する構造体
type ErrorDetail struct {
	Message    string            // エラーメッセージ
	StackTrace string            // スタックトレース
	Context    map[string]string // コンテキスト情報
}

// DBError はデータベース操作の詳細なエラー情報を保持する構造体
type DBError struct {
	Err       error      // 元のエラー
	Code      ErrorCode  // エラーコード
	Operation string     // 実行された操作
	Table     string     // 操作対象のテーブル
	Timestamp time.Time  // エラー発生時刻
	Details   ErrorDetail // 追加の詳細情報
}

// Error はDBErrorの文字列表現を返す
func (e *DBError) Error() string {
	var contextStr string

	if len(e.Details.Context) > 0 {
		var contextParts []string
		for k, v := range e.Details.Context {
			contextParts = append(contextParts, fmt.Sprintf("%s=%s", k, v))
		}

		contextStr = fmt.Sprintf(", コンテキスト: {%s}", strings.Join(contextParts, ", "))
	}

	return fmt.Sprintf("%s テーブルでの %s 操作中にエラーが発生しました: %v (エラーコード: %s, 時刻: %s, 詳細: %s%s)",
		e.Table, e.Operation, e.Err, e.Code, e.Timestamp.Format(time.RFC3339), e.Details.Message, contextStr)
}

// Unwrap は元のエラーを返す
func (e *DBError) Unwrap() error {
	return e.Err
}

// NewDBError は新しいDBErrorインスタンスを作成する
func NewDBError(err error, code ErrorCode, operation, table string, details ...string) *DBError {
	var detail string
	if len(details) > 0 {
		detail = details[0]
	}

	// スタックトレースの取得
	var stackTrace string

	pc := make([]uintptr, 10)
	n := runtime.Callers(2, pc)

	if n > 0 {
		frames := runtime.CallersFrames(pc[:n])

		var stack []string

		for {
			frame, more := frames.Next()
			stack = append(stack, fmt.Sprintf("%s:%d %s", frame.File, frame.Line, frame.Function))

			if !more {
				break
			}
		}

		stackTrace = strings.Join(stack, "\n")
	}

	return &DBError{
		Err:       err,
		Code:      code,
		Operation: operation,
		Table:     table,
		Timestamp: time.Now(),
		Details: ErrorDetail{
			Message:    detail,
			StackTrace: stackTrace,
			Context:    make(map[string]string),
		},
	}
}

// WithContext はエラーにコンテキスト情報を追加する
func (e *DBError) WithContext(key, value string) *DBError {
	e.Details.Context[key] = value
	return e
}

// IsNotFound はエラーがレコード未検出エラーかどうかを判定する
func IsNotFound(err error) bool {
	var dbErr *DBError
	if errors.As(err, &dbErr) {
		return dbErr.Code == CodeNotFound
	}

	return errors.Is(err, ErrRecordNotFound)
}

// IsDuplicateKey はエラーが一意制約違反エラーかどうかを判定する
func IsDuplicateKey(err error) bool {
	var dbErr *DBError
	if errors.As(err, &dbErr) {
		return dbErr.Code == CodeDuplicateKey
	}

	return errors.Is(err, ErrDuplicateKey)
}

// IsValidationError はエラーがバリデーションエラーかどうかを判定する
func IsValidationError(err error) bool {
	var dbErr *DBError
	if errors.As(err, &dbErr) {
		return dbErr.Code == CodeValidationError
	}

	return errors.Is(err, ErrValidationFailed)
}

// IsTimeout はエラーがタイムアウトエラーかどうかを判定する
func IsTimeout(err error) bool {
	var dbErr *DBError
	if errors.As(err, &dbErr) {
		return dbErr.Code == CodeTimeout
	}

	return errors.Is(err, ErrTimeout)
}

// IsDeadlock はエラーがデッドロックエラーかどうかを判定する
func IsDeadlock(err error) bool {
	var dbErr *DBError
	if errors.As(err, &dbErr) {
		return dbErr.Code == CodeDeadlock
	}

	return errors.Is(err, ErrDeadlock)
}

// GetErrorDetails はエラーの詳細情報を取得する
func GetErrorDetails(err error) (ErrorDetail, bool) {
	var dbErr *DBError
	if errors.As(err, &dbErr) {
		return dbErr.Details, true
	}

	return ErrorDetail{}, false
}
