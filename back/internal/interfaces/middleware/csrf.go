package middleware

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

// ConfigureCSRF はCSRF保護を設定します
func ConfigureCSRF() echo.MiddlewareFunc {
	return middleware.CSRFWithConfig(middleware.CSRFConfig{
		TokenLookup:    "header:X-CSRF-Token",
		CookieName:     "csrf",
		CookiePath:     "/",
		CookieHTTPOnly: true,
		CookieSameSite: http.SameSiteStrictMode,
	})
}

// CSRFTokenHandler はCSRFトークンを生成して返すハンドラーです
func CSRFTokenHandler(c echo.Context) error {
	token := c.Get("csrf").(string)
	return c.JSON(http.StatusOK, map[string]string{
		"token": token,
	})
}
