// Package errors はエラーハンドラーのテストを提供します。
// このパッケージは以下のテストを提供します：
// - エラーラップのテスト
// - アプリケーションエラーのテスト
// - エラー文字列表現のテスト
package errors

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	apperrors "university-exam-api/internal/errors"
	applogger "university-exam-api/internal/logger"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

const ValidationErrorMsg = "バリデーションエラー"

// TestWrapError はエラーラップのテストを行います。
// このテストは以下のケースを検証します：
// - 基本的なエラーラップ
// - nilエラーの処理
// - コードのみ指定の場合
func TestWrapError(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		err      error
		code     string
		message  string
		wantErr  bool
	}{
		{
			name:     "正常系: 基本的なエラーラップ",
			err:      errors.New("オリジナルエラー"),
			code:     ErrInvalidRequestBody,
			message:  MsgInvalidRequestBody,
			wantErr:  true,
		},
		{
			name:     "正常系: nilエラー",
			err:      nil,
			code:     "",
			message:  "",
			wantErr:  false,
		},
		{
			name:     "異常系: コードのみ指定",
			err:      errors.New("オリジナルエラー"),
			code:     ErrInvalidRequestBody,
			message:  "",
			wantErr:  true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			err := WrapError(tt.err, tt.code, tt.message)

			if tt.wantErr {
				assert.Error(t, err)

				var appErr *AppError

				assert.True(t, errors.As(err, &appErr))

				if appErr != nil {
					assert.Equal(t, tt.code, appErr.Code)
					assert.Contains(t, appErr.Message, tt.message)
				}
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

// TestNewAppError はアプリケーションエラーのテストを行います。
// このテストは以下のケースを検証します：
// - 基本的なエラー作成
// - 空のメッセージの場合
func TestNewAppError(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		code    string
		message string
	}{
		{
			name:    "正常系: 基本的なエラー作成",
			code:    ErrInvalidRequestBody,
			message: MsgInvalidRequestBody,
		},
		{
			name:    "正常系: 空のメッセージ",
			code:    ErrInvalidRequestBody,
			message: "",
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			err := NewAppError(tt.code, tt.message)
			assert.NotNil(t, err)
			assert.Equal(t, tt.code, err.Code)
			assert.Equal(t, tt.message, err.Message)
		})
	}
}

// TestAppErrorError はエラー文字列表現のテストを行います。
// このテストは以下のケースを検証します：
// - コードとメッセージありの場合
// - メッセージなしの場合
func TestAppErrorError(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		appErr  *AppError
		want    string
	}{
		{
			name: "正常系: コードとメッセージあり",
			appErr: &AppError{
				Code:    ErrInvalidRequestBody,
				Message: MsgInvalidRequestBody,
			},
			want: "code=INVALID_REQUEST_BODY, message=リクエストボディが不正です",
		},
		{
			name: "正常系: メッセージなし",
			appErr: &AppError{
				Code: ErrInvalidRequestBody,
			},
			want: "code=INVALID_REQUEST_BODY, message=",
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.appErr.Error())
		})
	}
}

// TestNewValidationError はバリデーションエラーの生成をテストします。
func TestNewValidationError(t *testing.T) {
	t.Parallel()

	message := ValidationErrorMsg
	err := NewValidationError(message)

	var appErr *apperrors.Error

	assert.True(t, errors.As(err, &appErr))
	assert.Equal(t, apperrors.Code(Validation), appErr.Code)
	assert.Equal(t, message, appErr.Message)
}

// TestNewRateLimitError はレート制限エラーの生成をテストします。
func TestNewRateLimitError(t *testing.T) {
	t.Parallel()

	message := "レート制限を超えました"
	err := NewRateLimitError(message)

	var appErr *apperrors.Error

	assert.True(t, errors.As(err, &appErr))
	assert.Equal(t, apperrors.Code(RateLimit), appErr.Code)
	assert.Equal(t, message, appErr.Message)
}

// TestNewRequestTooLargeError はリクエストサイズエラーの生成をテストします。
func TestNewRequestTooLargeError(t *testing.T) {
	t.Parallel()

	message := "リクエストサイズが大きすぎます"
	err := NewRequestTooLargeError(message)

	var appErr *apperrors.Error

	assert.True(t, errors.As(err, &appErr))
	assert.Equal(t, apperrors.Code(RequestTooLarge), appErr.Code)
	assert.Equal(t, message, appErr.Message)
}

// TestNewInvalidContentTypeError はコンテンツタイプエラーの生成をテストします。
func TestNewInvalidContentTypeError(t *testing.T) {
	t.Parallel()

	message := "不正なコンテンツタイプです"
	err := NewInvalidContentTypeError(message)

	var appErr *apperrors.Error

	assert.True(t, errors.As(err, &appErr))
	assert.Equal(t, apperrors.Code(InvalidContentType), appErr.Code)
	assert.Equal(t, message, appErr.Message)
}

// TestHandleError はエラーハンドリングをテストします。
func TestHandleError(t *testing.T) {
	t.Parallel()
	applogger.InitTestLogger()

	tests := []struct {
		name          string
		err          error
		expectedCode int
		expectedBody map[string]interface{}
	}{
		{
			name: "バリデーションエラー",
			err:  NewValidationError(ValidationErrorMsg),
			expectedCode: http.StatusBadRequest,
			expectedBody: map[string]interface{}{
				"code":    Validation,
				"message": ValidationErrorMsg,
			},
		},
		{
			name: "予期せぬエラー",
			err:  errors.New("予期せぬエラー"),
			expectedCode: http.StatusInternalServerError,
			expectedBody: map[string]interface{}{
				"code":    InternalServerError,
				"message": "サーバー内部でエラーが発生しました",
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			e := echo.New()
			req := httptest.NewRequest(http.MethodGet, "/", nil)
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			err := HandleError(c, tt.err)
			assert.NoError(t, err)
			assert.Equal(t, tt.expectedCode, rec.Code)

			var response map[string]interface{}
			err = json.Unmarshal(rec.Body.Bytes(), &response)
			assert.NoError(t, err)
			assert.Equal(t, tt.expectedBody["code"], response["code"])
			assert.Equal(t, tt.expectedBody["message"], response["message"])
		})
	}
}

// TestGetStatusCode はHTTPステータスコードの取得をテストします。
func TestGetStatusCode(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		code     string
		expected int
	}{
		{
			name:     "NotFound",
			code:     NotFound,
			expected: http.StatusNotFound,
		},
		{
			name:     "InvalidInput",
			code:     InvalidInput,
			expected: http.StatusBadRequest,
		},
		{
			name:     "Authentication",
			code:     Authentication,
			expected: http.StatusUnauthorized,
		},
		{
			name:     "Authorization",
			code:     Authorization,
			expected: http.StatusForbidden,
		},
		{
			name:     "RateLimit",
			code:     RateLimit,
			expected: http.StatusTooManyRequests,
		},
		{
			name:     "RequestTooLarge",
			code:     RequestTooLarge,
			expected: http.StatusRequestEntityTooLarge,
		},
		{
			name:     "InvalidContentType",
			code:     InvalidContentType,
			expected: http.StatusUnsupportedMediaType,
		},
		{
			name:     "Unknown",
			code:     "UNKNOWN",
			expected: http.StatusInternalServerError,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.expected, getStatusCode(tt.code))
		})
	}
}
