package admissioninfo

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
	"github.com/prometheus/client_golang/prometheus"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const errNotImplemented = "not implemented"

type mockUniversityRepo struct {
	FindAdmissionInfoFunc func(scheduleID, infoID uint) (*models.AdmissionInfo, error)
}

func (m *mockUniversityRepo) FindAdmissionInfo(scheduleID, infoID uint) (*models.AdmissionInfo, error) {
	return m.FindAdmissionInfoFunc(scheduleID, infoID)
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
func (m *mockUniversityRepo) FindSubject(_, _ uint) (*models.Subject, error) { panic(errNotImplemented) }
func (m *mockUniversityRepo) FindMajor(_, _ uint) (*models.Major, error) { panic(errNotImplemented) }
func (m *mockUniversityRepo) UpdateSubjectsBatch(_ uint, _ []models.Subject) error { panic(errNotImplemented) }
func (m *mockUniversityRepo) UpdateAdmissionSchedule(_ *models.AdmissionSchedule) error { panic(errNotImplemented) }

func newTestHandler(repo *mockUniversityRepo) *Handler {
	return &Handler{
		repo:    repo,
		timeout: 2 * time.Second,
		requestDuration: prometheus.NewHistogramVec(
			prometheus.HistogramOpts{Name: "dummy"},
			[]string{"method", "path"},
		),
		errorCounter: prometheus.NewCounterVec(
			prometheus.CounterOpts{Name: "dummy"},
			[]string{"method", "path", "error_type"},
		),
		requestSize: prometheus.NewHistogramVec(
			prometheus.HistogramOpts{Name: "dummy"},
			[]string{"method", "path"},
		),
		responseSize: prometheus.NewHistogramVec(
			prometheus.HistogramOpts{Name: "dummy"},
			[]string{"method", "path"},
		),
		dbDuration: prometheus.NewHistogramVec(
			prometheus.HistogramOpts{Name: "dummy"},
			[]string{"operation"},
		),
	}
}

// --- 募集情報取得APIの正常系テスト ---
func TestGetAdmissionInfoSuccess(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	mockRepo := &mockUniversityRepo{
		FindAdmissionInfoFunc: func(_ , infoID uint) (*models.AdmissionInfo, error) {
			return &models.AdmissionInfo{
				BaseModel:            models.BaseModel{ID: infoID},
				AdmissionScheduleID:  1,
				Enrollment:           100,
				AcademicYear:         2024,
				Status:               "published",
			}, nil
		},
	}
	h := newTestHandler(mockRepo)

	req := httptest.NewRequest(http.MethodGet, "/schedules/1/admission-info/2", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("scheduleId", "infoId")
	c.SetParamValues("1", "2")

	err := h.GetAdmissionInfo(c)
	require.NoError(t, err)
	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Contains(t, rec.Body.String(), "published")
}

// --- 募集情報取得APIの異常系テスト ---
func TestGetAdmissionInfoError(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	mockRepo := &mockUniversityRepo{
		FindAdmissionInfoFunc: func(_, _ uint) (*models.AdmissionInfo, error) {
			return nil, errors.New("DBエラー")
		},
	}
	h := newTestHandler(mockRepo)

	req := httptest.NewRequest(http.MethodGet, "/schedules/1/admission-info/2", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("scheduleId", "infoId")
	c.SetParamValues("1", "2")

	err := h.GetAdmissionInfo(c)
	require.NoError(t, err)
	assert.Equal(t, http.StatusInternalServerError, rec.Code)
	assert.Contains(t, rec.Body.String(), "エラー")
}
