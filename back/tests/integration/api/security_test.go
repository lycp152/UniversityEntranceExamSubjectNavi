package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
	"time"
	"university-exam-api/internal/domain/models"
	"university-exam-api/tests/integration/api/test_helpers"

	"github.com/labstack/echo/v4"
)

const (
	errSetupTestServer = "Failed to setup test server: %v"
	errGetUnderlyingDB = "Failed to get underlying *sql.DB: %v"
)

// TestInputValidation は入力値の検証を行います
func TestInputValidation(t *testing.T) {
	e, handler, db, err := test_helpers.SetupTestServer(t)
	if err != nil {
		t.Fatalf(errSetupTestServer, err)
	}
	sqlDB, err := db.DB()
	if err != nil {
		t.Fatalf(errGetUnderlyingDB, err)
	}
	defer sqlDB.Close()

	testCases := []struct {
		name           string
		method         string
		path           string
		body           interface{}
		expectedStatus int
		expectedError  string
	}{
		{
			name:   "大学名が空",
			method: http.MethodPost,
			path:   test_helpers.APIUniversitiesPath,
			body: models.University{
				Name: "",
				Departments: []models.Department{
					{
						Name: "テスト学部",
					},
				},
			},
			expectedStatus: http.StatusBadRequest,
			expectedError:  "大学名は必須です",
		},
		{
			name:   "学部名が長すぎる",
			method: http.MethodPost,
			path:   test_helpers.APIUniversitiesPath,
			body: models.University{
				Name: "テスト大学",
				Departments: []models.Department{
					{
						Name: strings.Repeat("あ", 101), // 100文字制限を超える
					},
				},
			},
			expectedStatus: http.StatusBadRequest,
			expectedError:  "学部名は100文字以内である必要があります",
		},
		{
			name:   "入学定員が負数",
			method: http.MethodPost,
			path:   test_helpers.APIUniversitiesPath,
			body: models.University{
				Name: "テスト大学",
				Departments: []models.Department{
					{
						Name: "テスト学部",
						Majors: []models.Major{
							{
								Name: "テスト学科",
								AdmissionSchedules: []models.AdmissionSchedule{
									{
										Name: "前期",
										AdmissionInfos: []models.AdmissionInfo{
											{
												Enrollment: -1,
											},
										},
									},
								},
							},
						},
					},
				},
			},
			expectedStatus: http.StatusBadRequest,
			expectedError:  "入学定員は0より大きい必要があります",
		},
		{
			name:   "科目の得点が負数",
			method: http.MethodPost,
			path:   test_helpers.APIUniversitiesPath,
			body: models.University{
				Name: "テスト大学",
				Departments: []models.Department{
					{
						Name: "テスト学部",
						Majors: []models.Major{
							{
								Name: "テスト学科",
								AdmissionSchedules: []models.AdmissionSchedule{
									{
										Name: "前期",
										AdmissionInfos: []models.AdmissionInfo{
											{
												Enrollment: 100,
											},
										},
										TestTypes: []models.TestType{
											{
												Name: "一般選抜",
												Subjects: []models.Subject{
													{
														Name:  "テスト科目",
														Score: -10,
													},
												},
											},
										},
									},
								},
							},
						},
					},
				},
			},
			expectedStatus: http.StatusBadRequest,
			expectedError:  "科目の得点は0以上である必要があります",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			jsonData, err := json.Marshal(tc.body)
			if err != nil {
				t.Fatalf(test_helpers.ErrMarshalTestData, err)
			}

			rec, c := test_helpers.CreateTestContext(e, tc.method, tc.path, nil)
			c.Request().Body = io.NopCloser(bytes.NewBuffer(jsonData))
			c.Request().Header.Set(test_helpers.ContentTypeHeader, test_helpers.ContentTypeJSON)

			err = handler.CreateUniversity(c)
			if err != nil {
				t.Fatalf(test_helpers.ErrRequestFailed, err)
			}

			test_helpers.AssertValidationError(t, rec, "", tc.expectedError)
		})
	}
}

// TestSQLInjectionPrevention はSQLインジェクション対策を検証します
func TestSQLInjectionPrevention(t *testing.T) {
	e, handler, db, err := test_helpers.SetupTestServer(t)
	if err != nil {
		t.Fatalf(errSetupTestServer, err)
	}
	sqlDB, err := db.DB()
	if err != nil {
		t.Fatalf(errGetUnderlyingDB, err)
	}
	defer sqlDB.Close()

	testCases := []struct {
		name           string
		maliciousInput string
		expectedStatus int
	}{
		{
			name:           "SQLインジェクション防御: ' OR '1'='1",
			maliciousInput: "' OR '1'='1",
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:           "SQLインジェクション防御: DROP TABLE",
			maliciousInput: "'; DROP TABLE universities; --",
			expectedStatus: http.StatusBadRequest,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// 不正な入力を含むリクエストを作成
			university := models.University{
				Name: tc.maliciousInput,
			}

			jsonData, err := json.Marshal(university)
			if err != nil {
				t.Fatalf("リクエストのJSONエンコードに失敗: %v", err)
			}

			rec, c := test_helpers.CreateTestContext(e, http.MethodPost, test_helpers.APIUniversitiesPath, nil)
			c.Request().Body = io.NopCloser(bytes.NewBuffer(jsonData))
			c.Request().Header.Set(test_helpers.ContentTypeHeader, test_helpers.ContentTypeJSON)

			// リクエストを実行
			err = handler.CreateUniversity(c)
			if err != nil {
				t.Logf("予期されたエラー: %v", err)
			}

			// レスポンスを検証
			if rec.Code != tc.expectedStatus {
				t.Errorf("予期しないステータスコード: got %v want %v", rec.Code, tc.expectedStatus)
			}
		})
	}
}

// TestErrorHandling はエラーハンドリングを検証します
func TestErrorHandling(t *testing.T) {
	e, handler, db, err := test_helpers.SetupTestServer(t)
	if err != nil {
		t.Fatalf(errSetupTestServer, err)
	}
	sqlDB, err := db.DB()
	if err != nil {
		t.Fatalf(errGetUnderlyingDB, err)
	}
	defer sqlDB.Close()

	testCases := []struct {
		name           string
		setup         func() (*httptest.ResponseRecorder, echo.Context)
		expectedStatus int
		expectedError  string
	}{
		{
			name: "存在しない大学のID",
			setup: func() (*httptest.ResponseRecorder, echo.Context) {
				rec, c := test_helpers.CreateTestContext(e, http.MethodGet, "/api/universities/999999", nil)
				c.SetParamNames("id")
				c.SetParamValues("999999")
				return rec, c
			},
			expectedStatus: http.StatusNotFound,
			expectedError:  "大学が見つかりません",
		},
		{
			name: "不正なIDフォーマット",
			setup: func() (*httptest.ResponseRecorder, echo.Context) {
				rec, c := test_helpers.CreateTestContext(e, http.MethodGet, "/api/universities/invalid", nil)
				c.SetParamNames("id")
				c.SetParamValues("invalid")
				return rec, c
			},
			expectedStatus: http.StatusBadRequest,
			expectedError:  "不正なID形式です",
		},
		{
			name: "不正なJSONフォーマット",
			setup: func() (*httptest.ResponseRecorder, echo.Context) {
				rec, c := test_helpers.CreateTestContext(e, http.MethodPost, test_helpers.APIUniversitiesPath, nil)
				c.Request().Body = io.NopCloser(bytes.NewBufferString("invalid json"))
				c.Request().Header.Set(test_helpers.ContentTypeHeader, test_helpers.ContentTypeJSON)
				return rec, c
			},
			expectedStatus: http.StatusBadRequest,
			expectedError:  "不正なリクエスト形式です",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			rec, c := tc.setup()

			var err error
			switch c.Request().Method {
			case http.MethodGet:
				err = handler.GetUniversity(c)
			case http.MethodPost:
				err = handler.CreateUniversity(c)
			}

			if err != nil {
				t.Fatalf(test_helpers.ErrRequestFailed, err)
			}

			test_helpers.AssertErrorResponse(t, rec, tc.expectedStatus, tc.expectedError)
		})
	}
}

// TestRateLimiting はレート制限機能をテストします
func TestRateLimiting(t *testing.T) {
	e, handler, db, err := test_helpers.SetupTestServer(t)
	if err != nil {
		t.Fatalf(errSetupTestServer, err)
	}
	sqlDB, err := db.DB()
	if err != nil {
		t.Fatalf(errGetUnderlyingDB, err)
	}
	defer sqlDB.Close()

	const (
		numRequests = 100  // 短時間での総リクエスト数
		timeWindow  = 1    // 時間枠（秒）
		maxRequests = 50   // 時間枠内での最大リクエスト数
	)

	// 短時間で大量のリクエストを送信
	results := make([]int, numRequests)
	for i := 0; i < numRequests; i++ {
		rec, c := test_helpers.CreateTestContext(e, http.MethodGet, test_helpers.APIUniversitiesPath, nil)

		err := handler.GetUniversities(c)
		if err != nil {
			t.Fatalf(test_helpers.ErrRequestFailed, err)
		}

		results[i] = rec.Code
		time.Sleep(time.Duration(timeWindow) * time.Second / time.Duration(numRequests))
	}

	// レート制限の検証
	tooManyRequests := 0
	for _, code := range results {
		if code == http.StatusTooManyRequests {
			tooManyRequests++
		}
	}

	// 一定数のリクエストが制限されていることを確認
	expectedMin := numRequests - maxRequests
	if tooManyRequests < expectedMin {
		t.Errorf("レート制限が正しく機能していません: %d requests were limited, expected at least %d",
			tooManyRequests, expectedMin)
	}

	// クールダウン後のリクエストが成功することを確認
	time.Sleep(time.Duration(timeWindow) * time.Second)
	rec, c := test_helpers.CreateTestContext(e, http.MethodGet, test_helpers.APIUniversitiesPath, nil)

	err = handler.GetUniversities(c)
	if err != nil {
		t.Fatalf(test_helpers.ErrRequestFailed, err)
	}

	if rec.Code != http.StatusOK {
		t.Errorf("クールダウン後のリクエストが失敗: got %v, want %v",
			rec.Code, http.StatusOK)
	}
}

// TestConcurrentRateLimiting は並行アクセス時のレート制限をテストします
func TestConcurrentRateLimiting(t *testing.T) {
	e, handler, db, err := test_helpers.SetupTestServer(t)
	if err != nil {
		t.Fatalf(errSetupTestServer, err)
	}
	sqlDB, err := db.DB()
	if err != nil {
		t.Fatalf(errGetUnderlyingDB, err)
	}
	defer sqlDB.Close()

	const (
		numGoroutines = 10
		numRequests   = 20
	)

	var (
		wg      sync.WaitGroup
		mu      sync.Mutex
		results = make([][]int, numGoroutines)
	)

	for i := 0; i < numGoroutines; i++ {
		wg.Add(1)
		go func(index int) {
			defer wg.Done()

			localResults := make([]int, numRequests)
			for j := 0; j < numRequests; j++ {
				rec, c := test_helpers.CreateTestContext(e, http.MethodGet, test_helpers.APIUniversitiesPath, nil)

				err := handler.GetUniversities(c)
				if err != nil {
					t.Errorf("ゴルーチン %d のリクエスト %d が失敗: %v",
						index, j, err)
					return
				}

				localResults[j] = rec.Code
				time.Sleep(50 * time.Millisecond)
			}

			mu.Lock()
			results[index] = localResults
			mu.Unlock()
		}(i)
	}

	wg.Wait()

	// 結果の分析
	var (
		totalRequests     = 0
		limitedRequests   = 0
		successRequests   = 0
	)

	for _, goroutineResults := range results {
		for _, code := range goroutineResults {
			totalRequests++
			if code == http.StatusTooManyRequests {
				limitedRequests++
			} else if code == http.StatusOK {
				successRequests++
			}
		}
	}

	// レート制限が機能していることを確認
	if limitedRequests == 0 {
		t.Error("並行アクセス時にレート制限が機能していません")
	}

	// 一定数のリクエストは成功していることを確認
	if successRequests == 0 {
		t.Error("すべてのリクエストが制限されています")
	}

	t.Logf("総リクエスト数: %d, 制限されたリクエスト: %d, 成功したリクエスト: %d",
		totalRequests, limitedRequests, successRequests)
}

// TestAuthentication は認証機能をテストします
func TestAuthentication(t *testing.T) {
	e, handler, db, err := test_helpers.SetupTestServer(t)
	if err != nil {
		t.Fatalf(errSetupTestServer, err)
	}
	sqlDB, err := db.DB()
	if err != nil {
		t.Fatalf(errGetUnderlyingDB, err)
	}
	defer sqlDB.Close()

	testCases := []struct {
		name           string
		setupAuth      func(*httptest.ResponseRecorder, echo.Context)
		expectedStatus int
		expectedError  string
	}{
		{
			name: "認証トークンなし",
			setupAuth: func(rec *httptest.ResponseRecorder, c echo.Context) {
				// 認証ヘッダーを設定しない
			},
			expectedStatus: http.StatusUnauthorized,
			expectedError:  "認証が必要です",
		},
		{
			name: "不正な認証トークン",
			setupAuth: func(rec *httptest.ResponseRecorder, c echo.Context) {
				c.Request().Header.Set("Authorization", "Bearer invalid-token")
			},
			expectedStatus: http.StatusUnauthorized,
			expectedError:  "不正な認証トークンです",
		},
		{
			name: "有効期限切れの認証トークン",
			setupAuth: func(rec *httptest.ResponseRecorder, c echo.Context) {
				c.Request().Header.Set("Authorization", "Bearer expired-token")
			},
			expectedStatus: http.StatusUnauthorized,
			expectedError:  "認証トークンの有効期限が切れています",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			rec, c := test_helpers.CreateTestContext(e, http.MethodPost, test_helpers.APIUniversitiesPath, nil)
			tc.setupAuth(rec, c)

			// リクエストの実行
			if err := handler.CreateUniversity(c); err != nil {
				t.Errorf("予期しないエラーが発生: %v", err)
			}

			// レスポンスの検証
			test_helpers.AssertErrorResponse(t, rec, tc.expectedStatus, tc.expectedError)
		})
	}
}

// TestAuthorization は認可機能をテストします
func TestAuthorization(t *testing.T) {
	e, handler, db, err := test_helpers.SetupTestServer(t)
	if err != nil {
		t.Fatalf(errSetupTestServer, err)
	}
	sqlDB, err := db.DB()
	if err != nil {
		t.Fatalf(errGetUnderlyingDB, err)
	}
	defer sqlDB.Close()

	testCases := []struct {
		name           string
		setupAuth      func(*httptest.ResponseRecorder, echo.Context)
		method         string
		path           string
		expectedStatus int
		expectedError  string
	}{
		{
			name: "読み取り専用ユーザーによる更新操作",
			setupAuth: func(rec *httptest.ResponseRecorder, c echo.Context) {
				c.Request().Header.Set("Authorization", "Bearer readonly-token")
			},
			method:         http.MethodPut,
			path:           test_helpers.TestUniversityPath,
			expectedStatus: http.StatusForbidden,
			expectedError:  "この操作を実行する権限がありません",
		},
		{
			name: "一般ユーザーによる削除操作",
			setupAuth: func(rec *httptest.ResponseRecorder, c echo.Context) {
				c.Request().Header.Set("Authorization", "Bearer normal-user-token")
			},
			method:         http.MethodDelete,
			path:           test_helpers.TestUniversityPath,
			expectedStatus: http.StatusForbidden,
			expectedError:  "この操作を実行する権限がありません",
		},
		{
			name: "管理者による操作",
			setupAuth: func(rec *httptest.ResponseRecorder, c echo.Context) {
				c.Request().Header.Set("Authorization", "Bearer admin-token")
			},
			method:         http.MethodDelete,
			path:           test_helpers.TestUniversityPath,
			expectedStatus: http.StatusNoContent,
			expectedError:  "",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			rec, c := test_helpers.CreateTestContext(e, tc.method, tc.path, nil)
			tc.setupAuth(rec, c)

			switch tc.method {
			case http.MethodPut:
				c.SetParamNames("id")
				c.SetParamValues("1")
				if err := handler.UpdateUniversity(c); err != nil {
					t.Fatalf(test_helpers.ErrRequestFailed, err)
				}
			case http.MethodDelete:
				c.SetParamNames("id")
				c.SetParamValues("1")
				if err := handler.DeleteUniversity(c); err != nil {
					t.Fatalf(test_helpers.ErrRequestFailed, err)
				}
			}

			if tc.expectedError != "" {
				test_helpers.AssertErrorResponse(t, rec, tc.expectedStatus, tc.expectedError)
			} else {
				test_helpers.AssertStatusCode(t, rec.Code, tc.expectedStatus)
			}
		})
	}
}

// TestXSSPrevention はXSS攻撃対策を検証します
func TestXSSPrevention(t *testing.T) {
	e, handler, db, err := test_helpers.SetupTestServer(t)
	if err != nil {
		t.Fatalf(errSetupTestServer, err)
	}
	sqlDB, err := db.DB()
	if err != nil {
		t.Fatalf(errGetUnderlyingDB, err)
	}
	defer sqlDB.Close()

	testCases := []struct {
		name           string
		input          models.University
		expectedStatus int
	}{
		{
			name: "スクリプトタグを含む大学名",
			input: models.University{
				Name: `<script>alert("XSS")</script>テスト大学`,
				Departments: []models.Department{
					{
						Name: "テスト学部",
					},
				},
			},
			expectedStatus: http.StatusOK,
		},
		{
			name: "JavaScriptイベントを含む学部名",
			input: models.University{
				Name: "テスト大学",
				Departments: []models.Department{
					{
						Name: `<div onclick="alert('XSS')">テスト学部</div>`,
					},
				},
			},
			expectedStatus: http.StatusOK,
		},
		{
			name: "URLエンコードされたスクリプト",
			input: models.University{
				Name: "テスト大学",
				Departments: []models.Department{
					{
						Name: `%3Cscript%3Ealert('XSS')%3C/script%3Eテスト学部`,
					},
				},
			},
			expectedStatus: http.StatusOK,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// 大学を作成
			jsonData, err := json.Marshal(tc.input)
			if err != nil {
				t.Fatalf(test_helpers.ErrMarshalTestData, err)
			}

			rec, c := test_helpers.CreateTestContext(e, http.MethodPost, test_helpers.APIUniversitiesPath, nil)
			c.Request().Body = io.NopCloser(bytes.NewBuffer(jsonData))
			c.Request().Header.Set(test_helpers.ContentTypeHeader, test_helpers.ContentTypeJSON)

			err = handler.CreateUniversity(c)
			if err != nil {
				t.Fatalf(test_helpers.ErrRequestFailed, err)
			}

			// 作成された大学を取得
			var createdUniversity models.University
			if err := json.Unmarshal(rec.Body.Bytes(), &createdUniversity); err != nil {
				t.Fatalf(test_helpers.ErrUnmarshalResponse, err)
			}

			// XSSペイロードがエスケープされていることを確認
			test_helpers.AssertXSSEscaped(t, createdUniversity.Name)
			for _, dept := range createdUniversity.Departments {
				test_helpers.AssertXSSEscaped(t, dept.Name)
			}

			// 取得APIでも確認
			rec, c = test_helpers.CreateTestContext(e, http.MethodGet, fmt.Sprintf("/api/universities/%d", createdUniversity.ID), nil)
			c.SetParamNames("id")
			c.SetParamValues(fmt.Sprintf("%d", createdUniversity.ID))

			err = handler.GetUniversity(c)
			if err != nil {
				t.Fatalf(test_helpers.ErrRequestFailed, err)
			}

			var retrievedUniversity models.University
			if err := json.Unmarshal(rec.Body.Bytes(), &retrievedUniversity); err != nil {
				t.Fatalf(test_helpers.ErrUnmarshalResponse, err)
			}

			// 取得したデータでもXSSペイロードがエスケープされていることを確認
			test_helpers.AssertXSSEscaped(t, retrievedUniversity.Name)
			for _, dept := range retrievedUniversity.Departments {
				test_helpers.AssertXSSEscaped(t, dept.Name)
			}
		})
	}
}

// TestCSRFProtection はCSRF保護機能をテストします
func TestCSRFProtection(t *testing.T) {
	e, handler, db, err := test_helpers.SetupTestServer(t)
	if err != nil {
		t.Fatalf(errSetupTestServer, err)
	}
	sqlDB, err := db.DB()
	if err != nil {
		t.Fatalf(errGetUnderlyingDB, err)
	}
	defer sqlDB.Close()

	testCases := []struct {
		name           string
		method         string
		setupCSRF     func(rec *httptest.ResponseRecorder, c echo.Context)
		expectedStatus int
		expectedError  string
	}{
		{
			name:   "CSRFトークンなし",
			method: http.MethodPost,
			setupCSRF: func(rec *httptest.ResponseRecorder, c echo.Context) {
				// CSRFトークンを設定しない
			},
			expectedStatus: http.StatusForbidden,
			expectedError:  "CSRFトークンが必要です",
		},
		{
			name:   "不正なCSRFトークン",
			method: http.MethodPost,
			setupCSRF: func(rec *httptest.ResponseRecorder, c echo.Context) {
				c.Request().Header.Set("X-CSRF-Token", "invalid-token")
			},
			expectedStatus: http.StatusForbidden,
			expectedError:  "不正なCSRFトークンです",
		},
		{
			name:   "有効なCSRFトークン",
			method: http.MethodPost,
			setupCSRF: func(rec *httptest.ResponseRecorder, c echo.Context) {
				// CSRFトークンを生成
				token := "valid-csrf-token"
				c.Set("csrf", token)
				c.Request().Header.Set("X-CSRF-Token", token)
			},
			expectedStatus: http.StatusCreated,
			expectedError:  "",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// テストデータの準備
			university := &models.University{
				Name: "CSRFテスト大学",
				Departments: []models.Department{
					{
						Name: "CSRFテスト学部",
						Majors: []models.Major{
							{
								Name: "CSRFテスト学科",
							},
						},
					},
				},
			}

			jsonData, err := json.Marshal(university)
			if err != nil {
				t.Fatalf("テストデータのマーシャルに失敗しました: %v", err)
			}

			rec, c := test_helpers.CreateTestContext(e, tc.method, "/api/v1/universities", nil)
			c.Request().Body = io.NopCloser(bytes.NewBuffer(jsonData))
			c.Request().Header.Set("Content-Type", "application/json")

			// CSRFトークンの設定
			tc.setupCSRF(rec, c)

			// リクエストの実行
			err = handler.CreateUniversity(c)

			// レスポンスの検証
			if tc.expectedError != "" {
				var response map[string]string
				if err := json.Unmarshal(rec.Body.Bytes(), &response); err != nil {
					t.Fatalf("レスポンスのアンマーシャルに失敗しました: %v", err)
				}
				if response["error"] != tc.expectedError {
					t.Errorf("エラーメッセージが一致しません: got %v want %v", response["error"], tc.expectedError)
				}
			}

			if rec.Code != tc.expectedStatus {
				t.Errorf("ステータスコードが一致しません: got %v want %v", rec.Code, tc.expectedStatus)
			}
		})
	}
}

// TestCSRFTokenRefresh はCSRFトークンの更新をテストします
func TestCSRFTokenRefresh(t *testing.T) {
	e, handler, db, err := test_helpers.SetupTestServer(t)
	if err != nil {
		t.Fatalf(errSetupTestServer, err)
	}
	sqlDB, err := db.DB()
	if err != nil {
		t.Fatalf(errGetUnderlyingDB, err)
	}
	defer sqlDB.Close()

	// 初回トークンの取得
	rec1, c1 := test_helpers.CreateTestContext(e, http.MethodGet, test_helpers.CSRFTokenPath, nil)
	if err := handler.GetCSRFToken(c1); err != nil {
		t.Fatalf(test_helpers.ErrRequestFailed, err)
	}

	var token1 struct {
		Token string `json:"token"`
	}
	if err := json.Unmarshal(rec1.Body.Bytes(), &token1); err != nil {
		t.Fatalf(test_helpers.ErrUnmarshalResponse, err)
	}

	// 2回目のトークン取得
	rec2, c2 := test_helpers.CreateTestContext(e, http.MethodGet, test_helpers.CSRFTokenPath, nil)
	if err := handler.GetCSRFToken(c2); err != nil {
		t.Fatalf(test_helpers.ErrRequestFailed, err)
	}

	var token2 struct {
		Token string `json:"token"`
	}
	if err := json.Unmarshal(rec2.Body.Bytes(), &token2); err != nil {
		t.Fatalf(test_helpers.ErrUnmarshalResponse, err)
	}

	// トークンが更新されていることを確認
	if token1.Token == token2.Token {
		t.Error("CSRFトークンが更新されていません")
	}
}

// TestInputSanitization は入力値のサニタイズをテストします
func TestInputSanitization(t *testing.T) {
	e, handler, db, err := test_helpers.SetupTestServer(t)
	if err != nil {
		t.Fatalf(errSetupTestServer, err)
	}
	sqlDB, err := db.DB()
	if err != nil {
		t.Fatalf(errGetUnderlyingDB, err)
	}
	defer sqlDB.Close()

	testCases := []struct {
		name           string
		input          models.University
		expectedName   string
		expectedDeptName string
	}{
		{
			name: "HTMLタグの除去",
			input: models.University{
				Name: "<p>テスト大学</p>",
				Departments: []models.Department{
					{
						Name: "<div>テスト学部</div>",
					},
				},
			},
			expectedName:   "テスト大学",
			expectedDeptName: "テスト学部",
		},
		{
			name: "制御文字の除去",
			input: models.University{
				Name: "テスト\u0000大学\u0008",
				Departments: []models.Department{
					{
						Name: "テスト\u0000学部\u0008",
					},
				},
			},
			expectedName:   "テスト大学",
			expectedDeptName: "テスト学部",
		},
		{
			name: "全角スペースの正規化",
			input: models.University{
				Name: "テスト　大学",
				Departments: []models.Department{
					{
						Name: "テスト　学部",
					},
				},
			},
			expectedName:   "テスト 大学",
			expectedDeptName: "テスト 学部",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// 大学を作成
			jsonData, err := json.Marshal(tc.input)
			if err != nil {
				t.Fatalf(test_helpers.ErrMarshalTestData, err)
			}

			rec, c := test_helpers.CreateTestContext(e, http.MethodPost, test_helpers.APIUniversitiesPath, nil)
			c.Request().Body = io.NopCloser(bytes.NewBuffer(jsonData))
			c.Request().Header.Set(test_helpers.ContentTypeHeader, test_helpers.ContentTypeJSON)

			err = handler.CreateUniversity(c)
			if err != nil {
				t.Fatalf(test_helpers.ErrRequestFailed, err)
			}

			// 作成された大学を取得
			var createdUniversity models.University
			if err := json.Unmarshal(rec.Body.Bytes(), &createdUniversity); err != nil {
				t.Fatalf(test_helpers.ErrUnmarshalResponse, err)
			}

			// サニタイズされた値を確認
			if createdUniversity.Name != tc.expectedName {
				t.Errorf("大学名が正しくサニタイズされていません: got %s, want %s",
					createdUniversity.Name, tc.expectedName)
			}

			if len(createdUniversity.Departments) > 0 {
				if createdUniversity.Departments[0].Name != tc.expectedDeptName {
					t.Errorf("学部名が正しくサニタイズされていません: got %s, want %s",
						createdUniversity.Departments[0].Name, tc.expectedDeptName)
				}
			}

			// 特殊文字のエスケープを確認
			test_helpers.AssertSpecialCharsSanitized(t, createdUniversity.Name)
			for _, dept := range createdUniversity.Departments {
				test_helpers.AssertSpecialCharsSanitized(t, dept.Name)
			}
		})
	}
}
