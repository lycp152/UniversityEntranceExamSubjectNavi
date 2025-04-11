package errors

import (
	"fmt"
)

// HTTPError はHTTPエラーを表現する構造体です
type HTTPError struct {
	Code    int               `json:"code"`
	Message string            `json:"message"`
	Err     error             `json:"-"`
	Details map[string]string `json:"details,omitempty"`
}

// Error はerrorインターフェースを実装します
func (e *HTTPError) Error() string {
	msg := fmt.Sprintf("HTTP %d: %s", e.Code, e.Message)
	if e.Err != nil {
		msg = fmt.Sprintf("%s (原因: %v)", msg, e.Err)
	}
	if len(e.Details) > 0 {
		msg = fmt.Sprintf("%s [詳細: %v]", msg, e.Details)
	}
	return msg
}

// Unwrap はラップされたエラーを返します
func (e *HTTPError) Unwrap() error {
	return e.Err
}

// WithDetails はエラーに詳細情報を追加します
func (e *HTTPError) WithDetails(details map[string]string) *HTTPError {
	e.Details = details
	return e
}

// NewHTTPError は新しいHTTPErrorを作成します
func NewHTTPError(code int, message string, err error) *HTTPError {
	return &HTTPError{
		Code:    code,
		Message: message,
		Err:     err,
	}
}

// NewBadRequestError は400 Bad Requestエラーを作成します
func NewBadRequestError(message string, err error) *HTTPError {
	return NewHTTPError(400, message, err)
}

// NewUnauthorizedError は401 Unauthorizedエラーを作成します
func NewUnauthorizedError(message string, err error) *HTTPError {
	return NewHTTPError(401, message, err)
}

// NewForbiddenError は403 Forbiddenエラーを作成します
func NewForbiddenError(message string, err error) *HTTPError {
	return NewHTTPError(403, message, err)
}

// NewHTTPNotFoundError は404 Not Foundエラーを作成します
func NewHTTPNotFoundError(message string, err error) *HTTPError {
	return NewHTTPError(404, message, err)
}

// NewInternalServerError は500 Internal Server Errorを作成します
func NewInternalServerError(message string, err error) *HTTPError {
	return NewHTTPError(500, message, err)
}
