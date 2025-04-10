package repositories

import (
	stdErrors "errors"
	"fmt"
	"strings"
	"testing"
	"university-exam-api/internal/domain/models"
	appErrors "university-exam-api/internal/errors"
)

const (
	testFieldName = "テストフィールド"
)

// getValidationTestCases はバリデーションテストのテストケースを生成します
func getValidationTestCases() []struct {
	name      string
	university *models.University
	wantErr   bool
	errField  string
} {
	return []struct {
		name      string
		university *models.University
		wantErr   bool
		errField  string
	}{
		{
			name: "有効な大学データ",
			university: &models.University{
				BaseModel: models.BaseModel{Version: 1},
				Name:     "テスト大学",
				Departments: []models.Department{
					{
						BaseModel: models.BaseModel{Version: 1},
						Name:     "テスト学部",
						Majors: []models.Major{
							{
								BaseModel: models.BaseModel{Version: 1},
								Name:     "テスト学科",
							},
						},
					},
				},
			},
			wantErr: false,
		},
		{
			name: "無効な大学名（空）",
			university: &models.University{
				BaseModel: models.BaseModel{Version: 1},
				Name:     "",
				Departments: []models.Department{
					{
						BaseModel: models.BaseModel{Version: 1},
						Name:     "テスト学部",
					},
				},
			},
			wantErr:  true,
			errField: "大学名",
		},
		{
			name: "無効な大学名（長すぎる）",
			university: &models.University{
				BaseModel: models.BaseModel{Version: 1},
				Name:     strings.Repeat("あ", maxNameLength+1),
				Departments: []models.Department{
					{
						BaseModel: models.BaseModel{Version: 1},
						Name:     "テスト学部",
					},
				},
			},
			wantErr:  true,
			errField: "大学名",
		},
		{
			name: "無効なバージョン",
			university: &models.University{
				BaseModel: models.BaseModel{Version: 0},
				Name:     "テスト大学",
				Departments: []models.Department{
					{
						BaseModel: models.BaseModel{Version: 1},
						Name:     "テスト学部",
					},
				},
			},
			wantErr:  true,
			errField: "version",
		},
		{
			name: "学部数超過",
			university: &models.University{
				BaseModel: models.BaseModel{Version: 1},
				Name:     "テスト大学",
				Departments: func() []models.Department {
					deps := make([]models.Department, maxDepartmentsPerUniversity+1)
					for i := range deps {
						deps[i] = models.Department{
							BaseModel: models.BaseModel{Version: 1},
							Name:     fmt.Sprintf("テスト学部%d", i),
						}
					}
					return deps
				}(),
			},
			wantErr:  true,
			errField: "departments",
		},
		{
			name: "重複する学部名",
			university: &models.University{
				BaseModel: models.BaseModel{Version: 1},
				Name:     "テスト大学",
				Departments: []models.Department{
					{
						BaseModel: models.BaseModel{Version: 1},
						Name:     "テスト学部",
					},
					{
						BaseModel: models.BaseModel{Version: 1},
						Name:     "テスト学部",
					},
				},
			},
			wantErr:  true,
			errField: "departments[1].name",
		},
		{
			name: "学科数超過",
			university: &models.University{
				BaseModel: models.BaseModel{Version: 1},
				Name:     "テスト大学",
				Departments: []models.Department{
					{
						BaseModel: models.BaseModel{Version: 1},
						Name:     "テスト学部",
						Majors: func() []models.Major {
							majors := make([]models.Major, maxMajorsPerDepartment+1)
							for i := range majors {
								majors[i] = models.Major{
									BaseModel: models.BaseModel{Version: 1},
									Name:     fmt.Sprintf("テスト学科%d", i),
								}
							}
							return majors
						}(),
					},
				},
			},
			wantErr:  true,
			errField: "departments[0].majors",
		},
		{
			name: "重複する学科名",
			university: &models.University{
				BaseModel: models.BaseModel{Version: 1},
				Name:     "テスト大学",
				Departments: []models.Department{
					{
						BaseModel: models.BaseModel{Version: 1},
						Name:     "テスト学部",
						Majors: []models.Major{
							{
								BaseModel: models.BaseModel{Version: 1},
								Name:     "テスト学科",
							},
							{
								BaseModel: models.BaseModel{Version: 1},
								Name:     "テスト学科",
							},
						},
					},
				},
			},
			wantErr:  true,
			errField: "departments[0].majors[1].name",
		},
		{
			name: "無効な科目スコア",
			university: &models.University{
				BaseModel: models.BaseModel{Version: 1},
				Name:     "テスト大学",
				Departments: []models.Department{
					{
						BaseModel: models.BaseModel{Version: 1},
						Name:     "テスト学部",
						Majors: []models.Major{
							{
								BaseModel: models.BaseModel{Version: 1},
								Name:     "テスト学科",
								AdmissionSchedules: []models.AdmissionSchedule{
									{
										BaseModel: models.BaseModel{Version: 1},
										Name:     "前期",
										TestTypes: []models.TestType{
											{
												BaseModel: models.BaseModel{Version: 1},
												Name:     "一般",
												Subjects: []models.Subject{
													{
														BaseModel: models.BaseModel{Version: 1},
														Name:     "数学",
														Score:    -1,
													},
												},
											},
										},
									},
								},
							},
						},
					},
				},
			},
			wantErr:  true,
			errField: "departments[0].majors[0].admissionSchedules[0].testTypes[0].subjects[0].score",
		},
	}
}

func TestValidation(t *testing.T) {
	repo, _ := setupTest(t)
	tests := getValidationTestCases()

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := repo.Create(tt.university)
			if (err != nil) != tt.wantErr {
				t.Errorf("バリデーションテストに失敗: エラー = %v, 期待するエラー %v", err, tt.wantErr)
				return
			}
			if tt.wantErr {
				var inputErr *appErrors.Error
				if !stdErrors.As(err, &inputErr) {
					t.Errorf("エラーを期待しましたが、%T が返されました", err)
					return
				}
				if inputErr.Code != appErrors.CodeInvalidInput {
					t.Errorf("エラーコード %q を期待しましたが、%q が返されました", appErrors.CodeInvalidInput, inputErr.Code)
				}
			}
		})
	}
}

// TestValidateName は名前のバリデーション関数をテストします
func TestValidateName(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		field    string
		wantErr  bool
		errField string
	}{
		{
			name:    "有効な名前",
			input:   "テスト",
			field:   testFieldName,
			wantErr: false,
		},
		{
			name:     "空の名前",
			input:    "",
			field:    testFieldName,
			wantErr:  true,
			errField: testFieldName,
		},
		{
			name:     "長すぎる名前",
			input:    strings.Repeat("あ", maxNameLength+1),
			field:    testFieldName,
			wantErr:  true,
			errField: testFieldName,
		},
		{
			name:    "最大長の名前",
			input:   strings.Repeat("あ", maxNameLength),
			field:   testFieldName,
			wantErr: false,
		},
		{
			name:    "空白を含む名前",
			input:   "テスト 名前",
			field:   testFieldName,
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := validateName(tt.input, tt.field)
			if (err != nil) != tt.wantErr {
				t.Errorf("validateName() エラー = %v, 期待するエラー %v", err, tt.wantErr)
				return
			}
			if tt.wantErr {
				var inputErr *appErrors.Error
				if !stdErrors.As(err, &inputErr) {
					t.Errorf("エラーを期待しましたが、%T が返されました", err)
					return
				}
				if inputErr.Code != appErrors.CodeInvalidInput {
					t.Errorf("エラーコード %q を期待しましたが、%q が返されました", appErrors.CodeInvalidInput, inputErr.Code)
				}
			}
		})
	}
}
