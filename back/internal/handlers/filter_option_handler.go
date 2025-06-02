// Package handlers はHTTPリクエストを処理するハンドラーを提供します。
// このパッケージには以下の機能が含まれます：
// 1. フィルターオプションの取得
// 2. カテゴリ別のフィルターオプションの取得
package handlers

import (
	"net/http"
	"university-exam-api/internal/usecases"

	"github.com/labstack/echo/v4"
)

// FilterOptionHandler はフィルターオプションのハンドラーです
type FilterOptionHandler struct {
	usecase usecases.FilterOptionUsecase
}

// NewFilterOptionHandler は新しいFilterOptionHandlerを作成します
func NewFilterOptionHandler(usecase usecases.FilterOptionUsecase) *FilterOptionHandler {
	return &FilterOptionHandler{usecase: usecase}
}

// RegisterRoutes はルートを登録します
// 注意: このメソッドは単純なルーティング設定のみを行い、ビジネスロジックを含まないため、
// テスト対象外としています。Echoフレームワークの機能に依存しており、
// フレームワーク自体のテストに任せるべき処理です。
//
//go:noinline
func (h *FilterOptionHandler) RegisterRoutes(e *echo.Echo) {
	e.GET("/api/filter-options", h.GetAllFilterOptions)
	e.GET("/api/filter-options/:category", h.GetFilterOptionsByCategory)
}

// GetAllFilterOptions は全てのフィルターオプションを取得するハンドラーです
func (h *FilterOptionHandler) GetAllFilterOptions(c echo.Context) error {
	options, err := h.usecase.GetAllFilterOptions(c.Request().Context())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "フィルターオプションの取得に失敗しました",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"data": options,
	})
}

// GetFilterOptionsByCategory は指定されたカテゴリーのフィルターオプションを取得するハンドラーです
func (h *FilterOptionHandler) GetFilterOptionsByCategory(c echo.Context) error {
	category := c.Param("category")
	options, err := h.usecase.GetFilterOptionsByCategory(c.Request().Context(), category)

	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "フィルターオプションの取得に失敗しました",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"data": options,
	})
}
