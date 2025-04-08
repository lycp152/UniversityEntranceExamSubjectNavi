package university_test

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
	"university-exam-api/internal/domain/models"
	"university-exam-api/internal/handlers/university"
	"university-exam-api/internal/repositories"
	"university-exam-api/internal/testutils"

	"github.com/labstack/echo/v4"
)

const (
	// APIパス
	APIUniversityPath = "/api/universities/%s"
)

// universityTestCase は大学関連のテストケースを定義します
type universityTestCase struct {
	testutils.TestCase
	universityID string                              // 大学ID
	validate     func(*testing.T, models.University) // 大学データの検証関数
}

// validateUniversityData は大学データの検証を行います
func validateUniversityData(t *testing.T, university models.University) {
	t.Helper()

	if university.Name == "" {
		t.Errorf("大学名が設定されていません")
	}
	if len(university.Departments) == 0 {
		t.Errorf("学部データが存在しません")
	}
}

// validateGetUniversityResponse は大学取得のレスポンスを検証します
func validateGetUniversityResponse(t *testing.T, rec *httptest.ResponseRecorder, tc universityTestCase) {
	t.Helper()

	testutils.ValidateResponse(t, rec, tc.TestCase)

	var university models.University
	if err := testutils.ParseResponse(rec, &university); err != nil {
		t.Fatalf("レスポンスのパースに失敗しました: %v", err)
	}

	if tc.validate != nil {
		tc.validate(t, university)
	} else {
		validateUniversityData(t, university)
	}
}

// TestGetUniversity は大学取得のテストを行います
func TestGetUniversity(t *testing.T) {
	t.Parallel() // テストを並列実行

	e, handler := testutils.SetupTestHandler()
	universityHandler := university.NewUniversityHandler(handler.GetRepo(), 5*time.Second)

	tests := []universityTestCase{
		{
			TestCase: testutils.TestCase{
				Name:       testutils.TestCaseNormalRequest,
				WantStatus: http.StatusOK,
			},
			universityID: "1",
			validate:    validateUniversityData,
		},
		{
			TestCase: testutils.TestCase{
				Name:       testutils.TestCaseNotFound,
				WantStatus: http.StatusNotFound,
				WantError:  fmt.Sprintf(university.ErrMsgUniversityNotFound, "999"),
			},
			universityID: "999",
		},
		{
			TestCase: testutils.TestCase{
				Name:       testutils.TestCaseInvalidID,
				WantStatus: http.StatusBadRequest,
				WantError:  fmt.Sprintf(testutils.ErrMsgInvalidIDFormat, "大学"),
			},
			universityID: "invalid",
		},
	}

	for _, tt := range tests {
		tt := tt // ループ変数のキャプチャ
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel() // サブテストを並列実行

			path := fmt.Sprintf(APIUniversityPath, tt.universityID)
			rec, err := testutils.ExecuteRequest(e, testutils.RequestConfig{
				Method: http.MethodGet,
				Path:   path,
			}, universityHandler.GetUniversity)
			if err != nil {
				t.Fatalf(testutils.ErrMsgRequestFailed, err)
			}
			validateGetUniversityResponse(t, rec, tt)
		})
	}
}

// TestCreateUniversity は大学作成のテストを行います
func TestCreateUniversity(t *testing.T) {
	e, handler := testutils.SetupTestHandler()
	universityHandler := university.NewUniversityHandler(handler.GetRepo(), 5*time.Second)

	tests := []universityTestCase{
		{
			TestCase: testutils.TestCase{
				Name:       testutils.TestCaseNormalRequest,
				WantStatus: http.StatusCreated,
			},
			universityID: "0",
		},
		{
			TestCase: testutils.TestCase{
				Name:       testutils.TestCaseInvalidBody,
				WantStatus: http.StatusBadRequest,
				WantError:  "リクエストボディの解析に失敗しました",
			},
			universityID: "0",
		},
	}

	for _, tt := range tests {
		t.Run(tt.Name, func(t *testing.T) {
			var body interface{}
			if tt.Name == testutils.TestCaseNormalRequest {
				body = map[string]interface{}{
					"name": "テスト大学",
				}
			} else {
				body = "invalid"
			}

			rec, err := testutils.ExecuteRequest(e, testutils.RequestConfig{
				Method: http.MethodPost,
				Path:   "/api/universities",
				Body:   body,
			}, universityHandler.CreateUniversity)
			if err != nil {
				t.Fatalf(testutils.ErrMsgRequestFailed, err)
			}
			validateGetUniversityResponse(t, rec, tt)
		})
	}
}

// TestUpdateUniversity は大学更新のテストを行います
func TestUpdateUniversity(t *testing.T) {
	e, handler := testutils.SetupTestHandler()
	universityHandler := university.NewUniversityHandler(handler.GetRepo(), 5*time.Second)

	tests := []universityTestCase{
		{
			TestCase: testutils.TestCase{
				Name:       testutils.TestCaseNormalRequest,
				WantStatus: http.StatusOK,
			},
			universityID: "1",
		},
		{
			TestCase: testutils.TestCase{
				Name:       testutils.TestCaseNotFound,
				WantStatus: http.StatusNotFound,
				WantError:  fmt.Sprintf(university.ErrMsgUniversityNotFound, "999"),
			},
			universityID: "999",
		},
	}

	for _, tt := range tests {
		t.Run(tt.Name, func(t *testing.T) {
			body := map[string]interface{}{
				"name": "更新されたテスト大学",
			}

			path := fmt.Sprintf(APIUniversityPath, tt.universityID)
			rec, err := testutils.ExecuteRequest(e, testutils.RequestConfig{
				Method: http.MethodPut,
				Path:   path,
				Body:   body,
			}, universityHandler.UpdateUniversity)
			if err != nil {
				t.Fatalf(testutils.ErrMsgRequestFailed, err)
			}
			validateGetUniversityResponse(t, rec, tt)
		})
	}
}

// TestDeleteUniversity は大学削除のテストを行います
func TestDeleteUniversity(t *testing.T) {
	e, handler := testutils.SetupTestHandler()
	universityHandler := university.NewUniversityHandler(handler.GetRepo(), 5*time.Second)

	tests := []universityTestCase{
		{
			TestCase: testutils.TestCase{
				Name:       testutils.TestCaseNormalRequest,
				WantStatus: http.StatusNoContent,
			},
			universityID: "1",
		},
		{
			TestCase: testutils.TestCase{
				Name:       testutils.TestCaseNotFound,
				WantStatus: http.StatusNotFound,
				WantError:  fmt.Sprintf(university.ErrMsgUniversityNotFound, "999"),
			},
			universityID: "999",
		},
	}

	for _, tt := range tests {
		t.Run(tt.Name, func(t *testing.T) {
			path := fmt.Sprintf(APIUniversityPath, tt.universityID)
			rec, err := testutils.ExecuteRequest(e, testutils.RequestConfig{
				Method: http.MethodDelete,
				Path:   path,
			}, universityHandler.DeleteUniversity)
			if err != nil {
				t.Fatalf(testutils.ErrMsgRequestFailed, err)
			}
			testutils.ValidateResponse(t, rec, tt.TestCase)
		})
	}
}

// universityListTestCase は大学一覧取得のテストケースを定義します
// この構造体は大学一覧取得のテストケースで使用される情報を保持します
type universityListTestCase struct {
	testutils.TestCase
	wantCount int                                    // 期待される大学の件数
	validate  func(*testing.T, []models.University) // 大学データの検証関数
}


// validateGetUniversitiesResponse は大学一覧取得のレスポンスを検証します
// この関数は大学一覧取得のレスポンスに対して詳細な検証を行います
func validateGetUniversitiesResponse(t *testing.T, rec *httptest.ResponseRecorder, tc universityListTestCase) {
	t.Helper()

	testutils.ValidateResponse(t, rec, tc.TestCase)

	var universities []models.University
	if err := testutils.ParseResponse(rec, &universities); err != nil {
		t.Fatalf(testutils.ErrMsgParseResponse, err)
	}

	if tc.validate != nil {
		tc.validate(t, universities)
	} else {
		validateUniversityListData(t, universities, tc.wantCount)
	}
}

// validateUniversityListData は大学一覧データの検証を行います
func validateUniversityListData(t *testing.T, universities []models.University, wantCount int) {
	t.Helper()

	if len(universities) != wantCount {
		t.Errorf("期待される大学数: %v, 実際の大学数: %v", wantCount, len(universities))
	}

	for _, university := range universities {
		if university.Name == "" {
			t.Errorf("大学名が設定されていません")
		}
		if len(university.Departments) == 0 {
			t.Errorf("学部データが存在しません")
		}
	}
}

// TestGetUniversities は大学一覧取得のテストを行います
// このテストは以下のケースを検証します：
// - 正常なリクエスト
// - データが存在しない場合
// - データベースエラーが発生した場合
func TestGetUniversities(t *testing.T) {
	e, handler := testutils.SetupTestHandler()

	tests := []universityListTestCase{
		{
			TestCase: testutils.TestCase{
				Name:       testutils.TestCaseNormalRequest,
				WantStatus: http.StatusOK,
			},
			wantCount: 1,
		},
		{
			TestCase: testutils.TestCase{
				Name:       testutils.TestCaseNotFound,
				Setup: func(t *testing.T, e *echo.Echo, h *university.UniversityHandler) {
					repo := repositories.SetupTestDB()
					h.SetRepo(repositories.NewUniversityRepository(repo))
				},
				WantStatus: http.StatusOK,
			},
			wantCount: 0,
		},
		{
			TestCase: testutils.TestCase{
				Name:       testutils.TestCaseDBError,
				Setup: func(t *testing.T, e *echo.Echo, h *university.UniversityHandler) {
					db := repositories.SetupTestDB()
					sqlDB, err := db.DB()
					if err != nil {
						t.Fatalf("データベースインスタンスの取得に失敗しました: %v", err)
					}
					sqlDB.Close()
					h.SetRepo(repositories.NewUniversityRepository(db))
				},
				WantStatus: http.StatusInternalServerError,
				WantError:  testutils.ErrInternalServer,
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.Name, func(t *testing.T) {
			if tt.Setup != nil {
				tt.Setup(t, e, handler)
			}

			rec, err := testutils.ExecuteRequest(e, testutils.RequestConfig{
				Method: http.MethodGet,
				Path:   testutils.APIUniversitiesPath,
			}, handler.GetUniversities)
			if err != nil {
				t.Fatalf(testutils.ErrMsgRequestFailed, err)
			}
			validateGetUniversitiesResponse(t, rec, tt)
		})
	}
}
