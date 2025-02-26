package database

import (
	"fmt"
	"university-exam-api/internal/domain/models"

	"gorm.io/gorm"
)

// RunMigrations はデータベースのマイグレーションを実行します
func RunMigrations(db *gorm.DB) error {
	// スキーマのマイグレーション
	if err := db.AutoMigrate(
		&models.University{},
		&models.Department{},
		&models.Major{},
		&models.AdmissionInfo{},
		&models.AdmissionSchedule{},
		&models.TestType{},
		&models.Subject{},
		&models.DepartmentSubjects{},
	); err != nil {
		return fmt.Errorf("マイグレーションに失敗: %w", err)
	}

	return nil
}
