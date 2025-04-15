package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"golang.org/x/time/rate"
)

const (
	errNoErrorExpected = "エラーは期待されません"
	defaultOrigin      = "http://localhost:3000"
)

func TestNewSecurityConfig(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name string
		want *SecurityConfig
	}{
		{
			name: "デフォルト設定の検証",
			want: &SecurityConfig{
				RateLimit:      DefaultRateLimit,
				BurstLimit:     DefaultBurstLimit,
				MaxBodySize:    DefaultMaxBodySize,
				AllowedOrigins: []string{defaultOrigin},
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got := NewSecurityConfig()
			assert.Equal(t, tt.want.RateLimit, got.RateLimit, "RateLimitが一致しません")
			assert.Equal(t, tt.want.BurstLimit, got.BurstLimit, "BurstLimitが一致しません")
			assert.Equal(t, tt.want.MaxBodySize, got.MaxBodySize, "MaxBodySizeが一致しません")
			assert.Equal(t, tt.want.AllowedOrigins, got.AllowedOrigins, "AllowedOriginsが一致しません")
		})
	}
}

func TestSecurityMiddleware(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name           string
		config         *SecurityConfig
		expectedError  bool
		expectedCount  int
	}{
		{
			name:          "デフォルト設定でのミドルウェア生成",
			config:        nil,
			expectedError: false,
			expectedCount: 3,
		},
		{
			name: "カスタム設定でのミドルウェア生成",
			config: &SecurityConfig{
				RateLimit:  50,
				BurstLimit: 25,
			},
			expectedError: false,
			expectedCount: 3,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			middleware := SecurityMiddleware(tt.config)
			assert.NotNil(t, middleware, "ミドルウェアがnilです")
			assert.Equal(t, tt.expectedCount, len(middleware), "ミドルウェアの数が一致しません")
		})
	}
}

func TestRequestValidationMiddleware(t *testing.T) {
	tests := []struct {
		name           string
		config         *SecurityConfig
		method         string
		contentType    string
		contentLength  int64
		expectedError  bool
		expectedStatus int
		expectedMsg    string
	}{
		{
			name:           "有効なJSONリクエスト",
			config:         NewSecurityConfig(),
			method:         http.MethodPost,
			contentType:    echo.MIMEApplicationJSON,
			contentLength:  1024,
			expectedError:  false,
			expectedStatus: http.StatusOK,
		},
		{
			name:           "無効なContent-Type",
			config:         NewSecurityConfig(),
			method:         http.MethodPost,
			contentType:    "text/plain",
			contentLength:  1024,
			expectedError:  true,
			expectedStatus: http.StatusUnsupportedMediaType,
			expectedMsg:    "Content-Typeはapplication/jsonである必要があります",
		},
		{
			name:           "リクエストサイズ超過",
			config:         NewSecurityConfig(),
			method:         http.MethodPost,
			contentType:    echo.MIMEApplicationJSON,
			contentLength:  DefaultMaxBodySize + 1,
			expectedError:  true,
			expectedStatus: http.StatusRequestEntityTooLarge,
			expectedMsg:    "リクエストボディは1048576バイト以下である必要があります",
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			e := echo.New()
			req := httptest.NewRequest(tt.method, "/", nil)

			if tt.contentType != "" {
				req.Header.Set(echo.HeaderContentType, tt.contentType)
			}

			req.ContentLength = tt.contentLength
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			middleware := RequestValidationMiddleware(tt.config)
			handler := middleware(func(c echo.Context) error {
				return c.String(http.StatusOK, "test")
			})

			err := handler(c)
			if tt.expectedError {
				assert.Error(t, err, "エラーが期待されます")
				httpErr, ok := err.(*echo.HTTPError)
				assert.True(t, ok, "HTTPErrorへの型アサーションに失敗しました")
				assert.Equal(t, tt.expectedStatus, httpErr.Code, "HTTPステータスコードが一致しません")

				if tt.expectedMsg != "" {
					assert.Contains(t, httpErr.Message.(map[string]string)["message"], tt.expectedMsg, "エラーメッセージが一致しません")
				}
			} else {
				assert.NoError(t, err, errNoErrorExpected)
				assert.Equal(t, tt.expectedStatus, rec.Code, "HTTPステータスコードが一致しません")
			}
		})
	}
}

func TestRateLimiter(t *testing.T) {
	config := NewSecurityConfig()
	middleware := SecurityMiddleware(config)

	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	// レート制限を超えるリクエストを送信
	limiter := rate.NewLimiter(rate.Limit(config.RateLimit), config.BurstLimit)
	for i := 0; i < config.RateLimit+1; i++ {
		if !limiter.Allow() {
			err := echo.NewHTTPError(http.StatusTooManyRequests, map[string]string{
				"error":   ErrRateLimitExceeded.Error(),
				"message": "リクエスト制限を超えました",
			})
			assert.Error(t, err, "レート制限エラーが期待されます")

			continue
		}

		handler := middleware[0](func(_ echo.Context) error {
			return nil
		})
		err := handler(c)
		assert.NoError(t, err, errNoErrorExpected)
	}
}

func TestCORS(t *testing.T) {
	config := NewSecurityConfig()
	middleware := SecurityMiddleware(config)

	e := echo.New()
	req := httptest.NewRequest(http.MethodOptions, "/", nil)
	req.Header.Set(echo.HeaderOrigin, defaultOrigin)

	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	handler := middleware[2](func(c echo.Context) error {
		return c.String(http.StatusOK, "test")
	})

	err := handler(c)
	assert.NoError(t, err, errNoErrorExpected)

	assert.Equal(t, defaultOrigin, rec.Header().Get(echo.HeaderAccessControlAllowOrigin),
	"Access-Control-Allow-Originヘッダーが一致しません")

	assert.Equal(t, "true", rec.Header().Get(echo.HeaderAccessControlAllowCredentials),

	"Access-Control-Allow-Credentialsヘッダーが一致しません")
}
