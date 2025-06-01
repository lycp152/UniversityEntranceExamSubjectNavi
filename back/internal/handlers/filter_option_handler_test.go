package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"university-exam-api/internal/domain/models"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockFilterOptionUsecase はFilterOptionUsecaseのモックです
type MockFilterOptionUsecase struct {
	mock.Mock
}

func (m *MockFilterOptionUsecase) GetAllFilterOptions(ctx context.Context) ([]models.FilterOption, error) {
	args := m.Called(ctx)
	return args.Get(0).([]models.FilterOption), args.Error(1)
}

// GetFilterOptionsByCategory は指定されたカテゴリーのフィルターオプションを取得します
func (m *MockFilterOptionUsecase) GetFilterOptionsByCategory(
	ctx context.Context,
	category string,
) ([]models.FilterOption, error) {
	args := m.Called(ctx, category)
	return args.Get(0).([]models.FilterOption), args.Error(1)
}

// Response はAPIレスポンスの構造体です
type Response struct {
	Data  []models.FilterOption `json:"data,omitempty"`
	Error string                `json:"error,omitempty"`
}

func TestGetAllFilterOptions(t *testing.T) {
	tests := []struct {
		name           string
		mockOptions    []models.FilterOption
		mockError      error
		expectedStatus int
		expectedBody   Response
	}{
		{
			name: "正常系：フィルターオプションの取得",
			mockOptions: []models.FilterOption{
				{
					BaseModel: models.BaseModel{Version: 1},
					Category:  "REGION",
					Name:      "関東",
					DisplayOrder: 1,
				},
			},
			mockError:      nil,
			expectedStatus: http.StatusOK,
			expectedBody: Response{
				Data: []models.FilterOption{
					{
						BaseModel: models.BaseModel{Version: 1},
						Category:  "REGION",
						Name:      "関東",
						DisplayOrder: 1,
					},
				},
			},
		},
		{
			name:           "エラー系：データベースエラー",
			mockOptions:    nil,
			mockError:      assert.AnError,
			expectedStatus: http.StatusInternalServerError,
			expectedBody: Response{
				Error: "フィルターオプションの取得に失敗しました",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// モックの設定
			mockUsecase := new(MockFilterOptionUsecase)
			mockUsecase.On("GetAllFilterOptions", mock.Anything).Return(tt.mockOptions, tt.mockError)

			// ハンドラーの作成
			handler := NewFilterOptionHandler(mockUsecase)

			// Echoインスタンスの作成
			e := echo.New()
			req := httptest.NewRequest(http.MethodGet, "/api/filter-options", nil)
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			// テスト実行
			err := handler.GetAllFilterOptions(c)

			// アサーション
			assert.NoError(t, err)
			assert.Equal(t, tt.expectedStatus, rec.Code)

			var response Response
			err = json.Unmarshal(rec.Body.Bytes(), &response)
			assert.NoError(t, err)
			assert.Equal(t, tt.expectedBody, response)

			mockUsecase.AssertExpectations(t)
		})
	}
}

func TestGetFilterOptionsByCategory(t *testing.T) {
	tests := []struct {
		name           string
		category       string
		mockOptions    []models.FilterOption
		mockError      error
		expectedStatus int
		expectedBody   Response
	}{
		{
			name:     "正常系：カテゴリ別フィルターオプションの取得",
			category: "REGION",
			mockOptions: []models.FilterOption{
				{
					BaseModel: models.BaseModel{Version: 1},
					Category:  "REGION",
					Name:      "関東",
					DisplayOrder: 1,
				},
			},
			mockError:      nil,
			expectedStatus: http.StatusOK,
			expectedBody: Response{
				Data: []models.FilterOption{
					{
						BaseModel: models.BaseModel{Version: 1},
						Category:  "REGION",
						Name:      "関東",
						DisplayOrder: 1,
					},
				},
			},
		},
		{
			name:           "エラー系：データベースエラー",
			category:       "REGION",
			mockOptions:    nil,
			mockError:      assert.AnError,
			expectedStatus: http.StatusInternalServerError,
			expectedBody: Response{
				Error: "フィルターオプションの取得に失敗しました",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// モックの設定
			mockUsecase := new(MockFilterOptionUsecase)
			mockUsecase.On("GetFilterOptionsByCategory", mock.Anything, tt.category).Return(tt.mockOptions, tt.mockError)

			// ハンドラーの作成
			handler := NewFilterOptionHandler(mockUsecase)

			// Echoインスタンスの作成
			e := echo.New()
			req := httptest.NewRequest(http.MethodGet, "/api/filter-options/"+tt.category, nil)
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)
			c.SetPath("/api/filter-options/:category")
			c.SetParamNames("category")
			c.SetParamValues(tt.category)

			// テスト実行
			err := handler.GetFilterOptionsByCategory(c)

			// アサーション
			assert.NoError(t, err)
			assert.Equal(t, tt.expectedStatus, rec.Code)

			var response Response
			err = json.Unmarshal(rec.Body.Bytes(), &response)
			assert.NoError(t, err)
			assert.Equal(t, tt.expectedBody, response)

			mockUsecase.AssertExpectations(t)
		})
	}
}
