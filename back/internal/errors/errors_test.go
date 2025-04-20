// Package errors_test はerrorsパッケージのテストを提供します。
// このパッケージは以下のテストを含みます：
// 1. エラー型の基本機能のテスト
// 2. エラーチェーンの処理のテスト
// 3. エラー詳細情報のテスト
// 4. スタックトレースのテスト
// 5. 各種エラー生成関数のテスト
// 6. データベースエラーの変換テスト
package errors

import (
	"errors"
	"testing"

	"gorm.io/gorm"
)

// resourceNotFoundMsg はリソースが見つからない場合のエラーメッセージです
const (
	resourceNotFoundMsg = "リソースが見つかりません"
)

// TestErrorError はError型のError()メソッドのテストを行います
// 以下のケースをテストします：
// 1. 内部エラーがない場合のエラーメッセージ
// 2. 内部エラーがある場合のエラーメッセージ
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

// TestErrorUnwrap はError型のUnwrap()メソッドのテストを行います
// ラップされた内部エラーが正しく返されることを確認します
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

// TestErrorIs はError型のIs()メソッドのテストを行います
// 以下のケースをテストします：
// 1. 同じエラーコードを持つエラーの比較
// 2. 異なるエラーコードを持つエラーの比較
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

// TestErrorWithDetails はError型のWithDetails()メソッドのテストを行います
// エラーに詳細情報が正しく設定されることを確認します
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

// TestErrorWithStack はError型のWithStack()メソッドのテストを行います
// スタックトレースが正しく設定されることを確認します
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

// TestNewNotFoundError はNewNotFoundError()関数のテストを行います
// リソースが見つからないエラーが正しく生成されることを確認します
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

// TestNewInvalidInputError はNewInvalidInputError()関数のテストを行います
// 無効な入力エラーが正しく生成されることを確認します
func TestNewInvalidInputError(t *testing.T) {
	err := NewInvalidInputError("Name", "無効な値", nil)

	if err.Code != CodeInvalidInput {
		t.Errorf("NewInvalidInputError().Code = %v, want %v", err.Code, CodeInvalidInput)
	}

	if err.Details.Field != "Name" {
		t.Errorf("NewInvalidInputError().Details.Field = %v, want %v", err.Details.Field, "Name")
	}
}

// TestNewDatabaseError はNewDatabaseError()関数のテストを行います
// データベースエラーが正しく生成されることを確認します
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

// TestTranslateDBError はTranslateDBError()関数のテストを行います
// 以下のケースをテストします：
// 1. レコードが見つからないエラーの変換
// 2. 重複キーエラーの変換
// 3. デッドロックエラーの変換
// 4. 接続エラーの変換
// 5. タイムアウトエラーの変換
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
