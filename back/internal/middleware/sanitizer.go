package middleware

import (
	"bytes"
	"encoding/json"
	"io"
	"strings"
	"unicode"

	"github.com/labstack/echo/v4"
	"github.com/microcosm-cc/bluemonday"
)

// SanitizerConfig はサニタイザーの設定を定義します
type SanitizerConfig struct {
	// サニタイズ対象のフィールド
	Fields []string
}

type requestProcessor struct {
	policy *bluemonday.Policy
	fields []string
}

func newRequestProcessor(policy *bluemonday.Policy, fields []string) *requestProcessor {
	return &requestProcessor{
		policy: policy,
		fields: fields,
	}
}

func (p *requestProcessor) readBody(c echo.Context) (map[string]interface{}, error) {
	body, err := io.ReadAll(c.Request().Body)
	if err != nil {
		return nil, err
	}
	c.Request().Body = io.NopCloser(bytes.NewBuffer(body))

	var data map[string]interface{}
	if err := json.Unmarshal(body, &data); err != nil {
		return nil, nil
	}
	return data, nil
}

func (p *requestProcessor) writeBody(c echo.Context, data map[string]interface{}) error {
	sanitizedBody, err := json.Marshal(data)
	if err != nil {
		return err
	}
	c.Request().Body = io.NopCloser(bytes.NewBuffer(sanitizedBody))
	return nil
}

// Sanitizer は入力データをサニタイズするミドルウェアを提供します
func Sanitizer(config SanitizerConfig) echo.MiddlewareFunc {
	policy := bluemonday.UGCPolicy()
	processor := newRequestProcessor(policy, config.Fields)

	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			data, err := processor.readBody(c)
			if err != nil {
				return err
			}
			if data == nil {
				return next(c)
			}

			data = sanitizeData(policy, data, config.Fields)
			if err := processor.writeBody(c, data); err != nil {
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
	for _, field := range fields {
		if value, ok := data[field].(string); ok {
			data[field] = sanitizeString(policy, value)
		}
	}
	return data
}
