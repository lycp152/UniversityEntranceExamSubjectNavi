package subject

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
	// APISubjectPath は科目APIのパスを定義します
	APISubjectPath = "/api/universities/%s/departments/%s/subjects/%s"
	// APISubjectsPath は科目一覧APIのパスを定義します
	APISubjectsPath = "/api/universities/%s/departments/%s/subjects"
	// ErrMsgSubjectNotFound は科目が見つからない場合のエラーメッセージを定義します
	ErrMsgSubjectNotFound = "科目が見つかりません: %s"
	// ErrMsgStatusMismatch はステータスコードの不一致エラーメッセージを定義します
	ErrMsgStatusMismatch = "期待するステータスコードと異なります: got = %v, want = %v"
	// ErrMsgParseResponse はレスポンスのパース失敗エラーメッセージを定義します
	ErrMsgParseResponse = "レスポンスのパースに失敗しました: %v"
	// ErrMsgErrorMismatch はエラーメッセージの不一致エラーメッセージを定義します
	ErrMsgErrorMismatch = "期待するエラーメッセージと異なります: got = %v, want = %v"
	// ErrMsgTestTypeIDNotSet は試験種別IDが設定されていない場合のエラーメッセージを定義します
	ErrMsgTestTypeIDNotSet = "試験種別IDが設定されていません"
	// ErrMsgSubjectNameNotSet は科目名が設定されていない場合のエラーメッセージを定義します
	ErrMsgSubjectNameNotSet = "科目名が設定されていません"
	// ErrMsgScoreInvalid は配点が無効な場合のエラーメッセージを定義します
	ErrMsgScoreInvalid = "配点が0以下です"
	// ErrMsgPercentageInvalid は配点比率が無効な場合のエラーメッセージを定義します
	ErrMsgPercentageInvalid = "配点比率が不正です（0-100の範囲外）"
	// ErrMsgDisplayOrderInvalid は表示順が無効な場合のエラーメッセージを定義します
	ErrMsgDisplayOrderInvalid = "表示順が負の値です"
	// TestCaseNameSubjectNotFound は科目が見つからない場合のテストケース名を定義します
	TestCaseNameSubjectNotFound = "異常系: 科目が見つからない"
)

// subjectTestCase は科目関連のテストケースを定義します
type subjectTestCase struct {
	name         string                           // テストケース名
	departmentID string                           // 学部ID
	subjectID    string                           // 科目ID
	wantStatus   int                             // 期待するステータスコード
	wantError    string                          // 期待するエラーメッセージ
	validate     func(*testing.T, models.Subject) // 科目データの検証関数
	body         interface{}                      // リクエストボディ
}

// validateSubjectData は科目データの検証を行います
func validateSubjectData(t *testing.T, subject models.Subject) {
	t.Helper()

	if subject.TestTypeID == 0 {
		t.Errorf(ErrMsgTestTypeIDNotSet)
	}
	if subject.Name == "" {
		t.Errorf(ErrMsgSubjectNameNotSet)
	}
	if subject.Score <= 0 {
		t.Errorf(ErrMsgScoreInvalid)
	}
	if subject.Percentage <= 0 || subject.Percentage > 100 {
		t.Errorf(ErrMsgPercentageInvalid)
	}
	if subject.DisplayOrder < 0 {
		t.Errorf(ErrMsgDisplayOrderInvalid)
	}
}

// validateGetSubjectResponse は科目取得のレスポンスを検証します
func validateGetSubjectResponse(t *testing.T, rec *httptest.ResponseRecorder, tc subjectTestCase) {
	t.Helper()

	if rec.Code != tc.wantStatus {
		t.Errorf(ErrMsgStatusMismatch, rec.Code, tc.wantStatus)
	}

	if tc.wantError != "" {
		var response map[string]interface{}
		if err := testutils.ParseResponse(rec, &response); err != nil {
			t.Fatalf(ErrMsgParseResponse, err)
		}
		if response["error"] != tc.wantError {
			t.Errorf(ErrMsgErrorMismatch, response["error"], tc.wantError)
		}
		return
	}

	var subject models.Subject
	if err := testutils.ParseResponse(rec, &subject); err != nil {
		t.Fatalf(ErrMsgParseResponse, err)
	}

	if tc.validate != nil {
		tc.validate(t, subject)
	} else {
		validateSubjectData(t, subject)
	}
}

// validateBatchUpdateResponse は一括更新のレスポンスを検証します
func validateBatchUpdateResponse(t *testing.T, rec *httptest.ResponseRecorder, wantStatus int, wantError string) {
	t.Helper()

	if rec.Code != wantStatus {
		t.Errorf(ErrMsgStatusMismatch, rec.Code, wantStatus)
	}

	if wantError != "" {
		var response map[string]interface{}
		if err := testutils.ParseResponse(rec, &response); err != nil {
			t.Fatalf(ErrMsgParseResponse, err)
		}
		if response["error"] != wantError {
			t.Errorf(ErrMsgErrorMismatch, response["error"], wantError)
		}
	}
}

// TestGetSubject は科目取得のテストを行います
func TestGetSubject(t *testing.T) {
	t.Parallel() // テストを並列実行

	e, handler := testutils.SetupTestHandler()
	subjectHandler := NewSubjectHandler(handler.GetRepo(), 5*time.Second)

	tests := []subjectTestCase{
		{
			name:         "正常系: 科目取得",
			departmentID: "1",
			subjectID:    "1",
			wantStatus:   http.StatusOK,
			validate:     validateSubjectData,
		},
		{
			name:         TestCaseNameSubjectNotFound,
			departmentID: "1",
			subjectID:    "999",
			wantStatus:   http.StatusNotFound,
			wantError:    fmt.Sprintf(ErrMsgSubjectNotFound, "999"),
		},
		{
			name:         "異常系: 無効な科目ID",
			departmentID: "1",
			subjectID:    "invalid",
			wantStatus:   http.StatusBadRequest,
			wantError:    fmt.Sprintf(testutils.ErrMsgInvalidIDFormat, "科目"),
		},
	}

	for _, tt := range tests {
		tt := tt // ループ変数のキャプチャ
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel() // サブテストを並列実行

			path := fmt.Sprintf(APISubjectPath, "1", tt.departmentID, tt.subjectID)
			rec, err := testutils.ExecuteRequest(e, testutils.RequestConfig{
				Method: http.MethodGet,
				Path:   path,
			}, subjectHandler.GetSubject)
			if err != nil {
				t.Fatalf(testutils.ErrMsgRequestFailed, err)
			}
			validateGetSubjectResponse(t, rec, tt)
		})
	}
}

// TestCreateSubject は科目作成のテストを行います
func TestCreateSubject(t *testing.T) {
	t.Parallel() // テストを並列実行

	e, handler := testutils.SetupTestHandler()
	subjectHandler := NewSubjectHandler(handler.GetRepo(), 5*time.Second)

	tests := []subjectTestCase{
		{
			name:         "正常系: 科目作成",
			departmentID: "1",
			subjectID:    "0",
			wantStatus:   http.StatusCreated,
			validate:     validateSubjectData,
		},
		{
			name:         "異常系: 無効なリクエストボディ",
			departmentID: "1",
			subjectID:    "0",
			wantStatus:   http.StatusBadRequest,
			wantError:    "リクエストボディの解析に失敗しました",
		},
	}

	for _, tt := range tests {
		tt := tt // ループ変数のキャプチャ
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel() // サブテストを並列実行

			var body interface{}
			if tt.name == "正常系: 科目作成" {
				body = map[string]interface{}{
					"test_type_id":   1,
					"name":          "テスト科目",
					"score":         100,
					"percentage":    50.0,
					"display_order": 1,
				}
			} else {
				body = "invalid"
			}

			path := fmt.Sprintf(APISubjectsPath, "1", tt.departmentID)
			rec, err := testutils.ExecuteRequest(e, testutils.RequestConfig{
				Method: http.MethodPost,
				Path:   path,
				Body:   body,
			}, subjectHandler.CreateSubject)
			if err != nil {
				t.Fatalf(testutils.ErrMsgRequestFailed, err)
			}
			validateGetSubjectResponse(t, rec, tt)
		})
	}
}

// TestUpdateSubject は科目更新のテストを行います
func TestUpdateSubject(t *testing.T) {
	t.Parallel() // テストを並列実行

	e, handler := testutils.SetupTestHandler()
	subjectHandler := NewSubjectHandler(handler.GetRepo(), 5*time.Second)

	tests := []subjectTestCase{
		{
			name:         "正常系: 科目更新",
			departmentID: "1",
			subjectID:    "1",
			wantStatus:   http.StatusOK,
			validate:     validateSubjectData,
		},
		{
			name:         TestCaseNameSubjectNotFound,
			departmentID: "1",
			subjectID:    "999",
			wantStatus:   http.StatusNotFound,
			wantError:    fmt.Sprintf(ErrMsgSubjectNotFound, "999"),
		},
	}

	for _, tt := range tests {
		tt := tt // ループ変数のキャプチャ
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel() // サブテストを並列実行

			body := map[string]interface{}{
				"test_type_id":   1,
				"name":          "更新されたテスト科目",
				"score":         150,
				"percentage":    60.0,
				"display_order": 2,
			}

			path := fmt.Sprintf(APISubjectPath, "1", tt.departmentID, tt.subjectID)
			rec, err := testutils.ExecuteRequest(e, testutils.RequestConfig{
				Method: http.MethodPut,
				Path:   path,
				Body:   body,
			}, subjectHandler.UpdateSubject)
			if err != nil {
				t.Fatalf(testutils.ErrMsgRequestFailed, err)
			}
			validateGetSubjectResponse(t, rec, tt)
		})
	}
}

// TestDeleteSubject は科目削除のテストを行います
func TestDeleteSubject(t *testing.T) {
	t.Parallel() // テストを並列実行

	e, handler := testutils.SetupTestHandler()
	subjectHandler := NewSubjectHandler(handler.GetRepo(), 5*time.Second)

	tests := []subjectTestCase{
		{
			name:         "正常系: 科目削除",
			departmentID: "1",
			subjectID:    "1",
			wantStatus:   http.StatusNoContent,
		},
		{
			name:         TestCaseNameSubjectNotFound,
			departmentID: "1",
			subjectID:    "999",
			wantStatus:   http.StatusNotFound,
			wantError:    fmt.Sprintf(ErrMsgSubjectNotFound, "999"),
		},
	}

	for _, tt := range tests {
		tt := tt // ループ変数のキャプチャ
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel() // サブテストを並列実行

			path := fmt.Sprintf(APISubjectPath, "1", tt.departmentID, tt.subjectID)
			rec, err := testutils.ExecuteRequest(e, testutils.RequestConfig{
				Method: http.MethodDelete,
				Path:   path,
			}, subjectHandler.DeleteSubject)
			if err != nil {
				t.Fatalf(testutils.ErrMsgRequestFailed, err)
			}

			validateBatchUpdateResponse(t, rec, tt.wantStatus, tt.wantError)
		})
	}
}

// TestUpdateSubjectsBatch は科目の一括更新のテストを行います
func TestUpdateSubjectsBatch(t *testing.T) {
	t.Parallel()

	e, handler := testutils.SetupTestHandler()
	subjectHandler := NewSubjectHandler(handler.GetRepo(), 5*time.Second)

	tests := []struct {
		name       string
		wantStatus int
		wantError  string
		body       interface{}
	}{
		{
			name:       "正常系: 科目の一括更新",
			wantStatus: http.StatusOK,
			body: []map[string]interface{}{
				{
					"test_type_id":   1,
					"name":          "科目1",
					"score":         100,
					"percentage":    50.0,
					"display_order": 1,
				},
				{
					"test_type_id":   1,
					"name":          "科目2",
					"score":         100,
					"percentage":    50.0,
					"display_order": 2,
				},
			},
		},
		{
			name:       "異常系: 無効なリクエストボディ",
			wantStatus: http.StatusBadRequest,
			wantError:  "リクエストボディの解析に失敗しました",
			body:       "invalid",
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			path := fmt.Sprintf(APISubjectsPath, "1", "1")
			rec, err := testutils.ExecuteRequest(e, testutils.RequestConfig{
				Method: http.MethodPut,
				Path:   path,
				Body:   tt.body,
			}, subjectHandler.UpdateSubjectsBatch)
			if err != nil {
				t.Fatalf(testutils.ErrMsgRequestFailed, err)
			}

			validateBatchUpdateResponse(t, rec, tt.wantStatus, tt.wantError)
		})
	}
}
