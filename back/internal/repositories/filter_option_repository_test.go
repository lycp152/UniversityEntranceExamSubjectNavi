package repositories

import (
	"context"
	"testing"
	"university-exam-api/internal/domain/models"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

const (
	testDBMemory = ":memory:"
)

// setupFilterOptionTestDB はテスト用のデータベースをセットアップします
func setupFilterOptionTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(testDBMemory), &gorm.Config{})
	require.NoError(t, err)

	// マイグレーションの実行
	err = db.AutoMigrate(&models.FilterOption{})
	require.NoError(t, err)

	return db
}

// createTestFilterOptions はテスト用のフィルターオプションを作成します
func createTestFilterOptions() []models.FilterOption {
	return []models.FilterOption{
		{
			BaseModel: models.BaseModel{Version: 1},
			Category:  "REGION",
			Name:      "関東",
			DisplayOrder: 1,
		},
		{
			BaseModel: models.BaseModel{Version: 1},
			Category:  "PREFECTURE",
			Name:      "東京",
			DisplayOrder: 1,
		},
		{
			BaseModel: models.BaseModel{Version: 1},
			Category:  "SCHEDULE",
			Name:      "前",
			DisplayOrder: 1,
		},
		{
			BaseModel: models.BaseModel{Version: 1},
			Category:  "ACADEMIC_FIELD",
			Name:      "工学",
			DisplayOrder: 1,
		},
		{
			BaseModel: models.BaseModel{Version: 1},
			Category:  "CLASSIFICATION",
			Name:      "国公立",
			DisplayOrder: 1,
		},
	}
}

// createTestFilterOptionChildren はテスト用の子フィルターオプションを作成します
func createTestFilterOptionChildren(parentID uint) []models.FilterOption {
	return []models.FilterOption{
		{
			BaseModel: models.BaseModel{Version: 1},
			Category:  "PREFECTURE",
			Name:      "東京",
			DisplayOrder: 1,
			ParentID:    &parentID,
		},
		{
			BaseModel: models.BaseModel{Version: 1},
			Category:  "PREFECTURE",
			Name:      "神奈川",
			DisplayOrder: 2,
			ParentID:    &parentID,
		},
	}
}

// setupTestData はテストデータをセットアップします
func setupTestData(t *testing.T, db *gorm.DB) {
	// 親フィルターオプションの作成
	parent := models.FilterOption{
		BaseModel: models.BaseModel{Version: 1},
		Category:  "REGION",
		Name:      "関東",
		DisplayOrder: 1,
	}
	err := db.Create(&parent).Error
	require.NoError(t, err)

	// 子フィルターオプションの作成
	children := createTestFilterOptionChildren(parent.ID)
	for _, child := range children {
		err := db.Create(&child).Error
		require.NoError(t, err)
	}
}

// TestNewFilterOptionRepository はNewFilterOptionRepositoryのテストを実行します
func TestNewFilterOptionRepository(t *testing.T) {
	db := setupFilterOptionTestDB(t)
	repo := NewFilterOptionRepository(db)

	assert.NotNil(t, repo, "リポジトリがnilであってはいけません")
}

// TestFilterOptionRepositoryFindAll はFindAllのテストを実行します
func TestFilterOptionRepositoryFindAll(t *testing.T) {
	db := setupFilterOptionTestDB(t)
	repo := NewFilterOptionRepository(db)

	// テストデータのセットアップ
	options := createTestFilterOptions()
	for _, option := range options {
		err := db.Create(&option).Error
		require.NoError(t, err)
	}

	tests := []struct {
		name    string
		want    int
		wantErr bool
	}{
		{
			name:    "全てのフィルターオプションを取得",
			want:    5,
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := repo.FindAll(context.Background())
			if tt.wantErr {
				assert.Error(t, err)
				return
			}

			assert.NoError(t, err)
			assert.Len(t, got, tt.want)
		})
	}
}

// TestFilterOptionRepositoryFindAllDBError はFindAllのデータベースエラー時のテストを実行します
func TestFilterOptionRepositoryFindAllDBError(t *testing.T) {
	// 無効なデータベース接続を作成
	db, err := gorm.Open(sqlite.Open(testDBMemory), &gorm.Config{})
	require.NoError(t, err)

	if err := db.Migrator().DropTable(&models.FilterOption{}); err != nil {
		t.Fatalf("テーブルの削除に失敗しました: %v", err)
	}

	repo := NewFilterOptionRepository(db)
	_, err = repo.FindAll(context.Background())
	assert.Error(t, err)
}

// TestFilterOptionRepositoryFindByCategory はFindByCategoryのテストを実行します
func TestFilterOptionRepositoryFindByCategory(t *testing.T) {
	db := setupFilterOptionTestDB(t)
	repo := NewFilterOptionRepository(db)

	// テストデータのセットアップ
	options := createTestFilterOptions()
	for _, option := range options {
		err := db.Create(&option).Error
		require.NoError(t, err)
	}

	tests := []struct {
		name     string
		category string
		want     int
		wantErr  bool
	}{
		{
			name:     "地域カテゴリのフィルターオプションを取得",
			category: "REGION",
			want:     1,
			wantErr:  false,
		},
		{
			name:     "都道府県カテゴリのフィルターオプションを取得",
			category: "PREFECTURE",
			want:     1,
			wantErr:  false,
		},
		{
			name:     "日程カテゴリのフィルターオプションを取得",
			category: "SCHEDULE",
			want:     1,
			wantErr:  false,
		},
		{
			name:     "学問系統カテゴリのフィルターオプションを取得",
			category: "ACADEMIC_FIELD",
			want:     1,
			wantErr:  false,
		},
		{
			name:     "分類カテゴリのフィルターオプションを取得",
			category: "CLASSIFICATION",
			want:     1,
			wantErr:  false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := repo.FindByCategory(context.Background(), tt.category)
			if tt.wantErr {
				assert.Error(t, err)
				return
			}

			assert.NoError(t, err)
			assert.Len(t, got, tt.want)

			for _, option := range got {
				assert.Equal(t, tt.category, option.Category)
			}
		})
	}
}

// TestFilterOptionRepositoryFindByCategory_NotFound は存在しないカテゴリでのFindByCategoryのテストを実行します
func TestFilterOptionRepositoryFindByCategoryNotFound(t *testing.T) {
	db := setupFilterOptionTestDB(t)
	repo := NewFilterOptionRepository(db)

	got, err := repo.FindByCategory(context.Background(), "INVALID_CATEGORY")
	assert.NoError(t, err)
	assert.Empty(t, got)
}

// TestFilterOptionRepositoryFindByCategoryDBError はFindByCategoryのデータベースエラー時のテストを実行します
func TestFilterOptionRepositoryFindByCategoryDBError(t *testing.T) {
	// 無効なデータベース接続を作成
	db, err := gorm.Open(sqlite.Open(testDBMemory), &gorm.Config{})
	require.NoError(t, err)

	if err := db.Migrator().DropTable(&models.FilterOption{}); err != nil {
		t.Fatalf("テーブルの削除に失敗しました: %v", err)
	}

	repo := NewFilterOptionRepository(db)
	_, err = repo.FindByCategory(context.Background(), "REGION")
	assert.Error(t, err)
}

// TestFilterOptionRepositoryFindAllWithChildren は親子関係を持つフィルターオプションのFindAllテストを実行します
func TestFilterOptionRepositoryFindAllWithChildren(t *testing.T) {
	db := setupFilterOptionTestDB(t)
	repo := NewFilterOptionRepository(db)

	// 親子関係を持つテストデータのセットアップ
	setupTestData(t, db)

	got, err := repo.FindAll(context.Background())
	assert.NoError(t, err)
	assert.Len(t, got, 3) // 親1つ + 子2つ

	// 親子関係の確認
	var parent *models.FilterOption

	for _, option := range got {
		if option.Category == "REGION" {
			parent = &option
			break
		}
	}

	assert.NotNil(t, parent, "親フィルターオプションが見つかりません")
	assert.Equal(t, "関東", parent.Name)

	// 子の確認
	childCount := 0

	for _, option := range got {
		if option.ParentID != nil && *option.ParentID == parent.ID {
			childCount++

			assert.Equal(t, "PREFECTURE", option.Category)
		}
	}

	assert.Equal(t, 2, childCount, "子フィルターオプションの数が期待と異なります")
}

// --- バリデーション関数のテスト雛形 ---
// validation.goのvalidateName等を直接呼び出す場合は、
// ここにテストケースを追加してください。
