package repositories

import (
	"context"
	"university-exam-api/internal/domain/models"

	"gorm.io/gorm"
)

// FilterOptionRepository はフィルターオプションのリポジトリインターフェースです
type FilterOptionRepository interface {
	FindAll(ctx context.Context) ([]models.FilterOption, error)
	FindByCategory(ctx context.Context, category string) ([]models.FilterOption, error)
}

// filterOptionRepository はFilterOptionRepositoryの実装です
type filterOptionRepository struct {
	db *gorm.DB
}

// NewFilterOptionRepository は新しいFilterOptionRepositoryを作成します
func NewFilterOptionRepository(db *gorm.DB) FilterOptionRepository {
	return &filterOptionRepository{db: db}
}

// FindAll は全てのフィルターオプションを取得します
func (r *filterOptionRepository) FindAll(ctx context.Context) ([]models.FilterOption, error) {
	var options []models.FilterOption
	if err := r.db.WithContext(ctx).Preload("Children").Find(&options).Error; err != nil {
		return nil, err
	}

	return options, nil
}

// FindByCategory は指定されたカテゴリーのフィルターオプションを取得します
func (r *filterOptionRepository) FindByCategory(ctx context.Context, category string) ([]models.FilterOption, error) {
	var options []models.FilterOption
	if err := r.db.WithContext(ctx).Preload("Children").Where("category = ?", category).Find(&options).Error; err != nil {
		return nil, err
	}

	return options, nil
}
