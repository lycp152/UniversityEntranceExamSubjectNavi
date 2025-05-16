package admissioninfo

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
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
const schedule1Info2Path = "/schedules/1/admission-info/2"
const schedule1InfoPath = "/schedules/1/admission-info"

type mockUniversityRepo struct {
	FindAdmissionInfoFunc func(scheduleID, infoID uint) (*models.AdmissionInfo, error)
	CreateAdmissionInfoFunc func(info *models.AdmissionInfo) error
	UpdateAdmissionInfoFunc func(info *models.AdmissionInfo) error
	DeleteAdmissionInfoFunc func(infoID uint) error
}

func (m *mockUniversityRepo) FindAdmissionInfo(scheduleID, infoID uint) (*models.AdmissionInfo, error) {
	return m.FindAdmissionInfoFunc(scheduleID, infoID)
}

func (m *mockUniversityRepo) CreateAdmissionInfo(info *models.AdmissionInfo) error {
	if m.CreateAdmissionInfoFunc != nil {
		return m.CreateAdmissionInfoFunc(info)
	}

	panic(errNotImplemented)
}

func (m *mockUniversityRepo) UpdateAdmissionInfo(info *models.AdmissionInfo) error {
	if m.UpdateAdmissionInfoFunc != nil {
		return m.UpdateAdmissionInfoFunc(info)
	}

	panic(errNotImplemented)
}

func (m *mockUniversityRepo) DeleteAdmissionInfo(infoID uint) error {
	if m.DeleteAdmissionInfoFunc != nil {
		return m.DeleteAdmissionInfoFunc(infoID)
	}

	panic(errNotImplemented)
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

	req := httptest.NewRequest(http.MethodGet, schedule1Info2Path, nil)
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

	req := httptest.NewRequest(http.MethodGet, schedule1Info2Path, nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("scheduleId", "infoId")
	c.SetParamValues("1", "2")

	err := h.GetAdmissionInfo(c)
	require.NoError(t, err)
	assert.Equal(t, http.StatusInternalServerError, rec.Code)
	assert.Contains(t, rec.Body.String(), "エラー")
}

// --- 募集情報作成APIの正常系テスト ---
func TestCreateAdmissionInfoSuccess(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	called := false
	mockRepo := &mockUniversityRepo{
		CreateAdmissionInfoFunc: func(info *models.AdmissionInfo) error {
			called = true
			assert.Equal(t, uint(1), info.AdmissionScheduleID)
			assert.Equal(t, 100, info.Enrollment)
			assert.Equal(t, 2024, info.AcademicYear)
			return nil
		},
	}
	h := newTestHandler(mockRepo)

	body := `{"enrollment":100,"academic_year":2024,"status":"published"}`
	req := httptest.NewRequest(http.MethodPost, schedule1InfoPath, strings.NewReader(body))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)

	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("scheduleId")
	c.SetParamValues("1")

	err := h.CreateAdmissionInfo(c)
	require.NoError(t, err)
	assert.Equal(t, http.StatusCreated, rec.Code)
	assert.True(t, called)
}

// --- 募集情報作成APIの異常系テスト ---
func TestCreateAdmissionInfoError(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	mockRepo := &mockUniversityRepo{
		CreateAdmissionInfoFunc: func(_ *models.AdmissionInfo) error {
			return errors.New("DBエラー")
		},
	}
	h := newTestHandler(mockRepo)

	body := `{"enrollment":100,"academic_year":2024,"status":"published"}`
	req := httptest.NewRequest(http.MethodPost, schedule1InfoPath, strings.NewReader(body))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)

	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("scheduleId")
	c.SetParamValues("1")

	err := h.CreateAdmissionInfo(c)
	require.NoError(t, err)
	assert.Equal(t, http.StatusInternalServerError, rec.Code)
	assert.Contains(t, rec.Body.String(), "エラー")
}

// --- 募集情報更新APIの正常系テスト ---
func TestUpdateAdmissionInfoSuccess(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	called := false
	mockRepo := &mockUniversityRepo{
		UpdateAdmissionInfoFunc: func(info *models.AdmissionInfo) error {
			called = true
			assert.Equal(t, uint(2), info.ID)
			assert.Equal(t, uint(1), info.AdmissionScheduleID)
			assert.Equal(t, 150, info.Enrollment)
			return nil
		},
	}
	h := newTestHandler(mockRepo)

	body := `{"enrollment":150,"academic_year":2024,"status":"published"}`
	req := httptest.NewRequest(http.MethodPut, schedule1Info2Path, strings.NewReader(body))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)

	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("scheduleId", "infoId")
	c.SetParamValues("1", "2")

	err := h.UpdateAdmissionInfo(c)
	require.NoError(t, err)
	assert.Equal(t, http.StatusOK, rec.Code)
	assert.True(t, called)
}

// --- 募集情報更新APIの異常系テスト ---
func TestUpdateAdmissionInfoError(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	mockRepo := &mockUniversityRepo{
		UpdateAdmissionInfoFunc: func(_ *models.AdmissionInfo) error {
			return errors.New("DBエラー")
		},
	}
	h := newTestHandler(mockRepo)

	body := `{"enrollment":150,"academic_year":2024,"status":"published"}`
	req := httptest.NewRequest(http.MethodPut, schedule1Info2Path, strings.NewReader(body))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)

	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("scheduleId", "infoId")
	c.SetParamValues("1", "2")

	err := h.UpdateAdmissionInfo(c)
	require.NoError(t, err)
	assert.Equal(t, http.StatusInternalServerError, rec.Code)
	assert.Contains(t, rec.Body.String(), "エラー")
}

// --- 募集情報削除APIの正常系テスト ---
func TestDeleteAdmissionInfoSuccess(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	called := false
	mockRepo := &mockUniversityRepo{
		DeleteAdmissionInfoFunc: func(infoID uint) error {
			called = true
			assert.Equal(t, uint(2), infoID)
			return nil
		},
	}
	h := newTestHandler(mockRepo)

	req := httptest.NewRequest(http.MethodDelete, schedule1Info2Path, nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("infoId")
	c.SetParamValues("2")

	err := h.DeleteAdmissionInfo(c)
	require.NoError(t, err)
	assert.Equal(t, http.StatusNoContent, rec.Code)
	assert.True(t, called)
}

// --- 募集情報削除APIの異常系テスト ---
func TestDeleteAdmissionInfoError(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	mockRepo := &mockUniversityRepo{
		DeleteAdmissionInfoFunc: func(_ uint) error {
			return errors.New("DBエラー")
		},
	}
	h := newTestHandler(mockRepo)

	req := httptest.NewRequest(http.MethodDelete, schedule1Info2Path, nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("infoId")
	c.SetParamValues("2")

	err := h.DeleteAdmissionInfo(c)
	require.NoError(t, err)
	assert.Equal(t, http.StatusInternalServerError, rec.Code)
	assert.Contains(t, rec.Body.String(), "エラー")
}

// --- NewHandler関数のテスト ---
func TestNewHandler(t *testing.T) {
	applogger.InitTestLogger()

	// メトリクスレジストリを一時的に差し替え
	origRegisterer := prometheus.DefaultRegisterer
	origGatherer := prometheus.DefaultGatherer
	reg := prometheus.NewRegistry()
	prometheus.DefaultRegisterer = reg
	prometheus.DefaultGatherer = reg

	defer func() {
		prometheus.DefaultRegisterer = origRegisterer
		prometheus.DefaultGatherer = origGatherer
	}()

	// 正常系テストのみ
	repo := &mockUniversityRepo{}
	timeout := 2 * time.Second
	handler := NewHandler(repo, timeout)

	assert.NotNil(t, handler)
	assert.Equal(t, repo, handler.repo)
	assert.Equal(t, timeout, handler.timeout)
	assert.NotNil(t, handler.requestDuration)
	assert.NotNil(t, handler.errorCounter)
	assert.NotNil(t, handler.requestSize)
	assert.NotNil(t, handler.responseSize)
	assert.NotNil(t, handler.dbDuration)
}

// --- bindRequest関数のテスト ---
func TestBindRequest(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	h := newTestHandler(&mockUniversityRepo{})

	// 正常系テスト
	body := `{"enrollment":100,"academic_year":2024,"status":"published"}`
	req := httptest.NewRequest(http.MethodPost, schedule1InfoPath, strings.NewReader(body))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)

	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	ctx := context.Background()

	err := h.bindRequest(ctx, c, &models.AdmissionInfo{})
	require.NoError(t, err)

	// 異常系テスト（不正なJSON）
	body = `{"enrollment":"invalid","academic_year":2024,"status":"published"}`
	req = httptest.NewRequest(http.MethodPost, schedule1InfoPath, strings.NewReader(body))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)

	rec = httptest.NewRecorder()
	c = e.NewContext(req, rec)

	err = h.bindRequest(ctx, c, &models.AdmissionInfo{})
	assert.Error(t, err)
}

// --- validateScheduleAndInfoID関数のテスト ---
func TestValidateScheduleAndInfoID(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	h := newTestHandler(&mockUniversityRepo{})
	ctx := context.Background()

	// 正常系テスト
	req := httptest.NewRequest(http.MethodGet, schedule1Info2Path, nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("scheduleId", "infoId")
	c.SetParamValues("1", "2")

	scheduleID, infoID, err := h.validateScheduleAndInfoID(ctx, c)
	require.NoError(t, err)
	assert.Equal(t, uint(1), scheduleID)
	assert.Equal(t, uint(2), infoID)

	// 異常系テスト（不正なscheduleId）
	req = httptest.NewRequest(http.MethodGet, schedule1Info2Path, nil)
	rec = httptest.NewRecorder()
	c = e.NewContext(req, rec)
	c.SetParamNames("scheduleId", "infoId")
	c.SetParamValues("invalid", "2")

	_, _, err = h.validateScheduleAndInfoID(ctx, c)
	assert.Error(t, err)

	// 異常系テスト（不正なinfoId）
	req = httptest.NewRequest(http.MethodGet, schedule1Info2Path, nil)
	rec = httptest.NewRecorder()
	c = e.NewContext(req, rec)
	c.SetParamNames("scheduleId", "infoId")
	c.SetParamValues("1", "invalid")

	_, _, err = h.validateScheduleAndInfoID(ctx, c)
	assert.Error(t, err)
}
