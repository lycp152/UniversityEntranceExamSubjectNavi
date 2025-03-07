package handlers

import (
	"encoding/json"
	"net/http/httptest"
	"testing"
	"university-exam-api/internal/repositories"

	"github.com/labstack/echo/v4"
)

// setupTestHandler はテスト用のEchoインスタンスとハンドラーを作成します
func setupTestHandler() (*echo.Echo, *UniversityHandler) {
	e := echo.New()
	db := repositories.SetupTestDB()
	repo := repositories.NewUniversityRepository(db)
	handler := NewUniversityHandler(repo)
	return e, handler
}

// executeRequest はテストリクエストを実行します
func executeRequest(e *echo.Echo, method, path string, handler echo.HandlerFunc) *httptest.ResponseRecorder {
	req := httptest.NewRequest(method, path, nil)
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	_ = handler(c)
	return rec
}

// parseResponse はレスポンスボディをパースします
func parseResponse(rec *httptest.ResponseRecorder, v interface{}) error {
	return json.NewDecoder(rec.Body).Decode(v)
}

// validateErrorResponse はエラーレスポンスを検証します
func validateErrorResponse(t testing.TB, rec *httptest.ResponseRecorder, wantStatus int, wantError string) {
	t.Helper()

	if rec.Code != wantStatus {
		t.Errorf("status code = %v, want %v", rec.Code, wantStatus)
	}

	var resp struct {
		Error string `json:"error"`
	}
	if err := parseResponse(rec, &resp); err != nil {
		t.Fatalf("Failed to parse error response: %v", err)
	}

	if resp.Error != wantError {
		t.Errorf("error message = %v, want %v", resp.Error, wantError)
	}
}
