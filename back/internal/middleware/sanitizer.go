// Package middleware はアプリケーションのミドルウェアを提供します。
// このパッケージは以下の機能を提供します：
// - 入力データのサニタイズ
// - HTMLタグの除去
// - 制御文字の除去
// - スペースの正規化
package middleware

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"sync"
	"unicode"

	"github.com/labstack/echo/v4"
	"github.com/microcosm-cc/bluemonday"
)

const (
	errorFormat      = "%w: %v"
	defaultBufferSize = 1024
	maxBufferSize    = 1024 * 1024 // 1MB
)

// RequestProcessor はリクエスト処理のインターフェースを定義します。
// このインターフェースは以下の機能を提供します：
// - リクエストボディの読み込み
// - リクエストボディの書き込み
type RequestProcessor interface {
	ReadBody(c echo.Context) (map[string]interface{}, error)
	WriteBody(c echo.Context, data map[string]interface{}) error
}

// SanitizerError はサニタイザー関連のエラーを表します。
// この構造体は以下の情報を保持します：
// - 元のエラー
// - エラーメッセージ
// - HTTPステータスコード
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
// これらのエラーは以下の場合に使用されます：
// - 無効な入力データ
// - リクエストボディの読み込み失敗
// - リクエストボディの書き込み失敗
// - 無効なJSON形式
// - バッファオーバーフロー
var (
	ErrInvalidInput     = &SanitizerError{Message: "無効な入力データです", Code: http.StatusBadRequest}
	ErrReadBodyFailed   = &SanitizerError{Message: "リクエストボディの読み込みに失敗しました", Code: http.StatusInternalServerError}
	ErrWriteBodyFailed  = &SanitizerError{Message: "リクエストボディの書き込みに失敗しました", Code: http.StatusInternalServerError}
	ErrInvalidJSON      = &SanitizerError{Message: "無効なJSON形式です", Code: http.StatusBadRequest}
	ErrBufferOverflow   = &SanitizerError{Message: "リクエストボディが大きすぎます", Code: http.StatusRequestEntityTooLarge}
)

// SanitizerConfig はサニタイザーの設定を定義します。
// この構造体は以下の設定を管理します：
// - サニタイズ対象のフィールド
// - サニタイズポリシー
type SanitizerConfig struct {
	// サニタイズ対象のフィールド
	Fields []string
	// ポリシーの設定
	Policy *bluemonday.Policy
}

// DefaultConfig はデフォルトの設定を返します。
// この関数は以下の処理を行います：
// 1. 空のフィールドリストの設定
// 2. UGCポリシーの設定
func DefaultConfig() SanitizerConfig {
	return SanitizerConfig{
		Fields: []string{},
		Policy: bluemonday.UGCPolicy(),
	}
}

type requestProcessor struct {
	policy *bluemonday.Policy
	fields []string
	pool   sync.Pool
}

// newRequestProcessor は新しいリクエストプロセッサーを作成します。
// この関数は以下の処理を行います：
// 1. ポリシーの設定
// 2. フィールドリストの設定
// 3. バッファプールの初期化
func newRequestProcessor(policy *bluemonday.Policy, fields []string) RequestProcessor {
	return &requestProcessor{
		policy: policy,
		fields: fields,
		pool: sync.Pool{
			New: func() interface{} {
				return bytes.NewBuffer(make([]byte, 0, defaultBufferSize))
			},
		},
	}
}

// ReadBody はリクエストボディを読み込みます。
// この関数は以下の処理を行います：
// 1. バッファの取得
// 2. ボディの読み込み
// 3. サイズチェック
// 4. JSONのデコード
// 5. データのサニタイズ
func (p *requestProcessor) ReadBody(c echo.Context) (map[string]interface{}, error) {
	if c.Request().Body == nil {
		return nil, nil
	}

	buf := p.pool.Get().(*bytes.Buffer)
	defer func() {
		buf.Reset()
		p.pool.Put(buf)
	}()

	if _, err := buf.ReadFrom(c.Request().Body); err != nil {
		return nil, fmt.Errorf(errorFormat, ErrReadBodyFailed, err)
	}

	if buf.Len() > maxBufferSize {
		return nil, ErrBufferOverflow
	}

	c.Request().Body = io.NopCloser(bytes.NewReader(buf.Bytes()))

	var data map[string]interface{}
	if err := json.NewDecoder(bytes.NewReader(buf.Bytes())).Decode(&data); err != nil {
		return nil, fmt.Errorf(errorFormat, ErrInvalidJSON, err)
	}

	return sanitizeData(p.policy, data, p.fields), nil
}

// WriteBody はリクエストボディを書き込みます。
// この関数は以下の処理を行います：
// 1. バッファの取得
// 2. JSONのエンコード
// 3. ボディの書き込み
func (p *requestProcessor) WriteBody(c echo.Context, data map[string]interface{}) error {
	buf := p.pool.Get().(*bytes.Buffer)
	defer func() {
		buf.Reset()
		p.pool.Put(buf)
	}()

	if err := json.NewEncoder(buf).Encode(data); err != nil {
		return fmt.Errorf(errorFormat, ErrWriteBodyFailed, err)
	}

	c.Request().Body = io.NopCloser(bytes.NewReader(buf.Bytes()))

	return nil
}

// shouldProcessRequest はリクエストを処理する必要があるかどうかを判定します。
// この関数は以下の条件をチェックします：
// - GETリクエストでないこと
// - HEADリクエストでないこと
// - OPTIONSリクエストでないこと
func shouldProcessRequest(c echo.Context) bool {
	method := c.Request().Method
	return method != http.MethodGet && method != http.MethodHead && method != http.MethodOptions
}

// shouldProcessContentType はコンテンツタイプを処理する必要があるかどうかを判定します。
// この関数は以下の条件をチェックします：
// - JSONコンテンツタイプであること
func shouldProcessContentType(c echo.Context) bool {
	contentType := c.Request().Header.Get(echo.HeaderContentType)
	return strings.Contains(contentType, echo.MIMEApplicationJSON)
}

// handleSanitizerError はサニタイザーエラーを処理します。
// この関数は以下の処理を行います：
// 1. エラーの型チェック
// 2. エラーレスポンスの生成
func handleSanitizerError(c echo.Context, err error) error {
	if sanitizerErr, ok := err.(*SanitizerError); ok {
		return c.JSON(sanitizerErr.Code, map[string]string{"error": sanitizerErr.Message})
	}

	return err
}

// Sanitizer は入力データをサニタイズするミドルウェアを提供します。
// この関数は以下の処理を行います：
// 1. 設定の初期化
// 2. リクエストプロセッサーの作成
// 3. リクエストの処理
func Sanitizer(config SanitizerConfig) echo.MiddlewareFunc {
	if config.Policy == nil {
		config.Policy = bluemonday.UGCPolicy()
	}

	processor := newRequestProcessor(config.Policy, config.Fields)

	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			if !shouldProcessRequest(c) || !shouldProcessContentType(c) {
				return next(c)
			}

			data, err := processor.ReadBody(c)
			if err != nil {
				return handleSanitizerError(c, err)
			}

			if data == nil {
				return next(c)
			}

			if err := processor.WriteBody(c, data); err != nil {
				return handleSanitizerError(c, err)
			}

			return next(c)
		}
	}
}

// removeControlChars は制御文字を除去します。
// この関数は以下の処理を行います：
// 1. 制御文字の検出
// 2. 制御文字の除去
func removeControlChars(s string) string {
	return strings.Map(func(r rune) rune {
		if unicode.IsControl(r) || unicode.Is(unicode.C, r) {
			return -1
		}

		return r
	}, s)
}

// normalizeSpaces は全角スペースを半角スペースに変換し、連続する空白を削除します。
// この関数は以下の処理を行います：
// 1. 全角スペースの変換
// 2. 連続する空白の削除
func normalizeSpaces(s string) string {
	// 全角スペースを半角スペースに変換
	s = strings.ReplaceAll(s, "　", " ")
	// すべての空白を削除
	return strings.ReplaceAll(s, " ", "")
}

// sanitizeString は文字列をサニタイズします。
// この関数は以下の処理を行います：
// 1. HTMLタグの除去
// 2. 制御文字の除去
// 3. スペースの正規化
func sanitizeString(policy *bluemonday.Policy, input string) string {
	if input == "" {
		return input
	}

	sanitized := policy.Sanitize(input)
	sanitized = removeControlChars(sanitized)
	sanitized = normalizeSpaces(sanitized)

	return strings.TrimSpace(sanitized)
}

// sanitizeValue は値を再帰的にサニタイズします。
// この関数は以下の処理を行います：
// 1. 型に応じたサニタイズ
// 2. 再帰的なサニタイズ
func sanitizeValue(policy *bluemonday.Policy, value interface{}) interface{} {
	switch v := value.(type) {
	case string:
		return sanitizeString(policy, v)
	case map[string]interface{}:
		return sanitizeData(policy, v, nil)
	case []interface{}:
		result := make([]interface{}, len(v))
		for i, item := range v {
			result[i] = sanitizeValue(policy, item)
		}

		return result
	default:
		return v
	}
}

// sanitizeData はデータをサニタイズします。
// この関数は以下の処理を行います：
// 1. フィールドの指定チェック
// 2. 再帰的なサニタイズ
func sanitizeData(policy *bluemonday.Policy, data map[string]interface{}, fields []string) map[string]interface{} {
	if len(fields) == 0 {
		// フィールドが指定されていない場合は、すべてのフィールドを再帰的にサニタイズ
		for key, value := range data {
			data[key] = sanitizeValue(policy, value)
		}
	} else {
		// 指定されたフィールドのみを再帰的にサニタイズ
		for _, field := range fields {
			if value, ok := data[field]; ok {
				data[field] = sanitizeValue(policy, value)
			}
		}
	}

	return data
}
