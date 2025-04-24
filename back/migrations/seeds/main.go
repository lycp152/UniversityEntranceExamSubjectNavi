// Package main はデータベースのシードデータを提供します。
// このスクリプトは以下の機能を提供します：
// - 大学、学部、学科、入試情報の初期データ生成
// - 科目のパーセンテージ計算
// - データベースのクリーンアップ
package main

import (
	"context"
	"fmt"
	"log"
	"math"
	"os"
	"university-exam-api/internal/domain/models"
	"university-exam-api/internal/infrastructure/database"

	"github.com/joho/godotenv"
	"gorm.io/gorm"
)

const (
	rollbackErrorMsg = "ロールバックに失敗しました: %v"
)

// calculatePercentages は科目のパーセンテージを自動計算します
// この関数は以下の処理を行います：
// - 全科目の総得点の計算
// - 各科目のパーセンテージの計算
func calculatePercentages(subjects []models.Subject) []models.Subject {
	var totalScore float64

	// 全科目の総得点を計算
	for _, subject := range subjects {
		totalScore += float64(subject.Score)
	}

	// パーセンテージを計算
	if totalScore > 0 {
		for i := range subjects {
			// パーセンテージを計算し、小数点以下2桁に丸める
			percentage := float64(subjects[i].Score) / totalScore * 100
			subjects[i].Percentage = math.Round(percentage*100) / 100
		}
	}

	return subjects
}

// cleanupDatabase はデータベースをクリーンアップします
// この関数は以下の処理を行います：
// - 既存のスキーマの削除
// - 新規スキーマの作成
// - マイグレーションの実行
func cleanupDatabase(db *gorm.DB) error {
	// 既存のデータを削除
	if err := db.Exec("DROP SCHEMA public CASCADE").Error; err != nil {
		return err
	}

	if err := db.Exec("CREATE SCHEMA public").Error; err != nil {
		return err
	}

	// スキーマを再作成
	if err := database.AutoMigrate(context.Background(), db); err != nil {
		return err
	}

	return nil
}

// SubjectData は科目のデータ構造を定義します
// この構造体は以下の情報を保持します：
// - 科目名
// - 表示順序
// - 共通テストの得点
// - 二次試験の得点
type SubjectData struct {
	Name string
	Order int
	CommonScore int
	SecondaryScore int
}

// createSubjectsWithScores は科目データを作成します
// この関数は以下の処理を行います：
// - 共通テスト用科目の作成
// - 二次試験用科目の作成
// - パーセンテージの計算
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

// setupEnvironment は環境変数を設定します
// この関数は以下の処理を行います：
// - .envファイルの読み込み
// - デフォルト値の設定
// - 環境変数の検証
func setupEnvironment() error {
	// .envファイルの読み込み
	if err := godotenv.Load(); err != nil {
		log.Printf("警告: .envファイルが見つかりません: %v", err)
	}

	// 必須環境変数の定義
	requiredEnvVars := map[string]string{
		"DB_HOST":     "localhost",
		"DB_USER":     "user",
		"DB_PASSWORD": "password",
		"DB_NAME":     "university_exam_db",
		"DB_PORT":     "5432",
	}

	// 環境変数の設定と検証
	for key, defaultValue := range requiredEnvVars {
		value := os.Getenv(key)
		if value == "" {
			if err := os.Setenv(key, defaultValue); err != nil {
				return fmt.Errorf("%sの設定に失敗しました: %v", key, err)
			}

			log.Printf("警告: %sが設定されていないため、デフォルト値(%s)を使用します", key, defaultValue)
		}
	}

	return nil
}

// createTestTypes は試験種別を作成します
// この関数は以下の処理を行います：
// - 試験種別の作成
// - 科目の関連付け
func createTestTypes(tx *gorm.DB, schedule *models.AdmissionSchedule, testTypes []models.TestType) error {
	for _, testType := range testTypes {
		testType.AdmissionScheduleID = schedule.ID
		subjects := testType.Subjects
		testType.Subjects = nil

		if err := tx.Create(&testType).Error; err != nil {
			return err
		}

		if err := createSubjects(tx, &testType, subjects); err != nil {
			return err
		}
	}

	return nil
}

// createSubjects は科目を作成します
// この関数は以下の処理を行います：
// - 科目の作成
// - 試験種別との関連付け
func createSubjects(tx *gorm.DB, testType *models.TestType, subjects []models.Subject) error {
	for _, subject := range subjects {
		subject.TestTypeID = testType.ID
		if err := tx.Create(&subject).Error; err != nil {
			return err
		}
	}

	return nil
}

// createAdmissionSchedules は入試日程を作成します
// この関数は以下の処理を行います：
// - 入試日程の作成
// - 試験種別の関連付け
func createAdmissionSchedules(tx *gorm.DB, major *models.Major, schedules []models.AdmissionSchedule) error {
	for _, schedule := range schedules {
		schedule.MajorID = major.ID
		testTypes := schedule.TestTypes
		schedule.TestTypes = nil

		if err := tx.Create(&schedule).Error; err != nil {
			return err
		}

		if err := createTestTypes(tx, &schedule, testTypes); err != nil {
			return err
		}
	}

	return nil
}

// createMajors は学科を作成します
// この関数は以下の処理を行います：
// - 学科の作成
// - 入試日程の関連付け
func createMajors(tx *gorm.DB, department *models.Department, majors []models.Major) error {
	for _, major := range majors {
		major.DepartmentID = department.ID
		schedules := major.AdmissionSchedules
		major.AdmissionSchedules = nil

		if err := tx.Create(&major).Error; err != nil {
			return err
		}

		if err := createAdmissionSchedules(tx, &major, schedules); err != nil {
			return err
		}
	}

	return nil
}

// createDepartments は学部を作成します
// この関数は以下の処理を行います：
// - 学部の作成
// - 学科の関連付け
func createDepartments(tx *gorm.DB, university *models.University, departments []models.Department) error {
	for _, department := range departments {
		department.UniversityID = university.ID
		majors := department.Majors
		department.Majors = nil

		if err := tx.Create(&department).Error; err != nil {
			return err
		}

		if err := createMajors(tx, &department, majors); err != nil {
			return err
		}
	}

	return nil
}

// seedUniversities は大学データを作成します
// この関数は以下の処理を行います：
// - 大学の作成
// - 学部の関連付け
func seedUniversities(tx *gorm.DB, universities []models.University) error {
	for _, university := range universities {
		departments := university.Departments
		university.Departments = nil

		if err := tx.Create(&university).Error; err != nil {
			return err
		}

		if err := createDepartments(tx, &university, departments); err != nil {
			return err
		}
	}

	return nil
}

// main はシードデータの投入を実行します
// この関数は以下の処理を行います：
// - 環境変数の設定
// - データベース接続の確立
// - データベースのクリーンアップ
// - トランザクションの開始
// - シードデータの投入
// - トランザクションのコミット
func main() {
	log.Println("シードデータの投入を開始します")

	// 環境変数の設定
	if err := setupEnvironment(); err != nil {
		log.Printf("環境変数の設定に失敗しました: %v", err)
		os.Exit(1)
	}

	// データベース接続の確立
	db, err := database.NewDB()
	if err != nil {
		log.Printf("データベース接続に失敗しました: %v", err)
		os.Exit(1)
	}

	// データベースのクリーンアップ
	if err := cleanupDatabase(db); err != nil {
		log.Printf("データベースのクリーンアップに失敗しました: %v", err)
		os.Exit(1)
	}

	// トランザクションの開始
	tx := db.Begin()
	if tx.Error != nil {
		log.Printf("トランザクションの開始に失敗しました: %v", tx.Error)
		os.Exit(1)
	}

	// パニック時のロールバック処理
	defer func() {
		if r := recover(); r != nil {
			if err := tx.Rollback().Error; err != nil {
				log.Printf(rollbackErrorMsg, err)
			}

			log.Printf("パニックが発生しました: %v", r)
			os.Exit(1)
		}
	}()

	// シードデータの定義
	currentYear := 2024
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
									Name:         "前期",
									DisplayOrder: 1,
									AdmissionInfos: []models.AdmissionInfo{
										{
											BaseModel: models.BaseModel{
												Version: 1,
											},
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
									Name:         "後期",
									DisplayOrder: 1,
									AdmissionInfos: []models.AdmissionInfo{
										{
											BaseModel: models.BaseModel{
												Version: 1,
											},
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
											Name:                "共通",
											Subjects: createSubjectsWithScores([]SubjectData{
												{Name: "英語L", Order: 1, CommonScore: 100},
												{Name: "英語R", Order: 2, CommonScore: 100},
												{Name: "数学", Order: 3, CommonScore: 100},
												{Name: "国語", Order: 4, CommonScore: 100},
												{Name: "理科", Order: 5, CommonScore: 100},
												{Name: "地歴公", Order: 6, CommonScore: 100},
											}),
										},
										{
											BaseModel: models.BaseModel{
												Version: 1,
											},
											Name:                "二次",
											Subjects: createSubjectsWithScores([]SubjectData{
												{Name: "英語L", Order: 1, SecondaryScore: 100},
												{Name: "英語R", Order: 2, SecondaryScore: 100},
												{Name: "数学", Order: 3, SecondaryScore: 100},
												{Name: "国語", Order: 4, SecondaryScore: 100},
												{Name: "理科", Order: 5, SecondaryScore: 100},
												{Name: "地歴公", Order: 6, SecondaryScore: 100},
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
	}

	// シードデータの投入
	if err := seedUniversities(tx, universities); err != nil {
		if err := tx.Rollback().Error; err != nil {
			log.Printf(rollbackErrorMsg, err)
		}

		log.Printf("シードデータの投入に失敗しました: %v", err)
	}

	// トランザクションのコミット
	if err := tx.Commit().Error; err != nil {
		if err := tx.Rollback().Error; err != nil {
			log.Printf(rollbackErrorMsg, err)
		}

		log.Printf("トランザクションのコミットに失敗しました: %v", err)
	}

	log.Println("シードデータの投入が正常に完了しました")
}
