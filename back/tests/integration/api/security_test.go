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
	"university-exam-api/tests/integration/api/config"
	"university-exam-api/tests/integration/api/test_helpers"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

const (
	errSetupTestServer = "Failed to setup test server: %v"
	errGetUnderlyingDB = "Failed to get underlying *sql.DB: %v"
	errMarshalTestData = "Failed to marshal test data: %v"
	errRequestFailed   = "Request failed: %v"
	errUnmarshalResponse = "Failed to unmarshal response: %v"
	errCSRFMissingToken = "CSRFトークンが必要です"
	errCSRFInvalidToken = "不正なCSRFトークンです"
	errAuthRequired = "認証が必要です"
	errInvalidAuthToken = "不正な認証トークンです"
	errExpiredAuthToken = "認証トークンの有効期限が切れています"
	errNoPermission = "この操作を実行する権限がありません"
	errUniversityNameRequired = "大学名は必須です"
	errDepartmentNameTooLong = "学部名は100文字以内である必要があります"
	errEnrollmentMustBePositive = "入学定員は0より大きい必要があります"
	errScoreMustBeNonNegative = "科目の得点は0以上である必要があります"
	errUniversityNotFound = "大学が見つかりません"
	errInvalidIDFormat = "不正なID形式です"
	errInvalidRequestFormat = "不正なリクエスト形式です"
	errInvalidInputFormat = "不正な入力形式です"
	errRateLimitExceeded = "レート制限を超えました"
	errRateLimitNotWorking = "レート制限が正しく機能していません: %d requests were limited, expected at least %d"
	errRequestAfterCooldown = "クールダウン後のリクエストが失敗: got %v, want %v"
	errConcurrentRateLimitNotWorking = "並行アクセス時にレート制限が機能していません"
	errAllRequestsLimited = "すべてのリクエストが制限されています"
	errRequestStats = "総リクエスト数: %d, 制限されたリクエスト: %d, 成功したリクエスト: %d"
	errSQLInjectionTestData = "テストデータの作成に失敗: %v"
	errSQLInjectionRequest = "リクエストの実行に失敗: %v"
	errXSSTestData = "XSSテストデータの作成に失敗: %v"
	errXSSRequest = "XSSテストのリクエストに失敗: %v"
	errXSSUnmarshal = "XSSテストのレスポンスのアンマーシャルに失敗: %v"
	errXSSVerification = "XSSエスケープの検証に失敗: %v"
	errCSRFTestData = "CSRFテストデータの作成に失敗: %v"
	errCSRFRequest = "CSRFテストのリクエストに失敗: %v"
	errCSRFUnmarshal = "CSRFテストのレスポンスのアンマーシャルに失敗: %v"
	errCSRFVerification = "CSRFトークンの検証に失敗: %v"
	errAuthTestData = "認証テストデータの作成に失敗: %v"
	errAuthRequest = "認証テストのリクエストに失敗: %v"
	errAuthUnmarshal = "認証テストのレスポンスのアンマーシャルに失敗: %v"
	errAuthVerification = "認証トークンの検証に失敗: %v"
	errAuthzTestData = "認可テストデータの作成に失敗: %v"
	errAuthzRequest = "認可テストのリクエストに失敗: %v"
	errAuthzUnmarshal = "認可テストのレスポンスのアンマーシャルに失敗: %v"
	errAuthzVerification = "認可の検証に失敗: %v"
	errSanitizationTestData = "サニタイズテストデータの作成に失敗: %v"
	errSanitizationRequest = "サニタイズテストのリクエストに失敗: %v"
	errSanitizationUnmarshal = "サニタイズテストのレスポンスのアンマーシャルに失敗: %v"
	errSanitizationVerification = "サニタイズの検証に失敗: %v"
	errSanitizationNameMismatch = "大学名が正しくサニタイズされていません: got %s, want %s"
	errSanitizationDeptNameMismatch = "学部名が正しくサニタイズされていません: got %s, want %s"
)

// TestEnvironment はテスト環境の設定を保持します
type TestEnvironment struct {
	E       *echo.Echo
	Handler interface{}
	DB      *gorm.DB
}

// setupTestEnvironment はテスト環境をセットアップします
func setupTestEnvironment(t *testing.T) (*TestEnvironment, error) {
	e, handler, db, err := test_helpers.SetupTestServer(t)
	if err != nil {
		return nil, fmt.Errorf(errSetupTestServer, err)
	}
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf(errGetUnderlyingDB, err)
	}
	defer sqlDB.Close()

	return &TestEnvironment{
		E:       e,
		Handler: handler,
		DB:      db,
	}, nil
}

// TestCase はテストケースの共通構造体です
type TestCase struct {
	Name           string
	Method         string
	Path           string
	Setup          func(*httptest.ResponseRecorder, echo.Context)
	ExpectedStatus int
	ExpectedError  string
}

// TestInputValidation は入力値の検証を行います
func TestInputValidation(t *testing.T) {
	env, err := setupTestEnvironment(t)
	if err != nil {
		t.Fatal(err)
	}

	testCases := []TestCase{
		{
			Name:   "大学名が空",
			Method: http.MethodPost,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				university := models.University{
				Name: "",
				Departments: []models.Department{
					{
						Name: "テスト学部",
					},
				},
				}
				jsonData, err := json.Marshal(university)
				if err != nil {
					t.Fatalf(errMarshalTestData, err)
				}
				c.Request().Body = io.NopCloser(bytes.NewBuffer(jsonData))
				c.Request().Header.Set(test_helpers.ContentTypeHeader, test_helpers.ContentTypeJSON)
			},
			ExpectedStatus: http.StatusBadRequest,
			ExpectedError:  errUniversityNameRequired,
		},
		{
			Name:   "学部名が長すぎる",
			Method: http.MethodPost,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				university := models.University{
				Name: "テスト大学",
				Departments: []models.Department{
					{
						Name: strings.Repeat("あ", 101), // 100文字制限を超える
					},
				},
				}
				jsonData, err := json.Marshal(university)
				if err != nil {
					t.Fatalf(errMarshalTestData, err)
				}
				c.Request().Body = io.NopCloser(bytes.NewBuffer(jsonData))
				c.Request().Header.Set(test_helpers.ContentTypeHeader, test_helpers.ContentTypeJSON)
			},
			ExpectedStatus: http.StatusBadRequest,
			ExpectedError:  errDepartmentNameTooLong,
		},
		{
			Name:   "入学定員が負数",
			Method: http.MethodPost,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				university := models.University{
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
				}
				jsonData, err := json.Marshal(university)
				if err != nil {
					t.Fatalf(errMarshalTestData, err)
				}
				c.Request().Body = io.NopCloser(bytes.NewBuffer(jsonData))
				c.Request().Header.Set(test_helpers.ContentTypeHeader, test_helpers.ContentTypeJSON)
			},
			ExpectedStatus: http.StatusBadRequest,
			ExpectedError:  errEnrollmentMustBePositive,
		},
		{
			Name:   "科目の得点が負数",
			Method: http.MethodPost,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				university := models.University{
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
				}
				jsonData, err := json.Marshal(university)
				if err != nil {
					t.Fatalf(errMarshalTestData, err)
				}
				c.Request().Body = io.NopCloser(bytes.NewBuffer(jsonData))
				c.Request().Header.Set(test_helpers.ContentTypeHeader, test_helpers.ContentTypeJSON)
			},
			ExpectedStatus: http.StatusBadRequest,
			ExpectedError:  errScoreMustBeNonNegative,
		},
		{
			Name:   "学部名が空",
			Method: http.MethodPost,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				university := models.University{
					Name: "テスト大学",
					Departments: []models.Department{
						{
							Name: "",
						},
					},
				}
				jsonData, err := json.Marshal(university)
			if err != nil {
					t.Fatalf(errMarshalTestData, err)
			}
			c.Request().Body = io.NopCloser(bytes.NewBuffer(jsonData))
			c.Request().Header.Set(test_helpers.ContentTypeHeader, test_helpers.ContentTypeJSON)
			},
			ExpectedStatus: http.StatusBadRequest,
			ExpectedError:  "学部名は必須です",
		},
		{
			Name:   "学科名が空",
			Method: http.MethodPost,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				university := models.University{
					Name: "テスト大学",
					Departments: []models.Department{
						{
							Name: "テスト学部",
							Majors: []models.Major{
								{
									Name: "",
								},
							},
						},
					},
				}
				jsonData, err := json.Marshal(university)
			if err != nil {
					t.Fatalf(errMarshalTestData, err)
				}
				c.Request().Body = io.NopCloser(bytes.NewBuffer(jsonData))
				c.Request().Header.Set(test_helpers.ContentTypeHeader, test_helpers.ContentTypeJSON)
			},
			ExpectedStatus: http.StatusBadRequest,
			ExpectedError:  "学科名は必須です",
		},
		{
			Name:   "入試スケジュール名が空",
			Method: http.MethodPost,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				university := models.University{
					Name: "テスト大学",
					Departments: []models.Department{
						{
							Name: "テスト学部",
							Majors: []models.Major{
								{
									Name: "テスト学科",
									AdmissionSchedules: []models.AdmissionSchedule{
										{
											Name: "",
										},
									},
								},
							},
						},
					},
				}
				jsonData, err := json.Marshal(university)
				if err != nil {
					t.Fatalf(errMarshalTestData, err)
				}
				c.Request().Body = io.NopCloser(bytes.NewBuffer(jsonData))
				c.Request().Header.Set(test_helpers.ContentTypeHeader, test_helpers.ContentTypeJSON)
			},
			ExpectedStatus: http.StatusBadRequest,
			ExpectedError:  "入試スケジュール名は必須です",
		},
		{
			Name:   "入試種別名が空",
			Method: http.MethodPost,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				university := models.University{
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
											TestTypes: []models.TestType{
												{
													Name: "",
												},
											},
										},
									},
								},
							},
						},
					},
				}
				jsonData, err := json.Marshal(university)
				if err != nil {
					t.Fatalf(errMarshalTestData, err)
				}
				c.Request().Body = io.NopCloser(bytes.NewBuffer(jsonData))
				c.Request().Header.Set(test_helpers.ContentTypeHeader, test_helpers.ContentTypeJSON)
			},
			ExpectedStatus: http.StatusBadRequest,
			ExpectedError:  "入試種別名は必須です",
		},
		{
			Name:   "科目名が空",
			Method: http.MethodPost,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				university := models.University{
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
											TestTypes: []models.TestType{
												{
													Name: "一般選抜",
													Subjects: []models.Subject{
														{
															Name: "",
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
				}
				jsonData, err := json.Marshal(university)
				if err != nil {
					t.Fatalf(errMarshalTestData, err)
				}
				c.Request().Body = io.NopCloser(bytes.NewBuffer(jsonData))
				c.Request().Header.Set(test_helpers.ContentTypeHeader, test_helpers.ContentTypeJSON)
			},
			ExpectedStatus: http.StatusBadRequest,
			ExpectedError:  "科目名は必須です",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.Name, func(t *testing.T) {
			rec, c := test_helpers.CreateTestContext(env.E, tc.Method, tc.Path, nil)
			tc.Setup(rec, c)

			if err := env.Handler.(interface{ CreateUniversity(echo.Context) error }).CreateUniversity(c); err != nil {
				t.Errorf("予期しないエラーが発生: %v", err)
			}

			test_helpers.AssertErrorResponse(t, rec, tc.ExpectedStatus, tc.ExpectedError)
		})
	}
}

// TestSQLInjectionPrevention はSQLインジェクション攻撃の防止をテストします
func TestSQLInjectionPrevention(t *testing.T) {
	env, err := setupTestEnvironment(t)
	if err != nil {
		t.Fatal(err)
	}
	defer test_helpers.CleanupTest(t, env.DB)

	testCases := []TestCase{
		{
			Name:   "SQLインジェクション攻撃（UNION SELECT）",
			Method: http.MethodGet,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				university := test_helpers.CreateTestUniversity("テスト大学", "テスト学部")
				if err := env.DB.Create(&university).Error; err != nil {
					t.Fatalf(errSQLInjectionTestData, err)
				}
				c.Request().URL.RawQuery = "name=1' UNION SELECT * FROM users --"
			},
			ExpectedStatus: http.StatusBadRequest,
			ExpectedError:  errInvalidInputFormat,
		},
		{
			Name:   "SQLインジェクション攻撃（OR 1=1）",
			Method: http.MethodGet,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				university := test_helpers.CreateTestUniversity("テスト大学", "テスト学部")
				if err := env.DB.Create(&university).Error; err != nil {
					t.Fatalf(errSQLInjectionTestData, err)
				}
				c.Request().URL.RawQuery = "name=1' OR '1'='1"
			},
			ExpectedStatus: http.StatusBadRequest,
			ExpectedError:  errInvalidInputFormat,
		},
		{
			Name:   "SQLインジェクション攻撃（コメント）",
			Method: http.MethodGet,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				university := test_helpers.CreateTestUniversity("テスト大学", "テスト学部")
				if err := env.DB.Create(&university).Error; err != nil {
					t.Fatalf(errSQLInjectionTestData, err)
				}
				c.Request().URL.RawQuery = "name=1' --"
			},
			ExpectedStatus: http.StatusBadRequest,
			ExpectedError:  errInvalidInputFormat,
		},
		{
			Name:   "SQLインジェクション攻撃（スタッククエリ）",
			Method: http.MethodGet,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				university := test_helpers.CreateTestUniversity("テスト大学", "テスト学部")
				if err := env.DB.Create(&university).Error; err != nil {
					t.Fatalf(errSQLInjectionTestData, err)
				}
				c.Request().URL.RawQuery = "name=1'; DROP TABLE universities; --"
			},
			ExpectedStatus: http.StatusBadRequest,
			ExpectedError:  errInvalidInputFormat,
		},
		{
			Name:   "SQLインジェクション攻撃（エンコードされたペイロード）",
			Method: http.MethodGet,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				university := test_helpers.CreateTestUniversity("テスト大学", "テスト学部")
				if err := env.DB.Create(&university).Error; err != nil {
					t.Fatalf(errSQLInjectionTestData, err)
				}
				c.Request().URL.RawQuery = "name=1%27%20UNION%20SELECT%20*%20FROM%20users%20--"
			},
			ExpectedStatus: http.StatusBadRequest,
			ExpectedError:  errInvalidInputFormat,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.Name, func(t *testing.T) {
			rec, c := test_helpers.CreateTestContext(env.E, tc.Method, tc.Path, nil)
			tc.Setup(rec, c)

			if err := env.Handler.(interface{ GetUniversities(echo.Context) error }).GetUniversities(c); err != nil {
				t.Errorf(errSQLInjectionRequest, err)
			}

			test_helpers.AssertErrorResponse(t, rec, tc.ExpectedStatus, tc.ExpectedError)
		})
	}
}

// TestErrorHandling はエラーハンドリングを検証します
func TestErrorHandling(t *testing.T) {
	env, err := setupTestEnvironment(t)
	if err != nil {
		t.Fatal(err)
	}

	testCases := []TestCase{
		{
			Name:   "存在しない大学のID",
			Method: http.MethodGet,
			Path:   "/api/universities/999999",
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				c.SetParamNames("id")
				c.SetParamValues("999999")
			},
			ExpectedStatus: http.StatusNotFound,
			ExpectedError:  errUniversityNotFound,
		},
		{
			Name:   "不正なIDフォーマット",
			Method: http.MethodGet,
			Path:   "/api/universities/invalid",
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				c.SetParamNames("id")
				c.SetParamValues("invalid")
			},
			ExpectedStatus: http.StatusBadRequest,
			ExpectedError:  errInvalidIDFormat,
		},
		{
			Name:   "不正なJSONフォーマット",
			Method: http.MethodPost,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				c.Request().Body = io.NopCloser(bytes.NewBufferString("invalid json"))
				c.Request().Header.Set(test_helpers.ContentTypeHeader, test_helpers.ContentTypeJSON)
			},
			ExpectedStatus: http.StatusBadRequest,
			ExpectedError:  errInvalidRequestFormat,
		},
		{
			Name:   "必須フィールドの欠落",
			Method: http.MethodPost,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				university := models.University{}
				jsonData, err := json.Marshal(university)
				if err != nil {
					t.Fatalf(errMarshalTestData, err)
				}
				c.Request().Body = io.NopCloser(bytes.NewBuffer(jsonData))
				c.Request().Header.Set(test_helpers.ContentTypeHeader, test_helpers.ContentTypeJSON)
			},
			ExpectedStatus: http.StatusBadRequest,
			ExpectedError:  errUniversityNameRequired,
		},
		{
			Name:   "不正なHTTPメソッド",
			Method: http.MethodPut,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				university := test_helpers.CreateTestUniversity("テスト大学", "テスト学部")
				jsonData, err := json.Marshal(university)
				if err != nil {
					t.Fatalf(errMarshalTestData, err)
				}
				c.Request().Body = io.NopCloser(bytes.NewBuffer(jsonData))
				c.Request().Header.Set(test_helpers.ContentTypeHeader, test_helpers.ContentTypeJSON)
			},
			ExpectedStatus: http.StatusMethodNotAllowed,
			ExpectedError:  "Method not allowed",
		},
		{
			Name:   "不正なContent-Type",
			Method: http.MethodPost,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				university := test_helpers.CreateTestUniversity("テスト大学", "テスト学部")
				jsonData, err := json.Marshal(university)
				if err != nil {
					t.Fatalf(errMarshalTestData, err)
				}
				c.Request().Body = io.NopCloser(bytes.NewBuffer(jsonData))
				c.Request().Header.Set(test_helpers.ContentTypeHeader, "text/plain")
			},
			ExpectedStatus: http.StatusUnsupportedMediaType,
			ExpectedError:  "Unsupported media type",
		},
		{
			Name:   "リクエストボディが空",
			Method: http.MethodPost,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				c.Request().Body = io.NopCloser(bytes.NewBufferString(""))
				c.Request().Header.Set(test_helpers.ContentTypeHeader, test_helpers.ContentTypeJSON)
			},
			ExpectedStatus: http.StatusBadRequest,
			ExpectedError:  errInvalidRequestFormat,
		},
		{
			Name:   "不正なURLパラメータ",
			Method: http.MethodGet,
			Path:   "/api/universities/",
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				c.SetParamNames("id")
				c.SetParamValues("")
			},
			ExpectedStatus: http.StatusBadRequest,
			ExpectedError:  errInvalidIDFormat,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.Name, func(t *testing.T) {
			rec, c := test_helpers.CreateTestContext(env.E, tc.Method, tc.Path, nil)
			tc.Setup(rec, c)

			var err error
			switch c.Request().Method {
			case http.MethodGet:
				if strings.Contains(tc.Path, "/api/universities/") {
					err = env.Handler.(interface{ GetUniversity(echo.Context) error }).GetUniversity(c)
				} else {
					err = env.Handler.(interface{ GetUniversities(echo.Context) error }).GetUniversities(c)
				}
			case http.MethodPost:
				err = env.Handler.(interface{ CreateUniversity(echo.Context) error }).CreateUniversity(c)
			}

			if err != nil {
				t.Errorf("予期しないエラーが発生: %v", err)
			}

			test_helpers.AssertErrorResponse(t, rec, tc.ExpectedStatus, tc.ExpectedError)
		})
	}
}

// TestRateLimiting はレート制限機能をテストします
func TestRateLimiting(t *testing.T) {
	env, err := setupTestEnvironment(t)
	if err != nil {
		t.Fatal(err)
	}

	rateConfig := config.LoadTestConfig()

	testCases := []TestCase{
		{
			Name:   "レート制限の基本機能",
			Method: http.MethodGet,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				result := test_helpers.ExecuteRateLimitTest(t, env.Handler, env.E, rateConfig.TestNumRequests, rateConfig.TestTimeWindow)
				expectedMinLimited := rateConfig.TestNumRequests - rateConfig.TestMaxRequests
				test_helpers.AssertRateLimitResult(t, result, expectedMinLimited, rateConfig.TestMaxRequests)
			},
			ExpectedStatus: http.StatusOK,
			ExpectedError:  "",
		},
		{
			Name:   "クールダウン後のリクエスト",
			Method: http.MethodGet,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				// 最初のバースト
				result1 := test_helpers.ExecuteRateLimitTest(t, env.Handler, env.E, rateConfig.TestNumRequests, rateConfig.TestTimeWindow)
				t.Logf("1回目のバースト: 制限されたリクエスト数: %d", result1.LimitedRequests)

				// クールダウン期間を待つ
				time.Sleep(rateConfig.TestCooldownTime)

				// 2回目のバースト
				result2 := test_helpers.ExecuteRateLimitTest(t, env.Handler, env.E, rateConfig.TestNumRequests, rateConfig.TestTimeWindow)
				t.Logf("2回目のバースト: 制限されたリクエスト数: %d", result2.LimitedRequests)
			},
			ExpectedStatus: http.StatusOK,
			ExpectedError:  "",
		},
		{
			Name:   "異なるIPアドレスからのリクエスト",
			Method: http.MethodGet,
				Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				ipAddresses := test_helpers.GenerateTestIPAddresses(3)
				results := make([]int, len(ipAddresses))
				responseTimes := make([]float64, len(ipAddresses))

				for i, ip := range ipAddresses {
					start := time.Now()
					rec, c := test_helpers.CreateTestContext(env.E, http.MethodGet, test_helpers.APIUniversitiesPath, nil)
					c.Request().Header.Set("X-Forwarded-For", ip)
					if err := env.Handler.(interface{ GetUniversities(echo.Context) error }).GetUniversities(c); err != nil {
						t.Errorf(errRequestFailed, err)
					}
					results[i] = rec.Code
					responseTimes[i] = float64(time.Since(start).Milliseconds())
					time.Sleep(100 * time.Millisecond)
				}

				result := test_helpers.AnalyzeRateLimitResults(results, responseTimes)
				if result.LimitedRequests > 0 {
					t.Errorf("異なるIPアドレスからのリクエストが制限されています: %d", result.LimitedRequests)
				}

				t.Logf("異なるIPアドレスからのリクエスト: 制限されたリクエスト数: %d", result.LimitedRequests)
				t.Logf("平均レスポンス時間: %.2f ms", result.AverageResponse)
			},
			ExpectedStatus: http.StatusOK,
			ExpectedError:  "",
		},
		{
			Name:   "異なるエンドポイントのレート制限",
			Method: http.MethodGet,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				endpoints := test_helpers.GenerateTestEndpoints()
				results := make([]int, len(endpoints))
				responseTimes := make([]float64, len(endpoints))

				for i, endpoint := range endpoints {
					start := time.Now()
					rec, c := test_helpers.CreateTestContext(env.E, http.MethodGet, endpoint, nil)
					if err := env.Handler.(interface{ GetUniversities(echo.Context) error }).GetUniversities(c); err != nil {
						t.Errorf(errRequestFailed, err)
					}
		results[i] = rec.Code
					responseTimes[i] = float64(time.Since(start).Milliseconds())
					time.Sleep(100 * time.Millisecond)
				}

				result := test_helpers.AnalyzeRateLimitResults(results, responseTimes)
				if result.LimitedRequests > 0 {
					t.Errorf("異なるエンドポイントへのリクエストが制限されています: %d", result.LimitedRequests)
				}

				t.Logf("異なるエンドポイントへのリクエスト: 制限されたリクエスト数: %d", result.LimitedRequests)
				t.Logf("平均レスポンス時間: %.2f ms", result.AverageResponse)
			},
			ExpectedStatus: http.StatusOK,
			ExpectedError:  "",
		},
		{
			Name:   "レート制限の統計情報",
			Method: http.MethodGet,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				result := test_helpers.ExecuteRateLimitTest(t, env.Handler, env.E, rateConfig.TestNumRequests, rateConfig.TestTimeWindow)

				if result.LimitedRequests == 0 {
					t.Error(errRateLimitNotWorking)
				}

				if result.SuccessRequests == 0 {
					t.Error(errAllRequestsLimited)
				}

				// レート制限の統計を検証
				expectedMinLimited := result.TotalRequests - rateConfig.TestMaxRequests
				if result.LimitedRequests < expectedMinLimited {
					t.Errorf("レート制限の統計が期待値を下回っています: got %d, want at least %d", result.LimitedRequests, expectedMinLimited)
				}

				// レスポンス時間の統計を出力
				t.Logf("レート制限テスト結果:")
				t.Logf("  総リクエスト数: %d", result.TotalRequests)
				t.Logf("  制限されたリクエスト: %d", result.LimitedRequests)
				t.Logf("  成功したリクエスト: %d", result.SuccessRequests)
				t.Logf("  平均レスポンス時間: %.2f ms", result.AverageResponse)
				t.Logf("  最大レスポンス時間: %.2f ms", result.MaxResponseTime)
				t.Logf("  最小レスポンス時間: %.2f ms", result.MinResponseTime)
			},
			ExpectedStatus: http.StatusOK,
			ExpectedError:  "",
		},
		{
			Name:   "エッジケース: 最小リクエスト数",
			Method: http.MethodGet,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				result := test_helpers.ExecuteRateLimitTest(t, env.Handler, env.E, 1, rateConfig.TestTimeWindow)
				test_helpers.AssertRateLimitResult(t, result, 0, 1)
			},
			ExpectedStatus: http.StatusOK,
			ExpectedError:  "",
		},
		{
			Name:   "エッジケース: 最大リクエスト数",
			Method: http.MethodGet,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				result := test_helpers.ExecuteRateLimitTest(t, env.Handler, env.E, rateConfig.TestMaxRequests*2, rateConfig.TestTimeWindow)
				expectedMinLimited := rateConfig.TestMaxRequests
				test_helpers.AssertRateLimitResult(t, result, expectedMinLimited, rateConfig.TestMaxRequests)
			},
			ExpectedStatus: http.StatusOK,
			ExpectedError:  "",
		},
		{
			Name:   "パフォーマンステスト: レスポンス時間",
			Method: http.MethodGet,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				result := test_helpers.ExecuteRateLimitTest(t, env.Handler, env.E, rateConfig.TestNumRequests, rateConfig.TestTimeWindow)

				// レスポンス時間の検証
				if result.AverageResponse > 1000 { // 1秒以上かかる場合は警告
					t.Logf("警告: 平均レスポンス時間が1秒を超えています: %.2f ms", result.AverageResponse)
				}

				// 最大レスポンス時間の検証
				if result.MaxResponseTime > 2000 { // 2秒以上かかる場合は警告
					t.Logf("警告: 最大レスポンス時間が2秒を超えています: %.2f ms", result.MaxResponseTime)
				}
			},
			ExpectedStatus: http.StatusOK,
			ExpectedError:  "",
		},
		{
			Name:   "エラーケース: 無効なエンドポイント",
			Method: http.MethodGet,
			Path:   "/invalid/endpoint",
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				result := test_helpers.ExecuteRateLimitTest(t, env.Handler, env.E, rateConfig.TestNumRequests, rateConfig.TestTimeWindow)
				// エラーエンドポイントでもレート制限が機能することを確認
				test_helpers.AssertRateLimitResult(t, result, rateConfig.TestNumRequests-rateConfig.TestMaxRequests, rateConfig.TestMaxRequests)
			},
			ExpectedStatus: http.StatusNotFound,
			ExpectedError:  "エンドポイントが見つかりません",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.Name, func(t *testing.T) {
			rec, c := test_helpers.CreateTestContext(env.E, tc.Method, tc.Path, nil)
			tc.Setup(rec, c)

			if tc.ExpectedError != "" {
				test_helpers.AssertErrorResponse(t, rec, tc.ExpectedStatus, tc.ExpectedError)
			} else {
				test_helpers.AssertStatusCode(t, rec.Code, tc.ExpectedStatus)
			}
		})
	}
}

// executeRequest は単一のリクエストを実行し、ステータスコードを返します
func executeRequest(handler interface{}, e *echo.Echo) (int, error) {
	rec, c := test_helpers.CreateTestContext(e, http.MethodGet, test_helpers.APIUniversitiesPath, nil)
	if h, ok := handler.(interface{ GetUniversities(echo.Context) error }); ok {
		if err := h.GetUniversities(c); err != nil {
			return 0, err
		}
		return rec.Code, nil
	}
	return 0, fmt.Errorf("invalid handler type")
}

// makeRequests は指定された回数のリクエストを実行し、結果を返します
func makeRequests(t *testing.T, handler interface{}, e *echo.Echo, numRequests int) []int {
	results := make([]int, numRequests)
	for j := 0; j < numRequests; j++ {
		code, err := executeRequest(handler, e)
	if err != nil {
			t.Errorf("リクエスト %d が失敗: %v", j, err)
			continue
		}
		results[j] = code
		time.Sleep(50 * time.Millisecond)
	}
	return results
}

// TestConcurrentRateLimiting は並行アクセス時のレート制限をテストします
func TestConcurrentRateLimiting(t *testing.T) {
	env, err := setupTestEnvironment(t)
	if err != nil {
		t.Fatal(err)
	}

	rateConfig := config.LoadTestConfig()

	testCases := []TestCase{
		{
			Name:   "並行アクセス時のレート制限",
			Method: http.MethodGet,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
	var (
		wg      sync.WaitGroup
					results = make([][]int, rateConfig.TestNumGoroutines)
	)

				// 並行リクエストの実行
				for i := 0; i < rateConfig.TestNumGoroutines; i++ {
		wg.Add(1)
		go func(index int) {
			defer wg.Done()
						results[index] = makeRequests(t, env.Handler, env.E, rateConfig.TestNumRequests)
					}(i)
				}

				wg.Wait()

				// 結果の分析
				totalRequests, limitedRequests, successRequests := analyzeResults(results)

				// レート制限の検証
				if limitedRequests == 0 {
					t.Error(errConcurrentRateLimitNotWorking)
				}

				if successRequests == 0 {
					t.Error(errAllRequestsLimited)
				}

				// 統計情報の出力
				t.Logf(errRequestStats, totalRequests, limitedRequests, successRequests)

				// レート制限の統計を検証
				expectedMinLimited := totalRequests - (rateConfig.TestMaxRequests * rateConfig.TestNumGoroutines)
				if limitedRequests < expectedMinLimited {
					t.Errorf("レート制限の統計が期待値を下回っています: got %d, want at least %d", limitedRequests, expectedMinLimited)
				}
			},
			ExpectedStatus: http.StatusOK,
			ExpectedError:  "",
		},
		{
			Name:   "異なるIPアドレスからの並行アクセス",
			Method: http.MethodGet,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				var (
					wg      sync.WaitGroup
					results = make([][]int, rateConfig.TestNumGoroutines)
				)

				// 異なるIPアドレスからの並行リクエスト
				for i := 0; i < rateConfig.TestNumGoroutines; i++ {
					wg.Add(1)
					go func(index int) {
						defer wg.Done()
						_, c := test_helpers.CreateTestContext(env.E, http.MethodGet, test_helpers.APIUniversitiesPath, nil)
						c.Request().Header.Set("X-Forwarded-For", fmt.Sprintf("192.168.1.%d", index+1))
						results[index] = makeRequests(t, env.Handler, env.E, rateConfig.TestNumRequests)
		}(i)
	}

	wg.Wait()

	// 結果の分析
				_, _, successRequests := analyzeResults(results)

				// 異なるIPアドレスからのリクエストは、それぞれ独立してレート制限されるべき
				expectedMinSuccess := rateConfig.TestNumRequests * rateConfig.TestNumGoroutines / 2
				if successRequests < expectedMinSuccess {
					t.Errorf("異なるIPアドレスからのリクエストの成功率が低すぎます: got %d, want at least %d", successRequests, expectedMinSuccess)
				}
			},
			ExpectedStatus: http.StatusOK,
			ExpectedError:  "",
		},
		{
			Name:   "レート制限のリセット",
			Method: http.MethodGet,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				// 最初のバースト
				results1 := makeRequests(t, env.Handler, env.E, rateConfig.TestNumRequests)

				// クールダウン期間を待つ
				time.Sleep(rateConfig.TestCooldownTime)

				// 2回目のバースト
				results2 := makeRequests(t, env.Handler, env.E, rateConfig.TestNumRequests)

				// 結果を分析
				limited1 := countLimitedRequests(results1)
				limited2 := countLimitedRequests(results2)

				if limited1 == 0 || limited2 == 0 {
					t.Error("レート制限のリセットが正しく機能していません")
				}

				// 統計情報の出力
				t.Logf("1回目のバースト: 制限されたリクエスト数: %d", limited1)
				t.Logf("2回目のバースト: 制限されたリクエスト数: %d", limited2)
			},
			ExpectedStatus: http.StatusOK,
			ExpectedError:  "",
		},
		{
			Name:   "レート制限の時間枠",
			Method: http.MethodGet,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				var (
					wg      sync.WaitGroup
					results = make([][]int, rateConfig.TestNumGoroutines)
				)

				// 時間枠内での並行リクエスト
				for i := 0; i < rateConfig.TestNumGoroutines; i++ {
					wg.Add(1)
					go func(index int) {
						defer wg.Done()
						results[index] = makeRequests(t, env.Handler, env.E, rateConfig.TestNumRequests)
					}(i)
				}

				wg.Wait()

				// 結果の分析
				totalRequests, limitedRequests, successRequests := analyzeResults(results)

				// 時間枠内でのレート制限を検証
				if limitedRequests == 0 {
					t.Error("時間枠内でのレート制限が機能していません")
				}

				// 統計情報の出力
				t.Logf(errRequestStats, totalRequests, limitedRequests, successRequests)
			},
			ExpectedStatus: http.StatusOK,
			ExpectedError:  "",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.Name, func(t *testing.T) {
			rec, c := test_helpers.CreateTestContext(env.E, tc.Method, tc.Path, nil)
			tc.Setup(rec, c)

			if tc.ExpectedError != "" {
				test_helpers.AssertErrorResponse(t, rec, tc.ExpectedStatus, tc.ExpectedError)
			} else {
				test_helpers.AssertStatusCode(t, rec.Code, tc.ExpectedStatus)
			}
		})
	}
}

// countLimitedRequests は制限されたリクエストの数をカウントします
func countLimitedRequests(results []int) int {
	count := 0
	for _, code := range results {
		if code == http.StatusTooManyRequests {
			count++
		}
	}
	return count
}

// analyzeResults はテスト結果を分析し、統計を返します
func analyzeResults(results [][]int) (int, int, int) {
	var totalRequests, limitedRequests, successRequests int

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

	return totalRequests, limitedRequests, successRequests
}

// TestAuthentication は認証機能をテストします
func TestAuthentication(t *testing.T) {
	env, err := setupTestEnvironment(t)
	if err != nil {
		t.Fatal(err)
	}

	testCases := []TestCase{
		{
			Name:   "認証トークンなし",
			Method: http.MethodPost,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				university := test_helpers.CreateTestUniversity("認証テスト大学", "認証テスト学部")
				jsonData, err := json.Marshal(university)
				if err != nil {
					t.Fatalf(errAuthTestData, err)
				}
				c.Request().Body = io.NopCloser(bytes.NewBuffer(jsonData))
				c.Request().Header.Set(test_helpers.ContentTypeHeader, test_helpers.ContentTypeJSON)
			},
			ExpectedStatus: http.StatusUnauthorized,
			ExpectedError:  errAuthRequired,
		},
		{
			Name:   "不正な認証トークン",
			Method: http.MethodPost,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				university := test_helpers.CreateTestUniversity("認証テスト大学", "認証テスト学部")
				jsonData, err := json.Marshal(university)
				if err != nil {
					t.Fatalf(errAuthTestData, err)
				}
				c.Request().Body = io.NopCloser(bytes.NewBuffer(jsonData))
				c.Request().Header.Set(test_helpers.ContentTypeHeader, test_helpers.ContentTypeJSON)
				c.Request().Header.Set("Authorization", "Bearer invalid-token")
			},
			ExpectedStatus: http.StatusUnauthorized,
			ExpectedError:  errInvalidAuthToken,
		},
		{
			Name:   "有効期限切れの認証トークン",
			Method: http.MethodPost,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				university := test_helpers.CreateTestUniversity("認証テスト大学", "認証テスト学部")
				jsonData, err := json.Marshal(university)
				if err != nil {
					t.Fatalf(errAuthTestData, err)
				}
				c.Request().Body = io.NopCloser(bytes.NewBuffer(jsonData))
				c.Request().Header.Set(test_helpers.ContentTypeHeader, test_helpers.ContentTypeJSON)
				c.Request().Header.Set("Authorization", "Bearer expired-token")
			},
			ExpectedStatus: http.StatusUnauthorized,
			ExpectedError:  errExpiredAuthToken,
		},
		{
			Name:   "有効な認証トークン",
			Method: http.MethodPost,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				university := test_helpers.CreateTestUniversity("認証テスト大学", "認証テスト学部")
				jsonData, err := json.Marshal(university)
				if err != nil {
					t.Fatalf(errAuthTestData, err)
				}
				c.Request().Body = io.NopCloser(bytes.NewBuffer(jsonData))
				c.Request().Header.Set(test_helpers.ContentTypeHeader, test_helpers.ContentTypeJSON)
				c.Request().Header.Set("Authorization", "Bearer valid-token")
			},
			ExpectedStatus: http.StatusCreated,
			ExpectedError:  "",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.Name, func(t *testing.T) {
			rec, c := test_helpers.CreateTestContext(env.E, tc.Method, tc.Path, nil)
			tc.Setup(rec, c)

			if err := env.Handler.(interface{ CreateUniversity(echo.Context) error }).CreateUniversity(c); err != nil {
				t.Errorf(errAuthRequest, err)
			}

			if tc.ExpectedError != "" {
				test_helpers.AssertErrorResponse(t, rec, tc.ExpectedStatus, tc.ExpectedError)
			} else {
				var university models.University
				if err := json.Unmarshal(rec.Body.Bytes(), &university); err != nil {
					t.Fatalf(errAuthUnmarshal, err)
				}
				if err := verifyAuthentication(t, rec, tc.ExpectedStatus, tc.ExpectedError); err != nil {
					t.Errorf(errAuthVerification, err)
				}
			}
		})
	}
}

// verifyAuthentication は認証テストのレスポンスを検証します
func verifyAuthentication(t *testing.T, rec *httptest.ResponseRecorder, expectedStatus int, expectedError string) error {
	if expectedError != "" {
		var response map[string]string
		if err := json.Unmarshal(rec.Body.Bytes(), &response); err != nil {
			return fmt.Errorf("レスポンスのアンマーシャルに失敗しました: %v", err)
		}
		if response["error"] != expectedError {
			return fmt.Errorf("エラーメッセージが一致しません: got %v want %v", response["error"], expectedError)
		}
	}

	if rec.Code != expectedStatus {
		return fmt.Errorf("ステータスコードが一致しません: got %v want %v", rec.Code, expectedStatus)
	}
	return nil
}

// TestAuthorization は認可機能をテストします
func TestAuthorization(t *testing.T) {
	env, err := setupTestEnvironment(t)
	if err != nil {
		t.Fatal(err)
	}

	testCases := []TestCase{
		{
			Name:   "権限なし",
			Method: http.MethodPost,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				university := test_helpers.CreateTestUniversity("認可テスト大学", "認可テスト学部")
				jsonData, err := json.Marshal(university)
	if err != nil {
					t.Fatalf(errAuthzTestData, err)
				}
				c.Request().Body = io.NopCloser(bytes.NewBuffer(jsonData))
				c.Request().Header.Set(test_helpers.ContentTypeHeader, test_helpers.ContentTypeJSON)
				c.Request().Header.Set("Authorization", "Bearer no-permission-token")
			},
			ExpectedStatus: http.StatusForbidden,
			ExpectedError:  errNoPermission,
		},
		{
			Name:   "一般ユーザー権限",
			Method: http.MethodPost,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				university := test_helpers.CreateTestUniversity("認可テスト大学", "認可テスト学部")
				jsonData, err := json.Marshal(university)
				if err != nil {
					t.Fatalf(errAuthzTestData, err)
				}
				c.Request().Body = io.NopCloser(bytes.NewBuffer(jsonData))
				c.Request().Header.Set(test_helpers.ContentTypeHeader, test_helpers.ContentTypeJSON)
				c.Request().Header.Set("Authorization", "Bearer user-token")
			},
			ExpectedStatus: http.StatusForbidden,
			ExpectedError:  errNoPermission,
		},
		{
			Name:   "編集者権限",
			Method: http.MethodPost,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				university := test_helpers.CreateTestUniversity("認可テスト大学", "認可テスト学部")
				jsonData, err := json.Marshal(university)
				if err != nil {
					t.Fatalf(errAuthzTestData, err)
				}
				c.Request().Body = io.NopCloser(bytes.NewBuffer(jsonData))
				c.Request().Header.Set(test_helpers.ContentTypeHeader, test_helpers.ContentTypeJSON)
				c.Request().Header.Set("Authorization", "Bearer editor-token")
			},
			ExpectedStatus: http.StatusCreated,
			ExpectedError:  "",
		},
		{
			Name:   "管理者権限",
			Method: http.MethodPost,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				university := test_helpers.CreateTestUniversity("認可テスト大学", "認可テスト学部")
				jsonData, err := json.Marshal(university)
				if err != nil {
					t.Fatalf(errAuthzTestData, err)
				}
				c.Request().Body = io.NopCloser(bytes.NewBuffer(jsonData))
				c.Request().Header.Set(test_helpers.ContentTypeHeader, test_helpers.ContentTypeJSON)
				c.Request().Header.Set("Authorization", "Bearer admin-token")
			},
			ExpectedStatus: http.StatusCreated,
			ExpectedError:  "",
		},
		{
			Name:   "権限の階層チェック",
			Method: http.MethodPost,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				university := test_helpers.CreateTestUniversity("認可テスト大学", "認可テスト学部")
				jsonData, err := json.Marshal(university)
				if err != nil {
					t.Fatalf(errAuthzTestData, err)
				}
				c.Request().Body = io.NopCloser(bytes.NewBuffer(jsonData))
				c.Request().Header.Set(test_helpers.ContentTypeHeader, test_helpers.ContentTypeJSON)
				c.Request().Header.Set("Authorization", "Bearer super-admin-token")
			},
			ExpectedStatus: http.StatusCreated,
			ExpectedError:  "",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.Name, func(t *testing.T) {
			rec, c := test_helpers.CreateTestContext(env.E, tc.Method, tc.Path, nil)
			tc.Setup(rec, c)

			if err := env.Handler.(interface{ CreateUniversity(echo.Context) error }).CreateUniversity(c); err != nil {
				t.Errorf(errAuthzRequest, err)
			}

			if tc.ExpectedError != "" {
				test_helpers.AssertErrorResponse(t, rec, tc.ExpectedStatus, tc.ExpectedError)
			} else {
				var university models.University
				if err := json.Unmarshal(rec.Body.Bytes(), &university); err != nil {
					t.Fatalf(errAuthzUnmarshal, err)
				}
				if err := verifyAuthorization(t, rec, tc.ExpectedStatus, tc.ExpectedError); err != nil {
					t.Errorf(errAuthzVerification, err)
				}
			}
		})
	}
}

// verifyAuthorization は認可テストのレスポンスを検証します
func verifyAuthorization(t *testing.T, rec *httptest.ResponseRecorder, expectedStatus int, expectedError string) error {
	if expectedError != "" {
		var response map[string]string
		if err := json.Unmarshal(rec.Body.Bytes(), &response); err != nil {
			return fmt.Errorf("レスポンスのアンマーシャルに失敗しました: %v", err)
		}
		if response["error"] != expectedError {
			return fmt.Errorf("エラーメッセージが一致しません: got %v want %v", response["error"], expectedError)
		}
	}

	if rec.Code != expectedStatus {
		return fmt.Errorf("ステータスコードが一致しません: got %v want %v", rec.Code, expectedStatus)
	}

	// 成功時の追加検証
	if expectedStatus == http.StatusCreated {
		var university models.University
		if err := json.Unmarshal(rec.Body.Bytes(), &university); err != nil {
			return fmt.Errorf("大学データのアンマーシャルに失敗しました: %v", err)
		}

		// 必須フィールドの検証
		if university.Name == "" {
			return fmt.Errorf("大学名が空です")
		}
		if len(university.Departments) == 0 {
			return fmt.Errorf("学部情報が空です")
		}
		if university.Departments[0].Name == "" {
			return fmt.Errorf("学部名が空です")
		}
	}

	return nil
}

// runXSSTest は単一のXSSテストケースを実行します
func runXSSTest(_ *testing.T, handler interface{}, e *echo.Echo, input models.University) (*models.University, error) {
	jsonData, err := json.Marshal(input)
			if err != nil {
		return nil, fmt.Errorf(test_helpers.ErrMarshalTestData, err)
			}

			rec, c := test_helpers.CreateTestContext(e, http.MethodPost, test_helpers.APIUniversitiesPath, nil)
			c.Request().Body = io.NopCloser(bytes.NewBuffer(jsonData))
			c.Request().Header.Set(test_helpers.ContentTypeHeader, test_helpers.ContentTypeJSON)

	if err := handler.(interface{ CreateUniversity(echo.Context) error }).CreateUniversity(c); err != nil {
		return nil, fmt.Errorf(test_helpers.ErrRequestFailed, err)
			}

			var createdUniversity models.University
			if err := json.Unmarshal(rec.Body.Bytes(), &createdUniversity); err != nil {
		return nil, fmt.Errorf(test_helpers.ErrUnmarshalResponse, err)
	}

	return &createdUniversity, nil
}

// verifyXSSEscaping はXSSエスケープを検証します
func verifyXSSEscaping(t *testing.T, handler interface{}, e *echo.Echo, university *models.University) error {
	test_helpers.AssertXSSEscaped(t, university.Name)
	for _, dept := range university.Departments {
				test_helpers.AssertXSSEscaped(t, dept.Name)
			}

	rec, c := test_helpers.CreateTestContext(e, http.MethodGet, fmt.Sprintf("/api/universities/%d", university.ID), nil)
			c.SetParamNames("id")
	c.SetParamValues(fmt.Sprintf("%d", university.ID))

	if err := handler.(interface{ GetUniversity(echo.Context) error }).GetUniversity(c); err != nil {
		return err
			}

			var retrievedUniversity models.University
			if err := json.Unmarshal(rec.Body.Bytes(), &retrievedUniversity); err != nil {
		return fmt.Errorf(test_helpers.ErrUnmarshalResponse, err)
			}

			test_helpers.AssertXSSEscaped(t, retrievedUniversity.Name)
			for _, dept := range retrievedUniversity.Departments {
				test_helpers.AssertXSSEscaped(t, dept.Name)
			}

	return nil
}

// TestXSSPrevention はXSS攻撃対策を検証します
func TestXSSPrevention(t *testing.T) {
	env, err := setupTestEnvironment(t)
	if err != nil {
		t.Fatal(err)
	}

	testCases := []TestCase{
		{
			Name:   "スクリプトタグを含む大学名",
			Method: http.MethodPost,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				university := test_helpers.CreateXSSUniversity()
				jsonData, err := json.Marshal(university)
				if err != nil {
					t.Fatalf(errXSSTestData, err)
				}
				c.Request().Body = io.NopCloser(bytes.NewBuffer(jsonData))
				c.Request().Header.Set(test_helpers.ContentTypeHeader, test_helpers.ContentTypeJSON)
			},
			ExpectedStatus: http.StatusCreated,
			ExpectedError:  "",
		},
		{
			Name:   "JavaScriptイベントを含む学部名",
			Method: http.MethodPost,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				university := test_helpers.CreateXSSUniversityWithEvent()
				jsonData, err := json.Marshal(university)
				if err != nil {
					t.Fatalf(errXSSTestData, err)
				}
				c.Request().Body = io.NopCloser(bytes.NewBuffer(jsonData))
				c.Request().Header.Set(test_helpers.ContentTypeHeader, test_helpers.ContentTypeJSON)
			},
			ExpectedStatus: http.StatusCreated,
			ExpectedError:  "",
		},
		{
			Name:   "URLエンコードされたスクリプト",
			Method: http.MethodPost,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				university := test_helpers.CreateXSSUniversityWithURLEncoding()
				jsonData, err := json.Marshal(university)
				if err != nil {
					t.Fatalf(errXSSTestData, err)
				}
				c.Request().Body = io.NopCloser(bytes.NewBuffer(jsonData))
				c.Request().Header.Set(test_helpers.ContentTypeHeader, test_helpers.ContentTypeJSON)
			},
			ExpectedStatus: http.StatusCreated,
			ExpectedError:  "",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.Name, func(t *testing.T) {
			rec, c := test_helpers.CreateTestContext(env.E, tc.Method, tc.Path, nil)
			tc.Setup(rec, c)

			if err := env.Handler.(interface{ CreateUniversity(echo.Context) error }).CreateUniversity(c); err != nil {
				t.Errorf(errXSSRequest, err)
			}

			if tc.ExpectedError != "" {
				test_helpers.AssertErrorResponse(t, rec, tc.ExpectedStatus, tc.ExpectedError)
			} else {
				var university models.University
				if err := json.Unmarshal(rec.Body.Bytes(), &university); err != nil {
					t.Fatalf(errXSSUnmarshal, err)
				}
				if err := verifyXSSEscaping(t, env.Handler, env.E, &university); err != nil {
					t.Errorf(errXSSVerification, err)
				}
			}
		})
	}
}

// runCSRFTest はCSRFテストケースを実行します
func runCSRFTest(_ *testing.T, handler interface{}, e *echo.Echo, method string, setupCSRF func(*httptest.ResponseRecorder, echo.Context)) (*httptest.ResponseRecorder, error) {
			university := &models.University{
				Name: "CSRFテスト大学",
		Departments: []models.Department{{
						Name: "CSRFテスト学部",
			Majors: []models.Major{{
								Name: "CSRFテスト学科",
			}},
		}},
			}

			jsonData, err := json.Marshal(university)
			if err != nil {
		return nil, fmt.Errorf(errMarshalTestData, err)
			}

	rec, c := test_helpers.CreateTestContext(e, method, "/api/v1/universities", nil)
			c.Request().Body = io.NopCloser(bytes.NewBuffer(jsonData))
			c.Request().Header.Set("Content-Type", "application/json")

	setupCSRF(rec, c)
	err = handler.(interface{ CreateUniversity(echo.Context) error }).CreateUniversity(c)
	return rec, err
}

// verifyCSRFResponse はCSRFテストのレスポンスを検証します
func verifyCSRFResponse(t *testing.T, rec *httptest.ResponseRecorder, expectedStatus int, expectedError string) error {
	if expectedError != "" {
				var response map[string]string
				if err := json.Unmarshal(rec.Body.Bytes(), &response); err != nil {
			return fmt.Errorf("レスポンスのアンマーシャルに失敗しました: %v", err)
		}
		if response["error"] != expectedError {
			return fmt.Errorf("エラーメッセージが一致しません: got %v want %v", response["error"], expectedError)
		}
	}

	if rec.Code != expectedStatus {
		return fmt.Errorf("ステータスコードが一致しません: got %v want %v", rec.Code, expectedStatus)
	}
	return nil
}

// TestCSRFProtection はCSRF保護機能をテストします
func TestCSRFProtection(t *testing.T) {
	env, err := setupTestEnvironment(t)
	if err != nil {
		t.Fatal(err)
	}

	testCases := []TestCase{
		{
			Name:   "CSRFトークンなし",
			Method: http.MethodPost,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				university := test_helpers.CreateTestUniversity("CSRFテスト大学", "CSRFテスト学部")
				jsonData, err := json.Marshal(university)
				if err != nil {
					t.Fatalf(errCSRFTestData, err)
				}
				c.Request().Body = io.NopCloser(bytes.NewBuffer(jsonData))
				c.Request().Header.Set(test_helpers.ContentTypeHeader, test_helpers.ContentTypeJSON)
			},
			ExpectedStatus: http.StatusForbidden,
			ExpectedError:  errCSRFMissingToken,
		},
		{
			Name:   "不正なCSRFトークン",
			Method: http.MethodPost,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				university := test_helpers.CreateTestUniversity("CSRFテスト大学", "CSRFテスト学部")
				jsonData, err := json.Marshal(university)
				if err != nil {
					t.Fatalf(errCSRFTestData, err)
				}
				c.Request().Body = io.NopCloser(bytes.NewBuffer(jsonData))
				c.Request().Header.Set(test_helpers.ContentTypeHeader, test_helpers.ContentTypeJSON)
				c.Request().Header.Set(test_helpers.CSRFTokenHeader, "invalid-token")
			},
			ExpectedStatus: http.StatusForbidden,
			ExpectedError:  errCSRFInvalidToken,
		},
		{
			Name:   "有効なCSRFトークン",
			Method: http.MethodPost,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				university := test_helpers.CreateTestUniversity("CSRFテスト大学", "CSRFテスト学部")
				jsonData, err := json.Marshal(university)
				if err != nil {
					t.Fatalf(errCSRFTestData, err)
				}
				c.Request().Body = io.NopCloser(bytes.NewBuffer(jsonData))
				c.Request().Header.Set(test_helpers.ContentTypeHeader, test_helpers.ContentTypeJSON)
				token := "valid-csrf-token"
				c.Set("csrf", token)
				c.Request().Header.Set(test_helpers.CSRFTokenHeader, token)
			},
			ExpectedStatus: http.StatusCreated,
			ExpectedError:  "",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.Name, func(t *testing.T) {
			rec, c := test_helpers.CreateTestContext(env.E, tc.Method, tc.Path, nil)
			tc.Setup(rec, c)

			if err := env.Handler.(interface{ CreateUniversity(echo.Context) error }).CreateUniversity(c); err != nil {
				t.Errorf(errCSRFRequest, err)
			}

			if tc.ExpectedError != "" {
				test_helpers.AssertErrorResponse(t, rec, tc.ExpectedStatus, tc.ExpectedError)
			} else {
				var university models.University
				if err := json.Unmarshal(rec.Body.Bytes(), &university); err != nil {
					t.Fatalf(errCSRFUnmarshal, err)
				}
				if err := verifyCSRFResponse(t, rec, tc.ExpectedStatus, tc.ExpectedError); err != nil {
					t.Errorf(errCSRFVerification, err)
				}
			}
		})
	}
}

// TestCSRFTokenRefresh はCSRFトークンの更新をテストします
func TestCSRFTokenRefresh(t *testing.T) {
	env, err := setupTestEnvironment(t)
	if err != nil {
		t.Fatal(err)
	}

	// 初回トークンの取得
	rec1, c1 := test_helpers.CreateTestContext(env.E, http.MethodGet, test_helpers.CSRFTokenPath, nil)
	if err := env.Handler.(interface{ GetCSRFToken(echo.Context) error }).GetCSRFToken(c1); err != nil {
		t.Errorf("予期しないエラーが発生: %v", err)
	}

	var token1 struct {
		Token string `json:"token"`
	}
	if err := json.Unmarshal(rec1.Body.Bytes(), &token1); err != nil {
		t.Fatalf(test_helpers.ErrUnmarshalResponse, err)
	}

	// 2回目のトークン取得
	rec2, c2 := test_helpers.CreateTestContext(env.E, http.MethodGet, test_helpers.CSRFTokenPath, nil)
	if err := env.Handler.(interface{ GetCSRFToken(echo.Context) error }).GetCSRFToken(c2); err != nil {
		t.Errorf("予期しないエラーが発生: %v", err)
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
	env, err := setupTestEnvironment(t)
	if err != nil {
		t.Fatal(err)
	}

	testCases := []TestCase{
		{
			Name:   "HTMLタグの除去",
			Method: http.MethodPost,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				university := test_helpers.CreateSanitizationUniversityWithHTML()
				jsonData, err := json.Marshal(university)
				if err != nil {
					t.Fatalf(errSanitizationTestData, err)
				}
				c.Request().Body = io.NopCloser(bytes.NewBuffer(jsonData))
				c.Request().Header.Set(test_helpers.ContentTypeHeader, test_helpers.ContentTypeJSON)
			},
			ExpectedStatus: http.StatusCreated,
			ExpectedError:  "",
		},
		{
			Name:   "制御文字の除去",
			Method: http.MethodPost,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				university := test_helpers.CreateSanitizationUniversityWithControlChars()
				jsonData, err := json.Marshal(university)
				if err != nil {
					t.Fatalf(errSanitizationTestData, err)
				}
				c.Request().Body = io.NopCloser(bytes.NewBuffer(jsonData))
				c.Request().Header.Set(test_helpers.ContentTypeHeader, test_helpers.ContentTypeJSON)
			},
			ExpectedStatus: http.StatusCreated,
			ExpectedError:  "",
		},
		{
			Name:   "全角スペースの正規化",
			Method: http.MethodPost,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				university := test_helpers.CreateSanitizationUniversityWithFullWidthSpace()
				jsonData, err := json.Marshal(university)
				if err != nil {
					t.Fatalf(errSanitizationTestData, err)
				}
				c.Request().Body = io.NopCloser(bytes.NewBuffer(jsonData))
				c.Request().Header.Set(test_helpers.ContentTypeHeader, test_helpers.ContentTypeJSON)
			},
			ExpectedStatus: http.StatusCreated,
			ExpectedError:  "",
		},
		{
			Name:   "SQLインジェクション文字の除去",
			Method: http.MethodPost,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				university := test_helpers.CreateSanitizationUniversityWithSQLInjection()
				jsonData, err := json.Marshal(university)
				if err != nil {
					t.Fatalf(errSanitizationTestData, err)
				}
				c.Request().Body = io.NopCloser(bytes.NewBuffer(jsonData))
				c.Request().Header.Set(test_helpers.ContentTypeHeader, test_helpers.ContentTypeJSON)
			},
			ExpectedStatus: http.StatusCreated,
			ExpectedError:  "",
		},
		{
			Name:   "XSS攻撃文字の除去",
			Method: http.MethodPost,
			Path:   test_helpers.APIUniversitiesPath,
			Setup: func(rec *httptest.ResponseRecorder, c echo.Context) {
				university := test_helpers.CreateSanitizationUniversityWithXSS()
				jsonData, err := json.Marshal(university)
				if err != nil {
					t.Fatalf(errSanitizationTestData, err)
				}
				c.Request().Body = io.NopCloser(bytes.NewBuffer(jsonData))
				c.Request().Header.Set(test_helpers.ContentTypeHeader, test_helpers.ContentTypeJSON)
			},
			ExpectedStatus: http.StatusCreated,
			ExpectedError:  "",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.Name, func(t *testing.T) {
			rec, c := test_helpers.CreateTestContext(env.E, tc.Method, tc.Path, nil)
			tc.Setup(rec, c)

			if err := env.Handler.(interface{ CreateUniversity(echo.Context) error }).CreateUniversity(c); err != nil {
				t.Errorf(errSanitizationRequest, err)
			}

			if tc.ExpectedError != "" {
				test_helpers.AssertErrorResponse(t, rec, tc.ExpectedStatus, tc.ExpectedError)
			} else {
				var university models.University
				if err := json.Unmarshal(rec.Body.Bytes(), &university); err != nil {
					t.Fatalf(errSanitizationUnmarshal, err)
				}

				if err := verifySanitization(t, &university, tc.Name); err != nil {
					t.Errorf(errSanitizationVerification, err)
				}
			}
		})
	}
}

// verifySanitization はサニタイズされた値を検証します
func verifySanitization(t *testing.T, university *models.University, testCaseName string) error {
	expectedName := "テスト大学"
	expectedDeptName := "テスト学部"

	switch testCaseName {
	case "HTMLタグの除去":
		expectedName = "テスト大学"
		expectedDeptName = "テスト学部"
	case "制御文字の除去":
		expectedName = "テスト大学"
		expectedDeptName = "テスト学部"
	case "全角スペースの正規化":
		expectedName = "テスト 大学"
		expectedDeptName = "テスト 学部"
	case "SQLインジェクション文字の除去":
		expectedName = "テスト大学"
		expectedDeptName = "テスト学部"
	case "XSS攻撃文字の除去":
		expectedName = "テスト大学"
		expectedDeptName = "テスト学部"
	}

	if university.Name != expectedName {
		return fmt.Errorf(errSanitizationNameMismatch, university.Name, expectedName)
	}

	if len(university.Departments) > 0 {
		if university.Departments[0].Name != expectedDeptName {
			return fmt.Errorf(errSanitizationDeptNameMismatch, university.Departments[0].Name, expectedDeptName)
		}
	}

	test_helpers.AssertSpecialCharsSanitized(t, university.Name)
	for _, dept := range university.Departments {
				test_helpers.AssertSpecialCharsSanitized(t, dept.Name)
			}

	return nil
}
