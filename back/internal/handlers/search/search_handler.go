// Package search は検索関連のHTTPリクエストを処理するパッケージです。
// このパッケージは、大学の検索機能を提供します。
package search

import (
	"context"
	"net/http"
	"strings"
	"time"
	applogger "university-exam-api/internal/logger"
	errorHandler "university-exam-api/internal/pkg/errors"
	"university-exam-api/internal/repositories"

	"github.com/labstack/echo/v4"
)

const (
	maxQueryLength = 100
)

// Handler は検索関連のHTTPリクエストを処理
type Handler struct {
	repo    repositories.IUniversityRepository
	timeout time.Duration
}

// NewSearchHandler は新しいHandlerインスタンスを生成
func NewSearchHandler(repo repositories.IUniversityRepository, timeout time.Duration) *Handler {
	return &Handler{
		repo:    repo,
		timeout: timeout,
	}
}

// validateSearchQuery は検索クエリのバリデーションを共通化
func (h *Handler) validateSearchQuery(query string) error {
	query = strings.TrimSpace(query)

	if query == "" {
		return errorHandler.NewValidationError("検索クエリは必須です")
	}

	if len(query) > maxQueryLength {
		return errorHandler.NewValidationError("検索クエリは100文字以内で入力してください")
	}

	if strings.ContainsAny(query, ";%") {
		return errorHandler.NewValidationError("検索クエリに不正な文字が含まれています")
	}

	return nil
}

// SearchUniversities は大学を検索
func (h *Handler) SearchUniversities(c echo.Context) error {
	ctx, cancel := context.WithTimeout(c.Request().Context(), h.timeout)
	defer cancel()

	query := strings.TrimSpace(c.QueryParam("q"))

	if err := h.validateSearchQuery(query); err != nil {
		applogger.Error(ctx, "検索クエリのバリデーションに失敗しました: %v", err)
		return errorHandler.HandleError(c, err)
	}

	applogger.Info(ctx, "大学の検索を開始します: query=%s", query)
	universities, err := h.repo.Search(query)

	if err != nil {
		applogger.Error(ctx, "検索クエリ '%s' での大学検索に失敗しました: %v", query, err)
		return errorHandler.HandleError(c, err)
	}

	applogger.Info(ctx, applogger.LogSearchUniversitiesSuccess, query, len(universities))

	return c.JSON(http.StatusOK, map[string]interface{}{
		"data": universities,
		"meta": map[string]interface{}{
			"query":     query,
			"count":     len(universities),
			"timestamp": time.Now().Unix(),
		},
	})
}
