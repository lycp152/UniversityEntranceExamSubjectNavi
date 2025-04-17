// Package server はHTTPサーバーのルーティング設定のテストを提供します。
// このパッケージは以下の機能のテストを提供します：
// - ルーティングの初期化
// - パスパラメータのバリデーション
// - リクエストボディのバリデーション
// - ルーティングのセットアップ
package server

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"university-exam-api/internal/config"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// TestNewRoutes はNewRoutes関数のテストを行います。
// このテストは以下のケースを検証します：
// - 正常な初期化
// - インスタンスのプロパティ
func TestNewRoutes(t *testing.T) {
	t.Parallel()

	e := echo.New()
	db := &gorm.DB{}
	cfg := &config.Config{}

	routes := NewRoutes(e, db, cfg)

	assert.NotNil(t, routes)
	assert.Equal(t, e, routes.echo)
	assert.Equal(t, db, routes.db)
	assert.Equal(t, cfg, routes.cfg)
}

// TestValidatePathParams はパスパラメータのバリデーションのテストを行います。
// このテストは以下のケースを検証します：
// - 有効なパスパラメータ
// - 無効な大学ID
// - 無効な学部ID
// - 無効な科目ID
func TestValidatePathParams(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name           string
		universityID   string
		departmentID   string
		subjectID      string
		expectedStatus int
		expectedError  string
	}{
		{
			name:           "有効なパスパラメータ",
			universityID:   "1",
			departmentID:   "2",
			subjectID:      "3",
			expectedStatus: http.StatusOK,
		},
		{
			name:           "無効な大学ID",
			universityID:   "invalid",
			expectedStatus: http.StatusBadRequest,
			expectedError:  "大学IDは数値である必要があります",
		},
		{
			name:           "無効な学部ID",
			departmentID:   "invalid",
			expectedStatus: http.StatusBadRequest,
			expectedError:  "学部IDは数値である必要があります",
		},
		{
			name:           "無効な科目ID",
			subjectID:      "invalid",
			expectedStatus: http.StatusBadRequest,
			expectedError:  "科目IDは数値である必要があります",
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

			if tt.universityID != "" {
				c.SetParamNames("universityID")
				c.SetParamValues(tt.universityID)
			}

			if tt.departmentID != "" {
				c.SetParamNames("departmentID")
				c.SetParamValues(tt.departmentID)
			}

			if tt.subjectID != "" {
				c.SetParamNames("subjectID")
				c.SetParamValues(tt.subjectID)
			}

			handler := validatePathParams(func(c echo.Context) error {
				return c.String(http.StatusOK, "OK")
			})

			err := handler(c)

			if tt.expectedStatus == http.StatusOK {
				assert.NoError(t, err)
				assert.Equal(t, http.StatusOK, rec.Code)
			} else {
				assert.Error(t, err)
				he, ok := err.(*echo.HTTPError)
				assert.True(t, ok)
				assert.Equal(t, tt.expectedStatus, he.Code)
				assert.Equal(t, tt.expectedError, he.Message)
			}
		})
	}
}

// TestValidateRequestBody はリクエストボディのバリデーションのテストを行います。
// このテストは以下のケースを検証します：
// - 有効なリクエスト
// - 無効なContent-Type
// - リクエストボディが大きすぎる
func TestValidateRequestBody(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name           string
		contentType    string
		contentLength  int64
		body           string
		expectedStatus int
		expectedError  string
	}{
		{
			name:           "有効なリクエスト",
			contentType:    "application/json",
			contentLength:  100,
			body:          `{"name": "テスト大学"}`,
			expectedStatus: http.StatusOK,
		},
		{
			name:           "無効なContent-Type",
			contentType:    "text/plain",
			contentLength:  100,
			body:          `{"name": "テスト大学"}`,
			expectedStatus: http.StatusUnsupportedMediaType,
			expectedError:  "Content-Typeはapplication/jsonである必要があります",
		},
		{
			name:           "リクエストボディが大きすぎる",
			contentType:    "application/json",
			contentLength:  2 * 1024 * 1024,
			body:          `{"name": "テスト大学"}`,
			expectedStatus: http.StatusRequestEntityTooLarge,
			expectedError:  "リクエストボディのサイズが大きすぎます",
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			e := echo.New()
			req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(tt.body))
			req.Header.Set("Content-Type", tt.contentType)
			req.ContentLength = tt.contentLength
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			handler := validateRequestBody(func(c echo.Context) error {
				return c.String(http.StatusOK, "OK")
			})

			err := handler(c)

			if tt.expectedStatus == http.StatusOK {
				assert.NoError(t, err)
				assert.Equal(t, http.StatusOK, rec.Code)
			} else {
				assert.Error(t, err)
				he, ok := err.(*echo.HTTPError)
				assert.True(t, ok)
				assert.Equal(t, tt.expectedStatus, he.Code)
				assert.Equal(t, tt.expectedError, he.Message)
			}
		})
	}
}

// TestSetup はルーティングのセットアップのテストを行います。
// このテストは以下のケースを検証します：
// - ミドルウェアの設定
// - エラーハンドラーの設定
func TestSetup(t *testing.T) {
	t.Parallel()

	e := echo.New()

	// モックデータベース接続の作成
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("データベース接続の作成に失敗しました: %v", err)
	}

	// モック設定の作成
	cfg := &config.Config{
		Env: "test",
	}

	routes := NewRoutes(e, db, cfg)

	err = routes.Setup()
	assert.NoError(t, err)

	// ミドルウェアが正しく設定されていることを確認
	assert.NotNil(t, e.HTTPErrorHandler)
}
