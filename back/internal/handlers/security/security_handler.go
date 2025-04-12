package security

import (
	"context"
	stdErrors "errors"
	"net/http"
	"time"
	"university-exam-api/internal/pkg/errors"

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

// SecurityHandler はセキュリティ関連のハンドラーを管理します
type SecurityHandler struct {
	securityService SecurityService
	timeout time.Duration
}

// SecurityService はセキュリティ関連のサービスを定義します
type SecurityService interface {
	GenerateCSRFToken(ctx context.Context) (interface{}, error)
}

// NewSecurityHandler は新しいSecurityHandlerを生成します
func NewSecurityHandler(securityService SecurityService, timeout time.Duration) *SecurityHandler {
	return &SecurityHandler{
		securityService: securityService,
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

	token, err := h.securityService.GenerateCSRFToken(ctx)
	if err != nil {
		return errors.HandleError(c, err)
	}

	csrfToken, ok := token.(string)
	if !ok {
		return errors.HandleError(c, stdErrors.New(ErrCSRFTokenInvalidType))
	}

	return c.JSON(http.StatusOK, map[string]string{
		"csrf_token": csrfToken,
	})
}
