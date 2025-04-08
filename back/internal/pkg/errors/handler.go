package errors

import (
	"net/http"
	"university-exam-api/internal/errors"
	applogger "university-exam-api/internal/logger"

	"github.com/labstack/echo/v4"
)

// NewValidationError はバリデーションエラーを生成
func NewValidationError(message string) error {
	return &errors.Error{
		Code:    errors.Validation,
		Message: message,
	}
}

// HandleError はエラーをHTTPレスポンスに変換
func HandleError(c echo.Context, err error) error {
	ctx := c.Request().Context()

	switch e := err.(type) {
	case *errors.Error:
		statusCode := http.StatusInternalServerError
		switch e.Code {
		case errors.NotFound:
			statusCode = http.StatusNotFound
		case errors.InvalidInput, errors.Validation:
			statusCode = http.StatusBadRequest
		case errors.Authentication:
			statusCode = http.StatusUnauthorized
		case errors.Authorization:
			statusCode = http.StatusForbidden
		}
		applogger.Error(ctx, "エラーが発生しました: %v", e)
		return c.JSON(statusCode, map[string]interface{}{
			"code":    e.Code,
			"message": e.Message,
			"details": e.Details,
		})
	default:
		applogger.Error(ctx, "予期せぬエラーが発生しました: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "サーバー内部でエラーが発生しました",
		})
	}
}
