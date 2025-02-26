package errors

// HTTPError はHTTPエラーを表現する構造体です
type HTTPError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

// Error はerrorインターフェースを実装します
func (e *HTTPError) Error() string {
	return e.Message
}

// NewHTTPError は新しいHTTPErrorを作成します
func NewHTTPError(code int, message string) *HTTPError {
	return &HTTPError{
		Code:    code,
		Message: message,
	}
}
