package department

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
const university1Department2Path = "/universities/1/departments/2"
const university1DepartmentsPath = "/universities/1/departments"

type mockUniversityRepo struct {
	FindDepartmentFunc func(universityID, departmentID uint) (*models.Department, error)
	CreateDepartmentFunc func(*models.Department) error
	UpdateDepartmentFunc func(*models.Department) error
	DeleteDepartmentFunc func(uint) error
}

func (m *mockUniversityRepo) FindDepartment(universityID, departmentID uint) (*models.Department, error) {
	return m.FindDepartmentFunc(universityID, departmentID)
}
// 他のIUniversityRepositoryメソッドはpanicでOK
func (m *mockUniversityRepo) FindAll(_ context.Context) ([]models.University, error) { panic(errNotImplemented) }
func (m *mockUniversityRepo) FindByID(_ uint) (*models.University, error) { panic(errNotImplemented) }
func (m *mockUniversityRepo) Search(_ string) ([]models.University, error) { panic(errNotImplemented) }
func (m *mockUniversityRepo) Create(_ *models.University) error { panic(errNotImplemented) }
func (m *mockUniversityRepo) Update(_ *models.University) error { panic(errNotImplemented) }
func (m *mockUniversityRepo) Delete(_ uint) error { panic(errNotImplemented) }
func (m *mockUniversityRepo) CreateDepartment(department *models.Department) error {
	return m.CreateDepartmentFunc(department)
}
func (m *mockUniversityRepo) UpdateDepartment(department *models.Department) error {
	return m.UpdateDepartmentFunc(department)
}
func (m *mockUniversityRepo) DeleteDepartment(departmentID uint) error {
	return m.DeleteDepartmentFunc(departmentID)
}
func (m *mockUniversityRepo) CreateSubject(_ *models.Subject) error { panic(errNotImplemented) }
func (m *mockUniversityRepo) UpdateSubject(_ *models.Subject) error { panic(errNotImplemented) }
func (m *mockUniversityRepo) DeleteSubject(_ uint) error { panic(errNotImplemented) }
func (m *mockUniversityRepo) CreateMajor(_ *models.Major) error { panic(errNotImplemented) }
func (m *mockUniversityRepo) UpdateMajor(_ *models.Major) error { panic(errNotImplemented) }
func (m *mockUniversityRepo) DeleteMajor(_ uint) error { panic(errNotImplemented) }
func (m *mockUniversityRepo) CreateAdmissionInfo(_ *models.AdmissionInfo) error { panic(errNotImplemented) }
func (m *mockUniversityRepo) DeleteAdmissionInfo(_ uint) error { panic(errNotImplemented) }
func (m *mockUniversityRepo) UpdateAdmissionInfo(_ *models.AdmissionInfo) error { panic(errNotImplemented) }
func (m *mockUniversityRepo) FindSubject(_, _ uint) (*models.Subject, error) { panic(errNotImplemented) }
func (m *mockUniversityRepo) FindMajor(_, _ uint) (*models.Major, error) { panic(errNotImplemented) }
func (m *mockUniversityRepo) FindAdmissionInfo(_, _ uint) (*models.AdmissionInfo, error) { panic(errNotImplemented) }
func (m *mockUniversityRepo) UpdateSubjectsBatch(_ uint, _ []models.Subject) error { panic(errNotImplemented) }
func (m *mockUniversityRepo) UpdateAdmissionSchedule(_ *models.AdmissionSchedule) error { panic(errNotImplemented) }

func TestGetDepartmentSuccess(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	mockRepo := &mockUniversityRepo{
		FindDepartmentFunc: func(_ , departmentID uint) (*models.Department, error) {
			return &models.Department{
				BaseModel:    models.BaseModel{ID: departmentID},
				UniversityID: 1,
				Name:         "テスト学部",
			}, nil
		},
	}
	h := NewDepartmentHandler(mockRepo, 2*time.Second)

	// パスパラメータをセット
	req := httptest.NewRequest(http.MethodGet, university1Department2Path, nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("universityId", "departmentId")
	c.SetParamValues("1", "2")

	err := h.GetDepartment(c)
	require.NoError(t, err)
	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Contains(t, rec.Body.String(), "テスト学部")
}

func TestGetDepartmentError(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	mockRepo := &mockUniversityRepo{
		FindDepartmentFunc: func(_, _ uint) (*models.Department, error) {
			return nil, errors.New("DBエラー")
		},
	}
	h := NewDepartmentHandler(mockRepo, 2*time.Second)

	req := httptest.NewRequest(http.MethodGet, university1Department2Path, nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("universityId", "departmentId")
	c.SetParamValues("1", "2")

	err := h.GetDepartment(c)
	require.NoError(t, err)
	assert.Equal(t, http.StatusInternalServerError, rec.Code)
	assert.Contains(t, rec.Body.String(), "エラー")
}

func TestNewDepartmentHandler(t *testing.T) {
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

	// 正常系テスト
	repo := &mockUniversityRepo{}
	timeout := 2 * time.Second
	handler := NewDepartmentHandler(repo, timeout)

	assert.NotNil(t, handler)
	assert.Equal(t, repo, handler.repo)
	assert.Equal(t, timeout, handler.timeout)
	assert.NotNil(t, handler.requestDuration)
	assert.NotNil(t, handler.errorCounter)
	assert.NotNil(t, handler.dbDuration)
}

func TestBindRequest(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	h := NewDepartmentHandler(&mockUniversityRepo{}, 2*time.Second)

	// 正常系テスト
	body := `{"name":"テスト学部","university_id":1}`
	req := httptest.NewRequest(http.MethodPost, university1DepartmentsPath, strings.NewReader(body))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)

	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	ctx := context.Background()

	err := h.bindRequest(ctx, c, &models.Department{})
	require.NoError(t, err)
}

func TestValidateDepartmentRequest(t *testing.T) {
	applogger.InitTestLogger()

	h := NewDepartmentHandler(&mockUniversityRepo{}, 2*time.Second)

	// 正常系テスト
	department := &models.Department{
		Name:         "テスト学部",
		UniversityID: 1,
	}
	err := h.validateDepartmentRequest(department)
	require.NoError(t, err)

	// 異常系テスト（空の学部名）
	department = &models.Department{
		Name:         "",
		UniversityID: 1,
	}
	err = h.validateDepartmentRequest(department)
	assert.Error(t, err)

	// 異常系テスト（長すぎる学部名）
	department = &models.Department{
		Name:         strings.Repeat("a", 101),
		UniversityID: 1,
	}
	err = h.validateDepartmentRequest(department)
	assert.Error(t, err)

	// 異常系テスト（大学IDが0）
	department = &models.Department{
		Name:         "テスト学部",
		UniversityID: 0,
	}
	err = h.validateDepartmentRequest(department)
	assert.Error(t, err)
}

func TestValidateUniversityAndDepartmentID(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	h := NewDepartmentHandler(&mockUniversityRepo{}, 2*time.Second)
	ctx := context.Background()

	// 正常系テスト
	req := httptest.NewRequest(http.MethodGet, university1Department2Path, nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("universityId", "departmentId")
	c.SetParamValues("1", "2")

	universityID, departmentID, err := h.validateUniversityAndDepartmentID(ctx, c)
	require.NoError(t, err)
	assert.Equal(t, uint(1), universityID)
	assert.Equal(t, uint(2), departmentID)

	// 異常系テスト（不正なuniversityId）
	req = httptest.NewRequest(http.MethodGet, "/universities/invalid/departments/2", nil)
	rec = httptest.NewRecorder()
	c = e.NewContext(req, rec)
	c.SetParamNames("universityId", "departmentId")
	c.SetParamValues("invalid", "2")

	_, _, err = h.validateUniversityAndDepartmentID(ctx, c)
	assert.Error(t, err)

	// 異常系テスト（不正なdepartmentId）
	req = httptest.NewRequest(http.MethodGet, "/universities/1/departments/invalid", nil)
	rec = httptest.NewRecorder()
	c = e.NewContext(req, rec)
	c.SetParamNames("universityId", "departmentId")
	c.SetParamValues("1", "invalid")

	_, _, err = h.validateUniversityAndDepartmentID(ctx, c)
	assert.Error(t, err)
}

func TestCreateDepartmentSuccess(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	called := false
	mockRepo := &mockUniversityRepo{
		CreateDepartmentFunc: func(department *models.Department) error {
			called = true
			assert.Equal(t, uint(1), department.UniversityID)
			assert.Equal(t, "テスト学部", department.Name)
			return nil
		},
	}
	h := NewDepartmentHandler(mockRepo, 2*time.Second)

	body := `{"name":"テスト学部","university_id":1}`
	req := httptest.NewRequest(http.MethodPost, university1DepartmentsPath, strings.NewReader(body))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)

	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("universityId")
	c.SetParamValues("1")

	err := h.CreateDepartment(c)
	require.NoError(t, err)
	assert.Equal(t, http.StatusCreated, rec.Code)
	assert.True(t, called)
}

func TestCreateDepartmentError(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	mockRepo := &mockUniversityRepo{
		CreateDepartmentFunc: func(_ *models.Department) error {
			return errors.New("DBエラー")
		},
	}
	h := NewDepartmentHandler(mockRepo, 2*time.Second)

	body := `{"name":"テスト学部","university_id":1}`
	req := httptest.NewRequest(http.MethodPost, university1DepartmentsPath, strings.NewReader(body))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)

	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("universityId")
	c.SetParamValues("1")

	err := h.CreateDepartment(c)
	require.NoError(t, err)
	assert.Equal(t, http.StatusInternalServerError, rec.Code)
	assert.Contains(t, rec.Body.String(), "DBエラー")
}

func TestUpdateDepartmentSuccess(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	called := false
	mockRepo := &mockUniversityRepo{
		UpdateDepartmentFunc: func(department *models.Department) error {
			called = true
			assert.Equal(t, uint(2), department.ID)
			assert.Equal(t, "更新された学部", department.Name)
			return nil
		},
	}
	h := NewDepartmentHandler(mockRepo, 2*time.Second)

	body := `{"name":"更新された学部","university_id":1}`
	req := httptest.NewRequest(http.MethodPut, university1Department2Path, strings.NewReader(body))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)

	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("universityId", "departmentId")
	c.SetParamValues("1", "2")

	err := h.UpdateDepartment(c)
	require.NoError(t, err)
	assert.Equal(t, http.StatusOK, rec.Code)
	assert.True(t, called)
}

func TestUpdateDepartmentError(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	mockRepo := &mockUniversityRepo{
		UpdateDepartmentFunc: func(_ *models.Department) error {
			return errors.New("DBエラー")
		},
	}
	h := NewDepartmentHandler(mockRepo, 2*time.Second)

	body := `{"name":"更新された学部","university_id":1}`
	req := httptest.NewRequest(http.MethodPut, university1Department2Path, strings.NewReader(body))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)

	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("universityId", "departmentId")
	c.SetParamValues("1", "2")

	err := h.UpdateDepartment(c)
	require.NoError(t, err)
	assert.Equal(t, http.StatusInternalServerError, rec.Code)
	assert.Contains(t, rec.Body.String(), "DBエラー")
}

func TestDeleteDepartmentSuccess(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	called := false
	mockRepo := &mockUniversityRepo{
		DeleteDepartmentFunc: func(departmentID uint) error {
			called = true
			assert.Equal(t, uint(2), departmentID)
			return nil
		},
	}
	h := NewDepartmentHandler(mockRepo, 2*time.Second)

	req := httptest.NewRequest(http.MethodDelete, university1Department2Path, nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("universityId", "departmentId")
	c.SetParamValues("1", "2")

	err := h.DeleteDepartment(c)
	require.NoError(t, err)
	assert.Equal(t, http.StatusNoContent, rec.Code)
	assert.True(t, called)
}

func TestDeleteDepartmentError(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	mockRepo := &mockUniversityRepo{
		DeleteDepartmentFunc: func(_ uint) error {
			return errors.New("DBエラー")
		},
	}
	h := NewDepartmentHandler(mockRepo, 2*time.Second)

	req := httptest.NewRequest(http.MethodDelete, university1Department2Path, nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("universityId", "departmentId")
	c.SetParamValues("1", "2")

	err := h.DeleteDepartment(c)
	require.NoError(t, err)
	assert.Equal(t, http.StatusInternalServerError, rec.Code)
	assert.Contains(t, rec.Body.String(), "エラー")
}
