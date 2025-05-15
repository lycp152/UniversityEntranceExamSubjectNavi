package subject

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

type mockUniversityRepo struct {
	FindSubjectFunc func(departmentID, subjectID uint) (*models.Subject, error)
}

func (m *mockUniversityRepo) FindSubject(departmentID, subjectID uint) (*models.Subject, error) {
	return m.FindSubjectFunc(departmentID, subjectID)
}
// 他のIUniversityRepositoryメソッドはpanicでOK
func (m *mockUniversityRepo) FindAll(_ context.Context) ([]models.University, error) { panic(errNotImplemented) }
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
func (m *mockUniversityRepo) FindMajor(_, _ uint) (*models.Major, error) { panic(errNotImplemented) }
func (m *mockUniversityRepo) UpdateSubjectsBatch(_ uint, _ []models.Subject) error { panic(errNotImplemented) }
func (m *mockUniversityRepo) UpdateAdmissionSchedule(_ *models.AdmissionSchedule) error { panic(errNotImplemented) }
func (m *mockUniversityRepo) FindAdmissionInfo(_, _ uint) (*models.AdmissionInfo, error) { panic(errNotImplemented) }

// --- 科目取得APIの正常系テスト ---
func TestGetSubjectSuccess(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	mockRepo := &mockUniversityRepo{
		FindSubjectFunc: func(_ , subjectID uint) (*models.Subject, error) {
			return &models.Subject{
				BaseModel:   models.BaseModel{ID: subjectID},
				TestTypeID:  1,
				Name:        "英語",
				Score:       100,
				Percentage:  50.0,
				DisplayOrder: 1,
			}, nil
		},
	}
	h := NewSubjectHandler(mockRepo, 2*time.Second)

	req := httptest.NewRequest(http.MethodGet, "/departments/1/subjects/2", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("departmentId", "subjectId")
	c.SetParamValues("1", "2")

	err := h.GetSubject(c)
	require.NoError(t, err)
	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Contains(t, rec.Body.String(), "英語")
}

// --- 科目取得APIの異常系テスト ---
func TestGetSubjectError(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	mockRepo := &mockUniversityRepo{
		FindSubjectFunc: func(_, _ uint) (*models.Subject, error) {
			return nil, errors.New("DBエラー")
		},
	}
	h := NewSubjectHandler(mockRepo, 2*time.Second)

	req := httptest.NewRequest(http.MethodGet, "/departments/1/subjects/2", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("departmentId", "subjectId")
	c.SetParamValues("1", "2")

	err := h.GetSubject(c)
	require.NoError(t, err)
	assert.Equal(t, http.StatusInternalServerError, rec.Code)
	assert.Contains(t, rec.Body.String(), "エラー")
}
