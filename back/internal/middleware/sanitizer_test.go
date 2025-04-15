package middleware

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/microcosm-cc/bluemonday"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const (
	testHTMLString = "<script>alert('test')</script>テスト"
	testString     = "テストテスト"
)

// テストヘルパー関数
func setupEchoContext(t *testing.T, method, target string, body io.Reader) (echo.Context, *httptest.ResponseRecorder) {
	t.Helper()

	e := echo.New()
	req := httptest.NewRequest(method, target, body)
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)

	rec := httptest.NewRecorder()

	return e.NewContext(req, rec), rec
}

func TestSanitizerError(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		err      *SanitizerError
		expected string
		wrapped  error
	}{
		{
			name: "基本的なエラー",
			err: &SanitizerError{
				Err:     io.EOF,
				Message: "テストエラー",
				Code:    500,
			},
			expected: "テストエラー",
			wrapped:  io.EOF,
		},
		{
			name: "エラーメッセージなし",
			err: &SanitizerError{
				Err:  io.EOF,
				Code: 500,
			},
			expected: "",
			wrapped:  io.EOF,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.expected, tt.err.Error())
			assert.True(t, errors.Is(tt.err, tt.wrapped))
		})
	}
}

func TestDefaultConfig(t *testing.T) {
	t.Parallel()

	config := DefaultConfig()
	assert.NotNil(t, config.Policy, "ポリシーがnilであってはいけません")
	assert.Empty(t, config.Fields, "フィールドは空であるべきです")
}

func TestSanitizeString(t *testing.T) {
	t.Parallel()

	policy := bluemonday.UGCPolicy()
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "空文字列",
			input:    "",
			expected: "",
		},
		{
			name:     "通常の文字列",
			input:    "テスト",
			expected: "テスト",
		},
		{
			name:     "HTMLタグを含む文字列",
			input:    testHTMLString,
			expected: "テスト",
		},
		{
			name:     "制御文字を含む文字列",
			input:    "テスト\nテスト",
			expected: "テストテスト",
		},
		{
			name:     "全角スペースを含む文字列",
			input:    "テスト　テスト",
			expected: testString,
		},
		{
			name:     "複数の制御文字とスペース",
			input:    "テスト\n\r\t　 テスト",
			expected: testString,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			result := sanitizeString(policy, tt.input)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestSanitizeData(t *testing.T) {
	t.Parallel()

	policy := bluemonday.UGCPolicy()
	tests := []struct {
		name     string
		input    map[string]interface{}
		fields   []string
		expected map[string]interface{}
	}{
		{
			name:     "空のデータ",
			input:    map[string]interface{}{},
			fields:   []string{},
			expected: map[string]interface{}{},
		},
		{
			name: "指定フィールドのサニタイズ",
			input: map[string]interface{}{
				"name": testHTMLString,
				"age":  20,
			},
			fields: []string{"name"},
			expected: map[string]interface{}{
				"name": "テスト",
				"age":  20,
			},
		},
		{
			name: "全フィールドのサニタイズ",
			input: map[string]interface{}{
				"name": testHTMLString,
				"desc": "説明\n説明",
			},
			fields: []string{},
			expected: map[string]interface{}{
				"name": "テスト",
				"desc": "説明説明",
			},
		},
		{
			name: "ネストされたデータのサニタイズ",
			input: map[string]interface{}{
				"user": map[string]interface{}{
					"name": testHTMLString,
					"desc": "説明\n説明",
				},
			},
			fields: []string{},
			expected: map[string]interface{}{
				"user": map[string]interface{}{
					"name": "テスト",
					"desc": "説明説明",
				},
			},
		},
		{
			name: "配列を含むデータのサニタイズ",
			input: map[string]interface{}{
				"names": []interface{}{
					"<script>alert('test1')</script>テスト1",
					"<script>alert('test2')</script>テスト2",
				},
			},
			fields: []string{},
			expected: map[string]interface{}{
				"names": []interface{}{
					"テスト1",
					"テスト2",
				},
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			result := sanitizeData(policy, tt.input, tt.fields)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestRequestProcessor(t *testing.T) {
	t.Parallel()

	policy := bluemonday.UGCPolicy()
	processor := newRequestProcessor(policy, []string{"name"})

	tests := []struct {
		name        string
		body        string
		expected    string
		expectError bool
	}{
		{
			name:        "HTMLタグを含むリクエスト",
			body:        `{"name": "<script>alert('test')</script>テスト"}`,
			expected:    "テスト",
			expectError: false,
		},
		{
			name:        "通常のリクエスト",
			body:        `{"name": "テスト"}`,
			expected:    "テスト",
			expectError: false,
		},
		{
			name:        "不正なJSON",
			body:        `{"name": "テスト"`,
			expectError: true,
		},
		{
			name:        "バッファサイズ超過",
			body:        string(make([]byte, maxBufferSize+1)),
			expectError: true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			c, _ := setupEchoContext(t, http.MethodPost, "/", bytes.NewBufferString(tt.body))

			data, err := processor.ReadBody(c)
			if tt.expectError {
				assert.Error(t, err)
				return
			}

			require.NoError(t, err)
			assert.Equal(t, tt.expected, data["name"])
		})
	}

	t.Run("WriteBody", func(t *testing.T) {
		t.Parallel()

		data := map[string]interface{}{
			"name": "テスト",
		}
		c, _ := setupEchoContext(t, http.MethodPost, "/", nil)

		err := processor.WriteBody(c, data)
		require.NoError(t, err)

		var result map[string]interface{}
		err = json.NewDecoder(c.Request().Body).Decode(&result)
		require.NoError(t, err)
		assert.Equal(t, "テスト", result["name"])
	})
}

func TestSanitizerMiddleware(t *testing.T) {
	t.Parallel()

	config := DefaultConfig()
	config.Fields = []string{"name"}
	middleware := Sanitizer(config)

	tests := []struct {
		name        string
		body        string
		expected    string
		expectError bool
	}{
		{
			name:        "HTMLタグを含むリクエスト",
			body:        `{"name": "<script>alert('test')</script>テスト"}`,
			expected:    "テスト",
			expectError: false,
		},
		{
			name:        "通常のリクエスト",
			body:        `{"name": "テスト"}`,
			expected:    "テスト",
			expectError: false,
		},
		{
			name:        "不正なJSON",
			body:        `{"name": "テスト"`,
			expectError: true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			c, rec := setupEchoContext(t, http.MethodPost, "/", bytes.NewBufferString(tt.body))

			handler := func(c echo.Context) error {
				var data map[string]interface{}
				if err := json.NewDecoder(c.Request().Body).Decode(&data); err != nil {
					return err
				}

				return c.JSON(http.StatusOK, data)
			}

			err := middleware(handler)(c)
			if tt.expectError {
				assert.Error(t, err)
				return
			}

			require.NoError(t, err)

			var result map[string]interface{}
			err = json.Unmarshal(rec.Body.Bytes(), &result)
			require.NoError(t, err)
			assert.Equal(t, tt.expected, result["name"])
		})
	}
}
