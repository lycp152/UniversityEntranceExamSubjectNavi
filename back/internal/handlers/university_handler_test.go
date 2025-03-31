package handlers

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
	"university-exam-api/internal/domain/models"
	"university-exam-api/internal/infrastructure/cache"
	"university-exam-api/internal/repositories"

	"github.com/labstack/echo/v4"
)

const (
	errParseResponse = "Failed to parse response: %v"
	testNormalRequest = "正常なリクエスト"
	errInternalServer = "Internal server error occurred"

	// エラーメッセージ
	errInvalidIDFormat = "Invalid %s ID format"
	errNotFound = "%s with ID %s not found"
	errEmptyQuery = "invalid input for field query: search query cannot be empty"
	errStatusMismatch = "%s status = %%v, want %%v"

	// APIパス
	apiUniversitiesPath = "/api/universities"
	apiUniversitiesSearchPath = "/api/universities/search?q=%s"
)

// validateUniversityResponse は大学データのレスポンスを検証します
func validateUniversityResponse(t *testing.T, universities []models.University, wantCount int) {
	t.Helper()

	if len(universities) != wantCount {
		t.Errorf("GetUniversities() returned %d universities, want %d", len(universities), wantCount)
		return
	}

	if len(universities) > 0 {
		u := universities[0]
		if u.Name == "" {
			t.Error("GetUniversities() returned university with empty name")
		}
		if len(u.Departments) == 0 {
			t.Error("GetUniversities() returned university with no departments")
		} else if len(u.Departments[0].Majors) == 0 {
			t.Error("GetUniversities() returned department with no majors")
		}
	}
}

func setupTestDB() repositories.IUniversityRepository {
	db := repositories.SetupTestDB()
	return repositories.NewUniversityRepository(db)
}

// validateGetUniversitiesResponse は大学一覧取得のレスポンスを検証します
func validateGetUniversitiesResponse(t *testing.T, rec *httptest.ResponseRecorder, tt struct {
	name       string
	setup      func(*testing.T, *echo.Echo, *UniversityHandler)
	wantStatus int
	wantCount  int
	wantError  string
}) {
	t.Helper()

	if tt.wantError != "" {
		validateErrorResponse(t, rec, tt.wantStatus, tt.wantError)
		return
	}

	if rec.Code != tt.wantStatus {
		t.Errorf(fmt.Sprintf(errStatusMismatch, "GetUniversities()"), rec.Code, tt.wantStatus)
	}

	var universities []models.University
	if err := parseResponse(rec, &universities); err != nil {
		t.Fatalf(errParseResponse, err)
	}

	validateUniversityResponse(t, universities, tt.wantCount)
}

func TestGetUniversities(t *testing.T) {
	e, handler := setupTestHandler()

	tests := []struct {
		name       string
		setup      func(*testing.T, *echo.Echo, *UniversityHandler)
		wantStatus int
		wantCount  int
		wantError  string
	}{
		{
			name:       testNormalRequest,
			wantStatus: http.StatusOK,
			wantCount:  1,
		},
		{
			name:       "データが存在しない場合",
			setup: func(t *testing.T, e *echo.Echo, h *UniversityHandler) {
				repo := setupTestDB()
				h.repo = repo
			},
			wantStatus: http.StatusOK,
			wantCount:  0,
		},
		{
			name:       "データベースエラー",
			setup: func(t *testing.T, e *echo.Echo, h *UniversityHandler) {
				db := repositories.SetupTestDB()
				sqlDB, err := db.DB()
				if err != nil {
					t.Fatalf("Failed to get DB instance: %v", err)
				}
				sqlDB.Close()
				h.repo = repositories.NewUniversityRepository(db)
			},
			wantStatus: http.StatusInternalServerError,
			wantError:  errInternalServer,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.setup != nil {
				tt.setup(t, e, handler)
			}

			rec := executeRequest(e, http.MethodGet, apiUniversitiesPath, handler.GetUniversities)
			validateGetUniversitiesResponse(t, rec, tt)
		})
	}
}

// validateGetUniversityResponse は個別の大学取得のレスポンスを検証します
func validateGetUniversityResponse(t *testing.T, rec *httptest.ResponseRecorder, tt struct {
	name       string
	id         string
	wantStatus int
	wantError  string
}) {
	t.Helper()

	if tt.wantError != "" {
		validateErrorResponse(t, rec, tt.wantStatus, tt.wantError)
		return
	}

	if rec.Code != tt.wantStatus {
		t.Errorf("GetUniversity() status = %v, want %v", rec.Code, tt.wantStatus)
	}

	var university models.University
	if err := parseResponse(rec, &university); err != nil {
		t.Fatalf(errParseResponse, err)
	}
}

func TestGetUniversity(t *testing.T) {
	e, handler := setupTestHandler()

	tests := []struct {
		name       string
		id         string
		wantStatus int
		wantError  string
	}{
		{
			name:       "存在するID",
			id:        "1",
			wantStatus: http.StatusOK,
		},
		{
			name:       "存在しないID",
			id:        "999",
			wantStatus: http.StatusNotFound,
			wantError:  fmt.Sprintf(errNotFound, "University", "999"),
		},
		{
			name:       "不正なID形式",
			id:        "invalid",
			wantStatus: http.StatusBadRequest,
			wantError:  fmt.Sprintf(errInvalidIDFormat, "university"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			path := fmt.Sprintf("/api/universities/%s", tt.id)
			rec := executeRequest(e, http.MethodGet, path, handler.GetUniversity)
			validateGetUniversityResponse(t, rec, tt)
		})
	}
}

// validateSearchResponse は検索結果のレスポンスを検証します
func validateSearchResponse(t *testing.T, rec *httptest.ResponseRecorder, tt struct {
	name       string
	setup      func(*testing.T, *echo.Echo, *UniversityHandler)
	query      string
	wantStatus int
	wantCount  int
	wantError  string
	isInitial  bool
}) {
	t.Helper()

	if tt.wantError != "" {
		validateErrorResponse(t, rec, tt.wantStatus, tt.wantError)
		return
	}

	if rec.Code != tt.wantStatus {
		t.Errorf(fmt.Sprintf(errStatusMismatch, "SearchUniversities()"), rec.Code, tt.wantStatus)
	}

	var universities []models.University
	if err := parseResponse(rec, &universities); err != nil {
		t.Fatalf(errParseResponse, err)
	}

	if len(universities) != tt.wantCount {
		t.Errorf("SearchUniversities() returned %d universities, want %d", len(universities), tt.wantCount)
	}
}

func TestSearchUniversities(t *testing.T) {
	e, handler := setupTestHandler()

	tests := []struct {
		name       string
		setup      func(*testing.T, *echo.Echo, *UniversityHandler)
		query      string
		wantStatus int
		wantCount  int
		wantError  string
		isInitial  bool
	}{
		{
			name:       "有効な検索クエリ",
			query:     "テスト",
			wantStatus: http.StatusOK,
			wantCount: 1,
			isInitial: false,
		},
		{
			name:       "空の検索クエリ",
			query:     "",
			wantStatus: http.StatusBadRequest,
			wantError:  errEmptyQuery,
			isInitial: false,
		},
		{
			name:       "存在しない大学名での検索",
			query:     "存在しない大学",
			wantStatus: http.StatusOK,
			wantCount: 0,
			isInitial: false,
		},
		{
			name:       "データベースエラー",
			setup: func(t *testing.T, e *echo.Echo, h *UniversityHandler) {
				db := repositories.SetupTestDB()
				sqlDB, err := db.DB()
				if err != nil {
					t.Fatalf("Failed to get DB instance: %v", err)
				}
				sqlDB.Close()
				h.repo = repositories.NewUniversityRepository(db)
			},
			query:     "テスト",
			wantStatus: http.StatusInternalServerError,
			wantError:  errInternalServer,
			isInitial: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.setup != nil {
				tt.setup(t, e, handler)
			}

			path := fmt.Sprintf(apiUniversitiesSearchPath, tt.query)
			rec := executeRequest(e, http.MethodGet, path, handler.SearchUniversities)

			validateSearchResponse(t, rec, tt)
		})
	}
}

// validateGetDepartmentResponse は学部取得のレスポンスを検証します
func validateGetDepartmentResponse(t *testing.T, rec *httptest.ResponseRecorder, tt struct {
	name         string
	universityID string
	departmentID string
	wantStatus   int
	wantError    string
}) {
	t.Helper()

	if tt.wantError != "" {
		validateErrorResponse(t, rec, tt.wantStatus, tt.wantError)
		return
	}

	if rec.Code != tt.wantStatus {
		t.Errorf(fmt.Sprintf(errStatusMismatch, "GetDepartment()"), rec.Code, tt.wantStatus)
	}

	var department models.Department
	if err := parseResponse(rec, &department); err != nil {
		t.Fatalf(errParseResponse, err)
	}
}

func TestGetDepartment(t *testing.T) {
	e, handler := setupTestHandler()

	tests := []struct {
		name         string
		universityID string
		departmentID string
		wantStatus   int
		wantError    string
	}{
		{
			name:         testNormalRequest,
			universityID: "1",
			departmentID: "1",
			wantStatus:   http.StatusOK,
		},
		{
			name:         "存在しない大学ID",
			universityID: "999",
			departmentID: "1",
			wantStatus:   http.StatusNotFound,
			wantError:    fmt.Sprintf(errNotFound, "Department", "1"),
		},
		{
			name:         "不正な大学ID形式",
			universityID: "invalid",
			departmentID: "1",
			wantStatus:   http.StatusBadRequest,
			wantError:    fmt.Sprintf(errInvalidIDFormat, "university"),
		},
		{
			name:         "不正な学部ID形式",
			universityID: "1",
			departmentID: "invalid",
			wantStatus:   http.StatusBadRequest,
			wantError:    fmt.Sprintf(errInvalidIDFormat, "department"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			path := fmt.Sprintf("/api/universities/%s/departments/%s", tt.universityID, tt.departmentID)
			rec := executeRequest(e, http.MethodGet, path, handler.GetDepartment)
			validateGetDepartmentResponse(t, rec, tt)
		})
	}
}

// validateGetSubjectResponse は科目取得のレスポンスを検証します
func validateGetSubjectResponse(t *testing.T, rec *httptest.ResponseRecorder, tt struct {
	name         string
	departmentID string
	subjectID    string
	wantStatus   int
	wantError    string
}) {
	t.Helper()

	if tt.wantError != "" {
		validateErrorResponse(t, rec, tt.wantStatus, tt.wantError)
		return
	}

	if rec.Code != tt.wantStatus {
		t.Errorf(fmt.Sprintf(errStatusMismatch, "GetSubject()"), rec.Code, tt.wantStatus)
	}

	var subject models.Subject
	if err := parseResponse(rec, &subject); err != nil {
		t.Fatalf(errParseResponse, err)
	}
}

func TestGetSubject(t *testing.T) {
	e, handler := setupTestHandler()

	tests := []struct {
		name         string
		departmentID string
		subjectID    string
		wantStatus   int
		wantError    string
	}{
		{
			name:         testNormalRequest,
			departmentID: "1",
			subjectID:    "1",
			wantStatus:   http.StatusOK,
		},
		{
			name:         "存在しない学部ID",
			departmentID: "999",
			subjectID:    "1",
			wantStatus:   http.StatusNotFound,
			wantError:    fmt.Sprintf(errNotFound, "Subject", "1"),
		},
		{
			name:         "不正な学部ID形式",
			departmentID: "invalid",
			subjectID:    "1",
			wantStatus:   http.StatusBadRequest,
			wantError:    fmt.Sprintf(errInvalidIDFormat, "department"),
		},
		{
			name:         "不正な科目ID形式",
			departmentID: "1",
			subjectID:    "invalid",
			wantStatus:   http.StatusBadRequest,
			wantError:    fmt.Sprintf(errInvalidIDFormat, "subject"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			path := fmt.Sprintf("/api/universities/1/departments/%s/subjects/%s", tt.departmentID, tt.subjectID)
			rec := executeRequest(e, http.MethodGet, path, handler.GetSubject)
			validateGetSubjectResponse(t, rec, tt)
		})
	}
}

// validateCacheResponse はキャッシュテストのレスポンスを検証します
func validateCacheResponse(t *testing.T, rec *httptest.ResponseRecorder, tt struct {
	name       string
	setup      func(*testing.T, *echo.Echo, *UniversityHandler)
	wantStatus int
	wantCount  int
	wantError  string
	isInitial  bool
}) {
	t.Helper()

	if tt.wantError != "" {
		validateErrorResponse(t, rec, tt.wantStatus, tt.wantError)
		return
	}

	if rec.Code != tt.wantStatus {
		t.Errorf("GetUniversities() status = %v, want %v", rec.Code, tt.wantStatus)
	}

	var universities []models.University
	if err := parseResponse(rec, &universities); err != nil {
		t.Fatalf(errParseResponse, err)
	}

	validateUniversityResponse(t, universities, tt.wantCount)
}

func TestGetUniversitiesWithCache(t *testing.T) {
	e, handler := setupTestHandler()

	tests := []struct {
		name       string
		setup      func(*testing.T, *echo.Echo, *UniversityHandler)
		wantStatus int
		wantCount  int
		wantError  string
		isInitial  bool
	}{
		{
			name:       "キャッシュがない場合の最初のリクエスト",
			setup: func(t *testing.T, e *echo.Echo, h *UniversityHandler) {
				cache.GetInstance().Delete("universities:all")
			},
			wantStatus: http.StatusOK,
			wantCount:  1,
			isInitial:  true,
		},
		{
			name:       "キャッシュヒットの場合",
			wantStatus: http.StatusOK,
			wantCount:  1,
			isInitial:  false,
		},
		{
			name:       "キャッシュ無効後のリクエスト",
			setup: func(t *testing.T, e *echo.Echo, h *UniversityHandler) {
				cache.GetInstance().Delete("universities:all")
			},
			wantStatus: http.StatusOK,
			wantCount:  1,
			isInitial:  true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.setup != nil {
				tt.setup(t, e, handler)
			}

			rec := executeRequest(e, http.MethodGet, apiUniversitiesPath, handler.GetUniversities)

			if tt.isInitial {
				validateInitialCacheRequest(t, rec)
			} else {
				validateCacheResponse(t, rec, tt)
			}
		})
	}
}

// TestSearchUniversitiesWithCache は検索機能のキャッシュテストを行います
func TestSearchUniversitiesWithCache(t *testing.T) {
	e, handler := setupTestHandler()

	tests := []struct {
		name       string
		setup      func(*testing.T, *echo.Echo, *UniversityHandler)
		query      string
		wantStatus int
		wantCount  int
		wantError  string
		isInitial  bool
	}{
		{
			name:       "キャッシュがない場合の検索",
			setup: func(t *testing.T, e *echo.Echo, h *UniversityHandler) {
				cache.GetInstance().Delete("universities:search:テスト")
			},
			query:     "テスト",
			wantStatus: http.StatusOK,
			wantCount: 1,
			isInitial: true,
		},
		{
			name:       "同じクエリでのキャッシュヒット",
			query:     "テスト",
			wantStatus: http.StatusOK,
			wantCount: 1,
			isInitial: false,
		},
		{
			name:       "キャッシュ無効後の検索",
			setup: func(t *testing.T, e *echo.Echo, h *UniversityHandler) {
				cache.GetInstance().Delete("universities:search:テスト")
			},
			query:     "テスト",
			wantStatus: http.StatusOK,
			wantCount: 1,
			isInitial: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.setup != nil {
				tt.setup(t, e, handler)
			}

			path := fmt.Sprintf(apiUniversitiesSearchPath, tt.query)
			rec := executeRequest(e, http.MethodGet, path, handler.SearchUniversities)

			if tt.isInitial {
				validateInitialCacheRequest(t, rec)
			} else {
				validateSearchResponse(t, rec, tt)
			}
		})
	}
}

// validateInitialCacheRequest は初期キャッシュリクエストを検証します
func validateInitialCacheRequest(t *testing.T, rec *httptest.ResponseRecorder) {
	t.Helper()

	if rec.Code != http.StatusOK {
		t.Fatalf("初期リクエストが失敗しました: status = %v", rec.Code)
	}
}

// validateCacheExpirationResponse はキャッシュ有効期限テストのレスポンスを検証します
func validateCacheExpirationResponse(t *testing.T, rec *httptest.ResponseRecorder, tt struct {
	name       string
	query      string
	sleep      time.Duration
	wantStatus int
	wantCount  int
	wantError  string
}) {
	t.Helper()

	if tt.wantError != "" {
		validateErrorResponse(t, rec, tt.wantStatus, tt.wantError)
		return
	}

	if rec.Code != tt.wantStatus {
		t.Errorf("SearchUniversities() status = %v, want %v", rec.Code, tt.wantStatus)
	}

	var universities []models.University
	if err := parseResponse(rec, &universities); err != nil {
		t.Fatalf(errParseResponse, err)
	}

	if len(universities) != tt.wantCount {
		t.Errorf("SearchUniversities() returned %d universities, want %d", len(universities), tt.wantCount)
	}
}

// TestSearchUniversitiesWithCacheExpiration は検索機能のキャッシュ有効期限切れのテストを行います
func TestSearchUniversitiesWithCacheExpiration(t *testing.T) {
	e, handler := setupTestHandler()

	tests := []struct {
		name       string
		query      string
		sleep      time.Duration
		wantStatus int
		wantCount  int
		wantError  string
	}{
		{
			name:       "キャッシュの有効期限内",
			query:     "テスト",
			sleep:     1 * time.Second,
			wantStatus: http.StatusOK,
			wantCount:  1,
		},
		{
			name:       "キャッシュの有効期限切れ",
			query:     "テスト",
			sleep:     6 * time.Minute,
			wantStatus: http.StatusOK,
			wantCount:  1,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			path := fmt.Sprintf(apiUniversitiesSearchPath, tt.query)

			// 最初のリクエストでキャッシュを作成
			rec := executeRequest(e, http.MethodGet, path, handler.SearchUniversities)
			validateInitialCacheRequest(t, rec)

			time.Sleep(tt.sleep)

			// 2回目のリクエスト
			rec = executeRequest(e, http.MethodGet, path, handler.SearchUniversities)
			validateCacheExpirationResponse(t, rec, tt)
		})
	}
}
