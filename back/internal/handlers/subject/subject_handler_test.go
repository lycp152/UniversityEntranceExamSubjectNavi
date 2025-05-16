package subject

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
const subject2Path = "/subjects/2"
const batchSubjectsPath = "/departments/1/subjects/batch"

type mockUniversityRepo struct {
	FindSubjectFunc func(departmentID, subjectID uint) (*models.Subject, error)
	CreateSubjectFunc func(subject *models.Subject) error
	UpdateSubjectFunc func(subject *models.Subject) error
	DeleteSubjectFunc func(id uint) error
	UpdateSubjectsBatchFunc func(departmentID uint, subjects []models.Subject) error
}

func (m *mockUniversityRepo) FindSubject(departmentID, subjectID uint) (*models.Subject, error) {
	return m.FindSubjectFunc(departmentID, subjectID)
}

func (m *mockUniversityRepo) CreateSubject(subject *models.Subject) error {
	if m.CreateSubjectFunc != nil {
		return m.CreateSubjectFunc(subject)
	}

	panic(errNotImplemented)
}

func (m *mockUniversityRepo) UpdateSubject(subject *models.Subject) error {
	if m.UpdateSubjectFunc != nil {
		return m.UpdateSubjectFunc(subject)
	}

	panic(errNotImplemented)
}

func (m *mockUniversityRepo) DeleteSubject(id uint) error {
	if m.DeleteSubjectFunc != nil {
		return m.DeleteSubjectFunc(id)
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
func (m *mockUniversityRepo) CreateMajor(_ *models.Major) error { panic(errNotImplemented) }
func (m *mockUniversityRepo) UpdateMajor(_ *models.Major) error { panic(errNotImplemented) }
func (m *mockUniversityRepo) DeleteMajor(_ uint) error { panic(errNotImplemented) }
func (m *mockUniversityRepo) CreateAdmissionInfo(_ *models.AdmissionInfo) error { panic(errNotImplemented) }
func (m *mockUniversityRepo) DeleteAdmissionInfo(_ uint) error { panic(errNotImplemented) }
func (m *mockUniversityRepo) UpdateAdmissionInfo(_ *models.AdmissionInfo) error { panic(errNotImplemented) }
func (m *mockUniversityRepo) FindDepartment(_, _ uint) (*models.Department, error) { panic(errNotImplemented) }
func (m *mockUniversityRepo) FindMajor(_, _ uint) (*models.Major, error) { panic(errNotImplemented) }
func (m *mockUniversityRepo) UpdateSubjectsBatch(departmentID uint, subjects []models.Subject) error {
	if m.UpdateSubjectsBatchFunc != nil {
		return m.UpdateSubjectsBatchFunc(departmentID, subjects)
	}

	panic(errNotImplemented)
}
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

// --- 科目作成APIの正常系テスト ---
func TestCreateSubjectSuccess(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	called := false
	mockRepo := &mockUniversityRepo{
		FindSubjectFunc: nil,
	}
	mockRepo.CreateSubjectFunc = func(_ *models.Subject) error { called = true; return nil }
	h := NewSubjectHandler(mockRepo, 2*time.Second)

	body := `{"name":"数学","testTypeId":1}`
	req := httptest.NewRequest(http.MethodPost, "/departments/1/subjects", strings.NewReader(body))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)

	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("departmentId")
	c.SetParamValues("1")

	err := h.CreateSubject(c)
	require.NoError(t, err)
	assert.Equal(t, http.StatusCreated, rec.Code)
	assert.True(t, called)
}

// --- 科目作成APIの異常系テスト ---
func TestCreateSubjectError(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	mockRepo := &mockUniversityRepo{
		FindSubjectFunc: nil,
	}
	mockRepo.CreateSubjectFunc = func(_ *models.Subject) error { return errors.New("DBエラー") }
	h := NewSubjectHandler(mockRepo, 2*time.Second)

	body := `{"name":"数学","testTypeId":1}`
	req := httptest.NewRequest(http.MethodPost, "/departments/1/subjects", strings.NewReader(body))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)

	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("departmentId")
	c.SetParamValues("1")

	err := h.CreateSubject(c)
	require.NoError(t, err)
	assert.Equal(t, http.StatusInternalServerError, rec.Code)
	assert.Contains(t, rec.Body.String(), "エラー")
}

// --- 科目更新APIの正常系テスト ---
func TestUpdateSubjectSuccess(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	called := false
	mockRepo := &mockUniversityRepo{
		FindSubjectFunc: nil,
	}
	mockRepo.UpdateSubjectFunc = func(s *models.Subject) error {
		assert.Equal(t, uint(1), s.TestTypeID)

		called = true; return nil
	}
	h := NewSubjectHandler(mockRepo, 2*time.Second)

	body := `{"name":"国語","test_type_id":1}`
	req := httptest.NewRequest(http.MethodPut, subject2Path, strings.NewReader(body))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)

	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("subjectId")
	c.SetParamValues("2")

	err := h.UpdateSubject(c)
	require.NoError(t, err)
	assert.Equal(t, http.StatusOK, rec.Code)
	assert.True(t, called)
}

// --- 科目更新APIの異常系テスト ---
func TestUpdateSubjectError(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	mockRepo := &mockUniversityRepo{
		FindSubjectFunc: nil,
	}
	mockRepo.UpdateSubjectFunc = func(s *models.Subject) error {
		assert.Equal(t, uint(1), s.TestTypeID)
		return errors.New("DBエラー")
	}
	h := NewSubjectHandler(mockRepo, 2*time.Second)

	body := `{"name":"国語","test_type_id":1}`
	req := httptest.NewRequest(http.MethodPut, subject2Path, strings.NewReader(body))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)

	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("subjectId")
	c.SetParamValues("2")

	err := h.UpdateSubject(c)
	require.NoError(t, err)
	assert.Equal(t, http.StatusInternalServerError, rec.Code)
	assert.Contains(t, rec.Body.String(), "エラー")
}

// --- 科目削除APIの正常系テスト ---
func TestDeleteSubjectSuccess(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	called := false
	mockRepo := &mockUniversityRepo{
		FindSubjectFunc: nil,
	}
	mockRepo.DeleteSubjectFunc = func(_ uint) error { called = true; return nil }
	h := NewSubjectHandler(mockRepo, 2*time.Second)

	req := httptest.NewRequest(http.MethodDelete, subject2Path, nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("subjectId")
	c.SetParamValues("2")

	err := h.DeleteSubject(c)
	require.NoError(t, err)
	assert.Equal(t, http.StatusNoContent, rec.Code)
	assert.True(t, called)
}

// --- 科目削除APIの異常系テスト ---
func TestDeleteSubjectError(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	mockRepo := &mockUniversityRepo{
		FindSubjectFunc: nil,
	}
	mockRepo.DeleteSubjectFunc = func(_ uint) error { return errors.New("DBエラー") }
	h := NewSubjectHandler(mockRepo, 2*time.Second)

	req := httptest.NewRequest(http.MethodDelete, subject2Path, nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("subjectId")
	c.SetParamValues("2")

	err := h.DeleteSubject(c)
	require.NoError(t, err)
	assert.Equal(t, http.StatusInternalServerError, rec.Code)
	assert.Contains(t, rec.Body.String(), "エラー")
}

// --- 科目一括更新APIのテスト ---
func TestUpdateSubjectsBatch(t *testing.T) {
	applogger.InitTestLogger()

	t.Run("正常系", func(t *testing.T) {
		e := echo.New()
		mockRepo := &mockUniversityRepo{
			UpdateSubjectsBatchFunc: func(_ uint, _ []models.Subject) error {
				return nil
			},
		}
		h := NewSubjectHandler(mockRepo, 2*time.Second)

		body := `[{"name":"数学","test_type_id":1},{"name":"英語","test_type_id":2}]`
		req := httptest.NewRequest(http.MethodPut, batchSubjectsPath, strings.NewReader(body))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)

		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("departmentId")
		c.SetParamValues("1")

		err := h.UpdateSubjectsBatch(c)
		require.NoError(t, err)
		assert.Equal(t, http.StatusOK, rec.Code)
	})

	t.Run("異常系 - 不正なJSON", func(t *testing.T) {
		e := echo.New()
		mockRepo := &mockUniversityRepo{
			UpdateSubjectsBatchFunc: func(_ uint, _ []models.Subject) error {
				return nil
			},
		}
		h := NewSubjectHandler(mockRepo, 2*time.Second)

		body := `invalid`
		req := httptest.NewRequest(http.MethodPut, batchSubjectsPath, strings.NewReader(body))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)

		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("departmentId")
		c.SetParamValues("1")

		err := h.UpdateSubjectsBatch(c)
		require.NoError(t, err)
		assert.Equal(t, http.StatusInternalServerError, rec.Code)
	})

	t.Run("異常系 - DBエラー", func(t *testing.T) {
		e := echo.New()
		mockRepo := &mockUniversityRepo{
			UpdateSubjectsBatchFunc: func(_ uint, _ []models.Subject) error {
				return errors.New("DBエラー")
			},
		}
		h := NewSubjectHandler(mockRepo, 2*time.Second)

		body := `[{"name":"数学","test_type_id":1}]`
		req := httptest.NewRequest(http.MethodPut, batchSubjectsPath, strings.NewReader(body))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)

		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("departmentId")
		c.SetParamValues("1")

		err := h.UpdateSubjectsBatch(c)
		require.NoError(t, err)
		assert.Equal(t, http.StatusInternalServerError, rec.Code)
		assert.Contains(t, rec.Body.String(), "エラー")
	})
}

// --- bindRequestのテスト ---
func TestBindRequest(t *testing.T) {
	applogger.InitTestLogger()

	mockRepo := &mockUniversityRepo{}
	h := NewSubjectHandler(mockRepo, 2*time.Second)

	t.Run("正常系", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(`{"name": "数学", "test_type_id": 1}`))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)

		rec := httptest.NewRecorder()
		c := echo.New().NewContext(req, rec)

		var subject models.Subject
		err := h.bindRequest(context.Background(), c, &subject)
		require.NoError(t, err)
		assert.Equal(t, "数学", subject.Name)
		assert.Equal(t, uint(1), subject.TestTypeID)
	})
}

// --- validateSubjectRequestのテスト ---
func TestValidateSubjectRequest(t *testing.T) {
	applogger.InitTestLogger()

	mockRepo := &mockUniversityRepo{}
	h := NewSubjectHandler(mockRepo, 2*time.Second)

	t.Run("正常系", func(t *testing.T) {
		subject := &models.Subject{
			Name:       "数学",
			TestTypeID: 1,
		}
		err := h.validateSubjectRequest(subject)
		require.NoError(t, err)
	})

	t.Run("異常系 - 科目名が空", func(t *testing.T) {
		subject := &models.Subject{
			Name:       "",
			TestTypeID: 1,
		}
		err := h.validateSubjectRequest(subject)
		require.Error(t, err)
		assert.Contains(t, err.Error(), "科目名は必須です")
	})

	t.Run("異常系 - 科目名が長すぎる", func(t *testing.T) {
		subject := &models.Subject{
			Name:       strings.Repeat("a", 101),
			TestTypeID: 1,
		}
		err := h.validateSubjectRequest(subject)
		require.Error(t, err)
		assert.Contains(t, err.Error(), "科目名は100文字以内で入力してください")
	})

	t.Run("異常系 - テストタイプIDが0", func(t *testing.T) {
		subject := &models.Subject{
			Name:       "数学",
			TestTypeID: 0,
		}
		err := h.validateSubjectRequest(subject)
		require.Error(t, err)
		assert.Contains(t, err.Error(), "試験種別IDは必須です")
	})
}
