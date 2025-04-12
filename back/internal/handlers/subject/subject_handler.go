// Package subject は科目関連のHTTPリクエストを処理するパッケージです。
// このパッケージは、科目の作成、取得、更新、削除などの操作を提供します。
package subject

import (
	"context"
	"net/http"
	"time"
	"university-exam-api/internal/domain/models"
	applogger "university-exam-api/internal/logger"
	"university-exam-api/internal/pkg/errors"
	"university-exam-api/internal/pkg/logging"
	"university-exam-api/internal/pkg/validation"
	"university-exam-api/internal/repositories"

	"github.com/labstack/echo/v4"
)

const (
	// ErrMsgSubjectNameRequired は科目名が未入力の場合のエラーメッセージです
	ErrMsgSubjectNameRequired   = "科目名は必須です"
	// ErrMsgSubjectNameLength は科目名の長さが制限を超えた場合のエラーメッセージです
	ErrMsgSubjectNameLength    = "科目名は100文字以内で入力してください"
	// ErrMsgTestTypeIDRequired は試験種別IDが未入力の場合のエラーメッセージです
	ErrMsgTestTypeIDRequired   = "試験種別IDは必須です"
	// ErrMsgBatchUpdateFailed は科目の一括更新に失敗した場合のエラーメッセージです
	ErrMsgBatchUpdateFailed    = "科目の一括更新に失敗しました"
)

// Handler は科目関連のHTTPリクエストを処理
type Handler struct {
	repo    repositories.IUniversityRepository
	timeout time.Duration
}

// NewSubjectHandler は新しいHandlerインスタンスを生成
func NewSubjectHandler(repo repositories.IUniversityRepository, timeout time.Duration) *Handler {
	return &Handler{
		repo:    repo,
		timeout: timeout,
	}
}

// bindRequest はリクエストボディのバインディングを共通化
func (h *Handler) bindRequest(ctx context.Context, c echo.Context, data interface{}) error {
	if err := c.Bind(data); err != nil {
		applogger.Error(ctx, errors.MsgBindRequestFailed, err)
		return errors.HandleError(c, err)
	}

	return nil
}

// validateSubjectRequest は科目リクエストのバリデーションを共通化
func (h *Handler) validateSubjectRequest(subject *models.Subject) error {
	if subject.Name == "" {
		return errors.NewValidationError(ErrMsgSubjectNameRequired)
	}

	if len(subject.Name) > 100 {
		return errors.NewValidationError(ErrMsgSubjectNameLength)
	}

	if subject.TestTypeID == 0 {
		return errors.NewValidationError(ErrMsgTestTypeIDRequired)
	}

	return nil
}

// GetSubject は指定された科目の情報を取得
func (h *Handler) GetSubject(c echo.Context) error {
	ctx, cancel := context.WithTimeout(c.Request().Context(), h.timeout)
	defer cancel()

	departmentID, err := validation.ValidateDepartmentID(ctx, c.Param("departmentId"))
	if err != nil {
		return errors.HandleError(c, err)
	}

	subjectID, err := validation.ValidateSubjectID(ctx, c.Param("subjectId"))
	if err != nil {
		return errors.HandleError(c, err)
	}

	subject, err := h.repo.FindSubject(departmentID, subjectID)
	if err != nil {
		applogger.Error(ctx, "科目の取得に失敗しました (学部ID: %d, 科目ID: %d): %v", departmentID, subjectID, err)
		return errors.HandleError(c, err)
	}

	applogger.Info(ctx, logging.LogGetSubjectSuccess, departmentID, subjectID)

	return c.JSON(http.StatusOK, map[string]interface{}{
		"data": subject,
	})
}

// CreateSubject は新しい科目を作成
func (h *Handler) CreateSubject(c echo.Context) error {
	ctx, cancel := context.WithTimeout(c.Request().Context(), h.timeout)
	defer cancel()

	departmentID, err := validation.ValidateDepartmentID(ctx, c.Param("departmentId"))
	if err != nil {
		return errors.HandleError(c, err)
	}

	var subject models.Subject
	if err := h.bindRequest(ctx, c, &subject); err != nil {
		return err
	}

	if err := h.validateSubjectRequest(&subject); err != nil {
		return errors.HandleError(c, err)
	}

	subject.TestTypeID = departmentID
	if err := h.repo.CreateSubject(&subject); err != nil {
		applogger.Error(ctx, "科目の作成に失敗しました: %v", err)
		return errors.HandleError(c, err)
	}

	applogger.Info(ctx, logging.LogCreateSubjectSuccess, subject.ID)

	return c.JSON(http.StatusCreated, map[string]interface{}{
		"data": subject,
	})
}

// UpdateSubject は既存の科目を更新
func (h *Handler) UpdateSubject(c echo.Context) error {
	ctx, cancel := context.WithTimeout(c.Request().Context(), h.timeout)
	defer cancel()

	subjectID, err := validation.ValidateSubjectID(ctx, c.Param("subjectId"))
	if err != nil {
		return errors.HandleError(c, err)
	}

	var subject models.Subject
	if err := h.bindRequest(ctx, c, &subject); err != nil {
		return err
	}

	if err := h.validateSubjectRequest(&subject); err != nil {
		return errors.HandleError(c, err)
	}

	subject.ID = subjectID
	if err := h.repo.UpdateSubject(&subject); err != nil {
		applogger.Error(ctx, "科目ID %dの更新に失敗しました: %v", subjectID, err)
		return errors.HandleError(c, err)
	}

	applogger.Info(ctx, logging.LogUpdateSubjectSuccess, subjectID)

	return c.JSON(http.StatusOK, map[string]interface{}{
		"data": subject,
	})
}

// DeleteSubject は科目を削除
func (h *Handler) DeleteSubject(c echo.Context) error {
	ctx, cancel := context.WithTimeout(c.Request().Context(), h.timeout)
	defer cancel()

	subjectID, err := validation.ValidateSubjectID(ctx, c.Param("subjectId"))
	if err != nil {
		return errors.HandleError(c, err)
	}

	if err := h.repo.DeleteSubject(subjectID); err != nil {
		applogger.Error(ctx, "科目ID %dの削除に失敗しました: %v", subjectID, err)
		return errors.HandleError(c, err)
	}

	applogger.Info(ctx, logging.LogDeleteSubjectSuccess, subjectID)

	return c.NoContent(http.StatusNoContent)
}

// UpdateSubjectsBatch は複数の科目を一括で更新
func (h *Handler) UpdateSubjectsBatch(c echo.Context) error {
	ctx, cancel := context.WithTimeout(c.Request().Context(), h.timeout)
	defer cancel()

	departmentID, err := validation.ValidateDepartmentID(ctx, c.Param("departmentId"))
	if err != nil {
		return errors.HandleError(c, err)
	}

	var subjects []models.Subject
	if err := h.bindRequest(ctx, c, &subjects); err != nil {
		return err
	}

	for i := range subjects {
		subjects[i].TestTypeID = departmentID
		if err := h.validateSubjectRequest(&subjects[i]); err != nil {
			return errors.HandleError(c, err)
		}
	}

	if err := h.repo.UpdateSubjectsBatch(departmentID, subjects); err != nil {
		applogger.Error(ctx, ErrMsgBatchUpdateFailed+": %v", err)
		return errors.HandleError(c, err)
	}

	applogger.Info(ctx, logging.LogBatchUpdateSubjectSuccess)

	return c.JSON(http.StatusOK, map[string]interface{}{
		"data": subjects,
		"meta": map[string]interface{}{
			"count":     len(subjects),
			"timestamp": time.Now().Unix(),
		},
	})
}
