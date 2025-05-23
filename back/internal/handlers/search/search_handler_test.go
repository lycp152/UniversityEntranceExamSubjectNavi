package search

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"university-exam-api/internal/domain/models"
	applogger "university-exam-api/internal/logger"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

const errNotImplemented = "not implemented"

// mockUniversityRepo は IUniversityRepository のSearchのみモックする構造体です。
type mockUniversityRepo struct {
	SearchFunc func(query string) ([]models.University, error)
}

func (m *mockUniversityRepo) Search(query string) ([]models.University, error) {
	return m.SearchFunc(query)
}
// 他のIUniversityRepositoryメソッドはpanicでOK
func (m *mockUniversityRepo) FindAll(_ context.Context) ([]models.University, error) { panic(errNotImplemented) }
func (m *mockUniversityRepo) FindByID(_ uint) (*models.University, error) { panic(errNotImplemented) }
func (m *mockUniversityRepo) Create(_ *models.University) error { panic(errNotImplemented) }
func (m *mockUniversityRepo) Update(_ *models.University) error { panic(errNotImplemented) }
func (m *mockUniversityRepo) Delete(_ uint) error { panic(errNotImplemented) }
func (m *mockUniversityRepo) CreateDepartment(_ *models.Department) error { panic(errNotImplemented) }
func (m *mockUniversityRepo) UpdateDepartment(_ *models.Department) error { panic(errNotImplemented) }
func (m *mockUniversityRepo) DeleteDepartment(_ uint) error { panic(errNotImplemented) }
func (m *mockUniversityRepo) CreateSubject(_ *models.Subject) error { panic(errNotImplemented) }
func (m *mockUniversityRepo) UpdateSubject(_ *models.Subject) error { panic(errNotImplemented) }
func (m *mockUniversityRepo) DeleteSubject(_ uint) error { panic(errNotImplemented) }
func (m *mockUniversityRepo) CreateMajor(_ *models.Major) error { panic(errNotImplemented) }
func (m *mockUniversityRepo) UpdateMajor(_ *models.Major) error { panic(errNotImplemented) }
func (m *mockUniversityRepo) DeleteMajor(_ uint) error { panic(errNotImplemented) }
func (m *mockUniversityRepo) CreateAdmissionInfo(_ *models.AdmissionInfo) error { panic(errNotImplemented) }
func (m *mockUniversityRepo) DeleteAdmissionInfo(_ uint) error { panic(errNotImplemented) }
func (m *mockUniversityRepo) UpdateAdmissionInfo(_ *models.AdmissionInfo) error { panic(errNotImplemented) }
func (m *mockUniversityRepo) FindDepartment(_, _ uint) (*models.Department, error) { panic(errNotImplemented) }
func (m *mockUniversityRepo) FindSubject(_, _ uint) (*models.Subject, error) { panic(errNotImplemented) }
func (m *mockUniversityRepo) FindMajor(_, _ uint) (*models.Major, error) { panic(errNotImplemented) }
func (m *mockUniversityRepo) UpdateSubjectsBatch(_ uint, _ []models.Subject) error { panic(errNotImplemented) }
func (m *mockUniversityRepo) UpdateAdmissionSchedule(_ *models.AdmissionSchedule) error { panic(errNotImplemented) }
func (m *mockUniversityRepo) FindAdmissionInfo(_, _ uint) (*models.AdmissionInfo, error) { panic(errNotImplemented) }

// --- 正常系: ヒットあり ---
func TestSearchUniversitiesSuccess(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	mockRepo := &mockUniversityRepo{
		SearchFunc: func(_ string) ([]models.University, error) {
			return []models.University{{Name: "テスト大学"}}, nil
		},
	}
	h := NewSearchHandler(mockRepo, 2*time.Second)

	req := httptest.NewRequest(http.MethodGet, "/search?q=テスト", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := h.SearchUniversities(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Contains(t, rec.Body.String(), "テスト大学")
}

// --- 正常系: ヒットなし ---
func TestSearchUniversitiesNoHit(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	mockRepo := &mockUniversityRepo{
		SearchFunc: func(_ string) ([]models.University, error) {
			return []models.University{}, nil
		},
	}
	h := NewSearchHandler(mockRepo, 2*time.Second)

	req := httptest.NewRequest(http.MethodGet, "/search?q=存在しない", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := h.SearchUniversities(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Contains(t, rec.Body.String(), "\"data\":[]")
}

// --- バリデーション: 空クエリ ---
func TestSearchUniversitiesEmptyQuery(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	mockRepo := &mockUniversityRepo{}
	h := NewSearchHandler(mockRepo, 2*time.Second)

	req := httptest.NewRequest(http.MethodGet, "/search?q=", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := h.SearchUniversities(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusBadRequest, rec.Code)
	assert.Contains(t, rec.Body.String(), "必須")
}

// --- バリデーション: 長すぎるクエリ ---
func TestSearchUniversitiesTooLongQuery(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	mockRepo := &mockUniversityRepo{}
	h := NewSearchHandler(mockRepo, 2*time.Second)

	longQuery := make([]rune, 101)
	for i := range longQuery {
		longQuery[i] = 'あ'
	}

	q := string(longQuery)
	req := httptest.NewRequest(http.MethodGet, "/search?q="+q, nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := h.SearchUniversities(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusBadRequest, rec.Code)
	assert.Contains(t, rec.Body.String(), "100文字以内")
}

// --- バリデーション: 不正文字 ---
func TestSearchUniversitiesInvalidChar(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	mockRepo := &mockUniversityRepo{}
	h := NewSearchHandler(mockRepo, 2*time.Second)

	req := httptest.NewRequest(http.MethodGet, "/search?q=abc%3B%25", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := h.SearchUniversities(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusBadRequest, rec.Code)
	assert.Contains(t, rec.Body.String(), "検索クエリに不正な文字が含まれています")
}

// --- リポジトリエラー ---
func TestSearchUniversitiesRepoError(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	mockRepo := &mockUniversityRepo{
		SearchFunc: func(_ string) ([]models.University, error) {
			return nil, errors.New("DBエラー")
		},
	}
	h := NewSearchHandler(mockRepo, 2*time.Second)

	req := httptest.NewRequest(http.MethodGet, "/search?q=テスト", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := h.SearchUniversities(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusInternalServerError, rec.Code)
	assert.Contains(t, rec.Body.String(), "エラー")
}
