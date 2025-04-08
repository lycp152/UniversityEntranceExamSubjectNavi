package major

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
	"university-exam-api/internal/domain/models"
	"university-exam-api/internal/testutils"
)

const (
	errMsgMajorNotFound    = "学科が見つかりません (ID: %s)"
	errMsgInvalidIDFormat  = "無効な%sIDの形式です"
	errMsgRequestFailed    = "リクエストの実行に失敗しました: %v"
	errMsgParseResponse    = "レスポンスのパースに失敗しました: %v"
	errMsgDepartmentIDNotSet = "学部IDが設定されていません"
	errMsgMajorNameNotSet    = "学科名が設定されていません"
	errMsgNoAdmissionSchedules = "入試日程データが存在しません"
)

// majorHandlerTestCase は学科ハンドラのテストケースを定義します
type majorHandlerTestCase struct {
	name         string
	departmentID string
	majorID      string
	wantStatus   int
	wantError    string
	validate     func(*testing.T, models.Major)
}

// validateMajorData は学科データの検証を行います
func validateMajorData(t *testing.T, major models.Major) {
	t.Helper()

	if major.DepartmentID == 0 {
		t.Error(errMsgDepartmentIDNotSet)
	}
	if major.Name == "" {
		t.Error(errMsgMajorNameNotSet)
	}
	if len(major.AdmissionSchedules) == 0 {
		t.Error(errMsgNoAdmissionSchedules)
	}
}

// validateGetMajorResponse は学科取得のレスポンスを検証します
func validateGetMajorResponse(t *testing.T, rec *httptest.ResponseRecorder, tc majorHandlerTestCase) {
	t.Helper()

	if rec.Code != tc.wantStatus {
		t.Errorf("期待するステータスコード: %d, 実際のステータスコード: %d", tc.wantStatus, rec.Code)
	}

	if tc.wantError != "" {
		var response map[string]interface{}
		if err := testutils.ParseResponse(rec, &response); err != nil {
			t.Fatalf(errMsgParseResponse, err)
		}
		if response["error"] != tc.wantError {
			t.Errorf("期待するエラーメッセージ: %s, 実際のエラーメッセージ: %s", tc.wantError, response["error"])
		}
		return
	}

	var major models.Major
	if err := testutils.ParseResponse(rec, &major); err != nil {
		t.Fatalf(errMsgParseResponse, err)
	}

	if tc.validate != nil {
		tc.validate(t, major)
	} else {
		validateMajorData(t, major)
	}
}

// TestGetMajor は学科取得のテストを行います
func TestGetMajor(t *testing.T) {
	e, handler := testutils.SetupTestHandler()
	majorHandler := NewMajorHandler(handler.GetRepo(), 5*time.Second)

	tests := []majorHandlerTestCase{
		{
			name:         "正常系: 学科の取得",
			departmentID: "1",
			majorID:      "1",
			wantStatus:   http.StatusOK,
			validate:     validateMajorData,
		},
		{
			name:         "異常系: 存在しない学科の取得",
			departmentID: "1",
			majorID:      "999",
			wantStatus:   http.StatusNotFound,
			wantError:    fmt.Sprintf(errMsgMajorNotFound, "999"),
		},
		{
			name:         "異常系: 無効な学科ID",
			departmentID: "1",
			majorID:      "invalid",
			wantStatus:   http.StatusBadRequest,
			wantError:    fmt.Sprintf(errMsgInvalidIDFormat, "学科"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			path := fmt.Sprintf(testutils.APIMajorPath, "1", tt.departmentID, tt.majorID)
			rec, err := testutils.ExecuteRequest(e, testutils.RequestConfig{
				Method: http.MethodGet,
				Path:   path,
			}, majorHandler.GetMajor)
			if err != nil {
				t.Fatalf(errMsgRequestFailed, err)
			}
			validateGetMajorResponse(t, rec, tt)
		})
	}
}

// TestCreateMajor は学科作成のテストを行います
func TestCreateMajor(t *testing.T) {
	e, handler := testutils.SetupTestHandler()
	majorHandler := NewMajorHandler(handler.GetRepo(), 5*time.Second)

	tests := []majorHandlerTestCase{
		{
			name:         "正常系: 学科の作成",
			departmentID: "1",
			majorID:      "0",
			wantStatus:   http.StatusCreated,
		},
		{
			name:         "異常系: 無効なリクエストボディ",
			departmentID: "1",
			majorID:      "0",
			wantStatus:   http.StatusBadRequest,
			wantError:    "リクエストボディの解析に失敗しました",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var body interface{}
			if tt.name == "正常系: 学科の作成" {
				body = map[string]interface{}{
					"department_id": 1,
					"name":         "テスト学科",
				}
			} else {
				body = "invalid"
			}

			path := fmt.Sprintf(testutils.APIMajorsPath, "1", tt.departmentID)
			rec, err := testutils.ExecuteRequest(e, testutils.RequestConfig{
				Method: http.MethodPost,
				Path:   path,
				Body:   body,
			}, majorHandler.CreateMajor)
			if err != nil {
				t.Fatalf(errMsgRequestFailed, err)
			}
			validateGetMajorResponse(t, rec, tt)
		})
	}
}

// TestUpdateMajor は学科更新のテストを行います
func TestUpdateMajor(t *testing.T) {
	e, handler := testutils.SetupTestHandler()
	majorHandler := NewMajorHandler(handler.GetRepo(), 5*time.Second)

	tests := []majorHandlerTestCase{
		{
			name:         "正常系: 学科の更新",
			departmentID: "1",
			majorID:      "1",
			wantStatus:   http.StatusOK,
		},
		{
			name:         "異常系: 存在しない学科の更新",
			departmentID: "1",
			majorID:      "999",
			wantStatus:   http.StatusNotFound,
			wantError:    fmt.Sprintf(errMsgMajorNotFound, "999"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			body := map[string]interface{}{
				"department_id": 1,
				"name":         "更新されたテスト学科",
			}

			path := fmt.Sprintf(testutils.APIMajorPath, "1", tt.departmentID, tt.majorID)
			rec, err := testutils.ExecuteRequest(e, testutils.RequestConfig{
				Method: http.MethodPut,
				Path:   path,
				Body:   body,
			}, majorHandler.UpdateMajor)
			if err != nil {
				t.Fatalf(errMsgRequestFailed, err)
			}
			validateGetMajorResponse(t, rec, tt)
		})
	}
}

// TestDeleteMajor は学科削除のテストを行います
func TestDeleteMajor(t *testing.T) {
	e, handler := testutils.SetupTestHandler()
	majorHandler := NewMajorHandler(handler.GetRepo(), 5*time.Second)

	tests := []majorHandlerTestCase{
		{
			name:         "正常系: 学科の削除",
			departmentID: "1",
			majorID:      "1",
			wantStatus:   http.StatusNoContent,
		},
		{
			name:         "異常系: 存在しない学科の削除",
			departmentID: "1",
			majorID:      "999",
			wantStatus:   http.StatusNotFound,
			wantError:    fmt.Sprintf(errMsgMajorNotFound, "999"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			path := fmt.Sprintf(testutils.APIMajorPath, "1", tt.departmentID, tt.majorID)
			rec, err := testutils.ExecuteRequest(e, testutils.RequestConfig{
				Method: http.MethodDelete,
				Path:   path,
			}, majorHandler.DeleteMajor)
			if err != nil {
				t.Fatalf(errMsgRequestFailed, err)
			}
			validateGetMajorResponse(t, rec, tt)
		})
	}
}
