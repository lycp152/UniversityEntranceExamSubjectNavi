// Package models はアプリケーションのドメインモデルを定義します。
// このパッケージには以下の機能が含まれます：
// 1. データベースのテーブル構造と対応する構造体
// 2. バリデーションルールとエラーハンドリング
// 3. リレーションシップの定義
// 4. インデックスの定義
package models

import (
	"fmt"
	"reflect"
	"time"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

// ValidationRule はバリデーションルールを定義する構造体です
// 以下のフィールドを含みます：
// - Field: バリデーション対象のフィールド名
// - Condition: バリデーション条件を定義する関数
// - Message: エラーメッセージ
// - Code: エラーコード
type ValidationRule struct {
	Field     string                 // バリデーション対象のフィールド名
	Condition func(interface{}) bool // バリデーション条件
	Message   string                 // エラーメッセージ
	Code      string                 // エラーコード
}

// ValidationError はバリデーションエラーを表現する構造体です
// 以下のフィールドを含みます：
// - Field: エラーが発生したフィールド名
// - Message: エラーメッセージ
// - Code: エラーコード
// - Severity: エラーの重要度
// - Err: 元のエラー
// - Details: エラーの詳細情報
type ValidationError struct {
	Field    string                 // エラーが発生したフィールド名
	Message  string                 // エラーメッセージ
	Code     string                 // エラーコード
	Severity string                 // エラーの重要度（error, warning）
	Err      error                  // 元のエラー
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

// BaseModel はすべてのモデルに共通する基本フィールドを定義します
// 以下のフィールドを含みます：
// - ID: 主キー
// - CreatedAt: 作成日時
// - UpdatedAt: 更新日時
// - DeletedAt: 削除日時（ソフトデリート用）
// - Version: 楽観的ロック用バージョン
// - CreatedBy: 作成者
// - UpdatedBy: 更新者
type BaseModel struct {
	ID        uint       `json:"id" gorm:"primarykey"`                    // 主キー
	CreatedAt time.Time  `json:"created_at"`                              // 作成日時
	UpdatedAt time.Time  `json:"updated_at"`                              // 更新日時
	DeletedAt *time.Time `json:"deleted_at,omitempty" gorm:"index:idx_deleted_at"` // 削除日時（ソフトデリート用）
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

// University は大学エンティティを表現する構造体です
// 以下のフィールドを含みます：
// - BaseModel: 基本フィールド
// - Name: 大学名
// - Departments: 学部一覧
type University struct {
	BaseModel
	Name        string       `json:"name"` // 大学名
	_ struct{} `gorm:"not null;uniqueIndex:idx_university_name;size:20;check:name <> ''"`
	Departments []Department `json:"departments"` // 学部一覧
	_ struct{} `gorm:"foreignKey:UniversityID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
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
				return ok && name != "" && len(name) <= 20 && !containsSpecialCharacters(name)
			},
			Message: "大学名は1-20文字の範囲で、特殊文字を含まない必要があります",
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

// Department は学部エンティティを表現する構造体です
// 以下のフィールドを含みます：
// - BaseModel: 基本フィールド
// - UniversityID: 大学ID
// - Name: 学部名
// - University: 所属大学
// - Majors: 学科一覧
type Department struct {
	BaseModel
	UniversityID uint       `json:"university_id"` // 大学ID
	_ struct{} `gorm:"not null;index:idx_dept_univ_name,type:btree"`
	Name         string     `json:"name"` // 学部名
	_ struct{} `gorm:"not null;index:idx_dept_univ_name,type:btree;size:20;check:name <> ''"`
	University   University `json:"-"` // 所属大学
	_ struct{} `gorm:"foreignKey:UniversityID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Majors       []Major    `json:"majors"` // 学科一覧
	_ struct{} `gorm:"foreignKey:DepartmentID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
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
				return ok && name != "" && len(name) <= 20 && !containsSpecialCharacters(name)
			},
			Message: "学部名は1-20文字の範囲で、特殊文字を含まない必要があります",
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

// Major は学科エンティティを表現する構造体です
// 以下のフィールドを含みます：
// - BaseModel: 基本フィールド
// - DepartmentID: 学部ID
// - Name: 学科名
// - Department: 所属学部
// - AdmissionSchedules: 入試日程一覧
type Major struct {
	BaseModel
	DepartmentID      uint              `json:"department_id" gorm:"not null;index:idx_major_dept,type:btree"` // 学部ID
	Name             string            `json:"name"` // 学科名
	_ struct{} `gorm:"not null;index:idx_major_name,type:btree;size:20;check:name <> ''"`
	Department       Department        `json:"-"` // 所属学部
	_ struct{} `gorm:"foreignKey:DepartmentID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	AdmissionSchedules []AdmissionSchedule `json:"admission_schedules,omitempty"` // 入試日程一覧
	_ struct{} `gorm:"foreignKey:MajorID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
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
				return ok && len(name) > 0 && len(name) <= 20
			},
			Message: "学科名は1-20文字である必要があります",
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

// AdmissionSchedule は入試日程エンティティを表現する構造体です
// 以下のフィールドを含みます：
// - BaseModel: 基本フィールド
// - MajorID: 学科ID
// - Name: 日程名
// - DisplayOrder: 表示順
// - Major: 所属学科
// - AdmissionInfos: 入試情報一覧
// - TestTypes: 試験種別一覧
type AdmissionSchedule struct {
	BaseModel
	MajorID       uint           `json:"major_id" gorm:"not null;index:idx_schedule_major_year,type:btree"` // 学科ID
	Name          string         `json:"name" gorm:"not null;size:6;check:name in ('前期','中期','後期')"` // 日程名
	DisplayOrder  int `json:"display_order" gorm:"not null;default:0;index:idx_schedule_display_order,type:btree"` // 表示順
	_ struct{} `gorm:"check:display_order >= 0 AND display_order <= 3"`
	Major         Major         `json:"-" gorm:"foreignKey:MajorID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"` // 所属学科
	AdmissionInfos []AdmissionInfo `json:"admission_infos,omitempty"` // 入試情報一覧
	_ struct{} `gorm:"foreignKey:AdmissionScheduleID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	TestTypes     []TestType    `json:"test_types,omitempty"` // 試験種別一覧
	_ struct{} `gorm:"foreignKey:AdmissionScheduleID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
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

// AdmissionInfo は入試情報エンティティを表現する構造体です
// 以下のフィールドを含みます：
// - BaseModel: 基本フィールド
// - AdmissionScheduleID: 入試日程ID
// - Enrollment: 募集人数
// - AcademicYear: 学年度
// - Status: ステータス
// - AdmissionSchedule: 所属入試日程
// - TestTypes: 試験種別一覧
type AdmissionInfo struct {
	BaseModel
	AdmissionScheduleID uint `json:"admission_schedule_id" gorm:"not null;index:idx_info_schedule_year"` // 入試日程ID
	Enrollment int `json:"enrollment" gorm:"not null;check:enrollment > 0 AND enrollment <= 9999"` // 募集人数
	AcademicYear int `json:"academic_year" gorm:"not null;index:idx_info_schedule_year"`
	_ struct{} `gorm:"check:academic_year >= 2000 AND academic_year <= 2100"` // 学年度
	Status string `json:"status" gorm:"type:varchar(20);default:'draft';index:idx_info_status"`
	_ struct{} `gorm:"check:status in ('draft','published','archived')"` // ステータス
	AdmissionSchedule  AdmissionSchedule `json:"-" gorm:"foreignKey:AdmissionScheduleID"` // 所属入試日程
	TestTypes []TestType `json:"test_types,omitempty" gorm:"many2many:admission_info_test_types"` // 試験種別一覧
	_ struct{} `gorm:"index:idx_info_test_types"`
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

// TestType は試験種別エンティティを表現する構造体です
// 以下のフィールドを含みます：
// - BaseModel: 基本フィールド
// - AdmissionScheduleID: 入試日程ID
// - Name: 試験種別名
// - AdmissionSchedule: 所属入試日程
// - Subjects: 科目一覧
type TestType struct {
	BaseModel
	AdmissionScheduleID uint      `json:"admission_schedule_id"` // 入試日程ID
	_ struct{} `gorm:"not null;index:idx_test_type_schedule,type:btree"`
	Name               string    `json:"name" gorm:"not null;type:varchar(10);check:name in ('共通','二次')"` // 試験種別名
	_ struct{} `gorm:"index:idx_test_type_name,type:btree,comment:'試験種別名のインデックス'"`
	AdmissionSchedule  AdmissionSchedule `json:"-"` // 所属入試日程
	_ struct{} `gorm:"foreignKey:AdmissionScheduleID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Subjects           []Subject `json:"subjects,omitempty"` // 科目一覧
	_ struct{} `gorm:"foreignKey:TestTypeID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
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

// Subject は科目エンティティを表現する構造体です
// 以下のフィールドを含みます：
// - BaseModel: 基本フィールド
// - TestTypeID: 試験種別ID
// - Name: 科目名
// - Score: 配点
// - Percentage: 配点比率
// - DisplayOrder: 表示順
// - TestType: 所属試験種別
type Subject struct {
	BaseModel
	TestTypeID   uint     `json:"test_type_id" gorm:"not null;index:idx_subject_test_type,type:btree"` // 試験種別ID
	Name         string   `json:"name" gorm:"not null;index:idx_subject_name,type:btree;size:20;check:name <> ''"` // 科目名
	Score        int      `json:"score" gorm:"not null;check:score >= 0 AND score <= 1000"` // 配点
	Percentage   float64  `json:"percentage" gorm:"not null;check:percentage >= 0 AND percentage <= 100"` // 配点比率
	DisplayOrder int      `json:"display_order"`
	_ struct{} `gorm:"not null;default:0;index:idx_subject_display_order,type:btree"` // 表示順
	_ struct{} `gorm:"check:display_order >= 0 AND display_order <= 999"`
	TestType     TestType `json:"-" gorm:"foreignKey:TestTypeID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"` // 所属試験種別
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
				return ok && len(name) > 0 && len(name) <= 20
			},
			Message: "科目名は1-20文字である必要があります",
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

// TestEnv はテスト環境の設定を表現する構造体です
// 以下のフィールドを含みます：
// - DB: データベース接続
// - Server: Echoサーバー
// - TestData: テストデータ
type TestEnv struct {
	DB        *gorm.DB     // データベース接続
	Server    *echo.Echo   // Echoサーバー
	TestData  map[string]interface{} // テストデータ
}
