package middleware

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"strings"
	"unicode"

	"github.com/labstack/echo/v4"
	"github.com/microcosm-cc/bluemonday"
)

const (
	errorFormat = "%w: %v"
	defaultBufferSize = 1024
	maxBufferSize = 1024 * 1024 // 1MB
)

// RequestProcessor はリクエスト処理のインターフェースを定義します
type RequestProcessor interface {
	ReadBody(c echo.Context) (map[string]interface{}, error)
	WriteBody(c echo.Context, data map[string]interface{}) error
}

// SanitizerError はサニタイザー関連のエラーを表します
type SanitizerError struct {
	Err     error
	Message string
	Code    int
}

func (e *SanitizerError) Error() string {
	return e.Message
}

func (e *SanitizerError) Unwrap() error {
	return e.Err
}

// エラー定義
var (
	ErrInvalidInput     = &SanitizerError{Message: "無効な入力データです", Code: 400}
	ErrReadBodyFailed   = &SanitizerError{Message: "リクエストボディの読み込みに失敗しました", Code: 500}
	ErrWriteBodyFailed  = &SanitizerError{Message: "リクエストボディの書き込みに失敗しました", Code: 500}
	ErrInvalidJSON      = &SanitizerError{Message: "無効なJSON形式です", Code: 400}
	ErrBufferOverflow   = &SanitizerError{Message: "リクエストボディが大きすぎます", Code: 413}
)

// SanitizerConfig はサニタイザーの設定を定義します
type SanitizerConfig struct {
	// サニタイズ対象のフィールド
	Fields []string
	// ポリシーの設定
	Policy *bluemonday.Policy
}

// DefaultConfig はデフォルトの設定を返します
func DefaultConfig() SanitizerConfig {
	return SanitizerConfig{
		Fields: []string{},
		Policy: bluemonday.UGCPolicy(),
	}
}

type requestProcessor struct {
	policy *bluemonday.Policy
	fields []string
	buf    *bytes.Buffer
}

func newRequestProcessor(policy *bluemonday.Policy, fields []string) RequestProcessor {
	return &requestProcessor{
		policy: policy,
		fields: fields,
		buf:    bytes.NewBuffer(make([]byte, 0, defaultBufferSize)),
	}
}

func (p *requestProcessor) ReadBody(c echo.Context) (map[string]interface{}, error) {
	if c.Request().Body == nil {
		return nil, nil
	}

	p.buf.Reset()

	if _, err := p.buf.ReadFrom(c.Request().Body); err != nil {
		return nil, fmt.Errorf(errorFormat, ErrReadBodyFailed, err)
	}

	if p.buf.Len() > maxBufferSize {
		return nil, ErrBufferOverflow
	}

	c.Request().Body = io.NopCloser(bytes.NewReader(p.buf.Bytes()))

	var data map[string]interface{}
	if err := json.Unmarshal(p.buf.Bytes(), &data); err != nil {
		return nil, fmt.Errorf(errorFormat, ErrInvalidJSON, err)
	}

	return data, nil
}

func (p *requestProcessor) WriteBody(c echo.Context, data map[string]interface{}) error {
	p.buf.Reset()

	if err := json.NewEncoder(p.buf).Encode(data); err != nil {
		return fmt.Errorf(errorFormat, ErrWriteBodyFailed, err)
	}

	c.Request().Body = io.NopCloser(bytes.NewReader(p.buf.Bytes()))

	return nil
}

// Sanitizer は入力データをサニタイズするミドルウェアを提供します
func Sanitizer(config SanitizerConfig) echo.MiddlewareFunc {
	if config.Policy == nil {
		config.Policy = bluemonday.UGCPolicy()
	}

	processor := newRequestProcessor(config.Policy, config.Fields)

	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			data, err := processor.ReadBody(c)
			if err != nil {
				return err
			}

			if data == nil {
				return next(c)
			}

			data = sanitizeData(config.Policy, data, config.Fields)
			if err := processor.WriteBody(c, data); err != nil {
				return err
			}

			return next(c)
		}
	}
}

// removeControlChars は制御文字を除去します
func removeControlChars(s string) string {
	return strings.Map(func(r rune) rune {
		if unicode.IsControl(r) || unicode.Is(unicode.C, r) {
			return -1
		}

		return r
	}, s)
}

// normalizeSpaces は全角スペースを半角スペースに変換し、連続する空白を1つに正規化します
func normalizeSpaces(s string) string {
	// 全角スペースを半角スペースに変換
	s = strings.ReplaceAll(s, "　", " ")
	// 連続する空白を1つに
	return strings.Join(strings.Fields(s), " ")
}

// sanitizeString は文字列をサニタイズします
func sanitizeString(policy *bluemonday.Policy, input string) string {
	if input == "" {
		return input
	}

	sanitized := policy.Sanitize(input)
	sanitized = removeControlChars(sanitized)
	sanitized = normalizeSpaces(sanitized)

	return strings.TrimSpace(sanitized)
}

func sanitizeData(policy *bluemonday.Policy, data map[string]interface{}, fields []string) map[string]interface{} {
	if len(fields) == 0 {
		// フィールドが指定されていない場合は、すべての文字列フィールドをサニタイズ
		for key, value := range data {
			if str, ok := value.(string); ok {
				data[key] = sanitizeString(policy, str)
			}
		}
	} else {
		// 指定されたフィールドのみをサニタイズ
		for _, field := range fields {
			if value, ok := data[field].(string); ok {
				data[field] = sanitizeString(policy, value)
			}
		}
	}

	return data
}
