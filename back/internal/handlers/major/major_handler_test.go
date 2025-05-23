package major

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
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const errNotImplemented = "not implemented"
const majors1Path = "/majors/1"

type mockUniversityRepo struct {
	FindMajorFunc      func(departmentID, majorID uint) (*models.Major, error)
	CreateMajorFunc     func(major *models.Major) error
	UpdateMajorFunc     func(major *models.Major) error
	DeleteMajorFunc     func(majorID uint) error
}

func (m *mockUniversityRepo) FindMajor(departmentID, majorID uint) (*models.Major, error) {
	return m.FindMajorFunc(departmentID, majorID)
}

func (m *mockUniversityRepo) CreateMajor(major *models.Major) error {
	return m.CreateMajorFunc(major)
}

func (m *mockUniversityRepo) UpdateMajor(major *models.Major) error {
	return m.UpdateMajorFunc(major)
}

func (m *mockUniversityRepo) DeleteMajor(majorID uint) error {
	return m.DeleteMajorFunc(majorID)
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
func (m *mockUniversityRepo) CreateAdmissionInfo(_ *models.AdmissionInfo) error { panic(errNotImplemented) }
func (m *mockUniversityRepo) DeleteAdmissionInfo(_ uint) error { panic(errNotImplemented) }
func (m *mockUniversityRepo) UpdateAdmissionInfo(_ *models.AdmissionInfo) error { panic(errNotImplemented) }
func (m *mockUniversityRepo) FindDepartment(_, _ uint) (*models.Department, error) { panic(errNotImplemented) }
func (m *mockUniversityRepo) FindSubject(_, _ uint) (*models.Subject, error) { panic(errNotImplemented) }
func (m *mockUniversityRepo) FindAdmissionInfo(_, _ uint) (*models.AdmissionInfo, error) { panic(errNotImplemented) }
func (m *mockUniversityRepo) UpdateSubjectsBatch(_ uint, _ []models.Subject) error { panic(errNotImplemented) }
func (m *mockUniversityRepo) UpdateAdmissionSchedule(_ *models.AdmissionSchedule) error { panic(errNotImplemented) }

// --- 学科取得APIの正常系テスト ---
func TestGetMajorSuccess(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	mockRepo := &mockUniversityRepo{
		FindMajorFunc: func(_ , majorID uint) (*models.Major, error) {
			return &models.Major{
				BaseModel:    models.BaseModel{ID: majorID},
				DepartmentID: 1,
				Name:         "テスト学科",
			}, nil
		},
	}
	h := NewMajorHandler(mockRepo, 2*time.Second)

	req := httptest.NewRequest(http.MethodGet, "/departments/1/majors/2", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("departmentId", "majorId")
	c.SetParamValues("1", "2")

	err := h.GetMajor(c)
	require.NoError(t, err)
	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Contains(t, rec.Body.String(), "テスト学科")
}

// --- 学科取得APIの異常系テスト ---
func TestGetMajorError(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	mockRepo := &mockUniversityRepo{
		FindMajorFunc: func(_, _ uint) (*models.Major, error) {
			return nil, errors.New("DBエラー")
		},
	}
	h := NewMajorHandler(mockRepo, 2*time.Second)

	req := httptest.NewRequest(http.MethodGet, "/departments/1/majors/2", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("departmentId", "majorId")
	c.SetParamValues("1", "2")

	err := h.GetMajor(c)
	require.NoError(t, err)
	assert.Equal(t, http.StatusInternalServerError, rec.Code)
	assert.Contains(t, rec.Body.String(), "エラー")
}

// --- bindRequestのテスト ---
func TestBindRequest(t *testing.T) {
	applogger.InitTestLogger()

	mockRepo := &mockUniversityRepo{}
	h := NewMajorHandler(mockRepo, 2*time.Second)

	t.Run("正常系", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(`{"name": "テスト学科", "department_id": 1}`))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)

		rec := httptest.NewRecorder()
		c := echo.New().NewContext(req, rec)

		var major models.Major
		err := h.bindRequest(context.Background(), c, &major)
		require.NoError(t, err)
		assert.Equal(t, "テスト学科", major.Name)
		assert.Equal(t, uint(1), major.DepartmentID)
	})

	t.Run("異常系 - 不正なJSON", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(`{"name": "テスト学科", "department_id": "invalid"}`))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)

		rec := httptest.NewRecorder()
		c := echo.New().NewContext(req, rec)

		var major models.Major
		_ = h.bindRequest(context.Background(), c, &major)
		err := h.validateMajorRequest(&major)
		require.Error(t, err)
		assert.Contains(t, err.Error(), "学部IDは必須です")
	})
}

// --- validateMajorRequestのテスト ---
func TestValidateMajorRequest(t *testing.T) {
	applogger.InitTestLogger()

	mockRepo := &mockUniversityRepo{}
	h := NewMajorHandler(mockRepo, 2*time.Second)

	t.Run("正常系", func(t *testing.T) {
		major := &models.Major{
			Name:         "テスト学科",
			DepartmentID: 1,
		}
		err := h.validateMajorRequest(major)
		require.NoError(t, err)
	})

	t.Run("異常系 - 学科名が空", func(t *testing.T) {
		major := &models.Major{
			Name:         "",
			DepartmentID: 1,
		}
		err := h.validateMajorRequest(major)
		require.Error(t, err)
		assert.Contains(t, err.Error(), "学科名は必須です")
	})

	t.Run("異常系 - 学科名が長すぎる", func(t *testing.T) {
		major := &models.Major{
			Name:         strings.Repeat("a", 101),
			DepartmentID: 1,
		}
		err := h.validateMajorRequest(major)
		require.Error(t, err)
		assert.Contains(t, err.Error(), "学科名は100文字以内で入力してください")
	})

	t.Run("異常系 - 学部IDが0", func(t *testing.T) {
		major := &models.Major{
			Name:         "テスト学科",
			DepartmentID: 0,
		}
		err := h.validateMajorRequest(major)
		require.Error(t, err)
		assert.Contains(t, err.Error(), "学部IDは必須です")
	})
}

// --- 学科作成APIのテスト ---
func TestCreateMajor(t *testing.T) {
	applogger.InitTestLogger()

	t.Run("正常系", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPost, "/departments/1/majors",
			strings.NewReader(`{"name": "テスト学科", "department_id": 1}`))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)

		rec := httptest.NewRecorder()
		c := echo.New().NewContext(req, rec)
		c.SetParamNames("departmentId")
		c.SetParamValues("1")

		h := NewMajorHandler(&mockUniversityRepo{
			CreateMajorFunc: func(_ *models.Major) error {
				return nil
			},
		}, 2*time.Second)

		err := h.CreateMajor(c)
		require.NoError(t, err)
		assert.Equal(t, http.StatusCreated, rec.Code)
		assert.Contains(t, rec.Body.String(), "テスト学科")
	})

	t.Run("異常系 - バリデーションエラー", func(t *testing.T) {
		mockRepo := &mockUniversityRepo{
			CreateMajorFunc: func(_ *models.Major) error {
				return nil
			},
		}
		h := NewMajorHandler(mockRepo, 2*time.Second)

		req := httptest.NewRequest(http.MethodPost, "/departments/1/majors", strings.NewReader(`{"name": ""}`))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)

		rec := httptest.NewRecorder()
		c := echo.New().NewContext(req, rec)
		c.SetParamNames("departmentId")
		c.SetParamValues("1")

		err := h.CreateMajor(c)
		require.NoError(t, err)
		assert.Equal(t, http.StatusBadRequest, rec.Code)
	})
}

// --- 学科更新APIのテスト ---
func TestUpdateMajor(t *testing.T) {
	applogger.InitTestLogger()

	mockRepo := &mockUniversityRepo{
		UpdateMajorFunc: func(_ *models.Major) error {
			return nil
		},
	}
	h := NewMajorHandler(mockRepo, 2*time.Second)

	t.Run("正常系", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPut, majors1Path, strings.NewReader(`{"name": "更新された学科", "department_id": 1}`))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)

		rec := httptest.NewRecorder()
		c := echo.New().NewContext(req, rec)
		c.SetParamNames("majorId")
		c.SetParamValues("1")

		err := h.UpdateMajor(c)
		require.NoError(t, err)
		assert.Equal(t, http.StatusOK, rec.Code)
		assert.Contains(t, rec.Body.String(), "更新された学科")
	})

	t.Run("異常系 - バリデーションエラー", func(t *testing.T) {
		mockRepo := &mockUniversityRepo{
			UpdateMajorFunc: func(_ *models.Major) error { return nil },
		}
		h := NewMajorHandler(mockRepo, 2*time.Second)
		req := httptest.NewRequest(http.MethodPut, majors1Path, strings.NewReader(`{"name": "", "department_id": 1}`))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)

		rec := httptest.NewRecorder()
		c := echo.New().NewContext(req, rec)
		c.SetParamNames("majorId")
		c.SetParamValues("1")

		err := h.UpdateMajor(c)
		require.NoError(t, err)
		assert.Equal(t, http.StatusBadRequest, rec.Code)
	})
}

// --- 学科削除APIのテスト ---
func TestDeleteMajor(t *testing.T) {
	applogger.InitTestLogger()

	mockRepo := &mockUniversityRepo{
		DeleteMajorFunc: func(_ uint) error {
			return nil
		},
	}
	h := NewMajorHandler(mockRepo, 2*time.Second)

	t.Run("正常系", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodDelete, majors1Path, nil)
		rec := httptest.NewRecorder()
		c := echo.New().NewContext(req, rec)
		c.SetParamNames("majorId")
		c.SetParamValues("1")

		err := h.DeleteMajor(c)
		require.NoError(t, err)
		assert.Equal(t, http.StatusNoContent, rec.Code)
	})

	t.Run("異常系 - 不正なID", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodDelete, "/majors/invalid", nil)
		rec := httptest.NewRecorder()
		c := echo.New().NewContext(req, rec)
		c.SetParamNames("majorId")
		c.SetParamValues("invalid")

		err := h.DeleteMajor(c)
		require.NoError(t, err)
		assert.Equal(t, http.StatusBadRequest, rec.Code)
	})
}
