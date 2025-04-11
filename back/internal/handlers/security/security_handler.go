package security

import (
	"context"
	"fmt"
	"net/http"
	"time"
	applogger "university-exam-api/internal/logger"
	"university-exam-api/internal/pkg/errors"
	"university-exam-api/internal/pkg/logging"

	"github.com/labstack/echo/v4"
)

const (
	// エラーメッセージ
	// #nosec G101 - これは認証情報ではなく、エラーメッセージです
	ErrCSRFTokenGeneration = "CSRFトークンの生成に失敗しました"
	// #nosec G101 - これは認証情報ではなく、エラーメッセージです
	ErrCSRFTokenInvalidType = "CSRFトークンの型が不正です"

	// セキュリティヘッダー
	HeaderXContentTypeOptions = "X-Content-Type-Options"
	HeaderXFrameOptions = "X-Frame-Options"
	HeaderXXSSProtection = "X-XSS-Protection"
	HeaderStrictTransportSecurity = "Strict-Transport-Security"
	HeaderContentSecurityPolicy = "Content-Security-Policy"
	HeaderReferrerPolicy = "Referrer-Policy"

	// セキュリティヘッダーの値
	ValueNoSniff = "nosniff"
	ValueDeny = "DENY"
	ValueXSSProtection = "1; mode=block"
	ValueHSTS = "max-age=31536000; includeSubDomains"
	ValueCSP = "default-src 'self'"
	ValueReferrerPolicy = "strict-origin-when-cross-origin"
)

// SecurityHandler はセキュリティ関連のHTTPリクエストを処理
type SecurityHandler struct {
	timeout time.Duration
}

// NewSecurityHandler は新しいSecurityHandlerインスタンスを生成
func NewSecurityHandler(timeout time.Duration) *SecurityHandler {
	return &SecurityHandler{
		timeout: timeout,
	}
}

// SecurityMiddleware はセキュリティヘッダーを設定するミドルウェア
func SecurityMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			headers := map[string]string{
				HeaderXContentTypeOptions: ValueNoSniff,
				HeaderXFrameOptions: ValueDeny,
				HeaderXXSSProtection: ValueXSSProtection,
				HeaderStrictTransportSecurity: ValueHSTS,
				HeaderContentSecurityPolicy: ValueCSP,
				HeaderReferrerPolicy: ValueReferrerPolicy,
			}

			for key, value := range headers {
				c.Response().Header().Set(key, value)
			}

			return next(c)
		}
	}
}

// GetCSRFToken はCSRFトークンを返します
func (h *SecurityHandler) GetCSRFToken(c echo.Context) error {
	ctx, cancel := context.WithTimeout(c.Request().Context(), h.timeout)
	defer cancel()

	token := c.Get("csrf")
	if token == nil {
		applogger.Error(ctx, ErrCSRFTokenGeneration)
		return errors.HandleError(c, fmt.Errorf(ErrCSRFTokenGeneration))
	}

	tokenStr, ok := token.(string)
	if !ok {
		applogger.Error(ctx, ErrCSRFTokenInvalidType)
		return errors.HandleError(c, fmt.Errorf(ErrCSRFTokenInvalidType))
	}

	applogger.Info(ctx, logging.LogGetCSRFTokenSuccess)
	return c.JSON(http.StatusOK, map[string]interface{}{
		"token": tokenStr,
		"meta": map[string]interface{}{
			"expires_in": 3600, // 1時間
			"timestamp":  time.Now().Unix(),
		},
	})
}
