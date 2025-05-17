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

const errMsgFormat = "Expected error message '%s', got '%s'"

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

func TestNewValidationError(t *testing.T) {
	field := "email"
	message := "invalid format"
	extra := map[string]string{"format": "RFC5322"}

	err := NewValidationError(field, message, extra)
	if err == nil {
		t.Error("NewValidationError should not return nil")
	}

	expectedMsg := "VALIDATION_ERROR: フィールド email のバリデーションに失敗しました: invalid format"

	if err.Error() != expectedMsg {
		t.Errorf(errMsgFormat, expectedMsg, err.Error())
	}

	if err.Details.Field != field {
		t.Errorf("Expected field '%s', got '%s'", field, err.Details.Field)
	}

	if err.Details.Extra["format"] != extra["format"] {
		t.Errorf("Expected extra format '%s', got '%s'", extra["format"], err.Details.Extra["format"])
	}
}

func TestNewSystemError(t *testing.T) {
	message := "system error"
	originalErr := NewValidationError("test", "test error", nil)
	extra := map[string]string{"component": "database"}

	err := NewSystemError(message, originalErr, extra)
	if err == nil {
		t.Error("NewSystemError should not return nil")
	}

	expectedMsg := "SYSTEM_ERROR: system error (VALIDATION_ERROR: フィールド test のバリデーションに失敗しました: test error)"

	if err.Error() != expectedMsg {
		t.Errorf(errMsgFormat, expectedMsg, err.Error())
	}

	if err.Err != originalErr {
		t.Error("Original error should be preserved")
	}

	if err.Details.Extra["component"] != extra["component"] {
		t.Errorf("Expected extra component '%s', got '%s'", extra["component"], err.Details.Extra["component"])
	}
}

func TestNewAuthenticationError(t *testing.T) {
	message := "authentication failed"
	extra := map[string]string{"reason": "invalid token"}

	err := NewAuthenticationError(message, extra)
	if err == nil {
		t.Error("NewAuthenticationError should not return nil")
	}

	expectedMsg := "AUTHENTICATION_ERROR: authentication failed"

	if err.Error() != expectedMsg {
		t.Errorf(errMsgFormat, expectedMsg, err.Error())
	}

	if err.Details.Extra["reason"] != extra["reason"] {
		t.Errorf("Expected extra reason '%s', got '%s'", extra["reason"], err.Details.Extra["reason"])
	}
}

func TestNewAuthorizationError(t *testing.T) {
	message := "unauthorized access"
	extra := map[string]string{"resource": "admin panel"}

	err := NewAuthorizationError(message, extra)
	if err == nil {
		t.Error("NewAuthorizationError should not return nil")
	}

	expectedMsg := "AUTHORIZATION_ERROR: unauthorized access"

	if err.Error() != expectedMsg {
		t.Errorf(errMsgFormat, expectedMsg, err.Error())
	}

	if err.Details.Extra["resource"] != extra["resource"] {
		t.Errorf("Expected extra resource '%s', got '%s'", extra["resource"], err.Details.Extra["resource"])
	}
}

func TestNewExternalAPIError(t *testing.T) {
	service := "payment"
	message := "API call failed"
	originalErr := NewValidationError("test", "test error", nil)
	extra := map[string]string{"endpoint": "/v1/payments"}

	err := NewExternalAPIError(service, message, originalErr, extra)
	if err == nil {
		t.Error("NewExternalAPIError should not return nil")
	}

	expectedMsg := "EXTERNAL_API_ERROR: 外部API 'payment' " +
		"でエラーが発生しました: API call failed " +
		"(VALIDATION_ERROR: フィールド test のバリデーションに失敗しました: test error)"

	if err.Error() != expectedMsg {
		t.Errorf(errMsgFormat, expectedMsg, err.Error())
	}

	if err.Err != originalErr {
		t.Error("Original error should be preserved")
	}

	if err.Details.Service != service {
		t.Errorf("Expected service '%s', got '%s'", service, err.Details.Service)
	}

	if err.Details.Extra["endpoint"] != extra["endpoint"] {
		t.Errorf("Expected extra endpoint '%s', got '%s'", extra["endpoint"], err.Details.Extra["endpoint"])
	}
}

func TestNewRateLimitError(t *testing.T) {
	message := "rate limit exceeded"
	extra := map[string]string{"limit": "100", "window": "1h"}

	err := NewRateLimitError(message, extra)
	if err == nil {
		t.Error("NewRateLimitError should not return nil")
	}

	expectedMsg := "RATE_LIMIT_ERROR: rate limit exceeded"

	if err.Error() != expectedMsg {
		t.Errorf(errMsgFormat, expectedMsg, err.Error())
	}

	if err.Details.Extra["limit"] != extra["limit"] {
		t.Errorf("Expected extra limit '%s', got '%s'", extra["limit"], err.Details.Extra["limit"])
	}

	if err.Details.Extra["window"] != extra["window"] {
		t.Errorf("Expected extra window '%s', got '%s'", extra["window"], err.Details.Extra["window"])
	}
}
