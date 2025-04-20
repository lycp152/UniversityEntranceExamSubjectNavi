// Package testutils はテストユーティリティを提供します。
// このパッケージは以下の機能を提供します：
// - テストヘルパー関数
// - テストケースの定義
// - テストデータの管理
// - セキュリティテスト
// - キャッシュテスト
package testutils

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
	"university-exam-api/internal/domain/models"
	"university-exam-api/internal/handlers/search"
	"university-exam-api/internal/handlers/university"
	"university-exam-api/internal/infrastructure/cache"
	applogger "university-exam-api/internal/logger"
	"university-exam-api/internal/middleware"
	"university-exam-api/internal/repositories"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

// APIパス定数
const (
	CSRFTokenPath = "/csrf"
	APIUniversitiesPath = "/api/universities"
	TestUniversityPath = "/api/universities/1"
	APIAdmissionScheduleInfoPath = "/api/admission-schedules/%d/info/%d"
	APIDepartmentsPath = "/api/universities/%s/departments"
	APIDepartmentPath = "/api/universities/%s/departments/%s"
	APIMajorsPath = "/api/universities/%s/departments/%s/majors"
	APIMajorPath = "/api/universities/%s/departments/%s/majors/%s"
)

// HTTPヘッダー定数
const (
	ContentTypeHeader = "Content-Type"
	ContentTypeJSON = "application/json"
)

// DefaultLogDirPerm はログディレクトリのデフォルトのパーミッションを定義します
const (
	DefaultLogDirPerm = 0750
)

// CSRFTokenHeader はCSRFトークンのHTTPヘッダー名を定義します
var (
	CSRFTokenHeader = getEnvOrDefault("CSRF_TOKEN_HEADER", "X-CSRF-Token")
	TestCSRFToken   = getEnvOrDefault("TEST_CSRF_TOKEN", generateRandomToken())
)

// generateRandomToken はランダムなCSRFトークンを生成します
// この関数は以下の処理を行います：
// - ランダムなバイト列の生成
// - Base64エンコーディング
// - フォールバック値の提供
func generateRandomToken() string {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "test-csrf-token" // フォールバック値
	}

	return base64.URLEncoding.EncodeToString(b)
}

// getEnvOrDefault は環境変数の値を取得し、設定されていない場合はデフォルト値を返します
// この関数は以下の処理を行います：
// - 環境変数の取得
// - デフォルト値の提供
func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}

	return defaultValue
}

// テストデータ定数
const (
	TestUniversityName = "CSRFテスト大学"
	TestDepartmentName = "CSRFテスト学部"
	TestDataDir = "testdata"
	TestDataFile = "test_data.json"
)

// エラーメッセージ定数
const (
	ErrRequestFailed = "リクエストの実行に失敗しました（メソッド: %s, パス: %s）: %v"
	ErrMarshalTestData = "テストデータのマーシャルに失敗しました（データ型: %T）: %v"
	ErrUnmarshalResponse = "レスポンスのアンマーシャルに失敗しました（ステータスコード: %d）: %v"
	ErrParsingResponse = "レスポンスのパースに失敗しました（Content-Type: %s）: %v"
	ErrLoadTestData = "テストデータの読み込みに失敗しました（ファイル: %s）: %v"
	ErrParseTestData = "テストデータのパースに失敗しました（ファイル: %s）: %v"
	ErrInitDB = "データベースの初期化に失敗しました"
	ErrCleanupDB = "データベースのクリーンアップに失敗しました（テーブル: %s）: %v"
	ErrInvalidStatusCode = "ステータスコードが一致しません（エンドポイント: %s）: got %v want %v"
	ErrInvalidResponse = "レスポンスが一致しません（エンドポイント: %s）:\ngot  %v\nwant %v"
	ErrInvalidErrorMsg = "エラーメッセージが一致しません（エンドポイント: %s）: got %v want %v"
	ErrTestCleanup = "テストのクリーンアップに失敗しました（リソース: %s）: %v"
	ErrXSSDetected = "エスケープされていないXSSペイロードを検出しました（パターン: %s）: %s"
	ErrControlCharFound = "制御文字が検出されました（コード: %x）: %s"
	ErrHTMLTagFound = "HTMLタグが検出されました（タグ: %s）"
	ErrMsgAdmissionInfoNotFound = "ID %dの募集情報が見つかりません"
	ErrMsgRequestFailed = "リクエストの実行に失敗しました: %v"
	ErrMsgMajorNotFound = "ID %sの学科が見つかりません"
	ErrMsgNotFound = "ID %sの%sが見つかりません"
	ErrMsgInvalidIDFormat = "無効な%s ID形式です"
	ErrMsgParseResponse = "レスポンスのパースに失敗しました: %v"
	ErrMsgInternalServer = "サーバー内部エラーが発生しました"
	ErrMsgEmptyQuery = "検索クエリが空です"
	ErrMsgStatusMismatch = "%sのステータスコードが期待値と異なります: got = %v, want = %v"
	ErrMsgCountMismatch = "%sの件数が期待値と異なります: got = %v, want = %v"
	ErrMsgDataValidation = "%sのデータ検証に失敗しました: %v"
)

// テストケース名定数
const (
	TestCaseNormalRequest = "正常なリクエスト"
	TestCaseNotFound = "存在しないデータ"
	TestCaseInvalidID = "不正なID形式"
	TestCaseInvalidBody = "不正なリクエストボディ"
	TestCaseDBError = "データベースエラー"
	TestCaseEmptyQuery = "空の検索クエリ"
	TestCaseCacheHit = "キャッシュヒット"
	TestCaseCacheMiss = "キャッシュミス"
	TestCaseCacheExpired = "キャッシュ有効期限切れ"
)

// APIパス定数（非公開）
const (
	apiUniversitiesPath = "/api/universities"
	apiUniversitiesSearchPath = "/api/universities/search?q=%s"
)

// TestData はテストデータの構造を定義します
// この構造体は以下のデータを保持します：
// - 大学情報
// - 学部情報
// - 科目情報
type TestData struct {
	Universities []models.University `json:"universities"`
	Departments  []models.Department `json:"departments"`
	Subjects     []models.Subject    `json:"subjects"`
}

// TestError はテスト関連のエラーを表現する構造体
// この構造体は以下の情報を保持します：
// - エラーコード
// - エラーメッセージ
// - 追加の属性情報
type TestError struct {
	Code    string      // エラーコード
	Message string      // エラーメッセージ
	Attrs   []slog.Attr // 追加の属性情報
}

// Error はTestErrorの文字列表現を返す
// この関数は以下の処理を行います：
// - エラー情報のフォーマット
// - 属性情報の追加
func (e *TestError) Error() string {
	if len(e.Attrs) > 0 {
		attrs := make([]string, len(e.Attrs))
		for i, attr := range e.Attrs {
			attrs[i] = fmt.Sprintf("%s=%v", attr.Key, attr.Value)
		}

		return fmt.Sprintf("%s: %s [%s]", e.Code, e.Message, strings.Join(attrs, ", "))
	}

	return fmt.Sprintf("%s: %s", e.Code, e.Message)
}

// TestConfig はテスト設定を保持する構造体
// この構造体は以下の設定を保持します：
// - ログレベル
// - ログディレクトリ
// - キャッシュタイムアウト
// - ログハンドラー
// - テストデータパス
type TestConfig struct {
	LogLevel     slog.Level
	LogDir       string
	CacheTimeout time.Duration
	LogHandler   slog.Handler
	TestDataPath string
}

// DefaultTestConfig はデフォルトのテスト設定を返す
// この関数は以下の処理を行います：
// - デフォルト値の設定
// - 設定の初期化
func DefaultTestConfig() *TestConfig {
	return &TestConfig{
		LogLevel:     slog.LevelInfo,
		LogDir:       "test_logs",
		CacheTimeout: 5 * time.Minute,
		TestDataPath: "testdata",
	}
}

// TestHelper はテストヘルパーを提供する構造体
// この構造体は以下の機能を提供します：
// - テストの実行
// - ログの管理
// - データベースの操作
type TestHelper struct {
	t       *testing.T
	e       *echo.Echo
	handler *university.Handler
	db      *gorm.DB
	config  *TestConfig
	logger  *slog.Logger
}

// NewTestHelper は新しいテストヘルパーを作成
// この関数は以下の処理を行います：
// - 設定の初期化
// - ログの設定
// - テストサーバーのセットアップ
func NewTestHelper(t *testing.T, opts ...func(*TestConfig)) *TestHelper {
	t.Helper()

	config := DefaultTestConfig()
	for _, opt := range opts {
		opt(config)
	}

	// ログディレクトリの作成
	logDir := filepath.Join("logs", "tests")
	if err := os.MkdirAll(logDir, DefaultLogDirPerm); err != nil {
		t.Fatalf("ログディレクトリの作成に失敗しました: %v", err)
	}

	// ログファイルの作成
	logFileName := fmt.Sprintf("test_%s.log", time.Now().Format("20060102_150405"))
	logFilePath := filepath.Join(logDir, logFileName)
	logFilePath = filepath.Clean(logFilePath) // パスの正規化

	if !strings.HasPrefix(logFilePath, logDir) {
		t.Fatalf("無効なログファイルパスです: %s", logFilePath)
	}

	logFile, err := os.Create(logFilePath)
	if err != nil {
		t.Fatalf("ログファイルの作成に失敗しました: %v", err)
	}

	defer func() {
		if err := logFile.Close(); err != nil {
			t.Errorf("ログファイルのクローズに失敗しました: %v", err)
		}
	}()

	// ロガーの初期化
	fileHandler := slog.NewTextHandler(logFile, &slog.HandlerOptions{Level: config.LogLevel})
	logger := slog.New(fileHandler)

	// テストサーバーのセットアップ
	e, handler, db, err := SetupTestServer(t, config)
	if err != nil {
		t.Fatalf("テストサーバーのセットアップに失敗しました: %v", err)
	}

	return &TestHelper{
		t:       t,
		e:       e,
		handler: handler,
		db:      db,
		config:  config,
		logger:  logger,
	}
}

// Cleanup はテストのクリーンアップを実行します
// この関数は以下の処理を行います：
// - データベースのクリーンアップ
// - リソースの解放
// - ログの記録
func (h *TestHelper) Cleanup() {
	h.t.Helper()
	h.logger.Info("テストのクリーンアップを開始します")

	if err := cleanupDatabase(h.db); err != nil {
		h.logger.Error("データベースのクリーンアップに失敗しました",
			"error", err,
			"database", h.db.Name(),
		)
		h.t.Errorf(ErrTestCleanup, "database", err)
	}

	h.logger.Info("テストのクリーンアップが完了しました")
}

// LoadTestData はテストデータを読み込みます
// この関数は以下の処理を行います：
// - ファイルの読み込み
// - データのパース
// - エラーハンドリング
func (h *TestHelper) LoadTestData() TestData {
	h.t.Helper()
	h.logger.Info("テストデータの読み込みを開始します",
		"file", TestDataFile,
		"dir", TestDataDir,
	)

	data, err := os.ReadFile(filepath.Join(TestDataDir, TestDataFile))
	if err != nil {
		h.logger.Error("テストデータの読み込みに失敗しました",
			"error", err,
			"file", TestDataFile,
		)
		h.t.Fatalf(ErrLoadTestData, TestDataFile, err)
	}

	var testData TestData
	if err := json.Unmarshal(data, &testData); err != nil {
		h.logger.Error("テストデータのパースに失敗しました",
			"error", err,
			"file", TestDataFile,
		)
		h.t.Fatalf(ErrParseTestData, TestDataFile, err)
	}

	h.logger.Info("テストデータの読み込みが完了しました",
		"universities", len(testData.Universities),
		"departments", len(testData.Departments),
		"subjects", len(testData.Subjects),
	)

	return testData
}

// CreateTestContext はテストコンテキストを作成します
// この関数は以下の処理を行います：
// - リクエストの作成
// - ヘッダーの設定
// - コンテキストの初期化
func (h *TestHelper) CreateTestContext(
	method, path string,
	body interface{},
) (*httptest.ResponseRecorder, echo.Context) {
	h.t.Helper()

	var req *http.Request

	if body != nil {
		jsonBody, err := json.Marshal(body)
		if err != nil {
			h.t.Fatalf(ErrMarshalTestData, body, err)
		}

		req = httptest.NewRequest(method, path, bytes.NewReader(jsonBody))
		req.Header.Set(ContentTypeHeader, ContentTypeJSON)
	} else {
		req = httptest.NewRequest(method, path, nil)
	}

	req.Header.Set(CSRFTokenHeader, TestCSRFToken)

	rec := httptest.NewRecorder()
	c := h.e.NewContext(req, rec)
	c.Set("csrf", TestCSRFToken)

	return rec, c
}

// AssertStatusCode はステータスコードを検証します
// この関数は以下の処理を行います：
// - ステータスコードの比較
// - エラーメッセージの生成
func (h *TestHelper) AssertStatusCode(got, want int) {
	h.t.Helper()

	if got != want {
		h.t.Errorf(ErrInvalidStatusCode, h.e.URL(h.handler.GetUniversity), got, want)
	}
}

// AssertJSONResponse はJSONレスポンスを検証します
// この関数は以下の処理を行います：
// - レスポンスのパース
// - データの比較
// - エラーハンドリング
func (h *TestHelper) AssertJSONResponse(rec *httptest.ResponseRecorder, want interface{}) {
	h.t.Helper()

	var got interface{}
	if err := json.Unmarshal(rec.Body.Bytes(), &got); err != nil {
		h.t.Fatalf(ErrParsingResponse, rec.Header().Get(ContentTypeHeader), err)
	}

	if fmt.Sprintf("%v", got) != fmt.Sprintf("%v", want) {
		h.t.Errorf(ErrInvalidResponse, h.e.URL(h.handler.GetUniversity), got, want)
	}
}

// AssertErrorResponse はエラーレスポンスを検証します
// この関数は以下の処理を行います：
// - ステータスコードの検証
// - エラーメッセージの検証
// - レスポンスのパース
func (h *TestHelper) AssertErrorResponse(rec *httptest.ResponseRecorder, wantStatus int, wantMessage string) {
	h.t.Helper()

	h.AssertStatusCode(rec.Code, wantStatus)

	var response map[string]string
	if err := json.Unmarshal(rec.Body.Bytes(), &response); err != nil {
		h.t.Fatalf(ErrParsingResponse, rec.Header().Get(ContentTypeHeader), err)
	}

	if message, ok := response["error"]; !ok || message != wantMessage {
		h.t.Errorf(ErrInvalidErrorMsg, h.e.URL(h.handler.GetUniversity), message, wantMessage)
	}
}

// AssertValidationError はバリデーションエラーを検証
// この関数は以下の処理を行います：
// - エラーレスポンスの検証
// - メッセージの比較
func (h *TestHelper) AssertValidationError(rec *httptest.ResponseRecorder, _ string, expectedError string) {
	h.t.Helper()

	var response map[string]string
	if err := json.Unmarshal(rec.Body.Bytes(), &response); err != nil {
		h.t.Fatalf(ErrParsingResponse, rec.Header().Get(ContentTypeHeader), err)
	}

	if message, ok := response["error"]; !ok || message != expectedError {
		h.t.Errorf(ErrInvalidErrorMsg, h.e.URL(h.handler.GetUniversity), message, expectedError)
	}
}

// AssertXSSEscaped はXSSペイロードが適切にエスケープされていることを確認
// この関数は以下の処理を行います：
// - 危険なパターンの検出
// - エスケープの検証
func (h *TestHelper) AssertXSSEscaped(s string) {
	h.t.Helper()

	dangerousPatterns := []string{
		"<script>", "</script>", "javascript:", "onerror=", "onclick=", "onload=", "onmouseover=",
	}

	for _, pattern := range dangerousPatterns {
		if strings.Contains(strings.ToLower(s), strings.ToLower(pattern)) {
			h.t.Errorf(ErrXSSDetected, pattern, s)
		}
	}
}

// AssertSpecialCharsSanitized は特殊文字が適切にサニタイズされていることを確認
// この関数は以下の処理を行います：
// - 制御文字の検出
// - HTMLタグの検出
func (h *TestHelper) AssertSpecialCharsSanitized(s string) {
	h.t.Helper()

	controlChars := []string{
		"\u0000", "\u0001", "\u0002", "\u0003", "\u0004", "\u0005", "\u0006", "\u0007",
		"\u0008", "\u0009", "\u000B", "\u000C", "\u000E", "\u000F",
	}

	for _, char := range controlChars {
		if strings.Contains(s, char) {
			h.t.Errorf(ErrControlCharFound, char[0], s)
		}
	}

	if strings.Contains(s, "<") || strings.Contains(s, ">") {
		h.t.Error("HTMLタグが検出されました")
	}
}

// TestMain はテストの初期化を行います。
// この関数は以下の処理を行います：
// - ログディレクトリの作成
// - ロガーの初期化
// - キャッシュの設定
func TestMain(m *testing.M) {
	// ログディレクトリの作成
	logDir := filepath.Join("logs", "tests")
	if err := os.MkdirAll(logDir, DefaultLogDirPerm); err != nil {
		fmt.Printf("ログディレクトリの作成に失敗しました: %v\n", err)
		os.Exit(1)
	}

	// ロガーの初期化
	config := applogger.DefaultConfig()
	config.LogLevel = applogger.LevelDebug
	config.LogDir = logDir

	if err := applogger.InitLoggers(config); err != nil {
		fmt.Printf("ロガーの初期化に失敗しました: %v\n", err)
		os.Exit(1)
	}

	// テスト用のキャッシュ設定（有効期限を5秒に設定）
	if err := cache.GetInstance().Set("test:config", struct{}{}, 5*time.Second); err != nil {
		fmt.Printf("キャッシュの設定に失敗しました: %v\n", err)
		os.Exit(1)
	}

	// テストの実行
	code := m.Run()
	os.Exit(code)
}

// SetupTestHandler はテスト用のEchoインスタンスとハンドラーを作成します。
// この関数は以下の処理を行います：
// - データベース接続の設定
// - リポジトリの初期化
// - ハンドラーの作成
func SetupTestHandler(middlewares ...echo.MiddlewareFunc) (*echo.Echo, *university.Handler) {
	e := echo.New()
	for _, m := range middlewares {
		e.Use(m)
	}

	db := repositories.SetupTestDB(nil, nil)
	repo := repositories.NewUniversityRepository(db)
	handler := university.NewUniversityHandler(repo, 5*time.Second)

	return e, handler
}

// RequestConfig はテストリクエストの設定を保持します。
// この構造体は以下の設定を保持します：
// - HTTPメソッド
// - パス
// - リクエストボディ
// - タイムアウト
// - ヘッダー
// - クエリパラメータ
type RequestConfig struct {
	Method      string
	Path        string
	Body        interface{}
	Timeout     time.Duration
	Headers     map[string]string
	QueryParams map[string]string
}

// ExecuteRequest はテストリクエストを実行し、レスポンスを返します。
// この関数は以下の処理を行います：
// - リクエストの作成
// - ハンドラーの実行
// - レスポンスの返却
func ExecuteRequest(e *echo.Echo, config RequestConfig, handler echo.HandlerFunc) (*httptest.ResponseRecorder, error) {
	var reqBody []byte

	if config.Body != nil {
		var err error
		reqBody, err = json.Marshal(config.Body)

		if err != nil {
			return nil, fmt.Errorf("リクエストボディのマーシャリングに失敗しました: %w", err)
		}
	}

	// クエリパラメータの追加
	if len(config.QueryParams) > 0 {
		values := url.Values{}
		for key, value := range config.QueryParams {
			values.Add(key, value)
		}

		config.Path = config.Path + "?" + values.Encode()
	}

	req := httptest.NewRequest(config.Method, config.Path, bytes.NewBuffer(reqBody))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)

	for key, value := range config.Headers {
		req.Header.Set(key, value)
	}

	if config.Timeout > 0 {
		ctx, cancel := context.WithTimeout(req.Context(), config.Timeout)
		defer cancel()

		req = req.WithContext(ctx)
	}

	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	if err := handler(c); err != nil {
		return nil, fmt.Errorf("ハンドラーの実行に失敗しました: %w", err)
	}

	return rec, nil
}

// ParseResponse はレスポンスボディを指定された型にパースします。
// この関数は以下の処理を行います：
// - レスポンスのデコード
// - エラーハンドリング
func ParseResponse(rec *httptest.ResponseRecorder, v interface{}) error {
	return json.NewDecoder(rec.Body).Decode(v)
}

// validateErrorResponse はエラーレスポンスを検証します。
// この関数は以下の処理を行います：
// - ステータスコードの検証
// - エラーメッセージの検証
func validateErrorResponse(t testing.TB, rec *httptest.ResponseRecorder, wantStatus int, wantError string) {
	t.Helper()

	if rec.Code != wantStatus {
		t.Errorf("ステータスコードが期待値と異なります: got = %v, want = %v", rec.Code, wantStatus)
	}

	var resp struct {
		Error string `json:"error"`
	}

	err := ParseResponse(rec, &resp)

	if err != nil {
		t.Fatalf("エラーレスポンスのパースに失敗しました: %v", err)
	}

	if resp.Error != wantError {
		t.Errorf("エラーメッセージが期待値と異なります: got = %v, want = %v", resp.Error, wantError)
	}
}

// SetupTestServer はテストサーバーをセットアップします
// この関数は以下の処理を行います：
// - ログの設定
// - データベースの初期化
// - ミドルウェアの設定
func SetupTestServer(t *testing.T, config *TestConfig) (*echo.Echo, *university.Handler, *gorm.DB, error) {
	t.Helper()

	if err := os.MkdirAll(config.LogDir, DefaultLogDirPerm); err != nil {
		return nil, nil, nil, &TestError{
			Code:    "LOG_DIR_CREATE_FAILED",
			Message: fmt.Sprintf("ログディレクトリの作成に失敗しました: %v", err),
		}
	}

	loggerConfig := applogger.DefaultConfig()
	loggerConfig.LogLevel = config.LogLevel
	loggerConfig.LogDir = config.LogDir

	if err := applogger.InitLoggers(loggerConfig); err != nil {
		return nil, nil, nil, &TestError{
			Code:    "LOGGER_INIT_FAILED",
			Message: fmt.Sprintf("ロガーの初期化に失敗しました: %v", err),
		}
	}

	e := echo.New()
	db := repositories.SetupTestDB(t, nil)

	if db == nil {
		return nil, nil, nil, &TestError{
			Code:    "DB_INIT_FAILED",
			Message: ErrInitDB,
		}
	}

	if err := cleanupDatabase(db); err != nil {
		return nil, nil, nil, &TestError{
			Code:    "DB_CLEANUP_FAILED",
			Message: fmt.Sprintf(ErrCleanupDB, "all", err),
		}
	}

	e.Use(middleware.CSRFMiddleware())
	e.Use(middleware.Sanitizer(middleware.SanitizerConfig{
		Fields: []string{"name"},
	}))

	if err := cache.GetInstance().Set("test:config", struct{}{}, config.CacheTimeout); err != nil {
		return nil, nil, nil, &TestError{
			Code:    "CACHE_SET_FAILED",
			Message: fmt.Sprintf("キャッシュの設定に失敗しました: %v", err),
		}
	}

	repo := repositories.NewUniversityRepository(db)
	handler := university.NewUniversityHandler(repo, config.CacheTimeout)

	return e, handler, db, nil
}

// cleanupDatabase はデータベースをクリーンアップします
// この関数は以下の処理を行います：
// - 制約の遅延
// - テーブルのクリーンアップ
// - 制約の即時適用
func cleanupDatabase(db *gorm.DB) error {
	if err := db.Exec("SET CONSTRAINTS ALL DEFERRED").Error; err != nil {
		return err
	}

	tables := []string{
		"subjects", "test_types", "admission_schedules", "admission_infos",
		"majors", "departments", "universities",
	}

	for _, table := range tables {
		if err := db.Exec(fmt.Sprintf("TRUNCATE TABLE %s CASCADE", table)).Error; err != nil {
			return err
		}
	}

	return db.Exec("SET CONSTRAINTS ALL IMMEDIATE").Error
}

// WithLogLevel はログレベルを設定するオプション関数です
// この関数は以下の処理を行います：
// - ログレベルの設定
func WithLogLevel(level slog.Level) func(*TestConfig) {
	return func(c *TestConfig) {
		c.LogLevel = level
	}
}

// WithCacheTimeout はキャッシュのタイムアウトを設定するオプション関数です
// この関数は以下の処理を行います：
// - キャッシュタイムアウトの設定
func WithCacheTimeout(timeout time.Duration) func(*TestConfig) {
	return func(c *TestConfig) {
		c.CacheTimeout = timeout
	}
}

// ValidateResponse はレスポンスの基本検証を行います
// この関数は以下の処理を行います：
// - エラーレスポンスの検証
// - ステータスコードの検証
func ValidateResponse(t *testing.T, rec *httptest.ResponseRecorder, tc TestCase) {
	t.Helper()

	if tc.WantError != "" {
		validateErrorResponse(t, rec, tc.WantStatus, tc.WantError)
		return
	}

	if rec.Code != tc.WantStatus {
		t.Errorf(ErrMsgStatusMismatch, tc.Name, rec.Code, tc.WantStatus)
	}
}

// TestCase はテストケースの基本構造を定義します
// この構造体は以下の情報を保持します：
// - テストケース名
// - セットアップ関数
// - 期待されるステータスコード
// - 期待されるエラーメッセージ
// - 検索クエリ
// - 待機時間
// - 期待される件数
type TestCase struct {
	Name       string                                    // テストケースの名前
	Setup      func(*testing.T, *echo.Echo, *university.Handler) // テストケースのセットアップ関数
	WantStatus int                                      // 期待されるステータスコード
	WantError  string                                   // 期待されるエラーメッセージ
	Query      string                                   // 検索クエリ
	Sleep      time.Duration                           // キャッシュテスト用の待機時間
	WantCount  int                                     // 期待される検索結果件数
}

// cacheTestCase はキャッシュ関連のテストケースを定義します
// この構造体は以下の情報を保持します：
// - テストケース
// - 検索クエリ
// - 待機時間
// - 期待される件数
// - 初期キャッシュ状態
type cacheTestCase struct {
	TestCase
	query      string                                    // 検索クエリ
	sleep      time.Duration                            // キャッシュの有効期限を待機する時間
	wantCount  int                                      // 期待される結果の件数
	isInitial  bool                                     // 初期キャッシュ状態かどうか
}

// validateCacheResponse はキャッシュテストのレスポンスを検証します
// この関数は以下の処理を行います：
// - ステータスコードの検証
// - レスポンスのパース
// - 件数の検証
func validateCacheResponse(t *testing.T, rec *httptest.ResponseRecorder, tt TestCase) {
	if rec.Code != tt.WantStatus {
		t.Errorf("ステータスコードが期待値と異なります: got = %d, want = %d", rec.Code, tt.WantStatus)
		return
	}

	var response struct {
		Data []models.University `json:"data"`
	}

	if err := json.NewDecoder(rec.Body).Decode(&response); err != nil {
		t.Errorf("レスポンスのパースに失敗しました: %v", err)
		return
	}

	if len(response.Data) != tt.WantCount {
		t.Errorf("検索結果の件数が期待値と異なります: got = %d, want = %d", len(response.Data), tt.WantCount)
	}
}

// TestGetUniversitiesWithCache はキャッシュを使用した大学一覧取得のテストを行います
// このテストは以下のケースを検証します：
// - キャッシュミス時の取得
// - キャッシュヒット時の取得
// - キャッシュ有効期限切れ時の取得
func TestGetUniversitiesWithCache(t *testing.T) {
	e, handler := SetupTestHandler()

	tests := []cacheTestCase{
		{
			TestCase: TestCase{
				Name:       TestCaseCacheMiss,
				Setup: func(t *testing.T, _ *echo.Echo, _ *university.Handler) {
					if err := cache.GetInstance().Delete("universities:all"); err != nil {
						t.Errorf("キャッシュの削除に失敗しました: %v", err)
					}
				},
				WantStatus: http.StatusOK,
			},
			wantCount: 1,
			isInitial: true,
		},
		{
			TestCase: TestCase{
				Name:       TestCaseCacheHit,
				WantStatus: http.StatusOK,
			},
			wantCount: 1,
			isInitial: false,
		},
		{
			TestCase: TestCase{
				Name:       TestCaseCacheExpired,
				Setup: func(t *testing.T, _ *echo.Echo, _ *university.Handler) {
					if err := cache.GetInstance().Delete("universities:all"); err != nil {
						t.Errorf("キャッシュの削除に失敗しました: %v", err)
					}
				},
				WantStatus: http.StatusOK,
			},
			wantCount: 1,
			isInitial: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.Name, func(t *testing.T) {
			if tt.Setup != nil {
				tt.Setup(t, e, handler)
			}

			rec, err := ExecuteRequest(e, RequestConfig{
				Method: http.MethodGet,
				Path:   apiUniversitiesPath,
			}, handler.GetUniversities)
			if err != nil {
				t.Fatalf(ErrMsgRequestFailed, err)
			}

			validateCacheResponse(t, rec, tt.TestCase)
		})
	}
}

// TestSearchUniversitiesWithCacheExpiration は検索機能のキャッシュ有効期限切れのテストを行います
// このテストは以下のケースを検証します：
// - キャッシュヒット時の検索
// - キャッシュ有効期限切れ時の検索
func TestSearchUniversitiesWithCacheExpiration(t *testing.T) {
	e, handler := SetupTestHandler()

	tests := []cacheTestCase{
		{
			TestCase: TestCase{
				Name:       TestCaseCacheHit,
				WantStatus: http.StatusOK,
			},
			query:     "テスト",
			sleep:     1 * time.Second,
			wantCount: 1,
		},
		{
			TestCase: TestCase{
				Name:       TestCaseCacheExpired,
				WantStatus: http.StatusOK,
			},
			query:     "テスト",
			sleep:     6 * time.Second,  // キャッシュ有効期限（5秒）より長い待機時間
			wantCount: 1,
		},
	}

	for _, tt := range tests {
		t.Run(tt.Name, func(t *testing.T) {
			path := fmt.Sprintf(apiUniversitiesSearchPath, tt.query)
			searchHandler := search.NewSearchHandler(handler.GetRepo(), 5*time.Second)

			// 最初のリクエストでキャッシュを作成
			rec, err := ExecuteRequest(e, RequestConfig{
				Method: http.MethodGet,
				Path:   path,
			}, searchHandler.SearchUniversities)
			if err != nil {
				t.Fatalf(ErrMsgRequestFailed, err)
			}

			validateCacheResponse(t, rec, tt.TestCase)

			time.Sleep(tt.sleep)

			// 2回目のリクエスト
			rec, err = ExecuteRequest(e, RequestConfig{
				Method: http.MethodGet,
				Path:   path,
			}, searchHandler.SearchUniversities)
			if err != nil {
				t.Fatalf(ErrMsgRequestFailed, err)
			}

			validateCacheResponse(t, rec, tt.TestCase)
		})
	}
}
