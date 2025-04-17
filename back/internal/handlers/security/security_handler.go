// Package security はセキュリティ関連の機能を提供するパッケージです。
// このパッケージは以下の機能を提供します：
// - CSRFトークンの生成と検証
// - セキュリティヘッダーの設定
// - エラーハンドリング
// - ログ記録
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
	// ErrCSRFTokenGeneration はCSRFトークンの生成に失敗した場合のエラーメッセージです
	// #nosec G101 - これは認証情報ではなく、エラーメッセージです
	ErrCSRFTokenGeneration = "CSRFトークンの生成に失敗しました"
	// ErrCSRFTokenInvalidType はCSRFトークンの型が不正な場合のエラーメッセージです
	// #nosec G101 - これは認証情報ではなく、エラーメッセージです
	ErrCSRFTokenInvalidType = "CSRFトークンの型が不正です"

	// HeaderXContentTypeOptions はX-Content-Type-Optionsヘッダーの名前です
	HeaderXContentTypeOptions = "X-Content-Type-Options"
	// HeaderXFrameOptions はX-Frame-Optionsヘッダーの名前です
	HeaderXFrameOptions = "X-Frame-Options"
	// HeaderXXSSProtection はX-XSS-Protectionヘッダーの名前です
	HeaderXXSSProtection = "X-XSS-Protection"
	// HeaderStrictTransportSecurity はStrict-Transport-Securityヘッダーの名前です
	HeaderStrictTransportSecurity = "Strict-Transport-Security"
	// HeaderContentSecurityPolicy はContent-Security-Policyヘッダーの名前です
	HeaderContentSecurityPolicy = "Content-Security-Policy"
	// HeaderReferrerPolicy はReferrer-Policyヘッダーの名前です
	HeaderReferrerPolicy = "Referrer-Policy"

	// ValueNoSniff はX-Content-Type-Optionsヘッダーの値です
	ValueNoSniff = "nosniff"
	// ValueDeny はX-Frame-Optionsヘッダーの値です
	ValueDeny = "DENY"
	// ValueXSSProtection はX-XSS-Protectionヘッダーの値です
	ValueXSSProtection = "1; mode=block"
	// ValueHSTS はStrict-Transport-Securityヘッダーの値です
	ValueHSTS = "max-age=31536000; includeSubDomains"
	// ValueCSP はContent-Security-Policyヘッダーの値です
	ValueCSP = "default-src 'self'"
	// ValueReferrerPolicy はReferrer-Policyヘッダーの値です
	ValueReferrerPolicy = "strict-origin-when-cross-origin"
)

// Handler はセキュリティ関連のハンドラーを管理する構造体です。
// この構造体は以下の機能を提供します：
// - セキュリティサービスの管理
// - リクエストタイムアウトの管理
// - エラーハンドリング
type Handler struct {
	securityService Service
	timeout time.Duration
}

// Service はセキュリティ関連のサービスを定義するインターフェースです。
// このインターフェースは以下の機能を提供します：
// - CSRFトークンの生成
// - エラーハンドリング
type Service interface {
	GenerateCSRFToken(ctx context.Context) (interface{}, error)
}

// NewHandler は新しいHandlerインスタンスを生成します。
// この関数は以下の処理を行います：
// - セキュリティサービスの初期化
// - タイムアウトの設定
// - ハンドラーの初期化
func NewHandler(securityService Service, timeout time.Duration) *Handler {
	return &Handler{
		securityService: securityService,
		timeout: timeout,
	}
}

// Middleware はセキュリティヘッダーを設定するミドルウェアです。
// この関数は以下の処理を行います：
// - セキュリティヘッダーの設定
// - リクエストの処理
// - エラーハンドリング
func Middleware() echo.MiddlewareFunc {
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

// GetCSRFToken はCSRFトークンを返します。
// この関数は以下の処理を行います：
// - CSRFトークンの生成
// - トークンの型チェック
// - エラーハンドリング
func (h *Handler) GetCSRFToken(c echo.Context) error {
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
