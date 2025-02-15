package repositories

import (
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

	db := database.NewDB()
	if err := database.AutoMigrate(db); err != nil {
		log.Fatalf("Failed to migrate test database: %v", err)
	}

	return db
}

// createScheduleData はテスト用のスケジュールデータを作成します
func createScheduleData(db *gorm.DB) error {
	schedule := &models.Schedule{
		Name:         "前期",
		DisplayOrder: 1,
		Description:  "前期日程試験",
		StartDate:    time.Date(2024, 2, 25, 0, 0, 0, 0, time.Local),
		EndDate:      time.Date(2024, 3, 7, 23, 59, 59, 0, time.Local),
	}

	return db.Create(schedule).Error
}

// テストデータを作成します
func createTestData(db *gorm.DB) (*models.University, error) {
	// スケジュールデータを作成
	if err := createScheduleData(db); err != nil {
		return nil, err
	}

	university := &models.University{
		Name: "テスト大学",
		Departments: []models.Department{
			{
				Name: "テスト学部",
				Majors: []models.Major{
					{
						Name: "テスト学科",
						ExamInfos: []models.ExamInfo{
							{
								ScheduleID:   1,
								Enrollment:   100,
								AcademicYear: 2024,
								ValidFrom:    time.Now(),
								ValidUntil:   time.Now().AddDate(1, 0, 0),
								Status:       "active",
								CreatedBy:    "system",
								UpdatedBy:    "system",
								Subjects: []models.Subject{
									{
										Name: "テスト科目1",
										TestScores: []models.TestScore{
											{
												Type:       models.CommonTest,
												Score:      80,
												Percentage: 20.0,
											},
											{
												Type:       models.SecondaryTest,
												Score:      90,
												Percentage: 30.0,
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
		return nil, err
	}

	return university, nil
}

// テストデータをクリーンアップします
func cleanupTestData(db *gorm.DB) error {
	return db.Exec("TRUNCATE universities, schedules CASCADE").Error
}
