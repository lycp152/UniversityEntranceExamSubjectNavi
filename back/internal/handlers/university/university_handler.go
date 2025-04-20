// Package university は大学関連のHTTPリクエストを処理するパッケージです。
// このパッケージは以下の機能を提供します：
// - 大学の作成、取得、更新、削除
// - 大学のバリデーション
// - エラーハンドリング
// - ログ記録
package university

import (
	"context"
	"net/http"
	"time"
	"university-exam-api/internal/domain/models"
	customErrors "university-exam-api/internal/errors"
	applogger "university-exam-api/internal/logger"
	errorMessages "university-exam-api/internal/pkg/errors"
	"university-exam-api/internal/pkg/validation"
	"university-exam-api/internal/repositories"

	"github.com/labstack/echo/v4"
)

const (
	// ErrMsgUniversityNotFound は大学が見つからない場合のエラーメッセージです
	ErrMsgUniversityNotFound = "大学が見つかりません: %s"
	// ErrMsgInvalidUniversityID は大学IDの形式が不正な場合のエラーメッセージです
	ErrMsgInvalidUniversityID = "大学IDの形式が不正です"
	// ErrMsgCreateUniversityFailed は大学の作成に失敗した場合のエラーメッセージです
	ErrMsgCreateUniversityFailed = "大学の作成に失敗しました"
	// ErrMsgUpdateUniversityFailed は大学の更新に失敗した場合のエラーメッセージです
	ErrMsgUpdateUniversityFailed = "大学の更新に失敗しました"
	// ErrMsgDeleteUniversityFailed は大学の削除に失敗した場合のエラーメッセージです
	ErrMsgDeleteUniversityFailed = "大学の削除に失敗しました"
	// ErrMsgCSRFTokenGeneration はCSRFトークンの生成に失敗した場合のエラーメッセージです
	// #nosec G101 - これは認証情報ではなく、エラーメッセージです
	ErrMsgCSRFTokenGeneration = "CSRFトークンの生成に失敗しました"
	// ErrMsgCSRFTokenInvalidType はCSRFトークンの型が不正な場合のエラーメッセージです
	// #nosec G101 - これは認証情報ではなく、エラーメッセージです
	ErrMsgCSRFTokenInvalidType = "CSRFトークンの型が不正です"
	// ErrMsgGetUniversitiesFailed は大学一覧の取得に失敗した場合のエラーメッセージです
	ErrMsgGetUniversitiesFailed = "大学一覧の取得に失敗しました"
	// ErrMsgGetUniversityFailed は大学の取得に失敗した場合のエラーメッセージです
	ErrMsgGetUniversityFailed = "大学の取得に失敗しました"
)

// Handler は大学関連のHTTPリクエストを処理する構造体です。
// この構造体は以下の機能を提供します：
// - リポジトリとの連携
// - リクエストタイムアウトの管理
// - エラーハンドリング
type Handler struct {
	repo    repositories.IUniversityRepository
	timeout time.Duration
}

// NewUniversityHandler は新しいHandlerインスタンスを生成します。
// この関数は以下の処理を行います：
// - リポジトリの初期化
// - タイムアウトの設定
// - ハンドラーの初期化
func NewUniversityHandler(repo repositories.IUniversityRepository, timeout time.Duration) *Handler {
	return &Handler{
		repo:    repo,
		timeout: timeout,
	}
}

// SetRepo はリポジトリを設定します（テスト用）。
// この関数は以下の処理を行います：
// - リポジトリの設定
// - テスト用の機能提供
func (h *Handler) SetRepo(repo repositories.IUniversityRepository) {
	h.repo = repo
}

// GetRepo はリポジトリを取得します（テスト用）。
// この関数は以下の処理を行います：
// - リポジトリの取得
// - テスト用の機能提供
func (h *Handler) GetRepo() repositories.IUniversityRepository {
	return h.repo
}

// handleError はエラーをHTTPレスポンスに変換します。
// この関数は以下の処理を行います：
// - エラーの種類に応じたステータスコードの設定
// - エラーメッセージの整形
// - ログ記録
func (h *Handler) handleError(ctx context.Context, c echo.Context, err error) error {
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

// bindRequest はリクエストボディのバインディングを共通化します。
// この関数は以下の処理を行います：
// - リクエストボディのバインディング
// - エラーハンドリング
// - ログ記録
func (h *Handler) bindRequest(ctx context.Context, c echo.Context, data interface{}) error {
	if err := c.Bind(data); err != nil {
		applogger.Error(ctx, errorMessages.MsgBindDataFailed, err)
		return customErrors.NewInvalidInputError("request", errorMessages.MsgInvalidRequestBody, nil)
	}

	return nil
}

// GetUniversities は大学一覧を取得します。
// この関数は以下の処理を行います：
// - 大学一覧の取得
// - エラーハンドリング
// - ログ記録
func (h *Handler) GetUniversities(c echo.Context) error {
	ctx, cancel := context.WithTimeout(c.Request().Context(), h.timeout)
	defer cancel()

	universities, err := h.repo.FindAll(ctx)
	if err != nil {
		applogger.Error(ctx, ErrMsgGetUniversitiesFailed+": %v", err)
		return h.handleError(ctx, c, err)
	}

	applogger.Info(ctx, applogger.LogGetUniversitiesSuccess, len(universities))

	return c.JSON(http.StatusOK, universities)
}

// GetUniversity は指定された大学の情報を取得します。
// この関数は以下の処理を行います：
// - 大学IDのバリデーション
// - 大学情報の取得
// - エラーハンドリング
func (h *Handler) GetUniversity(c echo.Context) error {
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

	applogger.Info(ctx, applogger.LogGetUniversitySuccess, id)

	return c.JSON(http.StatusOK, university)
}

// CreateUniversity は新しい大学を作成します。
// この関数は以下の処理を行います：
// - リクエストボディのバインディング
// - 大学の作成
// - エラーハンドリング
func (h *Handler) CreateUniversity(c echo.Context) error {
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

	applogger.Info(ctx, applogger.LogCreateUniversitySuccess, university.ID)

	return c.JSON(http.StatusCreated, university)
}

// UpdateUniversity は既存の大学を更新します。
// この関数は以下の処理を行います：
// - 大学IDのバリデーション
// - リクエストボディのバインディング
// - 大学の更新
// - エラーハンドリング
func (h *Handler) UpdateUniversity(c echo.Context) error {
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

	applogger.Info(ctx, applogger.LogUpdateUniversitySuccess, id)

	return c.JSON(http.StatusOK, university)
}

// DeleteUniversity は大学を削除します。
// この関数は以下の処理を行います：
// - 大学IDのバリデーション
// - 大学の削除
// - エラーハンドリング
func (h *Handler) DeleteUniversity(c echo.Context) error {
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

	applogger.Info(ctx, applogger.LogDeleteUniversitySuccess, id)

	return c.NoContent(http.StatusNoContent)
}

// GetCSRFToken はCSRFトークンを返します。
// この関数は以下の処理を行います：
// - CSRFトークンの取得
// - トークンの型チェック
// - エラーハンドリング
func (h *Handler) GetCSRFToken(c echo.Context) error {
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

	applogger.Info(ctx, applogger.LogGetCSRFTokenSuccess)

	return c.JSON(http.StatusOK, map[string]string{
		"token": tokenStr,
	})
}
