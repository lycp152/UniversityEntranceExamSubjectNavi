// Package models はアプリケーションのドメインモデルを定義します。
package models

// FilterOption はフィルターオプションの基本構造体です
type FilterOption struct {
	BaseModel
	Category    string `json:"category" gorm:"not null;index:idx_filter_category;size:20"`
	_ struct{} `gorm:"check:category <> ''"`
	_ struct{} `gorm:"check:category = 'REGION'"`
	_ struct{} `gorm:"check:category = 'PREFECTURE'"`
	_ struct{} `gorm:"check:category = 'SCHEDULE'"`
	_ struct{} `gorm:"check:category = 'ACADEMIC_FIELD'"`
	_ struct{} `gorm:"check:category = 'CLASSIFICATION'"`
	_ struct{} `gorm:"check:category = 'SUB_CLASSIFICATION'"`
	Name        string `json:"name" gorm:"not null;size:50"`
	_ struct{} `gorm:"check:name <> ''"`
	_ struct{} `gorm:"check:(category = 'REGION' AND length(name) <= 3)"`
	_ struct{} `gorm:"check:(category = 'PREFECTURE' AND length(name) <= 3)"`
	_ struct{} `gorm:"check:(category = 'SCHEDULE' AND length(name) = 1)"`
	_ struct{} `gorm:"check:(category = 'ACADEMIC_FIELD' AND length(name) <= 50)"`
	_ struct{} `gorm:"check:(category = 'CLASSIFICATION' AND length(name) <= 10)"`
	_ struct{} `gorm:"check:(category = 'SUB_CLASSIFICATION' AND length(name) <= 50)"`
	DisplayOrder int    `json:"display_order" gorm:"not null;default:0;index:idx_filter_display_order"`
	_ struct{} `gorm:"check:display_order >= 0 AND display_order <= 999"`
	ParentID    *uint  `json:"parent_id,omitempty" gorm:"index:idx_filter_parent"`
	Parent      *FilterOption `json:"-" gorm:"foreignKey:ParentID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Children    []FilterOption `json:"children,omitempty" gorm:"foreignKey:ParentID"`
	_ struct{} `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}

// validateName は名前のバリデーションを行います
func (f *FilterOption) validateName() error {
	runeLen := len([]rune(f.Name))

	switch f.Category {
	case "REGION", "PREFECTURE":
		if runeLen == 0 || runeLen > 3 {
			return &ValidationError{Field: "Name", Message: "名前は1-3文字である必要があります", Code: "INVALID_NAME"}
		}
	case "SCHEDULE":
		if runeLen != 1 {
			return &ValidationError{Field: "Name", Message: "名前は1文字である必要があります", Code: "INVALID_NAME"}
		}
	case "ACADEMIC_FIELD", "SUB_CLASSIFICATION":
		if runeLen == 0 || runeLen > 50 {
			return &ValidationError{Field: "Name", Message: "名前は1-50文字である必要があります", Code: "INVALID_NAME"}
		}
	case "CLASSIFICATION":
		if runeLen == 0 || runeLen > 10 {
			return &ValidationError{Field: "Name", Message: "名前は1-10文字である必要があります", Code: "INVALID_NAME"}
		}
	}

	return nil
}

// validateParentCategory は親子カテゴリの整合性チェックを行います
func (f *FilterOption) validateParentCategory() error {
	if f.Parent == nil {
		return nil
	}

	valid := false

	switch f.Category {
	case "PREFECTURE":
		valid = f.Parent.Category == "REGION"
	case "SUB_CLASSIFICATION":
		valid = f.Parent.Category == "CLASSIFICATION"
	default:
		valid = true // 他は親カテゴリ制約なし
	}

	if !valid {
		return &ValidationError{
			Field:   "Parent",
			Message: "親子カテゴリの組み合わせが不正です",
			Code:    "INVALID_PARENT_CATEGORY",
		}
	}

	return nil
}

// Validate はFilterOptionのバリデーションを行います
func (f *FilterOption) Validate() error {
	if err := f.BaseModel.Validate(); err != nil {
		return err
	}

	rules := []ValidationRule{
		{
			Field: "Category",
			Condition: func(v interface{}) bool {
				category, ok := v.(string)
				if !ok || category == "" {
					return false
				}
				validCategories := map[string]bool{
					"REGION": true,
					"PREFECTURE": true,
					"SCHEDULE": true,
					"ACADEMIC_FIELD": true,
					"CLASSIFICATION": true,
					"SUB_CLASSIFICATION": true,
				}
				return validCategories[category]
			},
			Message: "カテゴリは有効な値である必要があります",
			Code:    "INVALID_CATEGORY",
		},
		{
			Field: "DisplayOrder",
			Condition: func(v interface{}) bool {
				order, ok := v.(int)
				return ok && order >= 0 && order <= 999
			},
			Message: "表示順は0-999の範囲である必要があります",
			Code:    "INVALID_DISPLAY_ORDER",
		},
	}

	if err := validateRules(f, rules); err != nil {
		return err
	}

	if err := f.validateName(); err != nil {
		return err
	}

	return f.validateParentCategory()
}
