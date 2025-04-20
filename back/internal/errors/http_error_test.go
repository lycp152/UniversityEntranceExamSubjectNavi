// Package errors はアプリケーション全体で使用されるエラー型とエラーハンドリング機能のテストを提供します。
// このパッケージはHTTPError型のテストを実装し、エラーハンドリングの正確性を検証します。
package errors

import (
	"errors"
	"testing"
)

// テストで使用する定数
const (
	// notFoundMessage は404エラーのメッセージを定義します
	notFoundMessage = "リソースが見つかりません"
	// httpPrefix はHTTPエラーのプレフィックスを定義します
	httpPrefix = "HTTP 404: "
	// badRequestMsg は400エラーのメッセージを定義します
	badRequestMsg = "無効なリクエスト"
	// unauthorizedMsg は401エラーのメッセージを定義します
	unauthorizedMsg = "認証が必要です"
	// forbiddenMsg は403エラーのメッセージを定義します
	forbiddenMsg = "アクセスが拒否されました"
	// internalServerMsg は500エラーのメッセージを定義します
	internalServerMsg = "内部サーバーエラー"
)

// TestHTTPErrorError はHTTPErrorのError()メソッドのテストを実装します
// 以下のケースをテストします：
// 1. エラーがない場合
// 2. 内部エラーがある場合
// 3. 詳細情報がある場合
// 4. エラーと詳細情報の両方がある場合
func TestHTTPErrorError(t *testing.T) {
	tests := []struct {
		name     string
		err      *HTTPError
		expected string
	}{
		{
			name: "エラーなし",
			err: &HTTPError{
				Code:    404,
				Message: notFoundMessage,
			},
			expected: httpPrefix + notFoundMessage,
		},
		{
			name: "エラーあり",
			err: &HTTPError{
				Code:    404,
				Message: notFoundMessage,
				Err:     errors.New("内部エラー"),
			},
			expected: httpPrefix + notFoundMessage + " (原因: 内部エラー)",
		},
		{
			name: "詳細あり",
			err: &HTTPError{
				Code:    404,
				Message: notFoundMessage,
				Details: map[string]string{
					"resource": "User",
					"id":       "1",
				},
			},
			expected: httpPrefix + notFoundMessage + " [詳細: map[id:1 resource:User]]",
		},
		{
			name: "エラーと詳細あり",
			err: &HTTPError{
				Code:    404,
				Message: notFoundMessage,
				Err:     errors.New("内部エラー"),
				Details: map[string]string{
					"resource": "User",
					"id":       "1",
				},
			},
			expected: httpPrefix + notFoundMessage + " (原因: 内部エラー) [詳細: map[id:1 resource:User]]",
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

// TestHTTPErrorUnwrap はHTTPErrorのUnwrap()メソッドのテストを実装します
// 内部エラーが正しく返されることを確認します
func TestHTTPErrorUnwrap(t *testing.T) {
	innerErr := errors.New("内部エラー")
	err := &HTTPError{
		Code:    404,
		Message: notFoundMessage,
		Err:     innerErr,
	}

	if got := err.Unwrap(); got != innerErr {
		t.Errorf("Unwrap() = %v, want %v", got, innerErr)
	}
}

// TestHTTPErrorWithDetails はHTTPErrorのWithDetails()メソッドのテストを実装します
// 詳細情報が正しく設定されることを確認します
func TestHTTPErrorWithDetails(t *testing.T) {
	err := &HTTPError{
		Code:    404,
		Message: notFoundMessage,
	}

	details := map[string]string{
		"resource": "User",
		"id":       "1",
	}

	err = err.WithDetails(details)

	if len(err.Details) != len(details) {
		t.Errorf("WithDetails().Details length = %v, want %v", len(err.Details), len(details))
	}

	for k, v := range details {
		if err.Details[k] != v {
			t.Errorf("WithDetails().Details[%s] = %v, want %v", k, err.Details[k], v)
		}
	}
}

// TestNewHTTPError はNewHTTPError()関数のテストを実装します
// エラーコード、メッセージ、内部エラーが正しく設定されることを確認します
func TestNewHTTPError(t *testing.T) {
	innerErr := errors.New("内部エラー")
	err := NewHTTPError(404, notFoundMessage, innerErr)

	if err.Code != 404 {
		t.Errorf("NewHTTPError().Code = %v, want %v", err.Code, 404)
	}

	if err.Message != notFoundMessage {
		t.Errorf("NewHTTPError().Message = %v, want %v", err.Message, notFoundMessage)
	}

	if err.Err != innerErr {
		t.Errorf("NewHTTPError().Err = %v, want %v", err.Err, innerErr)
	}
}

// TestNewBadRequestError はNewBadRequestError()関数のテストを実装します
// 400エラーが正しく作成されることを確認します
func TestNewBadRequestError(t *testing.T) {
	innerErr := errors.New("無効な入力")
	err := NewBadRequestError(badRequestMsg, innerErr)

	if err.Code != 400 {
		t.Errorf("NewBadRequestError().Code = %v, want %v", err.Code, 400)
	}

	if err.Message != badRequestMsg {
		t.Errorf("NewBadRequestError().Message = %v, want %v", err.Message, badRequestMsg)
	}

	if err.Err != innerErr {
		t.Errorf("NewBadRequestError().Err = %v, want %v", err.Err, innerErr)
	}
}

// TestNewUnauthorizedError はNewUnauthorizedError()関数のテストを実装します
// 401エラーが正しく作成されることを確認します
func TestNewUnauthorizedError(t *testing.T) {
	innerErr := errors.New("認証エラー")
	err := NewUnauthorizedError(unauthorizedMsg, innerErr)

	if err.Code != 401 {
		t.Errorf("NewUnauthorizedError().Code = %v, want %v", err.Code, 401)
	}

	if err.Message != unauthorizedMsg {
		t.Errorf("NewUnauthorizedError().Message = %v, want %v", err.Message, unauthorizedMsg)
	}

	if err.Err != innerErr {
		t.Errorf("NewUnauthorizedError().Err = %v, want %v", err.Err, innerErr)
	}
}

// TestNewForbiddenError はNewForbiddenError()関数のテストを実装します
// 403エラーが正しく作成されることを確認します
func TestNewForbiddenError(t *testing.T) {
	innerErr := errors.New("権限エラー")
	err := NewForbiddenError(forbiddenMsg, innerErr)

	if err.Code != 403 {
		t.Errorf("NewForbiddenError().Code = %v, want %v", err.Code, 403)
	}

	if err.Message != forbiddenMsg {
		t.Errorf("NewForbiddenError().Message = %v, want %v", err.Message, forbiddenMsg)
	}

	if err.Err != innerErr {
		t.Errorf("NewForbiddenError().Err = %v, want %v", err.Err, innerErr)
	}
}

// TestNewHTTPNotFoundError はNewHTTPNotFoundError()関数のテストを実装します
// 404エラーが正しく作成されることを確認します
func TestNewHTTPNotFoundError(t *testing.T) {
	innerErr := errors.New("リソースが見つかりません")
	err := NewHTTPNotFoundError(notFoundMessage, innerErr)

	if err.Code != 404 {
		t.Errorf("NewHTTPNotFoundError().Code = %v, want %v", err.Code, 404)
	}

	if err.Message != notFoundMessage {
		t.Errorf("NewHTTPNotFoundError().Message = %v, want %v", err.Message, notFoundMessage)
	}

	if err.Err != innerErr {
		t.Errorf("NewHTTPNotFoundError().Err = %v, want %v", err.Err, innerErr)
	}
}

// TestNewInternalServerError はNewInternalServerError()関数のテストを実装します
// 500エラーが正しく作成されることを確認します
func TestNewInternalServerError(t *testing.T) {
	innerErr := errors.New("サーバーエラー")
	err := NewInternalServerError(internalServerMsg, innerErr)

	if err.Code != 500 {
		t.Errorf("NewInternalServerError().Code = %v, want %v", err.Code, 500)
	}

	if err.Message != internalServerMsg {
		t.Errorf("NewInternalServerError().Message = %v, want %v", err.Message, internalServerMsg)
	}

	if err.Err != innerErr {
		t.Errorf("NewInternalServerError().Err = %v, want %v", err.Err, innerErr)
	}
}
