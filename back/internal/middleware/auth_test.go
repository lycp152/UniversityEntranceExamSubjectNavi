// Package middleware はアプリケーションのミドルウェアのテストを提供します
package middleware

import (
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

// TestValidateAuthHeader は認証ヘッダーの検証をテストします
func TestValidateAuthHeader(t *testing.T) {
	tests := []struct {
		name     string
		auth     string
		want     string
		wantErr  bool
		wantCode int
	}{
		{
			name:     "正常なBearerトークン",
			auth:     "Bearer valid_token",
			want:     "valid_token",
			wantErr:  false,
			wantCode: 0,
		},
		{
			name:     "空のヘッダー",
			auth:     "",
			want:     "",
			wantErr:  true,
			wantCode: http.StatusUnauthorized,
		},
		{
			name:     "不正なプレフィックス",
			auth:     "Basic invalid_token",
			want:     "",
			wantErr:  true,
			wantCode: http.StatusUnauthorized,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := validateAuthHeader(tt.auth)
			if tt.wantErr {
				assert.Error(t, err)

				if authErr, ok := err.(*AuthError); ok {
					assert.Equal(t, tt.wantCode, authErr.Code)
				}
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.want, got)
			}
		})
	}
}

// TestValidateToken はトークンの検証をテストします
func TestValidateToken(t *testing.T) {
	// テスト用のJWTシークレットを設定
	err := os.Setenv("JWT_SECRET", "test_secret_that_is_long_enough_for_jwt")
	if err != nil {
		t.Fatalf("JWT_SECRETの設定に失敗しました: %v", err)
	}

	// 有効なトークンを作成
	claims := jwt.MapClaims{
		"sub":  "test_user",
		"role": "admin",
		"exp":  time.Now().Add(TokenExpiration).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	validToken, _ := token.SignedString([]byte(os.Getenv("JWT_SECRET")))

	tests := []struct {
		name     string
		token    string
		wantErr  bool
		wantCode int
	}{
		{
			name:     "有効なトークン",
			token:    validToken,
			wantErr:  false,
			wantCode: 0,
		},
		{
			name:     "無効なトークン",
			token:    "invalid_token",
			wantErr:  true,
			wantCode: http.StatusUnauthorized,
		},
		{
			name:     "期限切れのトークン",
			token:    "expired_token",
			wantErr:  true,
			wantCode: http.StatusUnauthorized,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := validateToken(tt.token)
			if tt.wantErr {
				assert.Error(t, err)

				if authErr, ok := err.(*AuthError); ok {
					assert.Equal(t, tt.wantCode, authErr.Code)
				}
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

// TestAuthorizeRole はロールベースの認可をテストします
func TestAuthorizeRole(t *testing.T) {
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rec := httptest.NewRecorder()

	tests := []struct {
		name     string
		user     interface{}
		roles    []string
		wantErr  bool
		wantCode int
	}{
		{
			name:     "許可されたロール",
			user:     map[string]string{"role": "admin"},
			roles:    []string{"admin"},
			wantErr:  false,
			wantCode: 0,
		},
		{
			name:     "許可されていないロール",
			user:     map[string]string{"role": "user"},
			roles:    []string{"admin"},
			wantErr:  true,
			wantCode: http.StatusForbidden,
		},
		{
			name:     "ユーザー情報なし",
			user:     nil,
			roles:    []string{"admin"},
			wantErr:  true,
			wantCode: http.StatusForbidden,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// 新しいコンテキストを作成
			c := e.NewContext(req, rec)

			if tt.user != nil {
				c.Set("user", tt.user)
			}

			middleware := AuthorizeRole(tt.roles...)
			err := middleware(func(_ echo.Context) error {
				return nil
			})(c)

			if tt.wantErr {
				assert.Error(t, err)

				if he, ok := err.(*echo.HTTPError); ok {
					assert.Equal(t, tt.wantCode, he.Code)
				}
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

// TestIsPublicPath は公開パスの判定をテストします
func TestIsPublicPath(t *testing.T) {
	tests := []struct {
		name string
		path string
		want bool
	}{
		{
			name: "公開パス",
			path: "/api/universities",
			want: true,
		},
		{
			name: "公開パスのサブパス",
			path: "/api/universities/1",
			want: true,
		},
		{
			name: "非公開パス",
			path: "/api/private",
			want: false,
		},
		{
			name: "CSRFトークン取得パス",
			path: "/csrf",
			want: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := isPublicPath(tt.path)
			assert.Equal(t, tt.want, got)
		})
	}
}
