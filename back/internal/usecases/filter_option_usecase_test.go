package usecases

import (
	"context"
	"testing"

	"university-exam-api/internal/domain/models"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockFilterOptionRepository はFilterOptionRepositoryのモック実装です
type MockFilterOptionRepository struct {
	mock.Mock
}

// FindAll は全てのフィルターオプションを取得するモック実装です
func (m *MockFilterOptionRepository) FindAll(ctx context.Context) ([]models.FilterOption, error) {
	args := m.Called(ctx)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}

	return args.Get(0).([]models.FilterOption), args.Error(1)
}

// FindByCategory は指定されたカテゴリーのフィルターオプションを取得するモック実装です
func (m *MockFilterOptionRepository) FindByCategory(
	ctx context.Context,
	category string,
) ([]models.FilterOption, error) {
	args := m.Called(ctx, category)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}

	return args.Get(0).([]models.FilterOption), args.Error(1)
}

func TestFilterOptionUsecaseGetAllFilterOptions(t *testing.T) {
	// テストケースの準備
	mockRepo := new(MockFilterOptionRepository)
	usecase := NewFilterOptionUsecase(mockRepo)

	// 期待される結果
	expectedOptions := []models.FilterOption{
		{Name: "テスト1", Category: "REGION"},
		{Name: "テスト2", Category: "PREFECTURE"},
	}

	// モックの設定
	mockRepo.On("FindAll", mock.Anything).Return(expectedOptions, nil)

	// テストの実行
	options, err := usecase.GetAllFilterOptions(context.Background())

	// アサーション
	assert.NoError(t, err)
	assert.Equal(t, expectedOptions, options)
	mockRepo.AssertExpectations(t)
}

func TestFilterOptionUsecaseGetAllFilterOptionsError(t *testing.T) {
	// テストケースの準備
	mockRepo := new(MockFilterOptionRepository)
	usecase := NewFilterOptionUsecase(mockRepo)

	// モックの設定
	mockRepo.On("FindAll", mock.Anything).Return(nil, assert.AnError)

	// テストの実行
	options, err := usecase.GetAllFilterOptions(context.Background())

	// アサーション
	assert.Error(t, err)
	assert.Nil(t, options)
	mockRepo.AssertExpectations(t)
}

func TestFilterOptionUsecaseGetFilterOptionsByCategory(t *testing.T) {
	// テストケースの準備
	mockRepo := new(MockFilterOptionRepository)
	usecase := NewFilterOptionUsecase(mockRepo)

	// 期待される結果
	expectedOptions := []models.FilterOption{
		{Name: "テスト1", Category: "REGION"},
	}

	// モックの設定
	mockRepo.On("FindByCategory", mock.Anything, "REGION").Return(expectedOptions, nil)

	// テストの実行
	options, err := usecase.GetFilterOptionsByCategory(context.Background(), "REGION")

	// アサーション
	assert.NoError(t, err)
	assert.Equal(t, expectedOptions, options)
	mockRepo.AssertExpectations(t)
}

func TestFilterOptionUsecaseGetFilterOptionsByCategoryError(t *testing.T) {
	// テストケースの準備
	mockRepo := new(MockFilterOptionRepository)
	usecase := NewFilterOptionUsecase(mockRepo)

	// モックの設定
	mockRepo.On("FindByCategory", mock.Anything, "REGION").Return(nil, assert.AnError)

	// テストの実行
	options, err := usecase.GetFilterOptionsByCategory(context.Background(), "REGION")

	// アサーション
	assert.Error(t, err)
	assert.Nil(t, options)
	mockRepo.AssertExpectations(t)
}
