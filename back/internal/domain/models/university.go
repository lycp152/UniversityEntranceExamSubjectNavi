package models

import (
	"context"
	"errors"
	"fmt"

	"gorm.io/gorm"
)

// BatchSize はバッチ処理のサイズを定義
const (
	DefaultBatchSize = 100
	MaxBatchSize     = 1000
)

// BatchInsertUniversities は大学データを一括で挿入する
func BatchInsertUniversities(ctx context.Context, db *gorm.DB, universities []University, batchSize int) error {
	if len(universities) == 0 {
		return fmt.Errorf("挿入する大学データがありません")
	}

	if batchSize <= 0 {
		batchSize = DefaultBatchSize
	} else if batchSize > MaxBatchSize {
		batchSize = MaxBatchSize
	}

	return db.Session(&gorm.Session{
		CreateBatchSize: batchSize,
		PrepareStmt:     true,
	}).
		WithContext(ctx).
		Transaction(func(tx *gorm.DB) error {
			if err := tx.CreateInBatches(universities, batchSize).Error; err != nil {
				return fmt.Errorf("大学データの一括挿入に失敗しました: %w", err)
			}

			return nil
		})
}

// GetUniversityByID はIDに基づいて大学と関連するデータを取得する
func GetUniversityByID(ctx context.Context, db *gorm.DB, id uint) (*University, error) {
	var university University
	err := db.Session(&gorm.Session{
		QueryFields: true,
		PrepareStmt: true,
	}).
		WithContext(ctx).
		Select("universities.*, departments.*, majors.*, admission_schedules.*, admission_infos.*, test_types.*, subjects.*").
		Joins("LEFT JOIN departments ON departments.university_id = universities.id").
		Joins("LEFT JOIN majors ON majors.department_id = departments.id").
		Joins("LEFT JOIN admission_schedules ON admission_schedules.major_id = majors.id").
		Joins("LEFT JOIN admission_infos ON admission_infos.admission_schedule_id = admission_schedules.id").
		Joins("LEFT JOIN test_types ON test_types.admission_schedule_id = admission_schedules.id").
		Joins("LEFT JOIN subjects ON subjects.test_type_id = test_types.id").
		First(&university, id).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("ID %d の大学が見つかりません: %w", id, err)
		}

		return nil, fmt.Errorf("大学の取得に失敗しました: %w", err)
	}

	return &university, nil
}

// GetUniversities はすべての大学を取得する
func GetUniversities(ctx context.Context, db *gorm.DB) ([]University, error) {
	var universities []University
	if err := db.Session(&gorm.Session{
		QueryFields: true,
		PrepareStmt: true,
	}).
		WithContext(ctx).
		Find(&universities).Error; err != nil {
		return nil, fmt.Errorf("大学一覧の取得に失敗しました: %w", err)
	}

	return universities, nil
}

// CreateUniversity は新しい大学を作成する
func CreateUniversity(ctx context.Context, db *gorm.DB, university *University) error {
	return db.Session(&gorm.Session{
		FullSaveAssociations: true,
		PrepareStmt:          true,
	}).
		WithContext(ctx).
		Transaction(func(tx *gorm.DB) error {
			tx.SavePoint("sp1")

			if err := tx.Create(university).Error; err != nil {
				tx.RollbackTo("sp1")
				return fmt.Errorf("大学の作成に失敗しました: %w", err)
			}

			return nil
		})
}

// UpdateUniversity は大学情報を更新する
func UpdateUniversity(ctx context.Context, db *gorm.DB, university *University) error {
	return db.Session(&gorm.Session{
		FullSaveAssociations: true,
		PrepareStmt:          true,
	}).
		WithContext(ctx).
		Transaction(func(tx *gorm.DB) error {
			tx.SavePoint("sp1")

			if err := tx.Save(university).Error; err != nil {
				tx.RollbackTo("sp1")
				return fmt.Errorf("大学の更新に失敗しました: %w", err)
			}

			return nil
		})
}

// DeleteUniversity は大学を削除する
func DeleteUniversity(ctx context.Context, db *gorm.DB, id uint) error {
	return db.Session(&gorm.Session{
		AllowGlobalUpdate: true,
		PrepareStmt:       true,
	}).
		WithContext(ctx).
		Transaction(func(tx *gorm.DB) error {
			tx.SavePoint("sp1")

			if err := tx.Delete(&University{}, id).Error; err != nil {
				tx.RollbackTo("sp1")
				return fmt.Errorf("大学の削除に失敗しました: %w", err)
			}

			return nil
		})
}

// UpdateUniversities は大学の一括更新を行う
func UpdateUniversities(ctx context.Context, db *gorm.DB, universities []*University) error {
	return db.Session(&gorm.Session{
		FullSaveAssociations: true,
		PrepareStmt:          true,
	}).
		WithContext(ctx).
		Transaction(func(tx *gorm.DB) error {
			tx.SavePoint("sp1")

			if err := tx.Save(universities).Error; err != nil {
				tx.RollbackTo("sp1")
				return fmt.Errorf("大学の一括更新に失敗しました: %w", err)
			}

			return nil
		})
}

// DeleteUniversities は大学の一括削除を行う
func DeleteUniversities(ctx context.Context, db *gorm.DB, universityIDs []uint) error {
	return db.Session(&gorm.Session{
		AllowGlobalUpdate: true,
		PrepareStmt:       true,
	}).
		WithContext(ctx).
		Transaction(func(tx *gorm.DB) error {
			tx.SavePoint("sp1")

			if err := tx.Delete(&University{}, universityIDs).Error; err != nil {
				tx.RollbackTo("sp1")
				return fmt.Errorf("大学の一括削除に失敗しました: %w", err)
			}

			return nil
		})
}

// GetUniversitiesWithRelations はすべての大学と関連するデータを取得する
func GetUniversitiesWithRelations(ctx context.Context, db *gorm.DB) ([]University, error) {
	var universities []University
	err := db.Session(&gorm.Session{
		QueryFields: true,
		PrepareStmt: true,
	}).
		WithContext(ctx).
		Select("universities.*, departments.*, majors.*, admission_schedules.*, admission_infos.*, test_types.*, subjects.*").
		Joins("LEFT JOIN departments ON departments.university_id = universities.id").
		Joins("LEFT JOIN majors ON majors.department_id = departments.id").
		Joins("LEFT JOIN admission_schedules ON admission_schedules.major_id = majors.id").
		Joins("LEFT JOIN admission_infos ON admission_infos.admission_schedule_id = admission_schedules.id").
		Joins("LEFT JOIN test_types ON test_types.admission_schedule_id = admission_schedules.id").
		Joins("LEFT JOIN subjects ON subjects.test_type_id = test_types.id").
		Find(&universities).Error

	if err != nil {

		return nil, fmt.Errorf("大学一覧の取得に失敗しました: %w", err)
	}

	return universities, nil
}
