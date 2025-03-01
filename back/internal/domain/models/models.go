package models

import (
	"errors"
	"time"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

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
	if b.Version < 1 {
		return errors.New("version must be greater than 0")
	}
	return nil
}

// BeforeUpdate is a GORM hook that increments the version
func (b *BaseModel) BeforeUpdate() error {
	b.Version++
	return nil
}

// University represents a university entity
type University struct {
	BaseModel
	Name        string       `json:"name" gorm:"not null;uniqueIndex;size:100;check:name <> ''"`
	Departments []Department `json:"departments" gorm:"foreignKey:UniversityID;constraint:OnDelete:CASCADE"`
}

// Validate validates the university
func (u *University) Validate() error {
	if err := u.BaseModel.Validate(); err != nil {
		return err
	}
	if u.Name == "" {
		return errors.New("大学名は必須です")
	}
	if len(u.Name) > 100 {
		return errors.New("大学名は100文字以内である必要があります")
	}
	return nil
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
	UniversityID uint        `json:"university_id" gorm:"not null;index"`
	Name         string      `json:"name" gorm:"not null;size:100;check:name <> ''"`
	University   University  `json:"-" gorm:"foreignKey:UniversityID"`
	Majors       []Major     `json:"majors" gorm:"foreignKey:DepartmentID;constraint:OnDelete:CASCADE"`
}

// Major represents a major in a department
type Major struct {
	BaseModel
	DepartmentID    uint            `json:"department_id" gorm:"not null;index"`
	Name            string          `json:"name" gorm:"not null;size:100;check:name <> ''"`
	Department      Department      `json:"-" gorm:"foreignKey:DepartmentID"`
	AdmissionSchedules []AdmissionSchedule `json:"admission_schedules,omitempty" gorm:"foreignKey:MajorID;constraint:OnDelete:CASCADE"`
}

// AdmissionSchedule represents a admissionSchedule period
type AdmissionSchedule struct {
	BaseModel
	MajorID    uint       `json:"major_id" gorm:"not null;index"`
	Name       string     `json:"name" gorm:"not null;size:50;check:name in ('前期','中期','後期')"`
	DisplayOrder int      `json:"display_order" gorm:"not null;default:0;check:display_order >= 0"`
	Major      Major      `json:"-" gorm:"foreignKey:MajorID"`
	AdmissionInfos []AdmissionInfo `json:"admission_infos,omitempty" gorm:"foreignKey:AdmissionScheduleID;constraint:OnDelete:CASCADE"`
	TestTypes  []TestType `json:"test_types,omitempty" gorm:"foreignKey:AdmissionScheduleID;constraint:OnDelete:CASCADE"`
}

// AdmissionInfo represents examination information for a major
type AdmissionInfo struct {
	BaseModel
	AdmissionScheduleID uint       `json:"admission_schedule_id" gorm:"not null;index"`
	Enrollment        int         `json:"enrollment" gorm:"not null;check:enrollment > 0 AND enrollment <= 9999"`
	AcademicYear      int         `json:"academic_year" gorm:"not null;check:academic_year >= 2000 AND academic_year <= 2100"`
	ValidFrom         time.Time   `json:"valid_from" gorm:"not null;check:valid_from <= valid_until"`
	ValidUntil        time.Time   `json:"valid_until" gorm:"not null"`
	Status            string      `json:"status" gorm:"type:varchar(20);default:'draft';check:status in ('draft','published','archived')"`
	AdmissionSchedule AdmissionSchedule `json:"-" gorm:"foreignKey:AdmissionScheduleID"`
	TestTypes        []TestType   `json:"test_types,omitempty" gorm:"many2many:admission_info_test_types"`
}

// TestType represents a type of examination (共通 or 二次)
type TestType struct {
	BaseModel
	AdmissionScheduleID uint      `json:"admission_schedule_id" gorm:"not null;index"`
	Name               string    `json:"name" gorm:"not null;type:varchar(10);check:name in ('共通','二次')"`
	AdmissionSchedule  AdmissionSchedule  `json:"-" gorm:"foreignKey:AdmissionScheduleID"`
	Subjects          []Subject `json:"subjects,omitempty" gorm:"foreignKey:TestTypeID;constraint:OnDelete:CASCADE"`
}

// Subject represents a subject in an exam
type Subject struct {
	BaseModel
	TestTypeID    uint      `json:"test_type_id" gorm:"not null;index"`
	Name          string    `json:"name" gorm:"not null;size:50;check:name <> ''"`
	Score         int       `json:"score" gorm:"not null;check:score >= 0 AND score <= 1000"`
	Percentage    float64   `json:"percentage" gorm:"not null;check:percentage >= 0 AND percentage <= 100"`
	DisplayOrder  int       `json:"display_order" gorm:"not null;default:0;check:display_order >= 0"`
	TestType      TestType  `json:"-" gorm:"foreignKey:TestTypeID"`
}

// DepartmentSubjects represents all subjects for a department (legacy table)
type DepartmentSubjects struct {
	gorm.Model
	DepartmentID uint     `json:"department_id" gorm:"not null;index"`
	Department   Department `json:"-" gorm:"foreignKey:DepartmentID"`

	// 英語L
	EnglishLCommonScore int     `json:"english_l_common_score" gorm:"not null;default:0"`
	EnglishLCommonPercentage float64 `json:"english_l_common_percentage" gorm:"not null;default:0"`
	EnglishLSecondaryScore int     `json:"english_l_secondary_score" gorm:"not null;default:0"`
	EnglishLSecondaryPercentage float64 `json:"english_l_secondary_percentage" gorm:"not null;default:0"`

	// 英語R
	EnglishRCommonScore int     `json:"english_r_common_score" gorm:"not null;default:0"`
	EnglishRCommonPercentage float64 `json:"english_r_common_percentage" gorm:"not null;default:0"`
	EnglishRSecondaryScore int     `json:"english_r_secondary_score" gorm:"not null;default:0"`
	EnglishRSecondaryPercentage float64 `json:"english_r_secondary_percentage" gorm:"not null;default:0"`
}

// TestEnv はテスト環境の設定を表現する構造体です
type TestEnv struct {
	DB        *gorm.DB
	Server    *echo.Echo
	TestData  map[string]interface{}
}
