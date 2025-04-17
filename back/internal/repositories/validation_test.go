// Package repositories はデータベースのバリデーション機能のテストを提供します。
// このパッケージは以下の機能のテストを提供します：
// - 入力値の検証
// - バリデーションルールの管理
// - エラーハンドリング
// - キャッシュの管理
package repositories

import (
	"errors"
	"testing"
	"university-exam-api/internal/domain/models"
	appErrors "university-exam-api/internal/errors"
)

const (
	errValidation = "バリデーションエラー"
)

// TestValidateName は名前のバリデーション機能をテストします。
// このテストは以下のケースを検証します：
// - 正常な名前
// - 空の名前
// - 長すぎる名前
func TestValidateName(t *testing.T) {
	t.Parallel()

	cases := []struct {
		name     string
		field    string
		expected error
	}{
		{
			name:     "正常な名前",
			field:    "テスト大学",
			expected: nil,
		},
		{
			name:     "空の名前",
			field:    "",
			expected: appErrors.NewInvalidInputError("field", "fieldは1文字以上である必要があります", nil),
		},
		{
			name:     "長すぎる名前",
			field:    "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんあいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん",
			expected: appErrors.NewInvalidInputError("field", "fieldは100文字以下である必要があります", nil),
		},
	}

	for _, c := range cases {
		c := c
		t.Run(c.name, func(t *testing.T) {
			t.Parallel()

			err := validateName(c.field, "field")

			if err != nil && c.expected != nil {
				if err.Error() != c.expected.Error() {
					t.Errorf("validateName(%q) = %v, want %v", c.field, err, c.expected)
				}
			} else if (err == nil) != (c.expected == nil) {
				t.Errorf("validateName(%q) = %v, want %v", c.field, err, c.expected)
			}
		})
	}
}

// TestValidateUniversity は大学のバリデーション機能をテストします。
// このテストは以下のケースを検証します：
// - 正常な大学データ
// - nilの大学データ
// - 空の大学名
func TestValidateUniversity(t *testing.T) {
	t.Parallel()

	cases := []struct {
		name       string
		university *models.University
		expected   error
	}{
		{
			name: "正常な大学データ",
			university: &models.University{
				BaseModel: models.BaseModel{
					Version: 1,
				},
				Name: "テスト大学",
				Departments: []models.Department{
					{
						BaseModel: models.BaseModel{
							Version: 1,
						},
						Name: "テスト学部",
					},
				},
			},
			expected: nil,
		},
		{
			name:       "nilの大学データ",
			university: nil,
			expected:   appErrors.NewInvalidInputError("university", errEmptyUniversity, nil),
		},
		{
			name: "空の大学名",
			university: &models.University{
				BaseModel: models.BaseModel{
					Version: 1,
				},
				Name: "",
			},
			expected: appErrors.NewInvalidInputError("大学名", "大学名は1文字以上である必要があります", nil),
		},
	}

	for _, c := range cases {
		c := c
		t.Run(c.name, func(t *testing.T) {
			t.Parallel()

			repo := &universityRepository{}
			err := repo.validateUniversity(c.university)

			if err != nil && c.expected != nil {
				if err.Error() != c.expected.Error() {
					t.Errorf("validateUniversity() = %v, want %v", err, c.expected)
				}
			} else if (err == nil) != (c.expected == nil) {
				t.Errorf("validateUniversity() = %v, want %v", err, c.expected)
			}
		})
	}
}

// TestValidateWithRules はバリデーションルールの適用をテストします。
// このテストは以下のケースを検証します：
// - 正常なバリデーション
// - バリデーションエラー
func TestValidateWithRules(t *testing.T) {
	t.Parallel()

	cases := []struct {
		name     string
		value    interface{}
		rules    []ValidationRule
		expected error
	}{
		{
			name:  "正常なバリデーション",
			value: "テスト",
			rules: []ValidationRule{
				{
					Field: "name",
					Validator: func(_ interface{}) error {
						return nil
					},
					Message: errValidation,
				},
			},
			expected: nil,
		},
		{
			name:  errValidation,
			value: "テスト",
			rules: []ValidationRule{
				{
					Field: "name",
					Validator: func(_ interface{}) error {
						return errors.New(errValidation)
					},
					Message: errValidation,
				},
			},
			expected: appErrors.NewValidationError("validation", "バリデーションエラーが発生しました", map[string]string{
				"errors": "[{name バリデーションエラー}]",
			}),
		},
	}

	for _, c := range cases {
		c := c
		t.Run(c.name, func(t *testing.T) {
			t.Parallel()

			err := validateWithRules(c.value, c.rules)

			if err != nil && c.expected != nil {
				if err.Error() != c.expected.Error() {
					t.Errorf("validateWithRules() = %v, want %v", err, c.expected)
				}
			} else if (err == nil) != (c.expected == nil) {
				t.Errorf("validateWithRules() = %v, want %v", err, c.expected)
			}
		})
	}
}

// TestGetValidationRules はバリデーションルールの取得をテストします。
// このテストは以下のケースを検証します：
// - ルールの存在確認
// - ルールの取得
func TestGetValidationRules(t *testing.T) {
	t.Parallel()

	rules := getValidationRules()
	if len(rules) == 0 {
		t.Error("バリデーションルールが取得できません")
	}
}
