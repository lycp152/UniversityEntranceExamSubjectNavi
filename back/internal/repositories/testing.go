package repositories

import (
	"fmt"
	"log"
	"os"
	"time"
	"university-exam-api/internal/domain/models"
	"university-exam-api/internal/infrastructure/database"
	"university-exam-api/pkg/logger"

	"gorm.io/gorm"
)

// SetupTestDB はテスト用のデータベース接続を作成します
func SetupTestDB() *gorm.DB {
	// ロガーを初期化
	logger.InitLoggers()

	// テスト用の環境変数を設定
	os.Setenv("DB_HOST", "localhost")
	os.Setenv("DB_USER", "user")
	os.Setenv("DB_PASSWORD", "password")
	os.Setenv("DB_NAME", "university_exam_test_db")
	os.Setenv("DB_PORT", "5432")
	os.Setenv("DB_SCHEMA", "test_schema")

	db := database.NewDB()
	if db == nil {
		log.Printf("データベース接続の初期化に失敗しました")
		return nil
	}

	// スキーマの設定
	if err := db.Exec("DROP SCHEMA IF EXISTS test_schema CASCADE").Error; err != nil {
		log.Printf("スキーマの削除に失敗: %v", err)
		return nil
	}

	if err := db.Exec("CREATE SCHEMA test_schema").Error; err != nil {
		log.Printf("スキーマの作成に失敗: %v", err)
		return nil
	}

	// マイグレーションを実行
	if err := database.RunMigrations(db); err != nil {
		log.Printf("マイグレーションに失敗: %v", err)
		return nil
	}

	// 検索パスを設定
	if err := db.Exec("SET search_path TO test_schema").Error; err != nil {
		log.Printf("検索パスの設定に失敗: %v", err)
		return nil
	}

	// データベースのエンコーディングを設定
	if err := db.Exec("SET client_encoding TO 'UTF8'").Error; err != nil {
		log.Printf("クライアントエンコーディングの設定に失敗: %v", err)
		return nil
	}

	return db
}

// createTestData はテストデータを作成します
func createTestData(db *gorm.DB) (*models.University, error) {
	currentYear := time.Now().Year()
	if time.Now().Month() < 4 {
		currentYear--
	}

	validFrom := time.Now()
	validUntil := validFrom.AddDate(1, 0, 0)

	university := &models.University{
		BaseModel: models.BaseModel{
			Version: 1,
		},
		Name: "テスト大学",
		Departments: []models.Department{
			{
				BaseModel: models.BaseModel{
					Version: 1,
				},
				Name: "テスト学部",
				Majors: []models.Major{
					{
						BaseModel: models.BaseModel{
							Version: 1,
						},
						Name: "テスト学科",
						AdmissionSchedules: []models.AdmissionSchedule{
							{
								BaseModel: models.BaseModel{
									Version: 1,
								},
								Name:         "前期",
								DisplayOrder: 1,
								AdmissionInfos: []models.AdmissionInfo{
									{
										BaseModel: models.BaseModel{
											Version: 1,
										},
										Enrollment:   100,
										AcademicYear: currentYear,
										ValidFrom:    validFrom,
										ValidUntil:   validUntil,
										Status:       "draft",
									},
								},
								TestTypes: []models.TestType{
									{
										BaseModel: models.BaseModel{
											Version: 1,
										},
										Name: "共通",
										Subjects: []models.Subject{
											{
												BaseModel: models.BaseModel{
													Version: 1,
												},
												Name:         "数学",
												Score:        200,
												Percentage:   20.0,
												DisplayOrder: 1,
											},
										},
									},
								},
							},
						},
					},
				},
			},
		},
	}

	if err := db.Create(university).Error; err != nil {
		return nil, fmt.Errorf("テストデータの作成に失敗: %w", err)
	}

	return university, nil
}

// cleanupTestData はテストデータをクリーンアップします
func cleanupTestData(db *gorm.DB) error {
	return db.Exec("TRUNCATE TABLE universities CASCADE").Error
}
