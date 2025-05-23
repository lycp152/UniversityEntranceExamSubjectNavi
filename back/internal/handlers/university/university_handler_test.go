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
	UpdateFunc   func(u *models.University) error
	DeleteFunc   func(id uint) error
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

func (m *mockUniversityRepo) Update(u *models.University) error {
	if m.UpdateFunc != nil {
		return m.UpdateFunc(u)
	}

	panic(errNotImplemented)
}

func (m *mockUniversityRepo) Delete(id uint) error {
	if m.DeleteFunc != nil {
		return m.DeleteFunc(id)
	}

	panic(errNotImplemented)
}

// 他のIUniversityRepositoryメソッドはpanicでOK（本テストでは使わないため）
func (m *mockUniversityRepo) Search(_ string) ([]models.University, error) { panic(errNotImplemented) }
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
	assert.Contains(t, rec.Body.String(), ErrMsgInternalServerError,)
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

func TestHandleErrorAuthError(t *testing.T) {
	e := echo.New()
	h := NewUniversityHandler(nil, 1*time.Second)
	rec := httptest.NewRecorder()
	c := e.NewContext(httptest.NewRequest(http.MethodGet, "/", nil), rec)
	err := &customErrors.Error{Code: customErrors.CodeAuthError, Message: "認証エラー"}
	hErr := h.handleError(context.Background(), c, err)
	assert.NoError(t, hErr)
	assert.Equal(t, http.StatusUnauthorized, rec.Code)
	assert.Contains(t, rec.Body.String(), "認証エラー")
}

func TestHandleErrorAuthzError(t *testing.T) {
	e := echo.New()
	h := NewUniversityHandler(nil, 1*time.Second)
	rec := httptest.NewRecorder()
	c := e.NewContext(httptest.NewRequest(http.MethodGet, "/", nil), rec)
	err := &customErrors.Error{Code: customErrors.CodeAuthzError, Message: "認可エラー"}
	hErr := h.handleError(context.Background(), c, err)
	assert.NoError(t, hErr)
	assert.Equal(t, http.StatusForbidden, rec.Code)
	assert.Contains(t, rec.Body.String(), "認可エラー")
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

func TestGetCSRFTokenInvalidType(t *testing.T) {
	e := echo.New()
	h := NewUniversityHandler(nil, 1*time.Second)
	req := httptest.NewRequest(http.MethodGet, "/csrf", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.Set("csrf", 123) // 不正な型を設定
	err := h.GetCSRFToken(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusInternalServerError, rec.Code)
	assert.Contains(t, rec.Body.String(), ErrMsgCSRFTokenInvalidType)
}

func TestGetUniversitiesTimeout(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	mockRepo := &mockUniversityRepo{
		FindAllFunc: func(ctx context.Context) ([]models.University, error) {
			<-ctx.Done()
			return nil, ctx.Err()
		},
	}
	h := NewUniversityHandler(mockRepo, 1*time.Second) // 1秒でタイムアウト

	req := httptest.NewRequest(http.MethodGet, universitiesPath, nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	// コンテキストにタイムアウトを設定
	ctx, cancel := context.WithTimeout(c.Request().Context(), 1*time.Second)
	defer cancel()
	c.SetRequest(c.Request().WithContext(ctx))

	err := h.GetUniversities(c)
	require.NoError(t, err)
	assert.Equal(t, http.StatusRequestTimeout, rec.Code)
	assert.Contains(t, rec.Body.String(), "リクエストがタイムアウトしました")
}

func TestGetUniversitiesContextCanceled(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	mockRepo := &mockUniversityRepo{
		FindAllFunc: func(ctx context.Context) ([]models.University, error) {
			select {
			case <-ctx.Done():
				return nil, ctx.Err()
			default:
				return nil, nil
			}
		},
	}
	h := NewUniversityHandler(mockRepo, 2*time.Second)

	req := httptest.NewRequest(http.MethodGet, universitiesPath, nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	// コンテキストをキャンセル
	ctx, cancel := context.WithCancel(c.Request().Context())
	c.SetRequest(c.Request().WithContext(ctx))
	cancel()

	err := h.GetUniversities(c)
	require.NoError(t, err)
	assert.Equal(t, http.StatusInternalServerError, rec.Code)
	assert.Contains(t, rec.Body.String(), "サーバー内部でエラーが発生しました")
}

func TestCreateUniversityValidationError(t *testing.T) {
	e := echo.New()
	mockRepo := &mockUniversityRepo{
		CreateFunc: func(_ *models.University) error {
			return &customErrors.Error{
				Code:    customErrors.CodeValidationError,
				Message: ErrMsgValidationError,
			}
		},
	}
	h := NewUniversityHandler(mockRepo, 1*time.Second)
	body := `{"name":""}` // 空の名前でバリデーションエラーを発生させる
	req := httptest.NewRequest(http.MethodPost, universitiesPath, strings.NewReader(body))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)

	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	err := h.CreateUniversity(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusBadRequest, rec.Code)
	assert.Contains(t, rec.Body.String(), ErrMsgValidationError)
}

func TestUpdateUniversityNotFound(t *testing.T) {
	e := echo.New()
	mockRepo := &mockUniversityRepo{
		FindByIDFunc: func(_ uint) (*models.University, error) {
			return nil, &customErrors.Error{
				Code:    customErrors.CodeNotFound,
				Message: ErrMsgUniversityNotFound,
			}
		},
		UpdateFunc: func(_ *models.University) error {
			return nil
		},
	}
	h := NewUniversityHandler(mockRepo, 1*time.Second)
	body := `{"name":"更新大学"}`
	req := httptest.NewRequest(http.MethodPut, universitiesPath+"/1", strings.NewReader(body))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)

	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("id")
	c.SetParamValues("1")
	err := h.UpdateUniversity(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusNotFound, rec.Code)
	assert.Contains(t, rec.Body.String(), ErrMsgUniversityNotFound)
}

func TestDeleteUniversityNotFound(t *testing.T) {
	e := echo.New()
	mockRepo := &mockUniversityRepo{
		FindByIDFunc: func(_ uint) (*models.University, error) {
			return nil, &customErrors.Error{
				Code:    customErrors.CodeNotFound,
				Message: ErrMsgUniversityNotFound,
			}
		},
		DeleteFunc: func(_ uint) error {
			return nil
		},
	}
	h := NewUniversityHandler(mockRepo, 1*time.Second)
	req := httptest.NewRequest(http.MethodDelete, universitiesPath+"/1", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("id")
	c.SetParamValues("1")
	err := h.DeleteUniversity(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusNotFound, rec.Code)
	assert.Contains(t, rec.Body.String(), ErrMsgUniversityNotFound)
}

func TestUpdateUniversitySuccess(t *testing.T) {
	e := echo.New()
	mockRepo := &mockUniversityRepo{
		FindByIDFunc: func(_ uint) (*models.University, error) {
			return &models.University{
				BaseModel: models.BaseModel{ID: 1},
				Name:     "旧大学名",
			}, nil
		},
		UpdateFunc: func(_ *models.University) error {
			return nil
		},
	}
	h := NewUniversityHandler(mockRepo, 1*time.Second)
	body := `{"name":"新大学名"}`
	req := httptest.NewRequest(http.MethodPut, universitiesPath+"/1", strings.NewReader(body))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)

	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("id")
	c.SetParamValues("1")
	err := h.UpdateUniversity(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Contains(t, rec.Body.String(), "新大学名")
}

func TestUpdateUniversityValidationError(t *testing.T) {
	e := echo.New()
	mockRepo := &mockUniversityRepo{
		FindByIDFunc: func(_ uint) (*models.University, error) {
			return &models.University{
				BaseModel: models.BaseModel{ID: 1},
				Name:     "旧大学名",
			}, nil
		},
		UpdateFunc: func(_ *models.University) error {
			return &customErrors.Error{
				Code:    customErrors.CodeValidationError,
				Message: ErrMsgValidationError,
			}
		},
	}
	h := NewUniversityHandler(mockRepo, 1*time.Second)
	body := `{"name":""}` // 空の名前でバリデーションエラーを発生させる
	req := httptest.NewRequest(http.MethodPut, universitiesPath+"/1", strings.NewReader(body))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)

	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("id")
	c.SetParamValues("1")
	err := h.UpdateUniversity(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusBadRequest, rec.Code)
	assert.Contains(t, rec.Body.String(), ErrMsgValidationError)
}

func TestDeleteUniversitySuccess(t *testing.T) {
	e := echo.New()
	mockRepo := &mockUniversityRepo{
		FindByIDFunc: func(_ uint) (*models.University, error) {
			return &models.University{
				BaseModel: models.BaseModel{ID: 1},
				Name:     "テスト大学",
			}, nil
		},
		DeleteFunc: func(_ uint) error {
			return nil
		},
	}
	h := NewUniversityHandler(mockRepo, 1*time.Second)
	req := httptest.NewRequest(http.MethodDelete, universitiesPath+"/1", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("id")
	c.SetParamValues("1")
	err := h.DeleteUniversity(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusNoContent, rec.Code)
}

func TestDeleteUniversityInternalError(t *testing.T) {
	e := echo.New()
	mockRepo := &mockUniversityRepo{
		FindByIDFunc: func(_ uint) (*models.University, error) {
			return &models.University{
				BaseModel: models.BaseModel{ID: 1},
				Name:     "テスト大学",
			}, nil
		},
		DeleteFunc: func(_ uint) error {
			return errors.New("削除エラー")
		},
	}
	h := NewUniversityHandler(mockRepo, 1*time.Second)
	req := httptest.NewRequest(http.MethodDelete, universitiesPath+"/1", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("id")
	c.SetParamValues("1")
	err := h.DeleteUniversity(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusInternalServerError, rec.Code)
	assert.Contains(t, rec.Body.String(), ErrMsgInternalServerError)
}

func TestGetUniversityInternalError(t *testing.T) {
	e := echo.New()
	mockRepo := &mockUniversityRepo{
		FindByIDFunc: func(_ uint) (*models.University, error) {
			return nil, errors.New("内部エラー")
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
	assert.Equal(t, http.StatusInternalServerError, rec.Code)
	assert.Contains(t, rec.Body.String(), ErrMsgInternalServerError)
}

func TestGetUniversitiesEmptyList(t *testing.T) {
	applogger.InitTestLogger()

	e := echo.New()
	mockRepo := &mockUniversityRepo{
		FindAllFunc: func(_ context.Context) ([]models.University, error) {
			return nil, nil
		},
	}
	h := NewUniversityHandler(mockRepo, 2*time.Second)

	req := httptest.NewRequest(http.MethodGet, universitiesPath, nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := h.GetUniversities(c)
	require.NoError(t, err)
	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Equal(t, "[]", strings.TrimSpace(rec.Body.String()))
}

func TestUpdateUniversityBindError(t *testing.T) {
	e := echo.New()
	mockRepo := &mockUniversityRepo{
		FindByIDFunc: func(_ uint) (*models.University, error) {
			return &models.University{
				BaseModel: models.BaseModel{ID: 1},
				Name:     "旧大学名",
			}, nil
		},
	}
	h := NewUniversityHandler(mockRepo, 1*time.Second)
	req := httptest.NewRequest(http.MethodPut, universitiesPath+"/1", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("id")
	c.SetParamValues("1")
	// Bind失敗を誘発
	bc := &badContext{c}
	err := h.UpdateUniversity(bc)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusBadRequest, rec.Code)
}

func TestDeleteUniversityValidationError(t *testing.T) {
	e := echo.New()
	mockRepo := &mockUniversityRepo{
		FindByIDFunc: func(_ uint) (*models.University, error) {
			return &models.University{
				BaseModel: models.BaseModel{ID: 1},
				Name:     "テスト大学",
			}, nil
		},
		DeleteFunc: func(_ uint) error {
			return &customErrors.Error{
				Code:    customErrors.CodeValidationError,
				Message: "バリデーションエラー",
			}
		},
	}
	h := NewUniversityHandler(mockRepo, 1*time.Second)
	req := httptest.NewRequest(http.MethodDelete, universitiesPath+"/1", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("id")
	c.SetParamValues("1")
	err := h.DeleteUniversity(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusBadRequest, rec.Code)
	assert.Contains(t, rec.Body.String(), "バリデーションエラー")
}

func TestUpdateUniversityInternalError(t *testing.T) {
	e := echo.New()
	mockRepo := &mockUniversityRepo{
		FindByIDFunc: func(_ uint) (*models.University, error) {
			return &models.University{
				BaseModel: models.BaseModel{ID: 1},
				Name:     "旧大学名",
			}, nil
		},
		UpdateFunc: func(_ *models.University) error {
			return errors.New("内部エラー")
		},
	}
	h := NewUniversityHandler(mockRepo, 1*time.Second)
	body := `{"name":"新大学名"}`
	req := httptest.NewRequest(http.MethodPut, universitiesPath+"/1", strings.NewReader(body))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)

	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("id")
	c.SetParamValues("1")
	err := h.UpdateUniversity(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusInternalServerError, rec.Code)
	assert.Contains(t, rec.Body.String(), ErrMsgInternalServerError)
}

func TestUpdateUniversityContextCanceled(t *testing.T) {
	e := echo.New()
	mockRepo := &mockUniversityRepo{
		FindByIDFunc: func(_ uint) (*models.University, error) {
			return &models.University{
				BaseModel: models.BaseModel{ID: 1},
				Name:     "旧大学名",
			}, nil
		},
		UpdateFunc: func(_ *models.University) error {
			return context.Canceled
		},
	}
	h := NewUniversityHandler(mockRepo, 1*time.Second)
	body := `{"name":"新大学名"}`
	req := httptest.NewRequest(http.MethodPut, universitiesPath+"/1", strings.NewReader(body))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)

	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("id")
	c.SetParamValues("1")
	err := h.UpdateUniversity(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusInternalServerError, rec.Code)
	assert.Contains(t, rec.Body.String(), ErrMsgInternalServerError)
}

func TestDeleteUniversityContextCanceled(t *testing.T) {
	e := echo.New()
	mockRepo := &mockUniversityRepo{
		FindByIDFunc: func(_ uint) (*models.University, error) {
			return &models.University{
				BaseModel: models.BaseModel{ID: 1},
				Name:     "テスト大学",
			}, nil
		},
		DeleteFunc: func(_ uint) error {
			return context.Canceled
		},
	}
	h := NewUniversityHandler(mockRepo, 1*time.Second)
	req := httptest.NewRequest(http.MethodDelete, universitiesPath+"/1", nil)

	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("id")
	c.SetParamValues("1")
	err := h.DeleteUniversity(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusInternalServerError, rec.Code)
	assert.Contains(t, rec.Body.String(), ErrMsgInternalServerError)
}
