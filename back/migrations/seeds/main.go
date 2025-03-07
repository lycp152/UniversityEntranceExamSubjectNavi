package main

import (
	"log"
	"os"
	"university-exam-api/internal/domain/models"
	"university-exam-api/internal/infrastructure/database"

	"github.com/joho/godotenv"
	"gorm.io/gorm"
)

// calculatePercentages は科目のパーセンテージを自動計算します
func calculatePercentages(subjects []models.Subject) []models.Subject {
	var totalScore float64

	// 全科目の総得点を計算
	for _, subject := range subjects {
		totalScore += float64(subject.Score)
	}

	// パーセンテージを計算
	if totalScore > 0 {
		for i := range subjects {
			subjects[i].Percentage = float64(subjects[i].Score) / totalScore * 100
		}
	}

	return subjects
}

// cleanupDatabase はデータベースをクリーンアップします
func cleanupDatabase(db *gorm.DB) error {
	// 既存のデータを削除
	if err := db.Exec("DROP SCHEMA public CASCADE").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE SCHEMA public").Error; err != nil {
		return err
	}

	// スキーマを再作成
	if err := database.AutoMigrate(db); err != nil {
		return err
	}

	return nil
}

type SubjectData struct {
	Name string
	Order int
	CommonScore int
	SecondaryScore int
}

func createSubjectsWithScores(subjectsData []SubjectData) []models.Subject {
	subjects := make([]models.Subject, len(subjectsData)*2)
	idx := 0

	for _, data := range subjectsData {
		// 共通テスト用の科目
		if data.CommonScore > 0 {
			subjects[idx] = models.Subject{
				BaseModel: models.BaseModel{
					Version: 1,
				},
				Name:         data.Name,
				Score:        data.CommonScore,
				DisplayOrder: data.Order,
			}
			idx++
		}

		// 二次試験用の科目
		if data.SecondaryScore > 0 {
			subjects[idx] = models.Subject{
				BaseModel: models.BaseModel{
					Version: 1,
				},
				Name:         data.Name,
				Score:        data.SecondaryScore,
				DisplayOrder: data.Order,
			}
			idx++
		}
	}

	subjects = subjects[:idx]
	return calculatePercentages(subjects)
}

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: .env file not found")
		// Set default environment variables
		os.Setenv("DB_HOST", "localhost")
		os.Setenv("DB_USER", "user")
		os.Setenv("DB_PASSWORD", "password")
		os.Setenv("DB_NAME", "university_exam_db")
		os.Setenv("DB_PORT", "5432")
	}

	// Connect to database
	db := database.NewDB()

	// データベースをクリーンアップ
	if err := cleanupDatabase(db); err != nil {
		log.Fatalf("Failed to cleanup database: %v", err)
	}

	// トランザクションを開始
	tx := db.Begin()
	if tx.Error != nil {
		log.Fatalf("Failed to begin transaction: %v", tx.Error)
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			log.Fatalf("Panic occurred: %v", r)
		}
	}()

	// 現在の年度と有効期間を設定
	currentYear := 2024

	// Sample data
	universities := []models.University{
		{
			BaseModel: models.BaseModel{
				Version: 1,
			},
			Name: "津々大学",
			Departments: []models.Department{
				{
					BaseModel: models.BaseModel{
						Version: 1,
					},
					Name: "医学部",
					Majors: []models.Major{
						{
							BaseModel: models.BaseModel{
								Version: 1,
							},
							Name: "医学科",
							AdmissionSchedules: []models.AdmissionSchedule{
								{
									BaseModel: models.BaseModel{
										Version: 1,
									},
									MajorID:      1,
									Name:         "前期",
									DisplayOrder: 1,
									AdmissionInfos: []models.AdmissionInfo{
										{
											BaseModel: models.BaseModel{
												Version: 1,
											},
											AdmissionScheduleID: 1,
											Enrollment:          100,
											AcademicYear:        currentYear,
											Status:              "published",
										},
									},
									TestTypes: []models.TestType{
										{
											BaseModel: models.BaseModel{
												Version: 1,
											},
											AdmissionScheduleID: 1,
											Name:                "共通",
											Subjects: createSubjectsWithScores([]SubjectData{
												{Name: "英語L", Order: 1, CommonScore: 50},
												{Name: "英語R", Order: 2, CommonScore: 50},
												{Name: "数学", Order: 3, CommonScore: 100},
												{Name: "国語", Order: 4, CommonScore: 100},
												{Name: "理科", Order: 5, CommonScore: 200},
												{Name: "地歴公", Order: 6, CommonScore: 50},
											}),
										},
										{
											BaseModel: models.BaseModel{
												Version: 1,
											},
											AdmissionScheduleID: 1,
											Name:                "二次",
											Subjects: createSubjectsWithScores([]SubjectData{
												{Name: "英語R", Order: 1, SecondaryScore: 150},
												{Name: "数学", Order: 2, SecondaryScore: 150},
											}),
										},
									},
								},
							},
						},
					},
				},
			},
		},
		{
			BaseModel: models.BaseModel{
				Version: 1,
			},
			Name: "浦々大学",
			Departments: []models.Department{
				{
					BaseModel: models.BaseModel{
						Version: 1,
					},
					Name: "工学部",
					Majors: []models.Major{
						{
							BaseModel: models.BaseModel{
								Version: 1,
							},
							Name: "機械工学科",
							AdmissionSchedules: []models.AdmissionSchedule{
								{
									BaseModel: models.BaseModel{
										Version: 1,
									},
									MajorID:      2,
									Name:         "後期",
									DisplayOrder: 1,
									AdmissionInfos: []models.AdmissionInfo{
										{
											BaseModel: models.BaseModel{
												Version: 1,
											},
											AdmissionScheduleID: 2,
											Enrollment:          150,
											AcademicYear:        currentYear,
											Status:              "published",
										},
									},
									TestTypes: []models.TestType{
										{
											BaseModel: models.BaseModel{
												Version: 1,
											},
											AdmissionScheduleID: 2,
											Name:                "共通",
											Subjects: []models.Subject{
												{
													BaseModel: models.BaseModel{
														Version: 1,
													},
													Name:         "英語L",
													Score:        100,
													Percentage:   8.33,
													DisplayOrder: 1,
												},
												{
													BaseModel: models.BaseModel{
														Version: 1,
													},
													Name:         "英語R",
													Score:        100,
													Percentage:   8.33,
													DisplayOrder: 2,
												},
												{
													BaseModel: models.BaseModel{
														Version: 1,
													},
													Name:         "数学",
													Score:        100,
													Percentage:   8.33,
													DisplayOrder: 3,
												},
												{
													BaseModel: models.BaseModel{
														Version: 1,
													},
													Name:         "国語",
													Score:        100,
													Percentage:   8.33,
													DisplayOrder: 4,
												},
												{
													BaseModel: models.BaseModel{
														Version: 1,
													},
													Name:         "理科",
													Score:        100,
													Percentage:   8.33,
													DisplayOrder: 5,
												},
												{
													BaseModel: models.BaseModel{
														Version: 1,
													},
													Name:         "地歴公",
													Score:        100,
													Percentage:   8.33,
													DisplayOrder: 6,
												},
											},
										},
										{
											BaseModel: models.BaseModel{
												Version: 1,
											},
											AdmissionScheduleID: 2,
											Name:                "二次",
											Subjects: []models.Subject{
												{
													BaseModel: models.BaseModel{
														Version: 1,
													},
													Name:         "英語L",
													Score:        100,
													Percentage:   8.33,
													DisplayOrder: 1,
												},
												{
													BaseModel: models.BaseModel{
														Version: 1,
													},
													Name:         "英語R",
													Score:        100,
													Percentage:   8.33,
													DisplayOrder: 2,
												},
												{
													BaseModel: models.BaseModel{
														Version: 1,
													},
													Name:         "数学",
													Score:        100,
													Percentage:   8.33,
													DisplayOrder: 3,
												},
												{
													BaseModel: models.BaseModel{
														Version: 1,
													},
													Name:         "国語",
													Score:        100,
													Percentage:   8.33,
													DisplayOrder: 4,
												},
												{
													BaseModel: models.BaseModel{
														Version: 1,
													},
													Name:         "理科",
													Score:        100,
													Percentage:   8.33,
													DisplayOrder: 5,
												},
												{
													BaseModel: models.BaseModel{
														Version: 1,
													},
													Name:         "地歴公",
													Score:        100,
													Percentage:   8.33,
													DisplayOrder: 6,
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
		},
	}

	// Create universities
	for _, university := range universities {
		if err := tx.Create(&university).Error; err != nil {
			tx.Rollback()
			log.Fatalf("Failed to seed data: %v", err)
		}
	}

	// トランザクションをコミット
	if err := tx.Commit().Error; err != nil {
		log.Fatalf("Failed to commit transaction: %v", err)
	}

	log.Println("Successfully seeded database")
}
