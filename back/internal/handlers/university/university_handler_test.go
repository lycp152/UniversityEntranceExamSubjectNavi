package university

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
	"github.com/stretchr/testify/require"
)

const errNotImplemented = "not implemented"

// --- モックリポジトリ定義 ---
type mockUniversityRepo struct {
	FindAllFunc func(ctx context.Context) ([]models.University, error)
}

func (m *mockUniversityRepo) FindAll(ctx context.Context) ([]models.University, error) {
	return m.FindAllFunc(ctx)
}

// 他のIUniversityRepositoryメソッドはpanicでOK（本テストでは使わないため）
func (m *mockUniversityRepo) FindByID(_ uint) (*models.University, error) { panic(errNotImplemented) }
func (m *mockUniversityRepo) Search(_ string) ([]models.University, error) { panic(errNotImplemented) }
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
func (m *mockUniversityRepo) FindAdmissionInfo(_, _ uint) (*models.AdmissionInfo, error) { panic(errNotImplemented) }
func (m *mockUniversityRepo) UpdateSubjectsBatch(_ uint, _ []models.Subject) error { panic(errNotImplemented) }
func (m *mockUniversityRepo) UpdateAdmissionSchedule(_ *models.AdmissionSchedule) error { panic(errNotImplemented) }

// --- テスト本体 ---
func TestGetUniversitiesSuccess(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	mockRepo := &mockUniversityRepo{
		FindAllFunc: func(_ context.Context) ([]models.University, error) {
			return []models.University{{Name: "テスト大学"}}, nil
		},
	}
	h := NewUniversityHandler(mockRepo, 2*time.Second)

	req := httptest.NewRequest(http.MethodGet, "/universities", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := h.GetUniversities(c)
	require.NoError(t, err)
	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Contains(t, rec.Body.String(), "テスト大学")
}

func TestGetUniversitiesError(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	mockRepo := &mockUniversityRepo{
		FindAllFunc: func(_ context.Context) ([]models.University, error) {
			return nil, errors.New("DBエラー")
		},
	}
	h := NewUniversityHandler(mockRepo, 2*time.Second)

	req := httptest.NewRequest(http.MethodGet, "/universities", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := h.GetUniversities(c)
	require.NoError(t, err)
	assert.Equal(t, http.StatusInternalServerError, rec.Code)
	assert.Contains(t, rec.Body.String(), "サーバー内部でエラーが発生しました")
}
