package errors

import (
	"errors"
	"testing"
)

const (
	notFoundMessage = "リソースが見つかりません"
	httpPrefix      = "HTTP 404: "
	badRequestMsg   = "無効なリクエスト"
	unauthorizedMsg = "認証が必要です"
	forbiddenMsg    = "アクセスが拒否されました"
	internalServerMsg = "内部サーバーエラー"
)

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
