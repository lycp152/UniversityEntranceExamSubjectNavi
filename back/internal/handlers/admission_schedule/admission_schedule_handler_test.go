package admissionschedule

import (
	"bytes"
	"context"
	"encoding/json"
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
	UpdateAdmissionScheduleFunc func(schedule *models.AdmissionSchedule) error
}

func (m *mockUniversityRepo) UpdateAdmissionSchedule(schedule *models.AdmissionSchedule) error {
	return m.UpdateAdmissionScheduleFunc(schedule)
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
func (m *mockUniversityRepo) FindAdmissionInfo(_, _ uint) (*models.AdmissionInfo, error) { panic(errNotImplemented) }
func (m *mockUniversityRepo) UpdateSubjectsBatch(_ uint, _ []models.Subject) error { panic(errNotImplemented) }

func newTestHandler(repo *mockUniversityRepo) *Handler {
	return &Handler{
		repo:    repo,
		timeout: 2 * time.Second,
		requestDuration: prometheus.NewHistogramVec(
			prometheus.HistogramOpts{Name: "dummy"},
			[]string{"method", "path", "status"},
		),
		errorCounter: prometheus.NewCounterVec(
			prometheus.CounterOpts{Name: "dummy"},
			[]string{"method", "path", "error_type"},
		),
		dbDuration: prometheus.NewHistogramVec(
			prometheus.HistogramOpts{Name: "dummy"},
			[]string{"operation"},
		),
	}
}

// --- 入試日程更新APIの正常系テスト ---
func TestUpdateAdmissionScheduleSuccess(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	mockRepo := &mockUniversityRepo{
		UpdateAdmissionScheduleFunc: func(_ *models.AdmissionSchedule) error {
			return nil
		},
	}
	h := newTestHandler(mockRepo)

	body := models.AdmissionSchedule{
		Name: "前期",
	}
	jsonBody, _ := json.Marshal(body)

	req := httptest.NewRequest(http.MethodPut, "/majors/1/schedules/2", bytes.NewReader(jsonBody))
	req.Header.Set("Content-Type", "application/json")

	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("majorId", "scheduleId")
	c.SetParamValues("1", "2")

	err := h.UpdateAdmissionSchedule(c)
	require.NoError(t, err)
	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Contains(t, rec.Body.String(), "前期")
}

// --- 入試日程更新APIの異常系テスト ---
func TestUpdateAdmissionScheduleError(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	mockRepo := &mockUniversityRepo{
		UpdateAdmissionScheduleFunc: func(_ *models.AdmissionSchedule) error {
			return errors.New("DBエラー")
		},
	}
	h := newTestHandler(mockRepo)

	body := models.AdmissionSchedule{
		Name: "後期",
	}
	jsonBody, _ := json.Marshal(body)

	req := httptest.NewRequest(http.MethodPut, "/majors/1/schedules/2", bytes.NewReader(jsonBody))
	req.Header.Set("Content-Type", "application/json")

	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("majorId", "scheduleId")
	c.SetParamValues("1", "2")

	err := h.UpdateAdmissionSchedule(c)
	require.NoError(t, err)
	assert.Equal(t, http.StatusInternalServerError, rec.Code)
	assert.Contains(t, rec.Body.String(), "エラー")
}
