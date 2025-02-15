package main

import (
	"log"
	"os"
	"time"
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
		for _, score := range subject.TestScores {
			totalScore += float64(score.Score)
		}
	}

	// パーセンテージを計算
	if totalScore > 0 {
		for i := range subjects {
			for j := range subjects[i].TestScores {
				subjects[i].TestScores[j].Percentage = float64(subjects[i].TestScores[j].Score) / totalScore * 100
			}
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
	subjects := make([]models.Subject, len(subjectsData))

	for i, data := range subjectsData {
		subjects[i] = models.Subject{
			Name: data.Name,
			DisplayOrder: data.Order,
			TestScores: []models.TestScore{
				{
					Type: models.CommonTest,
					Score: data.CommonScore,
				},
				{
					Type: models.SecondaryTest,
					Score: data.SecondaryScore,
				},
			},
		}
	}

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

	// スケジュールマスターデータを作成
	schedules := []models.Schedule{
		{
			Name: "前期",
			DisplayOrder: 1,
			Description: "前期日程試験",
			StartDate: time.Date(2024, 2, 25, 0, 0, 0, 0, time.Local),
			EndDate: time.Date(2024, 3, 7, 23, 59, 59, 0, time.Local),
		},
		{
			Name: "中期",
			DisplayOrder: 2,
			Description: "中期日程試験",
			StartDate: time.Date(2024, 3, 8, 0, 0, 0, 0, time.Local),
			EndDate: time.Date(2024, 3, 14, 23, 59, 59, 0, time.Local),
		},
		{
			Name: "後期",
			DisplayOrder: 3,
			Description: "後期日程試験",
			StartDate: time.Date(2024, 3, 15, 0, 0, 0, 0, time.Local),
			EndDate: time.Date(2024, 3, 25, 23, 59, 59, 0, time.Local),
		},
	}

	// スケジュールマスターデータを保存
	for _, schedule := range schedules {
		if err := tx.Create(&schedule).Error; err != nil {
			tx.Rollback()
			log.Fatalf("Failed to seed schedule data: %v", err)
		}
	}

	// 現在の年度と有効期間を設定
	currentYear := 2024
	validFrom := time.Date(2024, 4, 1, 0, 0, 0, 0, time.Local)
	validUntil := time.Date(2025, 3, 31, 23, 59, 59, 0, time.Local)

	// 〇〇大学の科目データを作成
	medicalSubjects := createSubjectsWithScores([]SubjectData{
		{"英語L", 1, 50, 0},
		{"英語R", 2, 50, 150},
		{"数学", 3, 100, 150},
		{"国語", 4, 100, 0},
		{"理科", 5, 200, 0},
		{"地歴公", 6, 50, 0},
	})

	// △△大学の科目データを作成
	engineeringSubjects := createSubjectsWithScores([]SubjectData{
		{"英語L", 1, 100, 100},
		{"英語R", 2, 100, 100},
		{"数学", 3, 100, 100},
		{"国語", 4, 100, 100},
		{"理科", 5, 100, 100},
		{"地歴公", 6, 100, 100},
	})

	// Sample data
	universities := []models.University{
		{
			Name: "〇〇大学",
			Description: "総合大学として医学部を含む多様な学部を持つ大学です。",
			Website: "https://example-univ1.ac.jp",
			Departments: []models.Department{
				{
					Name: "医学部",
					Description: "最新の医療技術と研究設備を備えた医学部です。",
					Website: "https://example-univ1.ac.jp/medical",
					Majors: []models.Major{
						{
							Name: "医学科",
							Description: "6年間の医学教育を通じて、優れた医師を育成します。",
							Website: "https://example-univ1.ac.jp/medical/medicine",
							Features: "充実した臨床実習、最新の研究設備、高い国家試験合格率",
							ExamInfos: []models.ExamInfo{
								{
									ScheduleID: 1,
									Enrollment: 100,
									AcademicYear: currentYear,
									ValidFrom: validFrom,
									ValidUntil: validUntil,
									Status: "active",
									Subjects: medicalSubjects,
									CreatedBy: "system",
									UpdatedBy: "system",
								},
							},
						},
					},
				},
			},
		},
		{
			Name: "△△大学",
			Description: "工学系の研究に特化した理工系大学です。",
			Website: "https://example-univ2.ac.jp",
			Departments: []models.Department{
				{
					Name: "工学部",
					Description: "最先端の工学技術を学べる学部です。",
					Website: "https://example-univ2.ac.jp/engineering",
					Majors: []models.Major{
						{
							Name: "機械工学科",
							Description: "機械工学の基礎から応用まで幅広く学べます。",
							Website: "https://example-univ2.ac.jp/engineering/mechanical",
							Features: "充実した実験設備、企業との連携、高い就職率",
							ExamInfos: []models.ExamInfo{
								{
									ScheduleID: 3,
									Enrollment: 150,
									AcademicYear: currentYear,
									ValidFrom: validFrom,
									ValidUntil: validUntil,
									Status: "active",
									Subjects: engineeringSubjects,
									CreatedBy: "system",
									UpdatedBy: "system",
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
