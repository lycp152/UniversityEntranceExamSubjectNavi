package models

import (
	"time"

	"gorm.io/gorm"
)

type TestType string

const (
	CommonTest    TestType = "共通"
	SecondaryTest TestType = "二次"
)

// University represents a university entity
type University struct {
	gorm.Model
	Name        string       `json:"name" gorm:"not null;uniqueIndex;size:100"`
	Description string       `json:"description" gorm:"type:text"`
	Website     string       `json:"website" gorm:"size:255"`
	Departments []Department `json:"departments,omitempty" gorm:"foreignKey:UniversityID;constraint:OnDelete:CASCADE"`
}

// Department represents a department in a university
type Department struct {
	gorm.Model
	UniversityID uint        `json:"university_id" gorm:"not null;index"`
	Name         string      `json:"name" gorm:"not null;size:100"`
	Description  string      `json:"description" gorm:"type:text"`
	Website      string      `json:"website" gorm:"size:255"`
	University   University  `json:"-" gorm:"foreignKey:UniversityID"`
	Majors       []Major     `json:"majors,omitempty" gorm:"foreignKey:DepartmentID;constraint:OnDelete:CASCADE"`
}

// Major represents a major in a department
type Major struct {
	gorm.Model
	DepartmentID uint        `json:"department_id" gorm:"not null;index"`
	Name         string      `json:"name" gorm:"not null;size:100"`
	Description  string      `json:"description" gorm:"type:text"`
	Website      string      `json:"website" gorm:"size:255"`
	Features     string      `json:"features" gorm:"type:text"`
	Department   Department  `json:"-" gorm:"foreignKey:DepartmentID"`
	ExamInfos    []ExamInfo `json:"exam_infos,omitempty" gorm:"foreignKey:MajorID;constraint:OnDelete:CASCADE"`
}

// Schedule はスケジュールのマスターデータを表します
type Schedule struct {
	gorm.Model
	Name         string    `json:"name" gorm:"not null;uniqueIndex;size:50"`
	DisplayOrder int       `json:"display_order" gorm:"not null;default:0"`
	Description  string    `json:"description" gorm:"type:text"`
	StartDate    time.Time `json:"start_date" gorm:"not null"`
	EndDate      time.Time `json:"end_date" gorm:"not null"`
}

// ExamInfo represents examination information for a major
type ExamInfo struct {
	gorm.Model
	MajorID      uint      `json:"major_id" gorm:"not null;index;index:idx_major_academic_year,priority:1"`
	ScheduleID   uint      `json:"schedule_id" gorm:"not null;index"`
	Schedule     Schedule  `json:"schedule" gorm:"foreignKey:ScheduleID"`
	Enrollment   int       `json:"enrollment" gorm:"not null;check:enrollment > 0"`
	AcademicYear int       `json:"academic_year" gorm:"not null;check:academic_year >= 2000;index:idx_major_academic_year,priority:2"`
	ValidFrom    time.Time `json:"valid_from" gorm:"not null;index:idx_valid_period,priority:1"`
	ValidUntil   time.Time `json:"valid_until" gorm:"not null;index:idx_valid_period,priority:2"`
	Status       string    `json:"status" gorm:"type:varchar(20);default:'active';check:status in ('active','archived','draft')"`
	Major        Major     `json:"-" gorm:"foreignKey:MajorID"`
	Subjects     []Subject `json:"subjects,omitempty" gorm:"foreignKey:ExamInfoID;constraint:OnDelete:CASCADE"`
	CreatedBy    string    `json:"created_by" gorm:"size:100"`
	UpdatedBy    string    `json:"updated_by" gorm:"size:100"`
}

// Subject represents a subject in an exam
type Subject struct {
	gorm.Model
	ExamInfoID   uint        `json:"exam_info_id" gorm:"not null;index"`
	Name         string      `json:"name" gorm:"not null;size:50"`
	DisplayOrder int         `json:"display_order" gorm:"not null;default:0"`
	ExamInfo     ExamInfo    `json:"-" gorm:"foreignKey:ExamInfoID"`
	TestScores   []TestScore `json:"test_scores,omitempty" gorm:"foreignKey:SubjectID;constraint:OnDelete:CASCADE"`
}

// TestScore represents a score for a specific test type
type TestScore struct {
	gorm.Model
	SubjectID  uint     `json:"subject_id" gorm:"not null;index"`
	Type       TestType `json:"test_type" gorm:"type:varchar(10);check:type in ('共通','二次')"`
	Score      int      `json:"score" gorm:"not null;check:score >= 0"`
	Percentage float64  `json:"percentage" gorm:"not null;check:percentage >= 0 AND percentage <= 100"`
	Subject    Subject  `json:"-" gorm:"foreignKey:SubjectID"`
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

	// 数学
	MathCommonScore int     `json:"math_common_score" gorm:"not null;default:0"`
	MathCommonPercentage float64 `json:"math_common_percentage" gorm:"not null;default:0"`
	MathSecondaryScore int     `json:"math_secondary_score" gorm:"not null;default:0"`
	MathSecondaryPercentage float64 `json:"math_secondary_percentage" gorm:"not null;default:0"`

	// 国語
	JapaneseCommonScore int     `json:"japanese_common_score" gorm:"not null;default:0"`
	JapaneseCommonPercentage float64 `json:"japanese_common_percentage" gorm:"not null;default:0"`
	JapaneseSecondaryScore int     `json:"japanese_secondary_score" gorm:"not null;default:0"`
	JapaneseSecondaryPercentage float64 `json:"japanese_secondary_percentage" gorm:"not null;default:0"`

	// 理科
	ScienceCommonScore int     `json:"science_common_score" gorm:"not null;default:0"`
	ScienceCommonPercentage float64 `json:"science_common_percentage" gorm:"not null;default:0"`
	ScienceSecondaryScore int     `json:"science_secondary_score" gorm:"not null;default:0"`
	ScienceSecondaryPercentage float64 `json:"science_secondary_percentage" gorm:"not null;default:0"`

	// 地歴公
	GeographyHistoryCommonScore int     `json:"geography_history_common_score" gorm:"not null;default:0"`
	GeographyHistoryCommonPercentage float64 `json:"geography_history_common_percentage" gorm:"not null;default:0"`
	GeographyHistorySecondaryScore int     `json:"geography_history_secondary_score" gorm:"not null;default:0"`
	GeographyHistorySecondaryPercentage float64 `json:"geography_history_secondary_percentage" gorm:"not null;default:0"`
}
