// Package errors はエラーハンドラーのテストを提供します。
// このパッケージは以下のテストを提供します：
// - エラーラップのテスト
// - アプリケーションエラーのテスト
// - エラー文字列表現のテスト
package errors

import (
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
)

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
