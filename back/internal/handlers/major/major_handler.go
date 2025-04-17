// Package major は学科関連のHTTPリクエストを処理するハンドラーを提供します。
// このパッケージは以下の機能を提供します：
// - 学科の取得、作成、更新、削除
// - リクエストのバリデーション
// - エラーハンドリング
// - ログ記録
package major

import (
	"context"
	"net/http"
	"time"
	"university-exam-api/internal/domain/models"
	applogger "university-exam-api/internal/logger"
	"university-exam-api/internal/pkg/errors"
	"university-exam-api/internal/pkg/validation"
	"university-exam-api/internal/repositories"

	"github.com/labstack/echo/v4"
)

const (
	logGetMajorSuccess    = "学科の取得に成功しました (学部ID: %d, 学科ID: %d)"
	logCreateMajorSuccess = "学科の作成に成功しました (ID: %d)"
	logUpdateMajorSuccess = "学科の更新に成功しました (ID: %d)"
	logDeleteMajorSuccess = "学科の削除に成功しました (ID: %d)"
)

// Handler は学科関連のHTTPリクエストを処理する構造体です。
// この構造体は以下の機能を提供します：
// - リポジトリとの連携
// - リクエストタイムアウトの管理
// - エラーハンドリング
type Handler struct {
	repo    repositories.IUniversityRepository
	timeout time.Duration
}

// NewMajorHandler は新しいHandlerインスタンスを生成します。
// この関数は以下の処理を行います：
// - リポジトリの初期化
// - タイムアウトの設定
// - ハンドラーの初期化
func NewMajorHandler(repo repositories.IUniversityRepository, timeout time.Duration) *Handler {
	return &Handler{
		repo:    repo,
		timeout: timeout,
	}
}

// bindRequest はリクエストボディのバインディングを共通化します。
// この関数は以下の処理を行います：
// - リクエストボディのバインディング
// - エラーログの記録
// - バリデーションエラーの生成
func (h *Handler) bindRequest(ctx context.Context, c echo.Context, data interface{}) error {
	if err := c.Bind(data); err != nil {
		applogger.Error(ctx, "リクエストのバインドに失敗しました: %v", err)
		return errors.HandleError(c, err)
	}

	return nil
}

// validateMajorRequest は学科リクエストのバリデーションを共通化します。
// この関数は以下の処理を行います：
// - 学科名の検証
// - 学部IDの検証
// - エラーメッセージの生成
func (h *Handler) validateMajorRequest(major *models.Major) error {
	if major.Name == "" {
		return errors.NewValidationError("学科名は必須です")
	}

	if len(major.Name) > 100 {
		return errors.NewValidationError("学科名は100文字以内で入力してください")
	}

	if major.DepartmentID == 0 {
		return errors.NewValidationError("学部IDは必須です")
	}

	return nil
}

// validateDepartmentAndMajorID は学部IDと学科IDのバリデーションを共通化します。
// この関数は以下の処理を行います：
// - 学部IDの検証
// - 学科IDの検証
// - エラーハンドリング
func (h *Handler) validateDepartmentAndMajorID(ctx context.Context, c echo.Context) (uint, uint, error) {
	departmentID, err := validation.ValidateDepartmentID(ctx, c.Param("departmentId"))
	if err != nil {
		return 0, 0, err
	}

	majorID, err := validation.ValidateMajorID(ctx, c.Param("majorId"))
	if err != nil {
		return 0, 0, err
	}

	return departmentID, majorID, nil
}

// GetMajor は指定された学科の情報を取得します。
// この関数は以下の処理を行います：
// - パラメータの検証
// - データベースからの取得
// - エラーハンドリング
func (h *Handler) GetMajor(c echo.Context) error {
	ctx, cancel := context.WithTimeout(c.Request().Context(), h.timeout)
	defer cancel()

	departmentID, majorID, err := h.validateDepartmentAndMajorID(ctx, c)
	if err != nil {
		return errors.HandleError(c, err)
	}

	major, err := h.repo.FindMajor(departmentID, majorID)
	if err != nil {
		applogger.Error(ctx, "学科の取得に失敗しました (学部ID: %d, 学科ID: %d): %v", departmentID, majorID, err)
		return errors.HandleError(c, err)
	}

	applogger.Info(ctx, logGetMajorSuccess, departmentID, majorID)

	return c.JSON(http.StatusOK, map[string]interface{}{
		"data": major,
	})
}

// CreateMajor は新しい学科を作成します。
// この関数は以下の処理を行います：
// - リクエストのバリデーション
// - データベースへの保存
// - エラーハンドリング
func (h *Handler) CreateMajor(c echo.Context) error {
	ctx, cancel := context.WithTimeout(c.Request().Context(), h.timeout)
	defer cancel()

	departmentID, err := validation.ValidateDepartmentID(ctx, c.Param("departmentId"))
	if err != nil {
		return errors.HandleError(c, err)
	}

	var major models.Major
	if err := h.bindRequest(ctx, c, &major); err != nil {
		return err
	}

	if err := h.validateMajorRequest(&major); err != nil {
		return errors.HandleError(c, err)
	}

	major.DepartmentID = departmentID
	if err := h.repo.CreateMajor(&major); err != nil {
		applogger.Error(ctx, "学科の作成に失敗しました: %v", err)
		return errors.HandleError(c, err)
	}

	applogger.Info(ctx, logCreateMajorSuccess, major.ID)

	return c.JSON(http.StatusCreated, map[string]interface{}{
		"data": major,
	})
}

// UpdateMajor は既存の学科を更新します。
// この関数は以下の処理を行います：
// - パラメータの検証
// - リクエストのバリデーション
// - データベースの更新
// - エラーハンドリング
func (h *Handler) UpdateMajor(c echo.Context) error {
	ctx, cancel := context.WithTimeout(c.Request().Context(), h.timeout)
	defer cancel()

	majorID, err := validation.ValidateMajorID(ctx, c.Param("majorId"))
	if err != nil {
		return errors.HandleError(c, err)
	}

	var major models.Major
	if err := h.bindRequest(ctx, c, &major); err != nil {
		return err
	}

	if err := h.validateMajorRequest(&major); err != nil {
		return errors.HandleError(c, err)
	}

	major.ID = majorID
	if err := h.repo.UpdateMajor(&major); err != nil {
		applogger.Error(ctx, "学科ID %dの更新に失敗しました: %v", majorID, err)
		return errors.HandleError(c, err)
	}

	applogger.Info(ctx, logUpdateMajorSuccess, majorID)

	return c.JSON(http.StatusOK, map[string]interface{}{
		"data": major,
	})
}

// DeleteMajor は学科を削除します。
// この関数は以下の処理を行います：
// - パラメータの検証
// - データベースからの削除
// - エラーハンドリング
func (h *Handler) DeleteMajor(c echo.Context) error {
	ctx, cancel := context.WithTimeout(c.Request().Context(), h.timeout)
	defer cancel()

	majorID, err := validation.ValidateMajorID(ctx, c.Param("majorId"))
	if err != nil {
		return errors.HandleError(c, err)
	}

	if err := h.repo.DeleteMajor(majorID); err != nil {
		applogger.Error(ctx, "学科ID %dの削除に失敗しました: %v", majorID, err)
		return errors.HandleError(c, err)
	}

	applogger.Info(ctx, logDeleteMajorSuccess, majorID)

	return c.NoContent(http.StatusNoContent)
}
