// Package repositories はデータベースのバリデーション機能を提供します。
// このパッケージは以下の機能を提供します：
// - 入力値の検証
// - バリデーションルールの管理
// - エラーハンドリング
// - キャッシュの管理
// - 大学、学部、学科、入試スケジュール、テストタイプ、科目のバリデーション
package repositories

import (
	"fmt"
	"strings"
	"sync"
	"university-exam-api/internal/domain/models"
	appErrors "university-exam-api/internal/errors"
)

const (
	maxNameLength = 100
	minNameLength = 1
	maxDepartmentsPerUniversity = 50
	maxMajorsPerDepartment = 30
	maxSubjectsPerTestType = 20
	errInvalidVersion = "バージョンは1以上である必要があります"
	errEmptyUniversity = "大学データが指定されていません"
	errMinLength = "%sは1文字以上である必要があります"
	errMaxLength = "%sは%d文字以下である必要があります"
	errDuplicateName = "%s「%s」が重複しています"
	errMaxItems = "%sは%d以下である必要があります"
	errNonNegative = "%sは0以上である必要があります"
	errPercentageRange = "パーセンテージは0以上100以下である必要があります"
)

// ValidationRule はバリデーションルールを定義します。
// この構造体は以下の設定を管理します：
// - フィールド名
// - バリデーター関数
// - エラーメッセージ
// - エラーコード
// - 重要度
type ValidationRule struct {
	Field     string
	Validator func(interface{}) error
	Message   string
	Code      string
	Severity  string
}

// ValidationRules はバリデーションルールのマップを定義します。
// この型は以下の機能を提供します：
// - エンティティごとのルール管理
// - ルールの検索
// - ルールの追加
type ValidationRules map[string][]ValidationRule

// validationCache はバリデーションルールのキャッシュを管理します。
// この構造体は以下の機能を提供します：
// - スレッドセーフなキャッシュ
// - ルールの取得
// - ルールの更新
type validationCache struct {
	rules ValidationRules
	mu    sync.RWMutex
}

var (
	validationCacheInstance = &validationCache{
		rules: make(ValidationRules),
	}
)

// validateWithRules は指定されたルールでバリデーションを行います。
// この関数は以下の処理を行います：
// - ルールの適用
// - エラーの収集
// - エラーの返却
func validateWithRules(value interface{}, rules []ValidationRule) error {
	var validationErrors []error

	for _, rule := range rules {
		if err := rule.Validator(value); err != nil {
			validationErrors = append(validationErrors, appErrors.NewInvalidInputError(rule.Field, rule.Message, nil))
		}
	}

	if len(validationErrors) > 0 {
		return appErrors.NewValidationError("validation", "バリデーションエラーが発生しました", map[string]string{
			"errors": fmt.Sprintf("%v", validationErrors),
		})
	}

	return nil
}

// getValidationRules はエンティティごとのバリデーションルールを返します。
// この関数は以下の処理を行います：
// - キャッシュのチェック
// - ルールの生成
// - キャッシュへの保存
func getValidationRules() ValidationRules {
	validationCacheInstance.mu.RLock()
	rules := validationCacheInstance.rules
	validationCacheInstance.mu.RUnlock()

	if len(rules) == 0 {
		validationCacheInstance.mu.Lock()
		defer validationCacheInstance.mu.Unlock()

		if len(validationCacheInstance.rules) == 0 {
			validationCacheInstance.rules = ValidationRules{
				"university": []ValidationRule{
					{
						Field: "name",
						Validator: func(v interface{}) error {
							university, ok := v.(*models.University)
							if !ok {
								return fmt.Errorf("invalid type: expected *models.University")
							}
							return validateName(university.Name, "大学名")
						},
						Message: "大学名のバリデーションに失敗しました",
						Code:    "INVALID_NAME",
						Severity: "error",
					},
				},
				"department": []ValidationRule{
					{
						Field: "name",
						Validator: func(v interface{}) error {
							department, ok := v.(models.Department)
							if !ok {
								return fmt.Errorf("invalid type: expected models.Department")
							}
							return validateName(department.Name, "学部名")
						},
						Message: "学部名のバリデーションに失敗しました",
						Code:    "INVALID_NAME",
						Severity: "error",
					},
				},
			}
		}

		rules = validationCacheInstance.rules
	}

	return rules
}

// validateName は名前の共通バリデーションを行います。
// この関数は以下の処理を行います：
// - 長さのチェック
// - エラーメッセージの生成
// - 結果の返却
func validateName(name string, field string) error {
	name = strings.TrimSpace(name)
	if len(name) < minNameLength {
		return appErrors.NewInvalidInputError(field, fmt.Sprintf("%sは1文字以上である必要があります", field), nil)
	}

	if len(name) > maxNameLength {
		return appErrors.NewInvalidInputError(field, fmt.Sprintf("%sは%d文字以下である必要があります", field, maxNameLength), nil)
	}

	return nil
}

// validateUniversity は大学のバリデーションを行います。
// この関数は以下の処理を行います：
// - 基本情報の検証
// - 関連データの検証
// - エラーの返却
func (r *universityRepository) validateUniversity(university *models.University) error {
	if university == nil {
		return appErrors.NewInvalidInputError("university", errEmptyUniversity, nil)
	}

	// バージョンチェックを最初に行う
	if university.Version < 1 {
		return appErrors.NewInvalidInputError("version", errInvalidVersion, nil)
	}

	// 名前のバリデーション
	if err := validateName(university.Name, "大学名"); err != nil {
		return err
	}

	// 学部数のバリデーション
	if len(university.Departments) > maxDepartmentsPerUniversity {
		return appErrors.NewInvalidInputError(
			"departments",
			fmt.Sprintf(errMaxItems, "学部数", maxDepartmentsPerUniversity),
			nil,
		)
	}

	return r.validateUniversityRelations(university)
}

// validateUniversityRelations は大学の関連データのバリデーションを行います。
// この関数は以下の処理を行います：
// - 学部の検証
// - 重複チェック
// - エラーの返却
func (r *universityRepository) validateUniversityRelations(university *models.University) error {
	departmentNames := make(map[string]bool)

	for i, dept := range university.Departments {
		// 学部名の重複チェック
		if departmentNames[dept.Name] {
			return appErrors.NewInvalidInputError(
				fmt.Sprintf("departments[%d].name", i),
				fmt.Sprintf(errDuplicateName, "学部名", dept.Name),
				nil,
			)
		}

		departmentNames[dept.Name] = true

		// 学部のバリデーション
		if err := r.validateDepartment(dept, i); err != nil {
			return err
		}
	}

	return nil
}

// validateDepartment は学部のバリデーションを行います。
// この関数は以下の処理を行います：
// - 基本情報の検証
// - 学科の検証
// - エラーの返却
func (r *universityRepository) validateDepartment(dept models.Department, index int) error {
	// 学部名のバリデーション
	if err := validateName(dept.Name, fmt.Sprintf("departments[%d].name", index)); err != nil {
		return err
	}

	// バージョンチェック
	if dept.Version < 1 {
		return appErrors.NewInvalidInputError(fmt.Sprintf("departments[%d].version", index), errInvalidVersion, nil)
	}

	// 学科数のバリデーション
	if len(dept.Majors) > maxMajorsPerDepartment {
		return appErrors.NewInvalidInputError(
			fmt.Sprintf("departments[%d].majors", index),
			fmt.Sprintf(errMaxItems, "学科数", maxMajorsPerDepartment),
			nil,
		)
	}

	majorNames := make(map[string]bool)
	for j, major := range dept.Majors {
		// 学科名の重複チェック
		if majorNames[major.Name] {
			return appErrors.NewInvalidInputError(
				fmt.Sprintf("departments[%d].majors[%d].name", index, j),
				fmt.Sprintf(errDuplicateName, "学科名", major.Name),
				nil,
			)
		}

		majorNames[major.Name] = true

		// 学科のバリデーション
		if err := r.validateMajor(major, index, j); err != nil {
			return err
		}
	}

	return nil
}

// validateMajor は学科のバリデーションを行います。
// この関数は以下の処理を行います：
// - 基本情報の検証
// - 入試スケジュールの検証
// - エラーの返却
func (r *universityRepository) validateMajor(major models.Major, deptIndex, majorIndex int) error {
	// 学科名のバリデーション
	if err := validateName(major.Name, fmt.Sprintf("departments[%d].majors[%d].name", deptIndex, majorIndex)); err != nil {
		return err
	}

	// バージョンチェック
	if major.Version < 1 {
		return appErrors.NewInvalidInputError(
			fmt.Sprintf("departments[%d].majors[%d].version", deptIndex, majorIndex),
			errInvalidVersion,
			nil,
		)
	}

	// 入試スケジュールのバリデーション
	for k, schedule := range major.AdmissionSchedules {
		if err := r.validateAdmissionSchedule(schedule, deptIndex, majorIndex, k); err != nil {
			return err
		}
	}

	return nil
}

// validateAdmissionSchedule は入試スケジュールのバリデーションを行います。
// この関数は以下の処理を行います：
// - 基本情報の検証
// - テストタイプの検証
// - エラーの返却
func (r *universityRepository) validateAdmissionSchedule(
	schedule models.AdmissionSchedule,
	deptIndex, majorIndex, scheduleIndex int,
) error {
	// スケジュール名のバリデーション
	fieldName := fmt.Sprintf(
		"departments[%d].majors[%d].admissionSchedules[%d].name",
		deptIndex, majorIndex, scheduleIndex,
	)
	if err := validateName(schedule.Name, fieldName); err != nil {
		return err
	}

	// バージョンチェック
	if schedule.Version < 1 {
		return appErrors.NewInvalidInputError(
			fmt.Sprintf(
				"departments[%d].majors[%d].admissionSchedules[%d].version",
				deptIndex, majorIndex, scheduleIndex,
			),
			errInvalidVersion,
			nil,
		)
	}

	// 表示順序のバリデーション
	if schedule.DisplayOrder < 0 {
		return appErrors.NewInvalidInputError(
			fmt.Sprintf(
				"departments[%d].majors[%d].admissionSchedules[%d].displayOrder",
				deptIndex, majorIndex, scheduleIndex,
			),
			fmt.Sprintf(errNonNegative, "表示順序"),
			nil,
		)
	}

	// テストタイプのバリデーション
	for l, testType := range schedule.TestTypes {
		if err := r.validateTestType(testType, deptIndex, majorIndex, scheduleIndex, l); err != nil {
			return err
		}
	}

	return nil
}

// validateTestType はテストタイプのバリデーションを行います。
// この関数は以下の処理を行います：
// - 基本情報の検証
// - 科目の検証
// - エラーの返却
func (r *universityRepository) validateTestType(
	testType models.TestType,
	deptIndex, majorIndex, scheduleIndex, testTypeIndex int,
) error {
	// テストタイプ名のバリデーション
	fieldName := fmt.Sprintf(
		"departments[%d].majors[%d].admissionSchedules[%d].testTypes[%d].name",
		deptIndex, majorIndex, scheduleIndex, testTypeIndex,
	)
	if err := validateName(testType.Name, fieldName); err != nil {
		return err
	}

	// バージョンチェック
	if testType.Version < 1 {
		return appErrors.NewInvalidInputError(
			fmt.Sprintf(
				"departments[%d].majors[%d].admissionSchedules[%d].testTypes[%d].version",
				deptIndex, majorIndex, scheduleIndex, testTypeIndex,
			),
			errInvalidVersion,
			nil,
		)
	}

	// 科目数のバリデーション
	if len(testType.Subjects) > maxSubjectsPerTestType {
		return appErrors.NewInvalidInputError(
			fmt.Sprintf(
				"departments[%d].majors[%d].admissionSchedules[%d].testTypes[%d].subjects",
				deptIndex, majorIndex, scheduleIndex, testTypeIndex,
			),
			fmt.Sprintf(errMaxItems, "科目数", maxSubjectsPerTestType),
			nil,
		)
	}

	subjectNames := make(map[string]bool)
	for m, subject := range testType.Subjects {
		// 科目名の重複チェック
		if subjectNames[subject.Name] {
			return appErrors.NewInvalidInputError(
				fmt.Sprintf(
					"departments[%d].majors[%d].admissionSchedules[%d].testTypes[%d].subjects[%d].name",
					deptIndex, majorIndex, scheduleIndex, testTypeIndex, m,
				),
				fmt.Sprintf(errDuplicateName, "科目名", subject.Name),
				nil,
			)
		}

		subjectNames[subject.Name] = true

		// 科目のバリデーション
		if err := r.validateSubject(subject, deptIndex, majorIndex, scheduleIndex, testTypeIndex, m); err != nil {
			return err
		}
	}

	return nil
}

// validateSubject は科目のバリデーションを行います。
// この関数は以下の処理を行います：
// - 基本情報の検証
// - スコアの検証
// - エラーの返却
func (r *universityRepository) validateSubject(
	subject models.Subject,
	deptIndex, majorIndex, scheduleIndex, testTypeIndex, subjectIndex int,
) error {
	// 科目名のバリデーション
	fieldName := fmt.Sprintf(
		"departments[%d].majors[%d].admissionSchedules[%d].testTypes[%d].subjects[%d].name",
		deptIndex, majorIndex, scheduleIndex, testTypeIndex, subjectIndex,
	)
	if err := validateName(subject.Name, fieldName); err != nil {
		return err
	}

	// バージョンチェック
	if subject.Version < 1 {
		return appErrors.NewInvalidInputError(
			fmt.Sprintf(
				"departments[%d].majors[%d].admissionSchedules[%d].testTypes[%d].subjects[%d].version",
				deptIndex, majorIndex, scheduleIndex, testTypeIndex, subjectIndex,
			),
			errInvalidVersion,
			nil,
		)
	}

	// スコアのバリデーション
	if subject.Score < 0 {
		return appErrors.NewInvalidInputError(
			fmt.Sprintf(
				"departments[%d].majors[%d].admissionSchedules[%d].testTypes[%d].subjects[%d].score",
				deptIndex, majorIndex, scheduleIndex, testTypeIndex, subjectIndex,
			),
			fmt.Sprintf(errNonNegative, "得点"),
			nil,
		)
	}

	// パーセンテージのバリデーション
	if subject.Percentage < 0 || subject.Percentage > 100 {
		return appErrors.NewInvalidInputError(
			fmt.Sprintf(
				"departments[%d].majors[%d].admissionSchedules[%d].testTypes[%d].subjects[%d].percentage",
				deptIndex, majorIndex, scheduleIndex, testTypeIndex, subjectIndex,
			),
			errPercentageRange,
			nil,
		)
	}

	// 表示順序のバリデーション
	if subject.DisplayOrder < 0 {
		return appErrors.NewInvalidInputError(
			fmt.Sprintf(
				"departments[%d].majors[%d].admissionSchedules[%d].testTypes[%d].subjects[%d].displayOrder",
				deptIndex, majorIndex, scheduleIndex, testTypeIndex, subjectIndex,
			),
			fmt.Sprintf(errNonNegative, "表示順序"),
			nil,
		)
	}

	return nil
}
