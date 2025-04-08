package search_test

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
	"university-exam-api/internal/domain/models"
	"university-exam-api/internal/handlers/search"
	"university-exam-api/internal/testutils"
)

// searchTestCase は検索機能のテストケースを定義します
type searchTestCase struct {
	name        string
	query       string
	wantStatus  int
	wantError   string
	wantCount   int
	validate    func(*testing.T, []models.University)
}

// validateSearchData は検索結果データの検証を行います
func validateSearchData(t *testing.T, universities []models.University) {
	t.Helper()

	if len(universities) == 0 {
		t.Error("検索結果が空です")
		return
	}

	for _, university := range universities {
		if university.Name == "" {
			t.Error("大学名が設定されていません")
		}
		if len(university.Departments) == 0 {
			t.Error("学部データが存在しません")
		}
	}
}

// validateSearchResponse は検索結果のレスポンスを検証します
func validateSearchResponse(t *testing.T, rec *httptest.ResponseRecorder, tc searchTestCase) {
	t.Helper()

	if rec.Code != tc.wantStatus {
		t.Errorf("期待するステータスコード: %d, 実際のステータスコード: %d", tc.wantStatus, rec.Code)
	}

	if tc.wantError != "" {
		var response map[string]interface{}
		if err := testutils.ParseResponse(rec, &response); err != nil {
			t.Fatalf("レスポンスのパースに失敗しました: %v", err)
		}
		if response["error"] != tc.wantError {
			t.Errorf("期待するエラーメッセージ: %s, 実際のエラーメッセージ: %s", tc.wantError, response["error"])
		}
		return
	}

	var response struct {
		Data []models.University `json:"data"`
		Meta struct {
			Query     string `json:"query"`
			Count     int    `json:"count"`
			Timestamp int64  `json:"timestamp"`
		} `json:"meta"`
	}

	if err := testutils.ParseResponse(rec, &response); err != nil {
		t.Fatalf("レスポンスのパースに失敗しました: %v", err)
	}

	if response.Meta.Query != tc.query {
		t.Errorf("検索クエリが一致しません: got = %v, want = %v", response.Meta.Query, tc.query)
	}

	if response.Meta.Count != tc.wantCount {
		t.Errorf("検索結果件数が一致しません: got = %v, want = %v", response.Meta.Count, tc.wantCount)
	}

	if tc.validate != nil {
		tc.validate(t, response.Data)
	} else {
		validateSearchData(t, response.Data)
	}
}

// TestSearchUniversities は大学検索のテストを行います
func TestSearchUniversities(t *testing.T) {
	e, handler := testutils.SetupTestHandler()
	searchHandler := search.NewSearchHandler(handler.GetRepo(), 5*time.Second)

	tests := []searchTestCase{
		{
			name:       "正常系: 大学名での検索",
			query:      "東京",
			wantStatus: http.StatusOK,
			wantCount:  1,
			validate:   validateSearchData,
		},
		{
			name:       "正常系: 別の大学名での検索",
			query:      "京都",
			wantStatus: http.StatusOK,
			wantCount:  1,
			validate:   validateSearchData,
		},
		{
			name:       "正常系: 存在しない大学名での検索",
			query:      "存在しない大学",
			wantStatus: http.StatusOK,
			wantCount:  0,
		},
		{
			name:       "異常系: 空の検索クエリ",
			query:      "",
			wantStatus: http.StatusBadRequest,
			wantError:  "検索クエリは必須です",
		},
		{
			name:       "異常系: 長すぎる検索クエリ",
			query:      "a" + strings.Repeat("b", 100),
			wantStatus: http.StatusBadRequest,
			wantError:  "検索クエリは100文字以内で入力してください",
		},
		{
			name:       "異常系: 不正な文字を含む検索クエリ",
			query:      "test;",
			wantStatus: http.StatusBadRequest,
			wantError:  "検索クエリに不正な文字が含まれています",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			path := fmt.Sprintf("%s?q=%s", testutils.APIUniversitiesPath, tt.query)
			rec, err := testutils.ExecuteRequest(e, testutils.RequestConfig{
				Method: http.MethodGet,
				Path:   path,
			}, searchHandler.SearchUniversities)
			if err != nil {
				t.Fatalf("リクエストの実行に失敗しました: %v", err)
			}
			validateSearchResponse(t, rec, tt)
		})
	}
}

// TestSearchUniversitiesWithCache はキャッシュを使用した大学検索のテストを行います
func TestSearchUniversitiesWithCache(t *testing.T) {
	e, handler := testutils.SetupTestHandler()
	searchHandler := search.NewSearchHandler(handler.GetRepo(), 5*time.Second)

	tests := []searchTestCase{
		{
			name:       testutils.TestCaseNormalRequest,
			query:      "東京",
			wantStatus: http.StatusOK,
			wantCount:  1,
			validate:   validateSearchData,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// 1回目の検索
			path := fmt.Sprintf("%s?q=%s", testutils.APIUniversitiesPath, tt.query)
			rec1, err := testutils.ExecuteRequest(e, testutils.RequestConfig{
				Method: http.MethodGet,
				Path:   path,
			}, searchHandler.SearchUniversities)
			if err != nil {
				t.Fatalf(testutils.ErrMsgRequestFailed, err)
			}
			validateSearchResponse(t, rec1, tt)

			// 2回目の検索（キャッシュから取得）
			rec2, err := testutils.ExecuteRequest(e, testutils.RequestConfig{
				Method: http.MethodGet,
				Path:   path,
			}, searchHandler.SearchUniversities)
			if err != nil {
				t.Fatalf(testutils.ErrMsgRequestFailed, err)
			}
			validateSearchResponse(t, rec2, tt)

			// レスポンスの比較
			if rec1.Body.String() != rec2.Body.String() {
				t.Errorf("キャッシュされたレスポンスが一致しません")
			}
		})
	}
}
