package university

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"university-exam-api/internal/domain/models"
	customErrors "university-exam-api/internal/errors"
	applogger "university-exam-api/internal/logger"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const errNotImplemented = "not implemented"
const universitiesPath = "/universities"

// --- モックリポジトリ定義 ---
type mockUniversityRepo struct {
	FindAllFunc  func(ctx context.Context) ([]models.University, error)
	FindByIDFunc func(id uint) (*models.University, error)
	CreateFunc   func(u *models.University) error
}

func (m *mockUniversityRepo) FindAll(ctx context.Context) ([]models.University, error) {
	return m.FindAllFunc(ctx)
}

func (m *mockUniversityRepo) FindByID(id uint) (*models.University, error) {
	if m.FindByIDFunc != nil {
		return m.FindByIDFunc(id)
	}

	panic(errNotImplemented)
}

func (m *mockUniversityRepo) Create(u *models.University) error {
	if m.CreateFunc != nil {
		return m.CreateFunc(u)
	}

	panic(errNotImplemented)
}

// 他のIUniversityRepositoryメソッドはpanicでOK（本テストでは使わないため）
func (m *mockUniversityRepo) Search(_ string) ([]models.University, error) { panic(errNotImplemented) }
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

	req := httptest.NewRequest(http.MethodGet, universitiesPath, nil)
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

	req := httptest.NewRequest(http.MethodGet, universitiesPath, nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := h.GetUniversities(c)
	require.NoError(t, err)
	assert.Equal(t, http.StatusInternalServerError, rec.Code)
	assert.Contains(t, rec.Body.String(), "サーバー内部でエラーが発生しました")
}

func TestSetAndGetRepo(t *testing.T) {
	h := NewUniversityHandler(nil, 1*time.Second)
	mockRepo := &mockUniversityRepo{FindAllFunc: func(_ context.Context) ([]models.University, error) { return nil, nil }}
	h.SetRepo(mockRepo)
	assert.Equal(t, mockRepo, h.GetRepo())
}

func TestHandleErrorCustomError(t *testing.T) {
	e := echo.New()
	h := NewUniversityHandler(nil, 1*time.Second)
	rec := httptest.NewRecorder()
	c := e.NewContext(httptest.NewRequest(http.MethodGet, "/", nil), rec)
	err := &customErrors.Error{Code: customErrors.CodeNotFound, Message: "not found"}
	hErr := h.handleError(context.Background(), c, err)
	assert.NoError(t, hErr)
	assert.Equal(t, http.StatusNotFound, rec.Code)
	assert.Contains(t, rec.Body.String(), "not found")
}

func TestHandleErrorDefault(t *testing.T) {
	e := echo.New()
	h := NewUniversityHandler(nil, 1*time.Second)
	rec := httptest.NewRecorder()
	c := e.NewContext(httptest.NewRequest(http.MethodGet, "/", nil), rec)
	hErr := h.handleError(context.Background(), c, errors.New("other error"))
	assert.NoError(t, hErr)
	assert.Equal(t, http.StatusInternalServerError, rec.Code)
	assert.Contains(t, rec.Body.String(), "サーバー内部でエラーが発生しました")
}

type badContext struct{ echo.Context }

func (b *badContext) Bind(_ interface{}) error { return errors.New("bind error") }

func TestBindRequestError(t *testing.T) {
	e := echo.New()
	h := NewUniversityHandler(nil, 1*time.Second)
	rec := httptest.NewRecorder()
	c := e.NewContext(httptest.NewRequest(http.MethodPost, "/", nil), rec)
	// Bindに失敗させるためにc.Bindをモック
	bc := &badContext{c}
	err := h.bindRequest(context.Background(), bc, &models.University{})
	assert.Error(t, err)
}

func TestGetUniversityError(t *testing.T) {
	e := echo.New()
	h := NewUniversityHandler(&mockUniversityRepo{}, 1*time.Second)
	req := httptest.NewRequest(http.MethodGet, universitiesPath+"/abc", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("id")
	c.SetParamValues("abc")
	err := h.GetUniversity(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusBadRequest, rec.Code)
}

func TestGetUniversitySuccess(t *testing.T) {
	e := echo.New()
	mockRepo := &mockUniversityRepo{
		FindByIDFunc: func(_ uint) (*models.University, error) {
			return &models.University{BaseModel: models.BaseModel{ID: 1}, Name: "大学X"}, nil
		},
	}
	h := NewUniversityHandler(mockRepo, 1*time.Second)
	req := httptest.NewRequest(http.MethodGet, universitiesPath+"/1", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("id")
	c.SetParamValues("1")
	err := h.GetUniversity(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Contains(t, rec.Body.String(), "大学X")
}

func TestCreateUniversityError(t *testing.T) {
	e := echo.New()
	h := NewUniversityHandler(&mockUniversityRepo{}, 1*time.Second)
	req := httptest.NewRequest(http.MethodPost, universitiesPath, nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	// Bind失敗を誘発
	bc := &badContext{c}
	err := h.CreateUniversity(bc)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusBadRequest, rec.Code)
}

func TestCreateUniversitySuccess(t *testing.T) {
	e := echo.New()
	called := false
	mockRepo := &mockUniversityRepo{
		CreateFunc: func(_ *models.University) error { called = true; return nil },
	}
	h := NewUniversityHandler(mockRepo, 1*time.Second)
	body := `{"name":"新大学"}`
	req := httptest.NewRequest(http.MethodPost, universitiesPath, strings.NewReader(body))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)

	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	err := h.CreateUniversity(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusCreated, rec.Code)
	assert.True(t, called)
}

func TestUpdateUniversityError(t *testing.T) {
	e := echo.New()
	h := NewUniversityHandler(&mockUniversityRepo{}, 1*time.Second)
	req := httptest.NewRequest(http.MethodPut, universitiesPath+"/abc", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("id")
	c.SetParamValues("abc")
	err := h.UpdateUniversity(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusBadRequest, rec.Code)
}

func TestDeleteUniversityError(t *testing.T) {
	e := echo.New()
	h := NewUniversityHandler(&mockUniversityRepo{}, 1*time.Second)
	req := httptest.NewRequest(http.MethodDelete, universitiesPath+"/abc", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("id")
	c.SetParamValues("abc")
	err := h.DeleteUniversity(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusBadRequest, rec.Code)
}

func TestGetCSRFTokenError(t *testing.T) {
	e := echo.New()
	h := NewUniversityHandler(nil, 1*time.Second)
	req := httptest.NewRequest(http.MethodGet, "/csrf", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	// tokenがnil
	err := h.GetCSRFToken(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusInternalServerError, rec.Code)
}

func TestGetCSRFTokenSuccess(t *testing.T) {
	e := echo.New()
	h := NewUniversityHandler(nil, 1*time.Second)
	req := httptest.NewRequest(http.MethodGet, "/csrf", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.Set("csrf", "testtoken")
	err := h.GetCSRFToken(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Contains(t, rec.Body.String(), "testtoken")
}
