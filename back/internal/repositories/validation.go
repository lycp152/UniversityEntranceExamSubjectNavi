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

// ValidationRule はバリデーションルールを定義します
type ValidationRule struct {
	Field     string
	Validator func(interface{}) error
	Message   string
	Code      string
	Severity  string
}

// ValidationRules はバリデーションルールのマップを定義します
type ValidationRules map[string][]ValidationRule

// validationCache はバリデーションルールのキャッシュを管理します
type validationCache struct {
	rules ValidationRules
	mu    sync.RWMutex
}

var (
	validationCacheInstance = &validationCache{
		rules: make(ValidationRules),
	}
)

// validateWithRules は指定されたルールでバリデーションを行います
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

// getValidationRules はエンティティごとのバリデーションルールを返します
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
							name := v.(string)
							return validateName(name, "大学名")
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
							name := v.(string)
							return validateName(name, "学部名")
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

// validateName は名前の共通バリデーションを行います
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

// validateUniversity は大学のバリデーションを行います
func (r *universityRepository) validateUniversity(university *models.University) error {
	if university == nil {
		return appErrors.NewInvalidInputError("university", "大学データが指定されていません", nil)
	}

	rules := getValidationRules()
	if err := validateWithRules(university, rules["university"]); err != nil {
		return err
	}

	if university.Version < 1 {
		return appErrors.NewInvalidInputError("version", "バージョンは1以上である必要があります", nil)
	}

	if len(university.Departments) > maxDepartmentsPerUniversity {
		return appErrors.NewInvalidInputError("departments", fmt.Sprintf("学部数は%d以下である必要があります", maxDepartmentsPerUniversity), nil)
	}

	return r.validateUniversityRelations(university)
}

func (r *universityRepository) validateUniversityRelations(university *models.University) error {
	departmentNames := make(map[string]bool)

	for i, dept := range university.Departments {
		// 学部名の重複チェック
		if departmentNames[dept.Name] {
			return appErrors.NewInvalidInputError(fmt.Sprintf("departments[%d].name", i), fmt.Sprintf(errDuplicateName, "学部名", dept.Name), nil)
		}

		departmentNames[dept.Name] = true

		// 学部のバリデーション
		if err := r.validateDepartment(dept, i); err != nil {
			return err
		}
	}

	return nil
}

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
		return appErrors.NewInvalidInputError(fmt.Sprintf("departments[%d].majors", index), fmt.Sprintf(errMaxItems, "学科数", maxMajorsPerDepartment), nil)
	}

	majorNames := make(map[string]bool)
	for j, major := range dept.Majors {
		// 学科名の重複チェック
		if majorNames[major.Name] {
			return appErrors.NewInvalidInputError(fmt.Sprintf("departments[%d].majors[%d].name", index, j), fmt.Sprintf(errDuplicateName, "学科名", major.Name), nil)
		}

		majorNames[major.Name] = true

		// 学科のバリデーション
		if err := r.validateMajor(major, index, j); err != nil {
			return err
		}
	}

	return nil
}

func (r *universityRepository) validateMajor(major models.Major, deptIndex, majorIndex int) error {
	// 学科名のバリデーション
	if err := validateName(major.Name, fmt.Sprintf("departments[%d].majors[%d].name", deptIndex, majorIndex)); err != nil {
		return err
	}

	// バージョンチェック
	if major.Version < 1 {
		return appErrors.NewInvalidInputError(fmt.Sprintf("departments[%d].majors[%d].version", deptIndex, majorIndex), errInvalidVersion, nil)
	}

	// 入試スケジュールのバリデーション
	for k, schedule := range major.AdmissionSchedules {
		if err := r.validateAdmissionSchedule(schedule, deptIndex, majorIndex, k); err != nil {
			return err
		}
	}

	return nil
}

func (r *universityRepository) validateAdmissionSchedule(schedule models.AdmissionSchedule, deptIndex, majorIndex, scheduleIndex int) error {
	// スケジュール名のバリデーション
	if err := validateName(schedule.Name, fmt.Sprintf("departments[%d].majors[%d].admissionSchedules[%d].name", deptIndex, majorIndex, scheduleIndex)); err != nil {
		return err
	}

	// バージョンチェック
	if schedule.Version < 1 {
		return appErrors.NewInvalidInputError(fmt.Sprintf("departments[%d].majors[%d].admissionSchedules[%d].version", deptIndex, majorIndex, scheduleIndex), errInvalidVersion, nil)
	}

	// 表示順序のバリデーション
	if schedule.DisplayOrder < 0 {
		return appErrors.NewInvalidInputError(fmt.Sprintf("departments[%d].majors[%d].admissionSchedules[%d].displayOrder", deptIndex, majorIndex, scheduleIndex), fmt.Sprintf(errNonNegative, "表示順序"), nil)
	}

	// テストタイプのバリデーション
	for l, testType := range schedule.TestTypes {
		if err := r.validateTestType(testType, deptIndex, majorIndex, scheduleIndex, l); err != nil {
			return err
		}
	}

	return nil
}

func (r *universityRepository) validateTestType(testType models.TestType, deptIndex, majorIndex, scheduleIndex, testTypeIndex int) error {
	// テストタイプ名のバリデーション
	if err := validateName(testType.Name, fmt.Sprintf("departments[%d].majors[%d].admissionSchedules[%d].testTypes[%d].name", deptIndex, majorIndex, scheduleIndex, testTypeIndex)); err != nil {
		return err
	}

	// バージョンチェック
	if testType.Version < 1 {
		return appErrors.NewInvalidInputError(fmt.Sprintf("departments[%d].majors[%d].admissionSchedules[%d].testTypes[%d].version", deptIndex, majorIndex, scheduleIndex, testTypeIndex), errInvalidVersion, nil)
	}

	// 科目数のバリデーション
	if len(testType.Subjects) > maxSubjectsPerTestType {
		return appErrors.NewInvalidInputError(fmt.Sprintf("departments[%d].majors[%d].admissionSchedules[%d].testTypes[%d].subjects", deptIndex, majorIndex, scheduleIndex, testTypeIndex), fmt.Sprintf(errMaxItems, "科目数", maxSubjectsPerTestType), nil)
	}

	subjectNames := make(map[string]bool)
	for m, subject := range testType.Subjects {
		// 科目名の重複チェック
		if subjectNames[subject.Name] {
			return appErrors.NewInvalidInputError(fmt.Sprintf("departments[%d].majors[%d].admissionSchedules[%d].testTypes[%d].subjects[%d].name", deptIndex, majorIndex, scheduleIndex, testTypeIndex, m), fmt.Sprintf(errDuplicateName, "科目名", subject.Name), nil)
		}

		subjectNames[subject.Name] = true

		// 科目のバリデーション
		if err := r.validateSubject(subject, deptIndex, majorIndex, scheduleIndex, testTypeIndex, m); err != nil {
			return err
		}
	}

	return nil
}

func (r *universityRepository) validateSubject(subject models.Subject, deptIndex, majorIndex, scheduleIndex, testTypeIndex, subjectIndex int) error {
	// 科目名のバリデーション
	if err := validateName(subject.Name, fmt.Sprintf("departments[%d].majors[%d].admissionSchedules[%d].testTypes[%d].subjects[%d].name", deptIndex, majorIndex, scheduleIndex, testTypeIndex, subjectIndex)); err != nil {
		return err
	}

	// バージョンチェック
	if subject.Version < 1 {
		return appErrors.NewInvalidInputError(fmt.Sprintf("departments[%d].majors[%d].admissionSchedules[%d].testTypes[%d].subjects[%d].version", deptIndex, majorIndex, scheduleIndex, testTypeIndex, subjectIndex), errInvalidVersion, nil)
	}

	// スコアのバリデーション
	if subject.Score < 0 {
		return appErrors.NewInvalidInputError(fmt.Sprintf("departments[%d].majors[%d].admissionSchedules[%d].testTypes[%d].subjects[%d].score", deptIndex, majorIndex, scheduleIndex, testTypeIndex, subjectIndex), fmt.Sprintf(errNonNegative, "得点"), nil)
	}

	// パーセンテージのバリデーション
	if subject.Percentage < 0 || subject.Percentage > 100 {
		return appErrors.NewInvalidInputError(fmt.Sprintf("departments[%d].majors[%d].admissionSchedules[%d].testTypes[%d].subjects[%d].percentage", deptIndex, majorIndex, scheduleIndex, testTypeIndex, subjectIndex), errPercentageRange, nil)
	}

	// 表示順序のバリデーション
	if subject.DisplayOrder < 0 {
		return appErrors.NewInvalidInputError(fmt.Sprintf("departments[%d].majors[%d].admissionSchedules[%d].testTypes[%d].subjects[%d].displayOrder", deptIndex, majorIndex, scheduleIndex, testTypeIndex, subjectIndex), fmt.Sprintf(errNonNegative, "表示順序"), nil)
	}

	return nil
}
