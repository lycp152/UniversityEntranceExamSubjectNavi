package repository

import (
	"context"
	"testing"

	"university-exam-api/internal/domain/models"

	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open test db: %v", err)
	}

	if err := db.AutoMigrate(
		&models.University{},
		&models.Department{},
		&models.Major{},
		&models.AdmissionSchedule{},
		&models.AdmissionInfo{},
		&models.TestType{},
		&models.Subject{},
	); err != nil {
		t.Fatalf("failed to migrate: %v", err)
	}

	return db
}

func TestFindByIDSuccess(t *testing.T) {
	db := setupTestDB(t)
	repo := NewUniversityRepository(db)
	ctx := context.Background()

	// テストデータ作成
	u := models.University{
		BaseModel: models.BaseModel{Version: 1},
		Name: "テスト大学",
	}
	if err := db.Create(&u).Error; err != nil {
		t.Fatalf("failed to create university: %v", err)
	}

	result, err := repo.FindByID(ctx, u.ID)
	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, u.Name, result.Name)
}

func TestFindByIDZero(t *testing.T) {
	db := setupTestDB(t)
	repo := NewUniversityRepository(db)
	ctx := context.Background()

	result, err := repo.FindByID(ctx, 0)
	assert.Nil(t, result)
	assert.Error(t, err)
}

func TestFindByIDNotFound(t *testing.T) {
	db := setupTestDB(t)
	repo := NewUniversityRepository(db)
	ctx := context.Background()

	result, err := repo.FindByID(ctx, 9999)
	assert.Nil(t, result)
	assert.Error(t, err)
}
