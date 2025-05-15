package security

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	applogger "university-exam-api/internal/logger"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

const testCSRFTokenPath = "/csrf-token"

// mockService は Service インターフェースのモックです。
type mockService struct {
	GenerateCSRFTokenFunc func(ctx context.Context) (interface{}, error)
}

func (m *mockService) GenerateCSRFToken(ctx context.Context) (interface{}, error) {
	return m.GenerateCSRFTokenFunc(ctx)
}

// --- Handler.GetCSRFToken 正常系テスト ---
func TestGetCSRFTokenSuccess(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	ms := &mockService{
		GenerateCSRFTokenFunc: func(_ context.Context) (interface{}, error) {
			return "test-csrf-token", nil
		},
	}
	h := NewHandler(ms, 2*time.Second)

	req := httptest.NewRequest(http.MethodGet, testCSRFTokenPath, nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := h.GetCSRFToken(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Contains(t, rec.Body.String(), "test-csrf-token")
}

// --- Handler.GetCSRFToken Serviceエラー時 ---
func TestGetCSRFTokenServiceError(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	ms := &mockService{
		GenerateCSRFTokenFunc: func(_ context.Context) (interface{}, error) {
			return nil, errors.New("CSRF生成失敗")
		},
	}
	h := NewHandler(ms, 2*time.Second)

	req := httptest.NewRequest(http.MethodGet, testCSRFTokenPath, nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := h.GetCSRFToken(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusInternalServerError, rec.Code)
	assert.Contains(t, rec.Body.String(), "エラー")
}

// --- Handler.GetCSRFToken トークン型不正時 ---
func TestGetCSRFTokenInvalidTokenType(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	ms := &mockService{
		GenerateCSRFTokenFunc: func(_ context.Context) (interface{}, error) {
			return 12345, nil
		},
	}
	h := NewHandler(ms, 2*time.Second)

	req := httptest.NewRequest(http.MethodGet, testCSRFTokenPath, nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := h.GetCSRFToken(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusInternalServerError, rec.Code)
	assert.Contains(t, rec.Body.String(), "型が不正")
}

// --- Middlewareのヘッダー付与テスト ---
func TestMiddlewareSetsSecurityHeaders(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	e.Use(Middleware())
	e.GET("/", func(c echo.Context) error {
		return c.String(http.StatusOK, "ok")
	})

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Equal(t, "ok", rec.Body.String())
	assert.Equal(t, ValueNoSniff, rec.Header().Get(HeaderXContentTypeOptions))
	assert.Equal(t, ValueDeny, rec.Header().Get(HeaderXFrameOptions))
	assert.Equal(t, ValueXSSProtection, rec.Header().Get(HeaderXXSSProtection))
	assert.Equal(t, ValueHSTS, rec.Header().Get(HeaderStrictTransportSecurity))
	assert.Equal(t, ValueCSP, rec.Header().Get(HeaderContentSecurityPolicy))
	assert.Equal(t, ValueReferrerPolicy, rec.Header().Get(HeaderReferrerPolicy))
}
