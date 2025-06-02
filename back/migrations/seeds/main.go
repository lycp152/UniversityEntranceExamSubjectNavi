// Package main はデータベースのシードデータを提供します。
// このスクリプトは以下の機能を提供します：
// - 大学、学部、学科、入試情報の初期データ生成
// - 科目のパーセンテージ計算
// - データベースのクリーンアップ
package main

import (
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

// calculateAndSetSubjectPercentages は科目のパーセンテージを計算し、設定します
func calculateAndSetSubjectPercentages(
	subjects []models.Subject,
	commonTestTotalScore float64,
	secondaryTestTotalScore float64,
) []models.Subject {
	// 共通テストと二次試験の合計点を分母とする
	denominator := commonTestTotalScore + secondaryTestTotalScore

	// パーセンテージを計算
	if denominator > 0 {
		for i := range subjects {
			// パーセンテージを計算し、小数点以下2桁に丸める
			percentage := float64(subjects[i].Score) / denominator * 100
			subjects[i].Percentage = math.Round(percentage*100) / 100
		}
	} else {
		// 分母が0の場合はパーセンテージも0とする
		for i := range subjects {
			subjects[i].Percentage = 0
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
	// トランザクションを開始
	tx := db.Begin()
	if tx.Error != nil {
		return fmt.Errorf("トランザクションの開始に失敗しました: %v", tx.Error)
	}

	// 既存のテーブルを削除
	if err := tx.Exec("DROP SCHEMA IF EXISTS public CASCADE").Error; err != nil {
		if err := tx.Rollback().Error; err != nil {
			return fmt.Errorf(rollbackErrorMsg, err)
		}

		return fmt.Errorf("スキーマの削除に失敗しました: %v", err)
	}

	// 新しいスキーマを作成
	if err := tx.Exec("CREATE SCHEMA IF NOT EXISTS public").Error; err != nil {
		if err := tx.Rollback().Error; err != nil {
			return fmt.Errorf(rollbackErrorMsg, err)
		}

		return fmt.Errorf("スキーマの作成に失敗しました: %v", err)
	}

	// 権限を付与
	if err := tx.Exec("GRANT ALL ON SCHEMA public TO postgres").Error; err != nil {
		if err := tx.Rollback().Error; err != nil {
			return fmt.Errorf(rollbackErrorMsg, err)
		}

		return fmt.Errorf("権限の付与に失敗しました: %v", err)
	}

	if err := tx.Exec("GRANT ALL ON SCHEMA public TO public").Error; err != nil {
		if err := tx.Rollback().Error; err != nil {
			return fmt.Errorf(rollbackErrorMsg, err)
		}

		return fmt.Errorf("権限の付与に失敗しました: %v", err)
	}

	// トランザクションをコミット
	if err := tx.Commit().Error; err != nil {
		return fmt.Errorf("トランザクションのコミットに失敗しました: %v", err)
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
	Name           string
	Order          int
	CommonScore    int
	SecondaryScore int
}

// createSubjectsWithScores は科目データを作成します (パーセンテージ計算は行わない)
func createSubjectsWithScores(subjectsData []SubjectData) []models.Subject {
	subjects := make([]models.Subject, 0, len(subjectsData)) // 初期キャパシティを指定

	for _, data := range subjectsData {
		// 共通テスト用の科目
		if data.CommonScore > 0 {
			subjects = append(subjects, models.Subject{
				BaseModel: models.BaseModel{
					Version: 1,
				},
				Name:         data.Name,
				Score:        data.CommonScore,
				DisplayOrder: data.Order,
				Percentage:   0, // 初期値
			})
		}

		// 二次試験用の科目 (共通テストの科目とは別エンティティとして扱う場合)
		// もし共通の科目名でScoreだけ異なる場合は、TestTypeを見てどちらのScoreを使うか判断
		// ここではScoreが設定されていれば別々の科目として作成すると仮定
		if data.SecondaryScore > 0 {
			subjects = append(subjects, models.Subject{
				BaseModel: models.BaseModel{
					Version: 1,
				},
				Name:         data.Name,    // 二次でも同じ科目名を使う想定
				Score:        data.SecondaryScore,
				DisplayOrder: data.Order, // 表示順は共通の場合と合わせるか、別途定義
				Percentage:   0, // 初期値
			})
		}
	}

	return subjects
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

// createTestTypes は試験種別を作成し、科目のパーセンテージを計算します
func createTestTypes(tx *gorm.DB, schedule *models.AdmissionSchedule, testTypesInput []models.TestType) error {
	createdTestTypes := make([]models.TestType, 0, len(testTypesInput))

	// まず全ての科目を作成 (パーセンテージはまだ0)
	for _, ttInput := range testTypesInput {
		newTestType := models.TestType{ // models.TestTypeを直接使う
			BaseModel:           ttInput.BaseModel,
			AdmissionScheduleID: schedule.ID,
			Name:                ttInput.Name,
			Subjects:            ttInput.Subjects, // このSubjectsはPercentageが0でScoreが設定済み
		}
		createdTestTypes = append(createdTestTypes, newTestType)
	}

	// 共通テストと二次試験の合計点を計算
	var commonTestTotalScore float64

	var secondaryTestTotalScore float64

	for _, tt := range createdTestTypes {
		var currentTypeTotal float64
		for _, s := range tt.Subjects {
			currentTypeTotal += float64(s.Score)
		}

		switch tt.Name {
		case "共通":
			commonTestTotalScore = currentTypeTotal
		case "二次":
			secondaryTestTotalScore = currentTypeTotal
		}
	}

	// 各試験種別の科目のパーセンテージを計算・設定
	for i := range createdTestTypes {
		createdTestTypes[i].Subjects = calculateAndSetSubjectPercentages(
			createdTestTypes[i].Subjects,
			commonTestTotalScore,
			secondaryTestTotalScore,
		)
	}

	// データベースに永続化
	for _, tt := range createdTestTypes {
		// Subjectsを一旦nilにしてTestType本体をCreateし、その後SubjectsをCreateする
		subjectsToCreate := tt.Subjects
		tt.Subjects = nil // GORMが関連を自動処理しようとするのを防ぐ

		if err := tx.Create(&tt).Error; err != nil {
			return fmt.Errorf("試験種別 '%s' の作成に失敗: %w", tt.Name, err)
		}
		// 作成されたTestTypeのIDを科目情報に紐付けて科目を作成
		if err := createSubjects(tx, &tt, subjectsToCreate); err != nil {
			return fmt.Errorf("試験種別 '%s' の科目作成に失敗: %w", tt.Name, err)
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
		academicFields := major.AcademicFields
		major.AdmissionSchedules = nil
		major.AcademicFields = nil

		if err := tx.Create(&major).Error; err != nil {
			return err
		}

		if err := createAdmissionSchedules(tx, &major, schedules); err != nil {
			return err
		}

		if err := createAcademicFields(tx, &major, academicFields); err != nil {
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
// - 地域の関連付け
// - 設置区分の関連付け
func seedUniversities(tx *gorm.DB, universities []models.University) error {
	for _, university := range universities {
		departments := university.Departments
		regions := university.Regions
		classifications := university.Classifications
		university.Departments = nil
		university.Regions = nil
		university.Classifications = nil

		if err := tx.Create(&university).Error; err != nil {
			return err
		}

		// 地域の作成
		if err := createRegions(tx, &university, regions); err != nil {
			return err
		}

		// 設置区分の作成
		if err := createClassifications(tx, &university, classifications); err != nil {
			return err
		}

		// 学部の作成
		if err := createDepartments(tx, &university, departments); err != nil {
			return err
		}
	}

	return nil
}

// createRegions は地域データを作成します
// この関数は以下の処理を行います：
// - 地域の作成
// - 都道府県の関連付け
func createRegions(tx *gorm.DB, university *models.University, regions []models.Region) error {
	for _, region := range regions {
		region.UniversityID = university.ID
		prefectures := region.Prefectures
		region.Prefectures = nil

		if err := tx.Create(&region).Error; err != nil {
			return err
		}

		if err := createPrefectures(tx, &region, prefectures); err != nil {
			return err
		}
	}

	return nil
}

// createPrefectures は都道府県データを作成します
func createPrefectures(tx *gorm.DB, region *models.Region, prefectures []models.Prefecture) error {
	for _, prefecture := range prefectures {
		prefecture.RegionID = region.ID
		if err := tx.Create(&prefecture).Error; err != nil {
			return err
		}
	}

	return nil
}

// createClassifications は設置区分データを作成します
// この関数は以下の処理を行います：
// - 設置区分の作成
// - 小分類の関連付け
func createClassifications(tx *gorm.DB, university *models.University, classifications []models.Classification) error {
	for _, classification := range classifications {
		classification.UniversityID = university.ID
		subClassifications := classification.SubClassifications
		classification.SubClassifications = nil

		if err := tx.Create(&classification).Error; err != nil {
			return err
		}

		if err := createSubClassifications(tx, &classification, subClassifications); err != nil {
			return err
		}
	}

	return nil
}

// createSubClassifications は設置区分の小分類データを作成します
func createSubClassifications(
	tx *gorm.DB,
	classification *models.Classification,
	subClassifications []models.SubClassification,
) error {
	for _, subClassification := range subClassifications {
		subClassification.ClassificationID = classification.ID
		if err := tx.Create(&subClassification).Error; err != nil {
			return err
		}
	}

	return nil
}

// createAcademicFields は学問系統データを作成します
func createAcademicFields(tx *gorm.DB, major *models.Major, academicFields []models.AcademicField) error {
	for _, academicField := range academicFields {
		academicField.MajorID = major.ID
		if err := tx.Create(&academicField).Error; err != nil {
			return err
		}
	}

	return nil
}

// createFilterOptions はフィルターオプションのシードデータを作成します
func createFilterOptions() []models.FilterOption {
	return []models.FilterOption{
		// 地域・都道府県
		{
			BaseModel: models.BaseModel{Version: 1},
			Category: "REGION",
			Name: "北海道",
			DisplayOrder: 1,
			Children: []models.FilterOption{
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "北海道",
					DisplayOrder: 1,
				},
			},
		},
		{
			BaseModel: models.BaseModel{Version: 1},
			Category: "REGION",
			Name: "東北",
			DisplayOrder: 2,
			Children: []models.FilterOption{
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "青森",
					DisplayOrder: 1,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "秋田",
					DisplayOrder: 2,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "岩手",
					DisplayOrder: 3,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "山形",
					DisplayOrder: 4,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "宮城",
					DisplayOrder: 5,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "福島",
					DisplayOrder: 6,
				},
			},
		},
		{
			BaseModel: models.BaseModel{Version: 1},
			Category: "REGION",
			Name: "北関東",
			DisplayOrder: 3,
			Children: []models.FilterOption{
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "群馬",
					DisplayOrder: 1,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "栃木",
					DisplayOrder: 2,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "茨城",
					DisplayOrder: 3,
				},
			},
		},
		{
			BaseModel: models.BaseModel{Version: 1},
			Category: "REGION",
			Name: "南関東",
			DisplayOrder: 4,
			Children: []models.FilterOption{
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "東京",
					DisplayOrder: 1,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "神奈川",
					DisplayOrder: 2,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "千葉",
					DisplayOrder: 3,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "埼玉",
					DisplayOrder: 4,
				},
			},
		},
		{
			BaseModel: models.BaseModel{Version: 1},
			Category: "REGION",
			Name: "甲信越",
			DisplayOrder: 5,
			Children: []models.FilterOption{
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "新潟",
					DisplayOrder: 1,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "長野",
					DisplayOrder: 2,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "山梨",
					DisplayOrder: 3,
				},
			},
		},
		{
			BaseModel: models.BaseModel{Version: 1},
			Category: "REGION",
			Name: "北陸",
			DisplayOrder: 6,
			Children: []models.FilterOption{
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "富山",
					DisplayOrder: 1,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "石川",
					DisplayOrder: 2,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "福井",
					DisplayOrder: 3,
				},
			},
		},
		{
			BaseModel: models.BaseModel{Version: 1},
			Category: "REGION",
			Name: "東海",
			DisplayOrder: 7,
			Children: []models.FilterOption{
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "静岡",
					DisplayOrder: 1,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "愛知",
					DisplayOrder: 2,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "岐阜",
					DisplayOrder: 3,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "三重",
					DisplayOrder: 4,
				},
			},
		},
		{
			BaseModel: models.BaseModel{Version: 1},
			Category: "REGION",
			Name: "関西",
			DisplayOrder: 8,
			Children: []models.FilterOption{
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "大阪",
					DisplayOrder: 1,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "京都",
					DisplayOrder: 2,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "兵庫",
					DisplayOrder: 3,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "滋賀",
					DisplayOrder: 4,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "奈良",
					DisplayOrder: 5,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "和歌山",
					DisplayOrder: 6,
				},
			},
		},
		{
			BaseModel: models.BaseModel{Version: 1},
			Category: "REGION",
			Name: "中国",
			DisplayOrder: 9,
			Children: []models.FilterOption{
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "広島",
					DisplayOrder: 1,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "岡山",
					DisplayOrder: 2,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "山口",
					DisplayOrder: 3,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "鳥取",
					DisplayOrder: 4,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "島根",
					DisplayOrder: 5,
				},
			},
		},
		{
			BaseModel: models.BaseModel{Version: 1},
			Category: "REGION",
			Name: "四国",
			DisplayOrder: 10,
			Children: []models.FilterOption{
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "香川",
					DisplayOrder: 1,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "徳島",
					DisplayOrder: 2,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "愛媛",
					DisplayOrder: 3,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "高知",
					DisplayOrder: 4,
				},
			},
		},
		{
			BaseModel: models.BaseModel{Version: 1},
			Category: "REGION",
			Name: "九州",
			DisplayOrder: 11,
			Children: []models.FilterOption{
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "福岡",
					DisplayOrder: 1,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "佐賀",
					DisplayOrder: 2,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "長崎",
					DisplayOrder: 3,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "熊本",
					DisplayOrder: 4,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "大分",
					DisplayOrder: 5,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "宮崎",
					DisplayOrder: 6,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "鹿児島",
					DisplayOrder: 7,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "PREFECTURE",
					Name: "沖縄",
					DisplayOrder: 8,
				},
			},
		},
		// 日程
		{
			BaseModel: models.BaseModel{Version: 1},
			Category: "SCHEDULE",
			Name: "前",
			DisplayOrder: 1,
		},
		{
			BaseModel: models.BaseModel{Version: 1},
			Category: "SCHEDULE",
			Name: "中",
			DisplayOrder: 2,
		},
		{
			BaseModel: models.BaseModel{Version: 1},
			Category: "SCHEDULE",
			Name: "後",
			DisplayOrder: 3,
		},

		// 学問系統
		{
			BaseModel: models.BaseModel{Version: 1},
			Category: "ACADEMIC_FIELD",
			Name: "文学",
			DisplayOrder: 1,
		},
		{
			BaseModel: models.BaseModel{Version: 1},
			Category: "ACADEMIC_FIELD",
			Name: "心理学",
			DisplayOrder: 2,
		},
		{
			BaseModel: models.BaseModel{Version: 1},
			Category: "ACADEMIC_FIELD",
			Name: "哲学",
			DisplayOrder: 3,
		},
		{
			BaseModel: models.BaseModel{Version: 1},
			Category: "ACADEMIC_FIELD",
			Name: "史学・人類学",
			DisplayOrder: 4,
		},
		{
			BaseModel: models.BaseModel{Version: 1},
			Category: "ACADEMIC_FIELD",
			Name: "社会・社会福祉・観光学",
			DisplayOrder: 5,
		},
		{
			BaseModel: models.BaseModel{Version: 1},
			Category: "ACADEMIC_FIELD",
			Name: "語学",
			DisplayOrder: 6,
		},
		{
			BaseModel: models.BaseModel{Version: 1},
			Category: "ACADEMIC_FIELD",
			Name: "法学・政治学",
			DisplayOrder: 7,
		},
		{
			BaseModel: models.BaseModel{Version: 1},
			Category: "ACADEMIC_FIELD",
			Name: "経済・経営・商学",
			DisplayOrder: 8,
		},
		{
			BaseModel: models.BaseModel{Version: 1},
			Category: "ACADEMIC_FIELD",
			Name: "教員養成・教育学",
			DisplayOrder: 9,
		},
		{
			BaseModel: models.BaseModel{Version: 1},
			Category: "ACADEMIC_FIELD",
			Name: "理学",
			DisplayOrder: 10,
		},
		{
			BaseModel: models.BaseModel{Version: 1},
			Category: "ACADEMIC_FIELD",
			Name: "工学",
			DisplayOrder: 11,
		},
		{
			BaseModel: models.BaseModel{Version: 1},
			Category: "ACADEMIC_FIELD",
			Name: "農・林・水産・獣医学",
			DisplayOrder: 12,
		},
		{
			BaseModel: models.BaseModel{Version: 1},
			Category: "ACADEMIC_FIELD",
			Name: "医学",
			DisplayOrder: 13,
		},
		{
			BaseModel: models.BaseModel{Version: 1},
			Category: "ACADEMIC_FIELD",
			Name: "看護・保健・衛生学",
			DisplayOrder: 14,
		},
		{
			BaseModel: models.BaseModel{Version: 1},
			Category: "ACADEMIC_FIELD",
			Name: "歯学",
			DisplayOrder: 15,
		},
		{
			BaseModel: models.BaseModel{Version: 1},
			Category: "ACADEMIC_FIELD",
			Name: "薬学",
			DisplayOrder: 16,
		},
		{
			BaseModel: models.BaseModel{Version: 1},
			Category: "ACADEMIC_FIELD",
			Name: "生活科学",
			DisplayOrder: 17,
		},
		{
			BaseModel: models.BaseModel{Version: 1},
			Category: "ACADEMIC_FIELD",
			Name: "芸術学",
			DisplayOrder: 18,
		},
		{
			BaseModel: models.BaseModel{Version: 1},
			Category: "ACADEMIC_FIELD",
			Name: "体育学",
			DisplayOrder: 19,
		},
		{
			BaseModel: models.BaseModel{Version: 1},
			Category: "ACADEMIC_FIELD",
			Name: "人間・情報科学・総合科学",
			DisplayOrder: 20,
		},
		// 設置区分
		{
			BaseModel: models.BaseModel{Version: 1},
			Category: "CLASSIFICATION",
			Name: "国公立",
			DisplayOrder: 1,
			Children: []models.FilterOption{
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "SUB_CLASSIFICATION",
					Name: "東京一工（東京、京都、一橋、東工）",
					DisplayOrder: 1,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "SUB_CLASSIFICATION",
					Name: "旧帝大（東京、京都、東北、名古屋、大阪、九州）",
					DisplayOrder: 2,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "SUB_CLASSIFICATION",
					Name: "難関国立10大学（東京、京都、一橋、東工、北海道、東北、名古屋、大阪、九州、神戸）",
					DisplayOrder: 3,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "SUB_CLASSIFICATION",
					Name: "筑横千首（筑波、横国、千葉、東京都立）",
					DisplayOrder: 4,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "SUB_CLASSIFICATION",
					Name: "電農名繊（電気通信、東京農工、名古屋工業、京都工芸繊維）",
					DisplayOrder: 5,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "SUB_CLASSIFICATION",
					Name: "金岡千広（金沢、岡山、千葉、広島）",
					DisplayOrder: 6,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "SUB_CLASSIFICATION",
					Name: "5S（埼玉、信州、新潟、静岡、滋賀）",
					DisplayOrder: 7,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "SUB_CLASSIFICATION",
					Name: "STARS（佐賀、鳥取、秋田、琉球、島根）",
					DisplayOrder: 8,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "SUB_CLASSIFICATION",
					Name: "その他の国立大",
					DisplayOrder: 9,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "SUB_CLASSIFICATION",
					Name: "その他の公立大",
					DisplayOrder: 10,
				},
			},
		},
		{
			BaseModel: models.BaseModel{Version: 1},
			Category: "CLASSIFICATION",
			Name: "私立",
			DisplayOrder: 2,
			Children: []models.FilterOption{
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "SUB_CLASSIFICATION",
					Name: "早慶上理ICU（早稲田、慶応、上智、東京理科、ICU）",
					DisplayOrder: 1,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "SUB_CLASSIFICATION",
					Name: "私立医大四天王（慶応、東京慈恵会医科、日本医科、順天堂）",
					DisplayOrder: 2,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "SUB_CLASSIFICATION",
					Name: "SMART（明治、青山、立教、上智、東京理科）",
					DisplayOrder: 3,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "SUB_CLASSIFICATION",
					Name: "GMARCH（明治、青山、立教、中央、法政、学習院）",
					DisplayOrder: 4,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "SUB_CLASSIFICATION",
					Name: "関関同立（関西、関西学院、同志社、立命館）",
					DisplayOrder: 5,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "SUB_CLASSIFICATION",
					Name: "五美大（多摩美術、女子美術、東京造形、日大藝術、武蔵野美術）",
					DisplayOrder: 6,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "SUB_CLASSIFICATION",
					Name: "成成明学（成蹊、成城、明治学院）",
					DisplayOrder: 7,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "SUB_CLASSIFICATION",
					Name: "四工大（芝浦工業、東京都市、東京電機、工学院）",
					DisplayOrder: 8,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "SUB_CLASSIFICATION",
					Name: "日東駒専（日本、東洋、駒澤、専修）",
					DisplayOrder: 9,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "SUB_CLASSIFICATION",
					Name: "産近甲龍（京都産業、近畿、甲南、龍谷）",
					DisplayOrder: 10,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "SUB_CLASSIFICATION",
					Name: "愛愛名中+南山（愛知、愛知学院、名城、中京、南山）",
					DisplayOrder: 11,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "SUB_CLASSIFICATION",
					Name: "大東亜帝国（大東文化、東海、亜細亜、帝京、国士舘）",
					DisplayOrder: 12,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "SUB_CLASSIFICATION",
					Name: "摂神追桃（摂南、神戸学院、追手門学院、桃山学院）",
					DisplayOrder: 13,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "SUB_CLASSIFICATION",
					Name: "関東上流江戸桜(関東学院、上武、流通経済、江戸川、桜美林)",
					DisplayOrder: 14,
				},
				{
					BaseModel: models.BaseModel{Version: 1},
					Category: "SUB_CLASSIFICATION",
					Name: "その他の私立大",
					DisplayOrder: 15,
				},
			},
		},
	}
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

	// データベース接続
	db, err := database.NewDB()
	if err != nil {
		log.Fatalf("データベース接続に失敗しました: %v", err)
	}

	// データベースのクリーンアップ
	if err := cleanupDatabase(db); err != nil {
		log.Printf("データベースのクリーンアップに失敗しました: %v", err)
		os.Exit(1)
	}

	// トランザクション開始
	tx := db.Begin()
	if tx.Error != nil {
		log.Fatalf("トランザクションの開始に失敗しました: %v", tx.Error)
	}

	// テーブルの存在確認と作成
	if err := tx.AutoMigrate(
		&models.University{},
		&models.Department{},
		&models.Major{},
		&models.AdmissionSchedule{},
		&models.AdmissionInfo{},
		&models.TestType{},
		&models.Subject{},
		&models.Region{},
		&models.Prefecture{},
		&models.Classification{},
		&models.SubClassification{},
		&models.AcademicField{},
		&models.FilterOption{},
	); err != nil {
		tx.Rollback()
		log.Fatalf("テーブルの作成に失敗しました: %v", err)
	}

	// シードデータの定義
	currentYear := 2024

	// フィルターオプションのシードデータを投入
	filterOptions := createFilterOptions()
	if err := seedFilterOptions(tx, filterOptions); err != nil {
		tx.Rollback()
		log.Fatalf("フィルターオプションのシードデータ投入に失敗しました: %v", err)
	}

	universities := []models.University{
		{
			BaseModel: models.BaseModel{
				Version: 1,
			},
			Name: "津々大学",
			Regions: []models.Region{
				{
					BaseModel: models.BaseModel{
						Version: 1,
					},
					Name: "南関東",
					Prefectures: []models.Prefecture{
						{
							BaseModel: models.BaseModel{
								Version: 1,
							},
							Name: "東京",
						},
					},
				},
			},
			Classifications: []models.Classification{
				{
					BaseModel: models.BaseModel{
						Version: 1,
					},
					Name: "国公立",
					SubClassifications: []models.SubClassification{
						{
							BaseModel: models.BaseModel{
								Version: 1,
							},
							Name: "東京一工（東京、京都、一橋、東工）",
						},
					},
				},
			},
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
							AcademicFields: []models.AcademicField{
								{
									BaseModel: models.BaseModel{
										Version: 1,
									},
									Name: "医学",
								},
							},
							AdmissionSchedules: []models.AdmissionSchedule{
								{
									BaseModel: models.BaseModel{
										Version: 1,
									},
									Name:         "前",
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
									// TestTypesのSubjectsはここでcreateSubjectsWithScoresを使って生成される
									TestTypes: []models.TestType{
										{
											BaseModel: models.BaseModel{Version: 1},
											Name:      "共通",
											Subjects: createSubjectsWithScores([]SubjectData{ // Scoreのみ設定、Percentageは0
												{Name: "英語L", Order: 1, CommonScore: 50},
												{Name: "英語R", Order: 2, CommonScore: 50},
												{Name: "数学", Order: 3, CommonScore: 100},
												{Name: "国語", Order: 4, CommonScore: 100},
												{Name: "理科", Order: 5, CommonScore: 200},
												{Name: "地歴公", Order: 6, CommonScore: 50},
											}),
										},
										{
											BaseModel: models.BaseModel{Version: 1},
											Name:      "二次",
											Subjects: createSubjectsWithScores([]SubjectData{ // Scoreのみ設定、Percentageは0
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
			Regions: []models.Region{
				{
					BaseModel: models.BaseModel{
						Version: 1,
					},
					Name: "関西",
					Prefectures: []models.Prefecture{
						{
							BaseModel: models.BaseModel{
								Version: 1,
							},
							Name: "大阪",
						},
					},
				},
			},
			Classifications: []models.Classification{
				{
					BaseModel: models.BaseModel{
						Version: 1,
					},
					Name: "私立",
					SubClassifications: []models.SubClassification{
						{
							BaseModel: models.BaseModel{
								Version: 1,
							},
							Name: "関関同立（関西、関西学院、同志社、立命館）",
						},
					},
				},
			},
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
							AcademicFields: []models.AcademicField{
								{
									BaseModel: models.BaseModel{
										Version: 1,
									},
									Name: "工学",
								},
							},
							AdmissionSchedules: []models.AdmissionSchedule{
								{
									BaseModel: models.BaseModel{
										Version: 1,
									},
									Name:         "後",
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
											BaseModel: models.BaseModel{Version: 1},
											Name:      "共通",
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
											BaseModel: models.BaseModel{Version: 1},
											Name:      "二次",
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
		tx.Rollback()
		log.Fatalf("シードデータの投入に失敗しました: %v", err)
	}

	// トランザクションのコミット
	if err := tx.Commit().Error; err != nil {
		log.Printf("トランザクションのコミットに失敗しました: %v", err)
		return
	}

	log.Println("シードデータの投入が正常に完了しました")
}

// seedFilterOptions はフィルターオプションのシードデータを投入します
func seedFilterOptions(tx *gorm.DB, options []models.FilterOption) error {
	// 親子関係を考慮して投入する必要があるため、2段階で処理
	// 1. 親レコードの投入
	for _, option := range options {
		children := option.Children
		option.Children = nil // 子レコードを一時的に切り離す

		if err := tx.Create(&option).Error; err != nil {
			return fmt.Errorf("フィルターオプション '%s' の作成に失敗: %w", option.Name, err)
		}

		// 2. 子レコードの投入
		for i := range children {
			children[i].ParentID = &option.ID
			if err := tx.Create(&children[i]).Error; err != nil {
				return fmt.Errorf("フィルターオプション '%s' の子レコード '%s' の作成に失敗: %w",
					option.Name, children[i].Name, err)
			}
		}
	}

	return nil
}
