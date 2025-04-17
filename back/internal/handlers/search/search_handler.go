// Package search は検索関連のHTTPリクエストを処理するパッケージです。
// このパッケージは以下の機能を提供します：
// - 大学の検索機能
// - 検索クエリのバリデーション
// - エラーハンドリング
// - ログ記録
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

// Handler は検索関連のHTTPリクエストを処理する構造体です。
// この構造体は以下の機能を提供します：
// - リポジトリとの連携
// - リクエストタイムアウトの管理
// - エラーハンドリング
type Handler struct {
	repo    repositories.IUniversityRepository
	timeout time.Duration
}

// NewSearchHandler は新しいHandlerインスタンスを生成します。
// この関数は以下の処理を行います：
// - リポジトリの初期化
// - タイムアウトの設定
// - ハンドラーの初期化
func NewSearchHandler(repo repositories.IUniversityRepository, timeout time.Duration) *Handler {
	return &Handler{
		repo:    repo,
		timeout: timeout,
	}
}

// validateSearchQuery は検索クエリのバリデーションを共通化します。
// この関数は以下の処理を行います：
// - クエリの空白除去
// - 必須チェック
// - 文字数制限の検証
// - 不正文字の検証
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

// SearchUniversities は大学を検索します。
// この関数は以下の処理を行います：
// - 検索クエリの取得とバリデーション
// - データベースからの検索
// - 検索結果の整形
// - エラーハンドリング
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
