// Package usecases はアプリケーションのユースケース層を提供します。
// このパッケージには以下の機能が含まれます：
// 1. フィルターオプションの取得
// 2. カテゴリ別のフィルターオプションの取得
package usecases

import (
	"context"
	"university-exam-api/internal/domain/models"
	"university-exam-api/internal/repositories"
)

// FilterOptionUsecase はフィルターオプションのユースケースインターフェースです
type FilterOptionUsecase interface {
	GetAllFilterOptions(ctx context.Context) ([]models.FilterOption, error)
	GetFilterOptionsByCategory(ctx context.Context, category string) ([]models.FilterOption, error)
}

// filterOptionUsecase はFilterOptionUsecaseの実装です
type filterOptionUsecase struct {
	repo repositories.FilterOptionRepository
}

// NewFilterOptionUsecase は新しいFilterOptionUsecaseを作成します
func NewFilterOptionUsecase(repo repositories.FilterOptionRepository) FilterOptionUsecase {
	return &filterOptionUsecase{repo: repo}
}

// GetAllFilterOptions は全てのフィルターオプションを取得します
func (u *filterOptionUsecase) GetAllFilterOptions(ctx context.Context) ([]models.FilterOption, error) {
	return u.repo.FindAll(ctx)
}

// GetFilterOptionsByCategory は指定されたカテゴリーのフィルターオプションを取得します
func (u *filterOptionUsecase) GetFilterOptionsByCategory(
	ctx context.Context,
	category string,
) ([]models.FilterOption, error) {
	return u.repo.FindByCategory(ctx, category)
}
