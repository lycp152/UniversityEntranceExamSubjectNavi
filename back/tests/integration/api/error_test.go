package api

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"university-exam-api/internal/errors"
	"university-exam-api/internal/handlers"
	"university-exam-api/internal/repositories"

	"github.com/labstack/echo/v4"
)

func TestAPIErrorHandling(t *testing.T) {
	// テスト用のデータベースをセットアップ
	db := repositories.SetupTestDB()
	if db == nil {
		t.Fatal("データベースの初期化に失敗しました")
	}

	// エコーインスタンスとハンドラーを作成
	e := echo.New()
	repo := repositories.NewUniversityRepository(db)
	handler := handlers.NewUniversityHandler(repo)

	tests := []struct {
		name           string
		setup         func(*testing.T) (*httptest.ResponseRecorder, echo.Context)
		expectedCode  int
		expectedError string
	}{
		{
			name: "存在しない大学のIDを指定した場合",
			setup: func(t *testing.T) (*httptest.ResponseRecorder, echo.Context) {
				req := httptest.NewRequest(http.MethodGet, "/universities/999", nil)
				rec := httptest.NewRecorder()
				c := e.NewContext(req, rec)
				c.SetParamNames("id")
				c.SetParamValues("999")
				return rec, c
			},
			expectedCode:  http.StatusNotFound,
			expectedError: "大学が見つかりません",
		},
		{
			name: "不正なIDを指定した場合",
			setup: func(t *testing.T) (*httptest.ResponseRecorder, echo.Context) {
				req := httptest.NewRequest(http.MethodGet, "/universities/invalid", nil)
				rec := httptest.NewRecorder()
				c := e.NewContext(req, rec)
				c.SetParamNames("id")
				c.SetParamValues("invalid")
				return rec, c
			},
			expectedCode:  http.StatusBadRequest,
			expectedError: "不正なIDが指定されました",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			rec, c := tt.setup(t)

			err := handler.GetUniversity(c)
			if err == nil {
				t.Error("エラーが期待されましたが、nilが返されました")
				return
			}

			if rec.Code != tt.expectedCode {
				t.Errorf("ステータスコードが一致しません: got %v want %v",
					rec.Code, tt.expectedCode)
			}

			httpError, ok := err.(*errors.HTTPError)
			if !ok {
				t.Errorf("*errors.HTTPErrorが期待されましたが、%Tが返されました", err)
				return
			}

			if httpError.Message != tt.expectedError {
				t.Errorf("エラーメッセージが一致しません: got %v want %v",
					httpError.Message, tt.expectedError)
			}
		})
	}
}
