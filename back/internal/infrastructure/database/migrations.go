package database

import (
	"fmt"
	"university-exam-api/internal/domain/models"

	"gorm.io/gorm"
)

// RunMigrations はデータベースのマイグレーションを実行します
func RunMigrations(db *gorm.DB) error {
	// スキーマを設定
	if err := db.Exec("SET search_path TO test_schema").Error; err != nil {
		return fmt.Errorf("スキーマの設定に失敗: %w", err)
	}

	// 依存関係を考慮して順番にマイグレーションを実行
	if err := db.AutoMigrate(&models.University{}); err != nil {
		return fmt.Errorf("universitiesテーブルのマイグレーションに失敗: %w", err)
	}

	if err := db.AutoMigrate(&models.Department{}); err != nil {
		return fmt.Errorf("departmentsテーブルのマイグレーションに失敗: %w", err)
	}

	if err := db.AutoMigrate(&models.Major{}); err != nil {
		return fmt.Errorf("majorsテーブルのマイグレーションに失敗: %w", err)
	}

	if err := db.AutoMigrate(&models.AdmissionSchedule{}); err != nil {
		return fmt.Errorf("admission_schedulesテーブルのマイグレーションに失敗: %w", err)
	}

	if err := db.AutoMigrate(&models.AdmissionInfo{}); err != nil {
		return fmt.Errorf("admission_infosテーブルのマイグレーションに失敗: %w", err)
	}

	if err := db.AutoMigrate(&models.TestType{}); err != nil {
		return fmt.Errorf("test_typesテーブルのマイグレーションに失敗: %w", err)
	}

	if err := db.AutoMigrate(&models.Subject{}); err != nil {
		return fmt.Errorf("subjectsテーブルのマイグレーションに失敗: %w", err)
	}

	return nil
}
