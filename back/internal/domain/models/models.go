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
	Field     string                 // バリデーション対象のフィールド名
	Condition func(interface{}) bool // バリデーション条件
	Message   string                 // エラーメッセージ
	Code      string                 // エラーコード
}

// ValidationError はバリデーションエラーを表現する構造体
type ValidationError struct {
	Field    string // エラーが発生したフィールド名
	Message  string // エラーメッセージ
	Code     string // エラーコード
	Severity string // エラーの重要度（error, warning, info）
	Err      error  // 元のエラー
	Details  map[string]interface{} // エラーの詳細情報
}

// Unwrap は元のエラーを返す
func (e *ValidationError) Unwrap() error {
	return e.Err
}

// Is はエラーの比較を行う
func (e *ValidationError) Is(target error) bool {
	if target == nil {
		return false
	}

	if err, ok := target.(*ValidationError); ok {
		return e.Code == err.Code
	}

	return false
}

// As はエラーの型変換を行う
func (e *ValidationError) As(target interface{}) bool {
	if err, ok := target.(*ValidationError); ok {
		*err = *e
		return true
	}

	return false
}

// エラーコードの定義
const (
	// データ変換エラー
	ErrTransformError      = "TRANSFORM_ERROR"      // データ変換エラー
	ErrInvalidDataFormat   = "INVALID_DATA_FORMAT"  // データ形式エラー
	ErrMissingRequiredField = "MISSING_REQUIRED_FIELD" // 必須フィールド不足

	// 計算エラー
	ErrCalculationError  = "CALCULATION_ERROR"  // 計算エラー
	ErrInvalidPercentage = "INVALID_PERCENTAGE" // パーセンテージエラー
	ErrTotalExceeded     = "TOTAL_EXCEEDED"     // 合計値超過

	// 表示エラー
	ErrRenderError       = "RENDER_ERROR"       // 描画エラー
	ErrInvalidDimensions = "INVALID_DIMENSIONS" // サイズエラー
	ErrOverflowError     = "OVERFLOW_ERROR"     // オーバーフローエラー
	ErrInvalidDisplayOrder = "表示順は0以上の整数である必要があります"
)

// ErrorMessages はエラーメッセージの定義です。
var ErrorMessages = map[string]string{
	ErrTransformError:      "データの変換中にエラーが発生しました",
	ErrInvalidDataFormat:   "データの形式が不正です",
	ErrMissingRequiredField: "必須フィールドが不足しています",
	ErrCalculationError:    "計算中にエラーが発生しました",
	ErrInvalidPercentage:   "パーセンテージの値が不正です（0-100の範囲）",
	ErrTotalExceeded:       "合計値が上限を超えています",
	ErrRenderError:         "チャートの描画中にエラーが発生しました",
	ErrInvalidDimensions:   "チャートのサイズが不正です",
	ErrOverflowError:       "データが表示可能な範囲を超えています",
}

// ErrorSeverity はエラーの重要度マッピングです。
var ErrorSeverity = map[string]string{
	ErrTransformError:      "error",
	ErrInvalidDataFormat:   "error",
	ErrMissingRequiredField: "error",
	ErrCalculationError:    "error",
	ErrInvalidPercentage:   "error",
	ErrTotalExceeded:       "error",
	ErrRenderError:         "warning",
	ErrInvalidDimensions:   "warning",
	ErrOverflowError:       "warning",
}

// Error はValidationErrorの文字列表現を返す
func (e *ValidationError) Error() string {
	return fmt.Sprintf("フィールド %s のバリデーションに失敗しました: %s", e.Field, e.Message)
}

// BaseModel はすべてのモデルに共通する基本フィールドを定義
type BaseModel struct {
	ID        uint       `json:"id" gorm:"primarykey"`                    // 主キー
	CreatedAt time.Time  `json:"created_at"`                              // 作成日時
	UpdatedAt time.Time  `json:"updated_at"`                              // 更新日時
	DeletedAt *time.Time `json:"deleted_at,omitempty" gorm:"index"`       // 削除日時（ソフトデリート用）
	Version   int        `json:"version" gorm:"not null;default:1"`       // 楽観的ロック用バージョン
	CreatedBy string     `json:"created_by" gorm:"size:100"`              // 作成者
	UpdatedBy string     `json:"updated_by" gorm:"size:100"`              // 更新者
}

// Validate はBaseModelのバリデーションを行う
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

// BeforeUpdate はGORMの更新前フックでバージョンをインクリメントする
func (b *BaseModel) BeforeUpdate() error {
	b.Version++
	return nil
}

// University は大学エンティティを表現する
type University struct {
	BaseModel
	Name        string       `json:"name" gorm:"not null;uniqueIndex:idx_university_name;size:100;check:name <> ''"` // 大学名
	Departments []Department `json:"departments" gorm:"foreignKey:UniversityID;constraint:OnDelete:CASCADE"`         // 学部一覧
}

// Validate はUniversityのバリデーションを行う
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

// BeforeCreate はGORMの作成前フックでバリデーションを行う
func (u *University) BeforeCreate(_ *gorm.DB) error {
	return u.Validate()
}

// BeforeUpdate はGORMの更新前フックでバリデーションを行う
func (u *University) BeforeUpdate(_ *gorm.DB) error {
	if err := u.BaseModel.BeforeUpdate(); err != nil {
		return err
	}

	return u.Validate()
}

// Department は学部エンティティを表現する
type Department struct {
	BaseModel
	UniversityID uint       `json:"university_id" gorm:"not null;index:idx_dept_univ_name"` // 大学ID
	Name         string     `json:"name" gorm:"not null;index:idx_dept_univ_name;size:100;check:name <> ''"` // 学部名
	University   University `json:"-" gorm:"foreignKey:UniversityID"`                        // 所属大学
	Majors       []Major    `json:"majors" gorm:"foreignKey:DepartmentID;constraint:OnDelete:CASCADE"` // 学科一覧
}

// Validate はDepartmentのバリデーションを行う
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

// validateRules は指定されたルールに基づいてバリデーションを実行する
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
				Details: map[string]interface{}{
					"value": field.Interface(),
				},
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
	Errors []ValidationError // バリデーションエラーの一覧
}

// Error はValidationErrorsの文字列表現を返す
func (e *ValidationErrors) Error() string {
	if len(e.Errors) == 0 {
		return "バリデーションに失敗しました"
	}

	return fmt.Sprintf("バリデーションエラー: %v", e.Errors)
}

// containsSpecialCharacters は文字列に特殊文字が含まれているかチェックする
func containsSpecialCharacters(s string) bool {
	for _, r := range s {
		// 制御文字（0-31）と特殊文字（127-159）のみを特殊文字として扱う
		if (r >= 0 && r <= 31) || (r >= 127 && r <= 159) {
			return true
		}
	}

	return false
}

// Major は学科エンティティを表現する
type Major struct {
	BaseModel
	DepartmentID      uint              `json:"department_id" gorm:"not null;index:idx_major_dept"` // 学部ID
	Name             string            `json:"name" gorm:"not null;index:idx_major_name;size:100;check:name <> ''"` // 学科名
	Department       Department        `json:"-" gorm:"foreignKey:DepartmentID"` // 所属学部
	AdmissionSchedules []AdmissionSchedule `json:"admission_schedules,omitempty" gorm:"foreignKey:MajorID;constraint:OnDelete:CASCADE"` // 入試日程一覧
}

// Validate はMajorのバリデーションを行う
func (m *Major) Validate() error {
	if err := m.BaseModel.Validate(); err != nil {
		return err
	}

	rules := []ValidationRule{
		{
			Field: "DepartmentID",
			Condition: func(v interface{}) bool {
				id, ok := v.(uint)
				return ok && id > 0
			},
			Message: "学部IDは必須です",
			Code:    "REQUIRED_DEPARTMENT_ID",
		},
		{
			Field: "Name",
			Condition: func(v interface{}) bool {
				name, ok := v.(string)
				return ok && len(name) > 0 && len(name) <= 50
			},
			Message: "学科名は1-50文字である必要があります",
			Code:    "INVALID_MAJOR_NAME",
		},
		{
			Field: "DisplayOrder",
			Condition: func(v interface{}) bool {
				order, ok := v.(int)
				return ok && order >= 0
			},
			Message: ErrInvalidDisplayOrder,
			Code:    "INVALID_DISPLAY_ORDER",
		},
	}

	return validateRules(m, rules)
}

// AdmissionSchedule は入試日程エンティティを表現する
type AdmissionSchedule struct {
	BaseModel
	MajorID       uint           `json:"major_id" gorm:"not null;index:idx_schedule_major_year"` // 学科ID
	Name          string         `json:"name" gorm:"not null;size:6;check:name in ('前期','中期','後期')"` // 日程名
	DisplayOrder  int           `json:"display_order" gorm:"not null;default:0;check:display_order >= 0 AND display_order <= 3"` // 表示順
	Major         Major         `json:"-" gorm:"foreignKey:MajorID"` // 所属学科
	AdmissionInfos []AdmissionInfo `json:"admission_infos,omitempty" gorm:"foreignKey:AdmissionScheduleID;constraint:OnDelete:CASCADE"` // 入試情報一覧
	TestTypes     []TestType    `json:"test_types,omitempty" gorm:"foreignKey:AdmissionScheduleID;constraint:OnDelete:CASCADE"` // 試験種別一覧
}

// Validate はAdmissionScheduleのバリデーションを行う
func (a *AdmissionSchedule) Validate() error {
	if err := a.BaseModel.Validate(); err != nil {
		return err
	}

	rules := []ValidationRule{
		{
			Field: "MajorID",
			Condition: func(v interface{}) bool {
				id, ok := v.(uint)
				return ok && id > 0
			},
			Message: "学科IDは必須です",
			Code:    "REQUIRED_MAJOR_ID",
		},
		{
			Field: "Name",
			Condition: func(v interface{}) bool {
				name, ok := v.(string)
				return ok && (name == "前期" || name == "中期" || name == "後期")
			},
			Message: "日程名は'前期'、'中期'、'後期'のいずれかである必要があります",
			Code:    "INVALID_SCHEDULE_NAME",
		},
		{
			Field: "DisplayOrder",
			Condition: func(v interface{}) bool {
				order, ok := v.(int)
				return ok && order >= 0
			},
			Message: ErrInvalidDisplayOrder,
			Code:    "INVALID_DISPLAY_ORDER",
		},
	}

	return validateRules(a, rules)
}

// AdmissionInfo は入試情報エンティティを表現する
type AdmissionInfo struct {
	BaseModel
	AdmissionScheduleID uint            `json:"admission_schedule_id" gorm:"not null;index:idx_info_schedule_year"` // 入試日程ID
	Enrollment int `json:"enrollment" gorm:"not null;check:enrollment > 0 AND enrollment <= 9999"` // 募集人数
	AcademicYear int `json:"academic_year" gorm:"not null;index:idx_info_schedule_year;check:academic_year >= 2000 AND academic_year <= 2100"` // 学年度
	Status string `json:"status" gorm:"type:varchar(20);default:'draft';check:status in ('draft','published','archived')"` // ステータス
	AdmissionSchedule  AdmissionSchedule `json:"-" gorm:"foreignKey:AdmissionScheduleID"` // 所属入試日程
	TestTypes []TestType `json:"test_types,omitempty" gorm:"many2many:admission_info_test_types"` // 試験種別一覧
}

// Validate はAdmissionInfoのバリデーションを行う
func (a *AdmissionInfo) Validate() error {
	if err := a.BaseModel.Validate(); err != nil {
		return err
	}

	rules := []ValidationRule{
		{
			Field: "AdmissionScheduleID",
			Condition: func(v interface{}) bool {
				id, ok := v.(uint)
				return ok && id > 0
			},
			Message: "入試日程IDは必須です",
			Code:    "REQUIRED_ADMISSION_SCHEDULE_ID",
		},
		{
			Field: "Enrollment",
			Condition: func(v interface{}) bool {
				enrollment, ok := v.(int)
				return ok && enrollment > 0 && enrollment <= 9999
			},
			Message: "募集人数は1-9999の範囲である必要があります",
			Code:    "INVALID_ENROLLMENT",
		},
		{
			Field: "AcademicYear",
			Condition: func(v interface{}) bool {
				year, ok := v.(int)
				return ok && year >= 2000 && year <= 2100
			},
			Message: "学年度は2000-2100の範囲である必要があります",
			Code:    "INVALID_ACADEMIC_YEAR",
		},
		{
			Field: "Status",
			Condition: func(v interface{}) bool {
				status, ok := v.(string)
				return ok && (status == "draft" || status == "published" || status == "archived")
			},
			Message: "ステータスは'draft'、'published'、'archived'のいずれかである必要があります",
			Code:    "INVALID_STATUS",
		},
	}

	return validateRules(a, rules)
}

// TestType は試験種別エンティティを表現する
type TestType struct {
	BaseModel
	AdmissionScheduleID uint      `json:"admission_schedule_id" gorm:"not null;index:idx_test_schedule"` // 入試日程ID
	Name               string    `json:"name" gorm:"not null;type:varchar(10);check:name in ('共通','二次')"` // 試験種別名
	AdmissionSchedule  AdmissionSchedule `json:"-" gorm:"foreignKey:AdmissionScheduleID"` // 所属入試日程
	Subjects          []Subject         `json:"subjects,omitempty" gorm:"foreignKey:TestTypeID;constraint:OnDelete:CASCADE"` // 科目一覧
}

// Validate はTestTypeのバリデーションを行う
func (t *TestType) Validate() error {
	if err := t.BaseModel.Validate(); err != nil {
		return err
	}

	rules := []ValidationRule{
		{
			Field: "AdmissionScheduleID",
			Condition: func(v interface{}) bool {
				id, ok := v.(uint)
				return ok && id > 0
			},
			Message: "入試日程IDは必須です",
			Code:    "REQUIRED_ADMISSION_SCHEDULE_ID",
		},
		{
			Field: "Name",
			Condition: func(v interface{}) bool {
				name, ok := v.(string)
				return ok && (name == "共通" || name == "二次")
			},
			Message: "試験種別名は'共通'または'二次'である必要があります",
			Code:    "INVALID_TEST_TYPE_NAME",
		},
	}

	return validateRules(t, rules)
}

// Subject は科目エンティティを表現する
type Subject struct {
	BaseModel
	TestTypeID   uint     `json:"test_type_id" gorm:"not null;index:idx_subject_test"` // 試験種別ID
	Name         string   `json:"name" gorm:"not null;index:idx_subject_name;size:20;check:name <> ''"` // 科目名
	Score        int      `json:"score" gorm:"not null;check:score >= 0 AND score <= 1000"` // 配点
	Percentage   float64  `json:"percentage" gorm:"not null;check:percentage >= 0 AND percentage <= 100"` // 配点比率
	DisplayOrder int      `json:"display_order" gorm:"not null;default:0;check:display_order >= 0"` // 表示順
	TestType     TestType `json:"-" gorm:"foreignKey:TestTypeID"` // 所属試験種別
}

// Validate はSubjectのバリデーションを行う
func (s *Subject) Validate() error {
	if err := s.BaseModel.Validate(); err != nil {
		return err
	}

	rules := []ValidationRule{
		{
			Field: "TestTypeID",
			Condition: func(v interface{}) bool {
				id, ok := v.(uint)
				return ok && id > 0
			},
			Message: "試験種別IDは必須です",
			Code:    "REQUIRED_TEST_TYPE_ID",
		},
		{
			Field: "Name",
			Condition: func(v interface{}) bool {
				name, ok := v.(string)
				return ok && len(name) > 0 && len(name) <= 50
			},
			Message: "科目名は1-50文字である必要があります",
			Code:    "INVALID_SUBJECT_NAME",
		},
		{
			Field: "Score",
			Condition: func(v interface{}) bool {
				score, ok := v.(int)
				return ok && score >= 0 && score <= 1000
			},
			Message: "配点は0-1000の範囲である必要があります",
			Code:    "INVALID_SCORE",
		},
		{
			Field: "Percentage",
			Condition: func(v interface{}) bool {
				percentage, ok := v.(float64)
				return ok && percentage >= 0 && percentage <= 100
			},
			Message: "配点比率は0-100の範囲である必要があります",
			Code:    "INVALID_PERCENTAGE",
		},
		{
			Field: "DisplayOrder",
			Condition: func(v interface{}) bool {
				order, ok := v.(int)
				return ok && order >= 0
			},
			Message: ErrInvalidDisplayOrder,
			Code:    "INVALID_DISPLAY_ORDER",
		},
	}

	return validateRules(s, rules)
}

// TestEnv はテスト環境の設定を表現する構造体
type TestEnv struct {
	DB        *gorm.DB     // データベース接続
	Server    *echo.Echo   // Echoサーバー
	TestData  map[string]interface{} // テストデータ
}
