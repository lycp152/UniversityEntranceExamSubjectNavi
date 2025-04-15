package middleware

import (
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

const (
	errExpectedError = "エラーが期待されましたが、nilが返されました"
	errUnexpectedType = "期待されるエラータイプは*echo.HTTPErrorですが、%Tが返されました"
	invalidToken = "invalid-token"
	errEnvSetFailed = "環境変数の設定に失敗しました: %v"
)

func TestGetTokenLength(t *testing.T) {
	tests := []struct {
		name     string
		envValue string
		want     int
	}{
		{
			name:     "デフォルト値を使用",
			envValue: "",
			want:     DefaultTokenLength,
		},
		{
			name:     "有効な値を使用",
			envValue: "32",
			want:     32,
		},
		{
			name:     "最小値未満の値はデフォルト値を使用",
			envValue: "16",
			want:     DefaultTokenLength,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if err := os.Setenv("CSRF_TOKEN_LENGTH", tt.envValue); err != nil {
				t.Fatalf(errEnvSetFailed, err)
			}

			got := getTokenLength()
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestGetTokenExpiration(t *testing.T) {
	tests := []struct {
		name     string
		envValue string
		want     time.Duration
	}{
		{
			name:     "デフォルト値を使用",
			envValue: "",
			want:     DefaultTokenExpiration,
		},
		{
			name:     "有効な値を使用",
			envValue: "24",
			want:     24 * time.Hour,
		},
		{
			name:     "最小値未満の値はデフォルト値を使用",
			envValue: "0",
			want:     DefaultTokenExpiration,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if err := os.Setenv("CSRF_TOKEN_EXPIRATION", tt.envValue); err != nil {
				t.Fatalf(errEnvSetFailed, err)
			}

			got := getTokenExpiration()
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestValidateRequestToken(t *testing.T) {
	e := echo.New()
	req := httptest.NewRequest(http.MethodPost, "/", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	// トークンが存在しない場合
	err := validateRequestToken(c)
	if err == nil {
		t.Fatal(errExpectedError)
	}

	httpErr, ok := err.(*echo.HTTPError)

	if !ok {
		t.Fatalf(errUnexpectedType, err)
	}

	assert.Equal(t, http.StatusForbidden, httpErr.Code)

	// 無効なトークンの場合
	req.Header.Set(CSRFTokenHeader, invalidToken)

	err = validateRequestToken(c)

	if err == nil {
		t.Fatal(errExpectedError)
	}

	httpErr, ok = err.(*echo.HTTPError)

	if !ok {
		t.Fatalf(errUnexpectedType, err)
	}

	assert.Equal(t, http.StatusForbidden, httpErr.Code)

	// 有効なトークンの場合
	token, _ := generateCSRFToken()

	tokenStore.Lock()
	tokenStore.tokens[token] = time.Now().Add(CSRFTokenExpiration)
	tokenStore.Unlock()
	req.Header.Set(CSRFTokenHeader, token)

	err = validateRequestToken(c)
	assert.NoError(t, err)
}

func TestGenerateCSRFToken(t *testing.T) {
	token1, err1 := generateCSRFToken()
	assert.NoError(t, err1)
	assert.NotEmpty(t, token1)

	token2, err2 := generateCSRFToken()
	assert.NoError(t, err2)
	assert.NotEmpty(t, token2)

	// 2つのトークンが異なることを確認
	assert.NotEqual(t, token1, token2)
}

func TestValidateCSRFToken(t *testing.T) {
	// テスト開始時にトークンストアをクリア
	tokenStore.Lock()
	tokenStore.tokens = make(map[string]time.Time)
	tokenStore.Unlock()

	// テスト用トークンの場合
	if err := os.Setenv("TEST_CSRF_TOKEN", "test-token"); err != nil {
		t.Fatalf(errEnvSetFailed, err)
	}

	assert.True(t, validateCSRFToken("test-token"))

	// テスト用トークンをクリア
	if err := os.Unsetenv("TEST_CSRF_TOKEN"); err != nil {
		t.Fatalf(errEnvSetFailed, err)
	}

	// 有効なトークンの場合
	token, _ := generateCSRFToken()

	tokenStore.Lock()
	tokenStore.tokens[token] = time.Now().Add(CSRFTokenExpiration)
	tokenStore.Unlock()
	assert.True(t, validateCSRFToken(token))

	// 無効なトークンの場合
	assert.False(t, validateCSRFToken(invalidToken))

	// 有効期限切れのトークンの場合
	expiredToken, _ := generateCSRFToken()

	tokenStore.Lock()
	tokenStore.tokens[expiredToken] = time.Now().Add(-1 * time.Hour)
	tokenStore.Unlock()
	assert.False(t, validateCSRFToken(expiredToken))

	// トークンストアが空の場合
	tokenStore.Lock()
	tokenStore.tokens = make(map[string]time.Time)
	tokenStore.Unlock()
	assert.False(t, validateCSRFToken(token))
}

func TestCSRFMiddleware(t *testing.T) {
	e := echo.New()
	handler := CSRFMiddleware()(func(c echo.Context) error {
		return c.String(http.StatusOK, "test")
	})

	// GETリクエストの場合
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	err := handler(c)
	assert.NoError(t, err)
	assert.NotEmpty(t, rec.Header().Get(CSRFTokenHeader))

	// POSTリクエスト（トークンなし）の場合
	req = httptest.NewRequest(http.MethodPost, "/", nil)
	rec = httptest.NewRecorder()
	c = e.NewContext(req, rec)
	err = handler(c)

	if err == nil {
		t.Fatal(errExpectedError)
	}

	httpErr, ok := err.(*echo.HTTPError)

	if !ok {
		t.Fatalf(errUnexpectedType, err)
	}

	assert.Equal(t, http.StatusForbidden, httpErr.Code)

	// POSTリクエスト（有効なトークン）の場合
	token, _ := generateCSRFToken()

	tokenStore.Lock()
	tokenStore.tokens[token] = time.Now().Add(CSRFTokenExpiration)
	tokenStore.Unlock()

	req = httptest.NewRequest(http.MethodPost, "/", nil)
	req.Header.Set(CSRFTokenHeader, token)

	rec = httptest.NewRecorder()
	c = e.NewContext(req, rec)
	err = handler(c)
	assert.NoError(t, err)
	assert.NotEmpty(t, rec.Header().Get(CSRFTokenHeader))

	// POSTリクエスト（無効なトークン）の場合
	req = httptest.NewRequest(http.MethodPost, "/", nil)
	req.Header.Set(CSRFTokenHeader, invalidToken)

	rec = httptest.NewRecorder()
	c = e.NewContext(req, rec)
	err = handler(c)

	if err == nil {
		t.Fatal(errExpectedError)
	}

	httpErr, ok = err.(*echo.HTTPError)

	if !ok {
		t.Fatalf(errUnexpectedType, err)
	}

	assert.Equal(t, http.StatusForbidden, httpErr.Code)
}
