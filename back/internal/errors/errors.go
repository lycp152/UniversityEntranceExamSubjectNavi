package errors

import (
	"fmt"
)

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
