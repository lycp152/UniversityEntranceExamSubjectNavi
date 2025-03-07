package models

import (
	"fmt"
	"reflect"
	"time"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

// ValidationRule はバリデーションルールを定義する構造体
type ValidationRule struct {
	Field     string
	Condition func(interface{}) bool
	Message   string
	Code      string
}

// ValidationError はバリデーションエラーを表現する構造体
type ValidationError struct {
	Field   string
	Message string
	Code    string
}

func (e *ValidationError) Error() string {
	return fmt.Sprintf("validation failed for field %s: %s", e.Field, e.Message)
}

// BaseModel represents common fields for all models
type BaseModel struct {
	ID        uint       `json:"id" gorm:"primarykey"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `json:"deleted_at,omitempty" gorm:"index"`
	Version   int        `json:"version" gorm:"not null;default:1"` // 楽観的ロック用
	CreatedBy string     `json:"created_by" gorm:"size:100"`
	UpdatedBy string     `json:"updated_by" gorm:"size:100"`
}

// Validate validates the base model
func (b *BaseModel) Validate() error {
	rules := []ValidationRule{
		{
			Field: "Version",
			Condition: func(v interface{}) bool {
				version, ok := v.(int)
				return ok && version > 0
			},
			Message: "バージョンは0より大きい必要があります",
			Code:    "INVALID_VERSION",
		},
	}

	return validateRules(b, rules)
}

// BeforeUpdate is a GORM hook that increments the version
func (b *BaseModel) BeforeUpdate() error {
	b.Version++
	return nil
}

// University represents a university entity
type University struct {
	BaseModel
	Name        string       `json:"name" gorm:"not null;uniqueIndex:idx_university_name;size:100;check:name <> ''"`
	Departments []Department `json:"departments" gorm:"foreignKey:UniversityID;constraint:OnDelete:CASCADE"`
}

// Validate validates the university
func (u *University) Validate() error {
	if err := u.BaseModel.Validate(); err != nil {
		return err
	}

	rules := []ValidationRule{
		{
			Field: "Name",
			Condition: func(v interface{}) bool {
				name, ok := v.(string)
				return ok && name != "" && len(name) <= 100 && !containsSpecialCharacters(name)
			},
			Message: "大学名は1-100文字の範囲で、特殊文字を含まない必要があります",
			Code:    "INVALID_NAME",
		},
	}

	return validateRules(u, rules)
}

// BeforeCreate is a GORM hook that validates before creation
func (u *University) BeforeCreate(tx *gorm.DB) error {
	return u.Validate()
}

// BeforeUpdate is a GORM hook that validates before update
func (u *University) BeforeUpdate(tx *gorm.DB) error {
	if err := u.BaseModel.BeforeUpdate(); err != nil {
		return err
	}
	return u.Validate()
}

// Department represents a department in a university
type Department struct {
	BaseModel
	UniversityID uint        `json:"university_id" gorm:"not null;index:idx_dept_univ_name"`
	Name         string      `json:"name" gorm:"not null;index:idx_dept_univ_name;size:100;check:name <> ''"`
	University   University  `json:"-" gorm:"foreignKey:UniversityID"`
	Majors       []Major     `json:"majors" gorm:"foreignKey:DepartmentID;constraint:OnDelete:CASCADE"`
}

// Validate validates the department
func (d *Department) Validate() error {
	if err := d.BaseModel.Validate(); err != nil {
		return err
	}

	rules := []ValidationRule{
		{
			Field: "Name",
			Condition: func(v interface{}) bool {
				name, ok := v.(string)
				return ok && name != "" && len(name) <= 100 && !containsSpecialCharacters(name)
			},
			Message: "学部名は1-100文字の範囲で、特殊文字を含まない必要があります",
			Code:    "INVALID_NAME",
		},
		{
			Field: "UniversityID",
			Condition: func(v interface{}) bool {
				id, ok := v.(uint)
				return ok && id > 0
			},
			Message: "大学IDは必須です",
			Code:    "REQUIRED_UNIVERSITY_ID",
		},
	}

	return validateRules(d, rules)
}

// validateRules は指定されたルールに基づいてバリデーションを実行します
func validateRules(v interface{}, rules []ValidationRule) error {
	val := reflect.ValueOf(v).Elem()
	var validationErrors []ValidationError

	for _, rule := range rules {
		field := val.FieldByName(rule.Field)
		if !field.IsValid() {
			continue
		}
		if !rule.Condition(field.Interface()) {
			validationErrors = append(validationErrors, ValidationError{
				Field:   rule.Field,
				Message: rule.Message,
				Code:    rule.Code,
			})
		}
	}

	if len(validationErrors) > 0 {
		return &ValidationErrors{Errors: validationErrors}
	}
	return nil
}

// ValidationErrors は複数のバリデーションエラーを表現する構造体
type ValidationErrors struct {
	Errors []ValidationError
}

func (e *ValidationErrors) Error() string {
	if len(e.Errors) == 0 {
		return "validation failed"
	}
	return fmt.Sprintf("validation failed: %v", e.Errors)
}

// containsSpecialCharacters は文字列に特殊文字が含まれているかチェックします
func containsSpecialCharacters(s string) bool {
	for _, r := range s {
		// 制御文字（0-31）と特殊文字（127-159）のみを特殊文字として扱う
		if (r >= 0 && r <= 31) || (r >= 127 && r <= 159) {
			return true
		}
	}
	return false
}

// Major represents a major in a department
type Major struct {
	BaseModel
	DepartmentID    uint            `json:"department_id" gorm:"not null;index:idx_major_dept"`
	Name            string          `json:"name" gorm:"not null;index:idx_major_name;size:100;check:name <> ''"`
	Department      Department      `json:"-" gorm:"foreignKey:DepartmentID"`
	AdmissionSchedules []AdmissionSchedule `json:"admission_schedules,omitempty" gorm:"foreignKey:MajorID;constraint:OnDelete:CASCADE"`
}

// AdmissionSchedule represents a admissionSchedule period
type AdmissionSchedule struct {
	BaseModel
	MajorID    uint       `json:"major_id" gorm:"not null;index:idx_schedule_major_year"`
	Name       string     `json:"name" gorm:"not null;size:50;check:name in ('前期','中期','後期')"`
	DisplayOrder int      `json:"display_order" gorm:"not null;default:0;check:display_order >= 0"`
	Major      Major      `json:"-" gorm:"foreignKey:MajorID"`
	AdmissionInfos []AdmissionInfo `json:"admission_infos,omitempty" gorm:"foreignKey:AdmissionScheduleID;constraint:OnDelete:CASCADE"`
	TestTypes  []TestType `json:"test_types,omitempty" gorm:"foreignKey:AdmissionScheduleID;constraint:OnDelete:CASCADE"`
}

// AdmissionInfo represents examination information for a major
type AdmissionInfo struct {
	BaseModel
	AdmissionScheduleID uint       `json:"admission_schedule_id" gorm:"not null;index:idx_info_schedule_year"`
	Enrollment        int         `json:"enrollment" gorm:"not null;check:enrollment > 0 AND enrollment <= 9999"`
	AcademicYear      int         `json:"academic_year" gorm:"not null;index:idx_info_schedule_year;check:academic_year >= 2000 AND academic_year <= 2100"`
	Status            string      `json:"status" gorm:"type:varchar(20);default:'draft';check:status in ('draft','published','archived')"`
	AdmissionSchedule AdmissionSchedule `json:"-" gorm:"foreignKey:AdmissionScheduleID"`
	TestTypes        []TestType   `json:"test_types,omitempty" gorm:"many2many:admission_info_test_types"`
}

// TestType represents a type of examination (共通 or 二次)
type TestType struct {
	BaseModel
	AdmissionScheduleID uint      `json:"admission_schedule_id" gorm:"not null;index:idx_test_schedule"`
	Name               string    `json:"name" gorm:"not null;type:varchar(10);check:name in ('共通','二次')"`
	AdmissionSchedule  AdmissionSchedule  `json:"-" gorm:"foreignKey:AdmissionScheduleID"`
	Subjects          []Subject `json:"subjects,omitempty" gorm:"foreignKey:TestTypeID;constraint:OnDelete:CASCADE"`
}

// Subject represents a subject in an exam
type Subject struct {
	BaseModel
	TestTypeID    uint      `json:"test_type_id" gorm:"not null;index:idx_subject_test"`
	Name          string    `json:"name" gorm:"not null;index:idx_subject_name;size:50;check:name <> ''"`
	Score         int       `json:"score" gorm:"not null;check:score >= 0 AND score <= 1000"`
	Percentage    float64   `json:"percentage" gorm:"not null;check:percentage >= 0 AND percentage <= 100"`
	DisplayOrder  int       `json:"display_order" gorm:"not null;default:0;check:display_order >= 0"`
	TestType      TestType  `json:"-" gorm:"foreignKey:TestTypeID"`
}

// TestEnv はテスト環境の設定を表現する構造体です
type TestEnv struct {
	DB        *gorm.DB
	Server    *echo.Echo
	TestData  map[string]interface{}
}
