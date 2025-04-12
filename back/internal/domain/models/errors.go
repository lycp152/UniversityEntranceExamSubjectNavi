package models

import (
	"errors"
	"fmt"
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

// DBError はデータベース操作の詳細なエラー情報を保持する構造体
type DBError struct {
	Err       error     // 元のエラー
	Code      ErrorCode // エラーコード
	Operation string    // 実行された操作
	Table     string    // 操作対象のテーブル
	Timestamp time.Time // エラー発生時刻
	Details   string    // 追加の詳細情報
}

// Error はDBErrorの文字列表現を返す
func (e *DBError) Error() string {
	return fmt.Sprintf("%s テーブルでの %s 操作中にエラーが発生しました: %v (エラーコード: %s, 時刻: %s, 詳細: %s)",
		e.Table, e.Operation, e.Err, e.Code, e.Timestamp.Format(time.RFC3339), e.Details)
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

	return &DBError{
		Err:       err,
		Code:      code,
		Operation: operation,
		Table:     table,
		Timestamp: time.Now(),
		Details:   detail,
	}
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
