package repository

import (
	"context"
	"errors"
	"testing"

	"university-exam-api/internal/domain/models"

	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

const filterUniversityA = "フィルタ大学A"

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

func TestFindAll(t *testing.T) {
	db := setupTestDB(t)
	repo := NewUniversityRepository(db)
	ctx := context.Background()

	// データが空のとき
	universities, err := repo.FindAll(ctx)
	assert.NoError(t, err)
	assert.Len(t, universities, 0)

	// データ追加後
	u := models.University{BaseModel: models.BaseModel{Version: 1}, Name: "大学A"}
	err = db.Create(&u).Error
	assert.NoError(t, err)
	universities, err = repo.FindAll(ctx)
	assert.NoError(t, err)
	assert.Len(t, universities, 1)
}

func TestFindByName(t *testing.T) {
	db := setupTestDB(t)
	repo := NewUniversityRepository(db)
	ctx := context.Background()

	// 名前が空
	result, err := repo.FindByName(ctx, "")
	assert.Nil(t, result)
	assert.Error(t, err)

	// 存在しない名前
	result, err = repo.FindByName(ctx, "notfound")
	assert.Nil(t, result)
	assert.Error(t, err)

	// 正常系
	u := models.University{BaseModel: models.BaseModel{Version: 1}, Name: "大学B"}
	err = db.Create(&u).Error
	assert.NoError(t, err)
	result, err = repo.FindByName(ctx, "大学B")
	assert.NoError(t, err)
	assert.NotNil(t, result)

	if result != nil {
		assert.Equal(t, "大学B", result.Name)
	}
}

func TestCreate(t *testing.T) {
	db := setupTestDB(t)
	repo := NewUniversityRepository(db)
	ctx := context.Background()

	u := &models.University{BaseModel: models.BaseModel{Version: 1}, Name: "大学C"}
	err := repo.Create(ctx, u)
	assert.NoError(t, err)

	var found models.University

	db.First(&found, u.ID)
	assert.Equal(t, "大学C", found.Name)
}

func TestUpdate(t *testing.T) {
	db := setupTestDB(t)
	repo := NewUniversityRepository(db)
	ctx := context.Background()

	u := &models.University{BaseModel: models.BaseModel{Version: 1}, Name: "大学D"}
	db.Create(u)
	u.Name = "大学D-更新"
	err := repo.Update(ctx, u)
	assert.NoError(t, err)

	var found models.University

	db.First(&found, u.ID)
	assert.Equal(t, "大学D-更新", found.Name)

	// ID=0の異常系
	u2 := &models.University{}
	err = repo.Update(ctx, u2)
	assert.Error(t, err)
}

func TestDelete(t *testing.T) {
	db := setupTestDB(t)
	repo := NewUniversityRepository(db)
	ctx := context.Background()

	u := &models.University{BaseModel: models.BaseModel{Version: 1}, Name: "大学E"}
	db.Create(u)
	err := repo.Delete(ctx, u.ID)
	assert.NoError(t, err)

	var found models.University
	err = db.Unscoped().First(&found, u.ID).Error

	if err == nil {
		assert.True(t, found.DeletedAt != nil)
	} else {
		// レコードが取得できなければ削除済みとみなす
		assert.Error(t, err)
	}

	// ID=0の異常系
	err = repo.Delete(ctx, 0)
	assert.Error(t, err)
}

func TestFindWithDepartmentsAndMajors(t *testing.T) {
	db := setupTestDB(t)
	repo := NewUniversityRepository(db)
	ctx := context.Background()

	u := models.University{BaseModel: models.BaseModel{Version: 1}, Name: "大学F"}
	db.Create(&u)
	result, err := repo.FindWithDepartmentsAndMajors(ctx, u.ID)
	assert.NoError(t, err)
	assert.NotNil(t, result)
}

func TestFindWithFullDetails(t *testing.T) {
	db := setupTestDB(t)
	repo := NewUniversityRepository(db)
	ctx := context.Background()

	u := models.University{BaseModel: models.BaseModel{Version: 1}, Name: "大学G"}
	db.Create(&u)
	result, err := repo.FindWithFullDetails(ctx, u.ID)
	assert.NoError(t, err)
	assert.NotNil(t, result)

	// ID=0の異常系
	result, err = repo.FindWithFullDetails(ctx, 0)
	assert.Nil(t, result)
	assert.Error(t, err)
}

func TestCreateInBatches(t *testing.T) {
	db := setupTestDB(t)
	repo := NewUniversityRepository(db)
	ctx := context.Background()

	unis := []models.University{
		{BaseModel: models.BaseModel{Version: 1}, Name: "大学H"},
		{BaseModel: models.BaseModel{Version: 1}, Name: "大学I"},
	}
	err := repo.CreateInBatches(ctx, unis)
	assert.NoError(t, err)

	var count int64

	db.Model(&models.University{}).Count(&count)
	assert.Equal(t, int64(2), count)
}

func TestUpdateInBatches(t *testing.T) {
	db := setupTestDB(t)
	repo := NewUniversityRepository(db)
	ctx := context.Background()

	unis := []models.University{
		{BaseModel: models.BaseModel{Version: 1}, Name: "大学J"},
		{BaseModel: models.BaseModel{Version: 1}, Name: "大学K"},
	}
	db.Create(&unis)
	unis[0].Name = "大学J-更新"
	unis[1].Name = "大学K-更新"
	err := repo.UpdateInBatches(ctx, unis)
	assert.NoError(t, err)

	var found models.University

	db.First(&found, unis[0].ID)
	assert.Equal(t, "大学J-更新", found.Name)
}

func TestBatchInsertUniversities(t *testing.T) {
	db := setupTestDB(t)
	ctx := context.Background()
	unis := []models.University{
		{BaseModel: models.BaseModel{Version: 1}, Name: "一括大学A"},
		{BaseModel: models.BaseModel{Version: 1}, Name: "一括大学B"},
	}
	err := BatchInsertUniversities(ctx, db, unis, 2)
	assert.NoError(t, err)

	var count int64

	db.Model(&models.University{}).Where("name IN ?", []string{"一括大学A", "一括大学B"}).Count(&count)
	assert.Equal(t, int64(2), count)

	// 異常系: 空スライス
	err = BatchInsertUniversities(ctx, db, []models.University{}, 2)
	assert.Error(t, err)
}

func TestGetUniversityByID(t *testing.T) {
	db := setupTestDB(t)
	ctx := context.Background()
	u := models.University{BaseModel: models.BaseModel{Version: 1}, Name: "取得大学"}
	db.Create(&u)
	result, err := GetUniversityByID(ctx, db, u.ID)
	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, "取得大学", result.Name)

	// 異常系: 存在しないID
	result, err = GetUniversityByID(ctx, db, 9999)
	assert.Error(t, err)
	assert.Nil(t, result)
}

func TestGetUniversities(t *testing.T) {
	db := setupTestDB(t)
	ctx := context.Background()

	db.Create(&models.University{BaseModel: models.BaseModel{Version: 1}, Name: "一覧大学A"})
	db.Create(&models.University{BaseModel: models.BaseModel{Version: 1}, Name: "一覧大学B"})
	unis, err := GetUniversities(ctx, db)
	assert.NoError(t, err)
	assert.GreaterOrEqual(t, len(unis), 2)
}

func TestCreateUniversity(t *testing.T) {
	db := setupTestDB(t)
	ctx := context.Background()
	u := &models.University{BaseModel: models.BaseModel{Version: 1}, Name: "作成大学"}
	err := CreateUniversity(ctx, db, u)
	assert.NoError(t, err)

	var found models.University

	db.First(&found, u.ID)
	assert.Equal(t, "作成大学", found.Name)
}

func TestUpdateUniversity(t *testing.T) {
	db := setupTestDB(t)
	ctx := context.Background()
	u := &models.University{BaseModel: models.BaseModel{Version: 1}, Name: "更新前大学"}
	db.Create(u)
	u.Name = "更新後大学"
	err := UpdateUniversity(ctx, db, u)
	assert.NoError(t, err)

	var found models.University

	db.First(&found, u.ID)
	assert.Equal(t, "更新後大学", found.Name)
}

func TestDeleteUniversity(t *testing.T) {
	db := setupTestDB(t)
	ctx := context.Background()
	u := &models.University{BaseModel: models.BaseModel{Version: 1}, Name: "削除大学"}
	db.Create(u)
	err := DeleteUniversity(ctx, db, u.ID)
	assert.NoError(t, err)

	var found models.University
	err = db.Unscoped().First(&found, u.ID).Error

	if err == nil {
		assert.True(t, found.DeletedAt != nil)
	} else {
		assert.Error(t, err)
	}
}

func TestUpdateUniversities(t *testing.T) {
	db := setupTestDB(t)
	ctx := context.Background()
	u1 := &models.University{BaseModel: models.BaseModel{Version: 1}, Name: "一括更新A"}
	u2 := &models.University{BaseModel: models.BaseModel{Version: 1}, Name: "一括更新B"}

	db.Create(u1)
	db.Create(u2)

	u1.Name = "一括更新A-後"
	u2.Name = "一括更新B-後"
	err := UpdateUniversities(ctx, db, []*models.University{u1, u2})
	assert.NoError(t, err)

	var found models.University

	db.First(&found, u1.ID)
	assert.Equal(t, "一括更新A-後", found.Name)
}

func TestDeleteUniversities(t *testing.T) {
	db := setupTestDB(t)
	ctx := context.Background()
	u1 := &models.University{BaseModel: models.BaseModel{Version: 1}, Name: "一括削除A"}
	u2 := &models.University{BaseModel: models.BaseModel{Version: 1}, Name: "一括削除B"}

	db.Create(u1)
	db.Create(u2)
	err := DeleteUniversities(ctx, db, []uint{u1.ID, u2.ID})
	assert.NoError(t, err)

	var found models.University
	err = db.Unscoped().First(&found, u1.ID).Error

	if err == nil {
		assert.True(t, found.DeletedAt != nil)
	} else {
		assert.Error(t, err)
	}
}

func TestGetUniversitiesWithRelations(t *testing.T) {
	db := setupTestDB(t)
	ctx := context.Background()

	db.Create(&models.University{BaseModel: models.BaseModel{Version: 1}, Name: "関連大学A"})
	db.Create(&models.University{BaseModel: models.BaseModel{Version: 1}, Name: "関連大学B"})
	unis, err := GetUniversitiesWithRelations(ctx, db)
	assert.NoError(t, err)
	assert.GreaterOrEqual(t, len(unis), 2)
}

func TestFindWithFilters(t *testing.T) {
	db := setupTestDB(t)
	repo := NewUniversityRepository(db)
	ctx := context.Background()

	// データ追加
	db.Create(&models.University{BaseModel: models.BaseModel{Version: 1}, Name: filterUniversityA})
	db.Create(&models.University{BaseModel: models.BaseModel{Version: 1}, Name: "フィルタ大学B"})

	// 正常系: 名前でフィルタ
	filters := map[string]interface{}{"name": filterUniversityA}
	unis, err := repo.FindWithFilters(ctx, filters)
	assert.NoError(t, err)
	assert.Len(t, unis, 1)
	assert.Equal(t, filterUniversityA, unis[0].Name)

	// 異常系: 存在しない名前
	filters = map[string]interface{}{"name": "notfound"}
	unis, err = repo.FindWithFilters(ctx, filters)
	assert.NoError(t, err)
	assert.Len(t, unis, 0)

	// 異常系: DBエラー（不正なカラム名）
	filters = map[string]interface{}{"not_exist_column": "xxx"}
	_, err = repo.FindWithFilters(ctx, filters)
	assert.Error(t, err)
}

func TestProcessInBatches(t *testing.T) {
	db := setupTestDB(t)
	repo := NewUniversityRepository(db)
	ctx := context.Background()

	// データ追加
	unis := []models.University{
		{BaseModel: models.BaseModel{Version: 1}, Name: "バッチ大学A"},
		{BaseModel: models.BaseModel{Version: 1}, Name: "バッチ大学B"},
	}
	db.Create(&unis)

	var called bool

	batchFunc := func(_ *gorm.DB, _ []models.University) error {
		called = true
		return nil
	}

	err := repo.ProcessInBatches(ctx, batchFunc)
	assert.NoError(t, err)
	assert.True(t, called)
}

func TestSetBatchSize(t *testing.T) {
	db := setupTestDB(t)
	repo := NewUniversityRepository(db)
	repo.SetBatchSize(10)
	assert.Equal(t, 10, repo.batchSize)

	repo.SetBatchSize(0)
	assert.Equal(t, 10, repo.batchSize) // 0以下は無視される
}

func TestIsRetryableError(t *testing.T) {
	assert.True(t, isRetryableError(gorm.ErrInvalidTransaction))
	assert.True(t, isRetryableError(gorm.ErrInvalidDB))
	assert.True(t, isRetryableError(gorm.ErrRecordNotFound))
	assert.False(t, isRetryableError(errors.New("other error")))
}

func TestErrorAndUnwrap(t *testing.T) {
	err := &Error{Op: "TestOp", Err: errors.New("元エラー"), Code: ErrCodeDBError}
	assert.Contains(t, err.Error(), "TestOp")
	assert.EqualError(t, err.Unwrap(), "元エラー")
}
