package test_helpers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
	"university-exam-api/internal/domain/models"
	"university-exam-api/internal/handlers/university"
	"university-exam-api/internal/middleware"
	"university-exam-api/internal/repositories"

	"errors"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

const (
	// APIパス
	CSRFTokenPath = "/csrf"
	APIUniversitiesPath = "/api/universities"
	TestUniversityPath = "/api/universities/1"

	// HTTPヘッダー
	ContentTypeHeader = "Content-Type"
	ContentTypeJSON = "application/json"
	CSRFTokenHeader = "X-CSRF-Token"

	// テストデータ
	TestUniversityName = "CSRFテスト大学"
	TestDepartmentName = "CSRFテスト学部"

	// エラーメッセージ
	ErrRequestFailed = "リクエストの実行に失敗: %v"
	ErrMarshalTestData = "テストデータのマーシャルに失敗: %v"
	ErrUnmarshalResponse = "レスポンスのアンマーシャルに失敗: %v"
	ErrParsingResponse = "レスポンスのパースに失敗: %v"
	ErrLoadTestData = "テストデータの読み込みに失敗: %v"
	ErrParseTestData = "テストデータのパースに失敗: %v"
	ErrInitDB = "データベースの初期化に失敗"
	ErrCleanupDB = "データベースのクリーンアップに失敗: %v"
	ErrInvalidStatusCode = "ステータスコードが一致しません: got %v want %v"
	ErrInvalidResponse = "レスポンスが一致しません:\ngot  %v\nwant %v"
	ErrInvalidErrorMessage = "エラーメッセージが一致しません: got %v want %v"
	ErrTestCleanup = "テストのクリーンアップに失敗: %v"
	ErrXSSDetected = "エスケープされていないXSSペイロードを検出: %s in %s"
	ErrControlCharDetected = "制御文字が検出されました: %x in %s"
	ErrHTMLTagDetected = "HTMLタグが検出されました"
)

// TestData はテストデータの構造を定義します
type TestData struct {
	Universities []models.University `json:"universities"`
}

// LoadTestData はJSONファイルからテストデータを読み込みます
func LoadTestData(t *testing.T, filename string) TestData {
	t.Helper()

	data, err := os.ReadFile(filepath.Join("testdata", filename))
	if err != nil {
		t.Fatalf(ErrLoadTestData, err)
	}

	var testData TestData
	if err := json.Unmarshal(data, &testData); err != nil {
		t.Fatalf(ErrParseTestData, err)
	}

	return testData
}

// SetupTestServer はテストサーバーをセットアップします
func SetupTestServer(t *testing.T) (*echo.Echo, *university.UniversityHandler, *gorm.DB, error) {
	t.Helper()

	e := echo.New()
	db := repositories.SetupTestDB(t, nil)
	if db == nil {
		return nil, nil, nil, errors.New(ErrInitDB)
	}

	// データベースをクリーンアップ
	if err := cleanupDatabase(db); err != nil {
		return nil, nil, nil, fmt.Errorf(ErrCleanupDB, err)
	}

	// ミドルウェアの設定
	e.Use(middleware.CSRFMiddleware())
	e.Use(middleware.Sanitizer(middleware.SanitizerConfig{
		Fields: []string{"name"},
	}))

	repo := repositories.NewUniversityRepository(db)
	handler := university.NewUniversityHandler(repo, 5*time.Second)

	return e, handler, db, nil
}

// cleanupDatabase はデータベースをクリーンアップします
func cleanupDatabase(db *gorm.DB) error {
	// 外部キー制約を一時的に無効化
	if err := db.Exec("SET CONSTRAINTS ALL DEFERRED").Error; err != nil {
		return err
	}

	// 全てのテーブルをクリーンアップ
	tables := []string{
		"subjects",
		"test_types",
		"admission_schedules",
		"admission_infos",
		"majors",
		"departments",
		"universities",
	}

	for _, table := range tables {
		if err := db.Exec(fmt.Sprintf("TRUNCATE TABLE %s CASCADE", table)).Error; err != nil {
			return err
		}
	}

	// 外部キー制約を再度有効化
	return db.Exec("SET CONSTRAINTS ALL IMMEDIATE").Error
}

// CreateTestContext はテストコンテキストを作成します
func CreateTestContext(e *echo.Echo, method, path string, body interface{}) (*httptest.ResponseRecorder, echo.Context) {
	var req *http.Request

	if body != nil {
		jsonBody, _ := json.Marshal(body)
		req = httptest.NewRequest(method, path, strings.NewReader(string(jsonBody)))
		req.Header.Set(ContentTypeHeader, ContentTypeJSON)
	} else {
		req = httptest.NewRequest(method, path, nil)
	}

	// CSRFトークンを設定
	token := "test-csrf-token"
	req.Header.Set(CSRFTokenHeader, token)

	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.Set("csrf", token)

	return rec, c
}

// AssertStatusCode はステータスコードを検証します
func AssertStatusCode(t *testing.T, got, want int) {
	t.Helper()
	if got != want {
		t.Errorf(ErrInvalidStatusCode, got, want)
	}
}

// AssertJSONResponse はJSONレスポンスを検証します
func AssertJSONResponse(t *testing.T, rec *httptest.ResponseRecorder, want interface{}) {
	t.Helper()

	var got interface{}
	if err := json.Unmarshal(rec.Body.Bytes(), &got); err != nil {
		t.Fatalf(ErrParsingResponse, err)
	}

	if fmt.Sprintf("%v", got) != fmt.Sprintf("%v", want) {
		t.Errorf(ErrInvalidResponse, got, want)
	}
}

// AssertErrorResponse はエラーレスポンスを検証します
func AssertErrorResponse(t *testing.T, rec *httptest.ResponseRecorder, wantStatus int, wantMessage string) {
	t.Helper()

	AssertStatusCode(t, rec.Code, wantStatus)

	var response map[string]string
	if err := json.Unmarshal(rec.Body.Bytes(), &response); err != nil {
		t.Fatalf(ErrParsingResponse, err)
	}

	if message, ok := response["error"]; !ok || message != wantMessage {
		t.Errorf(ErrInvalidErrorMessage, message, wantMessage)
	}
}

// CleanupTest はテストのクリーンアップを行います
func CleanupTest(t *testing.T, db *gorm.DB) {
	t.Helper()
	if err := cleanupDatabase(db); err != nil {
		t.Errorf(ErrTestCleanup, err)
	}
}

// AssertValidationError はバリデーションエラーを検証します
func AssertValidationError(t *testing.T, rec *httptest.ResponseRecorder, field, expectedError string) {
	t.Helper()

	var response map[string]string
	if err := json.Unmarshal(rec.Body.Bytes(), &response); err != nil {
		t.Fatalf(ErrParsingResponse, err)
	}

	if message, ok := response["error"]; !ok || message != expectedError {
		t.Errorf("エラーメッセージが一致しません: got %v want %v", message, expectedError)
	}
}

// AssertXSSEscaped はXSSペイロードが適切にエスケープされていることを確認します
func AssertXSSEscaped(t *testing.T, s string) {
	t.Helper()

	dangerousPatterns := []string{
		"<script>",
		"</script>",
		"javascript:",
		"onerror=",
		"onclick=",
		"onload=",
		"onmouseover=",
	}

	for _, pattern := range dangerousPatterns {
		if strings.Contains(strings.ToLower(s), strings.ToLower(pattern)) {
			t.Errorf(ErrXSSDetected, pattern, s)
		}
	}
}

// AssertSpecialCharsSanitized は特殊文字が適切にサニタイズされていることを確認します
func AssertSpecialCharsSanitized(t *testing.T, s string) {
	t.Helper()

	// 制御文字のパターン
	controlChars := []string{
		"\u0000", // Null
		"\u0001", // Start of Heading
		"\u0002", // Start of Text
		"\u0003", // End of Text
		"\u0004", // End of Transmission
		"\u0005", // Enquiry
		"\u0006", // Acknowledge
		"\u0007", // Bell
		"\u0008", // Backspace
		"\u0009", // Horizontal Tab (許可する場合もある)
		"\u000B", // Vertical Tab
		"\u000C", // Form Feed
		"\u000E", // Shift Out
		"\u000F", // Shift In
	}

	for _, char := range controlChars {
		if strings.Contains(s, char) {
			t.Errorf(ErrControlCharDetected, char[0], s)
		}
	}

	// HTMLタグのパターン
	if strings.Contains(s, "<") || strings.Contains(s, ">") {
		t.Error(ErrHTMLTagDetected)
	}
}
