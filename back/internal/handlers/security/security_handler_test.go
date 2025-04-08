package security

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
	"university-exam-api/internal/testutils"

	"github.com/labstack/echo/v4"
)

// securityTestCase はセキュリティ関連のテストケースを定義します
type securityTestCase struct {
	name           string
	wantStatus     int
	wantError      string
	validateHeaders func(*testing.T, http.Header)
	setupContext   func(echo.Context)
}

// validateSecurityHeaders はセキュリティヘッダーの検証を行います
func validateSecurityHeaders(t *testing.T, headers http.Header) {
	t.Helper()

	requiredHeaders := map[string]string{
		HeaderXContentTypeOptions: ValueNoSniff,
		HeaderXFrameOptions: ValueDeny,
		HeaderXXSSProtection: ValueXSSProtection,
		HeaderStrictTransportSecurity: ValueHSTS,
		HeaderContentSecurityPolicy: ValueCSP,
		HeaderReferrerPolicy: ValueReferrerPolicy,
	}

	for key, want := range requiredHeaders {
		got := headers.Get(key)
		if got != want {
			t.Errorf("セキュリティヘッダー %s の値が不正です: got = %v, want = %v", key, got, want)
		}
	}

	// 追加のヘッダー検証
	if headers.Get("X-Content-Type-Options") != "nosniff" {
		t.Error("X-Content-Type-Options ヘッダーが不正です")
	}
	if headers.Get("X-Frame-Options") != "DENY" {
		t.Error("X-Frame-Options ヘッダーが不正です")
	}
}

// validateGetCSRFTokenResponse はCSRFトークン取得のレスポンスを検証します
func validateGetCSRFTokenResponse(t *testing.T, rec *httptest.ResponseRecorder, tc securityTestCase) {
	t.Helper()

	if rec.Code != tc.wantStatus {
		t.Errorf("期待するステータスコードと異なります: got = %v, want = %v", rec.Code, tc.wantStatus)
	}

	if tc.validateHeaders != nil {
		tc.validateHeaders(t, rec.Header())
	}

	var response struct {
		Token string `json:"token"`
		Meta  struct {
			ExpiresIn int64 `json:"expires_in"`
			Timestamp int64 `json:"timestamp"`
		} `json:"meta"`
	}

	if err := testutils.ParseResponse(rec, &response); err != nil {
		t.Fatalf("レスポンスのパースに失敗しました: %v", err)
	}

	if response.Token == "" {
		t.Error("CSRFトークンが空です")
	}

	if response.Meta.ExpiresIn != 3600 {
		t.Errorf("トークンの有効期限が不正です: got = %v, want = %v", response.Meta.ExpiresIn, 3600)
	}

	if response.Meta.Timestamp <= 0 {
		t.Error("タイムスタンプが不正です")
	}
}

// TestGetCSRFToken はCSRFトークン取得のテストを行います
func TestGetCSRFToken(t *testing.T) {
	t.Parallel() // テストを並列実行

	e := echo.New()
	securityHandler := NewSecurityHandler(5 * time.Second)

	tests := []securityTestCase{
		{
			name:       "正常系: CSRFトークン取得",
			wantStatus: http.StatusOK,
			validateHeaders: validateSecurityHeaders,
			setupContext: func(c echo.Context) {
				c.Set("csrf", "test-token")
			},
		},
		{
			name:       "異常系: CSRFトークンが未設定",
			wantStatus: http.StatusInternalServerError,
			wantError:  ErrCSRFTokenGeneration,
			validateHeaders: validateSecurityHeaders,
		},
		{
			name:       "異常系: CSRFトークンの型が不正",
			wantStatus: http.StatusInternalServerError,
			wantError:  ErrCSRFTokenInvalidType,
			validateHeaders: validateSecurityHeaders,
			setupContext: func(c echo.Context) {
				c.Set("csrf", 123) // 不正な型
			},
		},
	}

	for _, tt := range tests {
		tt := tt // ループ変数のキャプチャ
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel() // サブテストを並列実行

			req := httptest.NewRequest(http.MethodGet, "/api/csrf-token", nil)
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			if tt.setupContext != nil {
				tt.setupContext(c)
			}

			if err := securityHandler.GetCSRFToken(c); err != nil {
				if tt.wantError == "" {
					t.Fatalf("リクエストの実行に失敗しました: %v", err)
				}
				if err.Error() != tt.wantError {
					t.Errorf("期待するエラーメッセージと異なります: got = %v, want = %v", err.Error(), tt.wantError)
				}
				return
			}

			validateGetCSRFTokenResponse(t, rec, tt)
		})
	}
}

// TestSecurityMiddleware はセキュリティミドルウェアのテストを行います
func TestSecurityMiddleware(t *testing.T) {
	t.Parallel() // テストを並列実行

	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	handler := SecurityMiddleware()(func(c echo.Context) error {
		return c.String(http.StatusOK, "test")
	})

	if err := handler(c); err != nil {
		t.Fatalf("ミドルウェアの実行に失敗しました: %v", err)
	}

	validateSecurityHeaders(t, rec.Header())
}

// BenchmarkGetCSRFToken はCSRFトークン取得のベンチマークテストを行います
func BenchmarkGetCSRFToken(b *testing.B) {
	e := echo.New()
	securityHandler := NewSecurityHandler(5 * time.Second)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		req := httptest.NewRequest(http.MethodGet, "/api/csrf-token", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.Set("csrf", "test-token")

		if err := securityHandler.GetCSRFToken(c); err != nil {
			b.Fatalf("リクエストの実行に失敗しました: %v", err)
		}
	}
}

// BenchmarkSecurityMiddleware はセキュリティミドルウェアのベンチマークテストを行います
func BenchmarkSecurityMiddleware(b *testing.B) {
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	handler := SecurityMiddleware()(func(c echo.Context) error {
		return c.String(http.StatusOK, "test")
	})

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		if err := handler(c); err != nil {
			b.Fatalf("ミドルウェアの実行に失敗しました: %v", err)
		}
	}
}
