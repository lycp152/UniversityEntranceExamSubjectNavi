package university

import (
	"context"
	"net/http"
	"time"
	"university-exam-api/internal/domain/models"
	customErrors "university-exam-api/internal/errors"
	applogger "university-exam-api/internal/logger"
	errorMessages "university-exam-api/internal/pkg/errors"
	"university-exam-api/internal/pkg/logging"
	"university-exam-api/internal/pkg/validation"
	"university-exam-api/internal/repositories"

	"github.com/labstack/echo/v4"
)

const (
	// エラーメッセージ
	ErrMsgUniversityNotFound = "大学が見つかりません: %s"
	ErrMsgInvalidUniversityID = "大学IDの形式が不正です"
	ErrMsgCreateUniversityFailed = "大学の作成に失敗しました"
	ErrMsgUpdateUniversityFailed = "大学の更新に失敗しました"
	ErrMsgDeleteUniversityFailed = "大学の削除に失敗しました"
	// #nosec G101 - これは認証情報ではなく、エラーメッセージです
	ErrMsgCSRFTokenGeneration = "CSRFトークンの生成に失敗しました"
	// #nosec G101 - これは認証情報ではなく、エラーメッセージです
	ErrMsgCSRFTokenInvalidType = "CSRFトークンの型が不正です"
	ErrMsgGetUniversitiesFailed = "大学一覧の取得に失敗しました"
	ErrMsgGetUniversityFailed = "大学の取得に失敗しました"
)

// UniversityHandler は大学関連のHTTPリクエストを処理するハンドラー
type UniversityHandler struct {
	repo    repositories.IUniversityRepository
	timeout time.Duration
}

// NewUniversityHandler は新しいUniversityHandlerインスタンスを生成
func NewUniversityHandler(repo repositories.IUniversityRepository, timeout time.Duration) *UniversityHandler {
	return &UniversityHandler{
		repo:    repo,
		timeout: timeout,
	}
}

// SetRepo はリポジトリを設定します（テスト用）
func (h *UniversityHandler) SetRepo(repo repositories.IUniversityRepository) {
	h.repo = repo
}

// GetRepo はリポジトリを取得します（テスト用）
func (h *UniversityHandler) GetRepo() repositories.IUniversityRepository {
	return h.repo
}

// handleError はエラーをHTTPレスポンスに変換
func (h *UniversityHandler) handleError(ctx context.Context, c echo.Context, err error) error {
	switch e := err.(type) {
	case *customErrors.Error:
		statusCode := http.StatusInternalServerError

		switch e.Code {
		case customErrors.CodeNotFound:
			statusCode = http.StatusNotFound
		case customErrors.CodeInvalidInput, customErrors.CodeValidationError:
			statusCode = http.StatusBadRequest
		case customErrors.CodeAuthError:
			statusCode = http.StatusUnauthorized
		case customErrors.CodeAuthzError:
			statusCode = http.StatusForbidden
		}

		applogger.Error(ctx, "エラーが発生しました: %v", e)

		return c.JSON(statusCode, map[string]interface{}{
			"code":    e.Code,
			"message": e.Message,
			"details": e.Details,
		})
	default:
		applogger.Error(ctx, "予期せぬエラーが発生しました: %v", err)

		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "サーバー内部でエラーが発生しました",
		})
	}
}

// bindRequest はリクエストボディのバインディング
func (h *UniversityHandler) bindRequest(ctx context.Context, c echo.Context, data interface{}) error {
	if err := c.Bind(data); err != nil {
		applogger.Error(ctx, errorMessages.MsgBindDataFailed, err)
		return customErrors.NewInvalidInputError("request", errorMessages.MsgInvalidRequestBody, nil)
	}

	return nil
}

// GetUniversities は大学一覧を取得
func (h *UniversityHandler) GetUniversities(c echo.Context) error {
	ctx, cancel := context.WithTimeout(c.Request().Context(), h.timeout)
	defer cancel()

	universities, err := h.repo.FindAll(ctx)
	if err != nil {
		applogger.Error(ctx, ErrMsgGetUniversitiesFailed+": %v", err)
		return h.handleError(ctx, c, err)
	}

	applogger.Info(ctx, logging.LogGetUniversitiesSuccess, len(universities))

	return c.JSON(http.StatusOK, universities)
}

// GetUniversity は指定された大学の情報を取得
func (h *UniversityHandler) GetUniversity(c echo.Context) error {
	ctx, cancel := context.WithTimeout(c.Request().Context(), h.timeout)
	defer cancel()

	id, err := validation.ValidateUniversityID(ctx, c.Param("id"))
	if err != nil {
		return h.handleError(ctx, c, err)
	}

	university, err := h.repo.FindByID(id)
	if err != nil {
		applogger.Error(ctx, ErrMsgGetUniversityFailed+": %v", err)
		return h.handleError(ctx, c, err)
	}

	applogger.Info(ctx, logging.LogGetUniversitySuccess, id)

	return c.JSON(http.StatusOK, university)
}

// CreateUniversity は新しい大学を作成します
func (h *UniversityHandler) CreateUniversity(c echo.Context) error {
	ctx, cancel := context.WithTimeout(c.Request().Context(), h.timeout)
	defer cancel()

	var university models.University
	if err := h.bindRequest(ctx, c, &university); err != nil {
		return h.handleError(ctx, c, err)
	}

	if err := h.repo.Create(&university); err != nil {
		applogger.Error(ctx, ErrMsgCreateUniversityFailed+": %v", err)
		return h.handleError(ctx, c, err)
	}

	applogger.Info(ctx, logging.LogCreateUniversitySuccess, university.ID)

	return c.JSON(http.StatusCreated, university)
}

// UpdateUniversity は既存の大学を更新します
func (h *UniversityHandler) UpdateUniversity(c echo.Context) error {
	ctx, cancel := context.WithTimeout(c.Request().Context(), h.timeout)
	defer cancel()

	id, err := validation.ValidateUniversityID(ctx, c.Param("id"))
	if err != nil {
		return h.handleError(ctx, c, err)
	}

	var university models.University
	if err := h.bindRequest(ctx, c, &university); err != nil {
		return h.handleError(ctx, c, err)
	}

	university.ID = id
	if err := h.repo.Update(&university); err != nil {
		applogger.Error(ctx, ErrMsgUpdateUniversityFailed+": %v", err)
		return h.handleError(ctx, c, err)
	}

	applogger.Info(ctx, logging.LogUpdateUniversitySuccess, id)

	return c.JSON(http.StatusOK, university)
}

// DeleteUniversity は大学を削除します
func (h *UniversityHandler) DeleteUniversity(c echo.Context) error {
	ctx, cancel := context.WithTimeout(c.Request().Context(), h.timeout)
	defer cancel()

	id, err := validation.ValidateUniversityID(ctx, c.Param("id"))
	if err != nil {
		return h.handleError(ctx, c, err)
	}

	if err := h.repo.Delete(id); err != nil {
		applogger.Error(ctx, ErrMsgDeleteUniversityFailed+": %v", err)
		return h.handleError(ctx, c, err)
	}

	applogger.Info(ctx, logging.LogDeleteUniversitySuccess, id)

	return c.NoContent(http.StatusNoContent)
}

// GetCSRFToken はCSRFトークンを返します
func (h *UniversityHandler) GetCSRFToken(c echo.Context) error {
	ctx, cancel := context.WithTimeout(c.Request().Context(), h.timeout)
	defer cancel()

	token := c.Get("csrf")
	if token == nil {
		applogger.Error(ctx, ErrMsgCSRFTokenGeneration)

		return h.handleError(ctx, c, customErrors.NewSystemError(ErrMsgCSRFTokenGeneration, nil, nil))
	}

	tokenStr, ok := token.(string)
	if !ok {
		applogger.Error(ctx, ErrMsgCSRFTokenInvalidType)

		return h.handleError(ctx, c, customErrors.NewSystemError(ErrMsgCSRFTokenInvalidType, nil, nil))
	}

	applogger.Info(ctx, logging.LogGetCSRFTokenSuccess)

	return c.JSON(http.StatusOK, map[string]string{
		"token": tokenStr,
	})
}
