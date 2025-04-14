package errors

import (
	"errors"
	"testing"

	"gorm.io/gorm"
)

const (
	resourceNotFoundMsg = "リソースが見つかりません"
)

func TestErrorError(t *testing.T) {
	tests := []struct {
		name     string
		err      *Error
		expected string
	}{
		{
			name: "エラーなし",
			err: &Error{
				Code:    CodeNotFound,
				Message: resourceNotFoundMsg,
			},
			expected: "NOT_FOUND: " + resourceNotFoundMsg,
		},
		{
			name: "エラーあり",
			err: &Error{
				Code:    CodeNotFound,
				Message: resourceNotFoundMsg,
				Err:     errors.New("内部エラー"),
			},
			expected: "NOT_FOUND: " + resourceNotFoundMsg + " (内部エラー)",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := tt.err.Error(); got != tt.expected {
				t.Errorf("Error() = %v, want %v", got, tt.expected)
			}
		})
	}
}

func TestErrorUnwrap(t *testing.T) {
	innerErr := errors.New("内部エラー")
	err := &Error{
		Code:    CodeNotFound,
		Message: resourceNotFoundMsg,
		Err:     innerErr,
	}

	if got := err.Unwrap(); got != innerErr {
		t.Errorf("Unwrap() = %v, want %v", got, innerErr)
	}
}

func TestErrorIs(t *testing.T) {
	err1 := &Error{Code: CodeNotFound}
	err2 := &Error{Code: CodeNotFound}
	err3 := &Error{Code: CodeInvalidInput}

	if !err1.Is(err2) {
		t.Errorf("Is() = false, want true")
	}

	if err1.Is(err3) {
		t.Errorf("Is() = true, want false")
	}
}

func TestErrorWithDetails(t *testing.T) {
	err := &Error{
		Code:    CodeNotFound,
		Message: resourceNotFoundMsg,
	}

	details := ErrorDetails{
		Resource: "User",
		ID:       1,
		Field:    "ID",
	}

	err = err.WithDetails(details)

	if err.Details.Resource != details.Resource {
		t.Errorf("WithDetails().Details.Resource = %v, want %v", err.Details.Resource, details.Resource)
	}

	if err.Details.ID != details.ID {
		t.Errorf("WithDetails().Details.ID = %v, want %v", err.Details.ID, details.ID)
	}

	if err.Details.Field != details.Field {
		t.Errorf("WithDetails().Details.Field = %v, want %v", err.Details.Field, details.Field)
	}
}

func TestErrorWithStack(t *testing.T) {
	err := &Error{
		Code:    CodeNotFound,
		Message: resourceNotFoundMsg,
	}

	err = err.WithStack()

	if len(err.Details.Stack) == 0 {
		t.Error("WithStack() did not add stack trace")
	}
}

func TestNewNotFoundError(t *testing.T) {
	err := NewNotFoundError("User", 1, nil)

	if err.Code != CodeNotFound {
		t.Errorf("NewNotFoundError().Code = %v, want %v", err.Code, CodeNotFound)
	}

	if err.Details.Resource != "User" {
		t.Errorf("NewNotFoundError().Details.Resource = %v, want %v", err.Details.Resource, "User")
	}

	if err.Details.ID != 1 {
		t.Errorf("NewNotFoundError().Details.ID = %v, want %v", err.Details.ID, 1)
	}
}

func TestNewInvalidInputError(t *testing.T) {
	err := NewInvalidInputError("Name", "無効な値", nil)

	if err.Code != CodeInvalidInput {
		t.Errorf("NewInvalidInputError().Code = %v, want %v", err.Code, CodeInvalidInput)
	}

	if err.Details.Field != "Name" {
		t.Errorf("NewInvalidInputError().Details.Field = %v, want %v", err.Details.Field, "Name")
	}
}

func TestNewDatabaseError(t *testing.T) {
	innerErr := errors.New("接続エラー")
	err := NewDatabaseError("SELECT", innerErr, nil)

	if err.Code != CodeDatabaseError {
		t.Errorf("NewDatabaseError().Code = %v, want %v", err.Code, CodeDatabaseError)
	}

	if err.Details.Operation != "SELECT" {
		t.Errorf("NewDatabaseError().Details.Operation = %v, want %v", err.Details.Operation, "SELECT")
	}
}

func TestTranslateDBError(t *testing.T) {
	tests := []struct {
		name     string
		err      error
		expected Code
	}{
		{
			name:     "RecordNotFound",
			err:      gorm.ErrRecordNotFound,
			expected: CodeNotFound,
		},
		{
			name:     "DuplicatedKey",
			err:      gorm.ErrDuplicatedKey,
			expected: CodeInvalidInput,
		},
		{
			name:     "Deadlock",
			err:      errors.New("deadlock detected"),
			expected: CodeDatabaseError,
		},
		{
			name:     "Connection",
			err:      errors.New("connection refused"),
			expected: CodeDatabaseError,
		},
		{
			name:     "Timeout",
			err:      errors.New("timeout"),
			expected: CodeTimeoutError,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			translatedErr := TranslateDBError(tt.err)
			if translatedErr == nil {
				t.Fatal("TranslateDBError() returned nil")
			}

			if err, ok := translatedErr.(*Error); !ok {
				t.Fatal("TranslateDBError() did not return *Error")
			} else if err.Code != tt.expected {
				t.Errorf("TranslateDBError().Code = %v, want %v", err.Code, tt.expected)
			}
		})
	}
}
