package models

import (
	"errors"
	"fmt"
)

// データベース関連のエラー
var (
	ErrRecordNotFound   = errors.New("record not found")
	ErrDuplicateKey    = errors.New("duplicate key violation")
	ErrValidationFailed = errors.New("validation failed")
	ErrDatabaseError   = errors.New("database error")
	ErrInvalidAcademicYear = errors.New("学年度は2000年から2100年の間である必要があります")
)

// DBError はデータベースエラーをラップする構造体
type DBError struct {
	Err      error
	Code     string
	Operation string
	Table    string
}

func (e *DBError) Error() string {
	return fmt.Sprintf("%s error on table %s: %v (code: %s)",
		e.Operation, e.Table, e.Err, e.Code)
}

// NewDBError は新しいDBErrorを作成します
func NewDBError(err error, code, operation, table string) *DBError {
	return &DBError{
		Err:      err,
		Code:     code,
		Operation: operation,
		Table:    table,
	}
}

// IsNotFound はエラーがレコード未検出かどうかを判定します
func IsNotFound(err error) bool {
	return errors.Is(err, ErrRecordNotFound)
}

// IsDuplicateKey はエラーが一意制約違反かどうかを判定します
func IsDuplicateKey(err error) bool {
	return errors.Is(err, ErrDuplicateKey)
}

// IsValidationError はエラーがバリデーションエラーかどうかを判定します
func IsValidationError(err error) bool {
	return errors.Is(err, ErrValidationFailed)
}
