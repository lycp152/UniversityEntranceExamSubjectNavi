package repositories

import (
	"context"
	"errors"
	stdErrors "errors"
	"fmt"
	"strings"
	"testing"
	"time"
	"university-exam-api/internal/domain/models"
	appErrors "university-exam-api/internal/errors"
)

const (
	errCleanupTestData = "Failed to cleanup test data: %v"
	errCreateTestData  = "Failed to create test data: %v"
	testFieldName      = "テストフィールド"
)

// setupTest はテストの共通セットアップを行います
func setupTest(t *testing.T) (*universityRepository, *models.University) {
	t.Helper()
	db := SetupTestDB()
	repo := NewUniversityRepository(db)

	if err := cleanupTestData(db); err != nil {
		t.Fatalf(errCleanupTestData, err)
	}

	university, err := createTestData(db)
	if err != nil {
		t.Fatalf(errCreateTestData, err)
	}

	return repo.(*universityRepository), university
}

func TestFindAll(t *testing.T) {
	repo, university := setupTest(t)

	universities, err := repo.FindAll(context.Background())
	if err != nil {
		t.Errorf("FindAll() error = %v", err)
		return
	}

	if len(universities) != 1 {
		t.Errorf("FindAll() got = %v universities, want 1", len(universities))
	}

	if universities[0].Name != university.Name {
		t.Errorf("FindAll() got university name = %v, want %v", universities[0].Name, university.Name)
	}
}

func TestFindByID(t *testing.T) {
	repo, university := setupTest(t)

	tests := []struct {
		name    string
		id      uint
		wantErr bool
		errType error
	}{
		{
			name:    "存在するID",
			id:      university.ID,
			wantErr: false,
		},
		{
			name:    "存在しないID",
			id:      999,
			wantErr: true,
			errType: appErrors.NewNotFoundError("university", 999, nil),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := repo.FindByID(tt.id)
			if (err != nil) != tt.wantErr {
				t.Errorf("FindByID() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if tt.wantErr {
				var notFoundErr *appErrors.Error
				if !stdErrors.As(err, &notFoundErr) || notFoundErr.Code != appErrors.NotFound {
					t.Errorf("FindByID() got error type = %T, want %T", err, tt.errType)
				}
				return
			}
			if got.ID != university.ID {
				t.Errorf("FindByID() got = %v, want %v", got.ID, university.ID)
			}
		})
	}
}

// validateSearchResult は検索結果を検証します
func validateSearchResult(t *testing.T, got []models.University, err error, tt struct {
	name      string
	query     string
	wantCount int
	wantErr   bool
	errType   error
}, university *models.University) {
	t.Helper()

	if (err != nil) != tt.wantErr {
		t.Errorf("Search() error = %v, wantErr %v", err, tt.wantErr)
		return
	}
	if tt.wantErr {
		var invalidInputErr *appErrors.Error
		if !stdErrors.As(err, &invalidInputErr) || invalidInputErr.Code != appErrors.InvalidInput {
			t.Errorf("Search() got error type = %T, want %T", err, tt.errType)
		}
		return
	}
	if len(got) != tt.wantCount {
		t.Errorf("Search() got = %v results, want %v", len(got), tt.wantCount)
	}
	if tt.wantCount > 0 && got[0].ID != university.ID {
		t.Errorf("Search() got university ID = %v, want %v", got[0].ID, university.ID)
	}
}

func TestSearch(t *testing.T) {
	repo, university := setupTest(t)

	tests := []struct {
		name      string
		query     string
		wantCount int
		wantErr   bool
		errType   error
	}{
		{
			name:      "存在する大学名で検索",
			query:     "テスト大学",
			wantCount: 1,
			wantErr:   false,
		},
		{
			name:      "存在する学部名で検索",
			query:     "テスト学部",
			wantCount: 1,
			wantErr:   false,
		},
		{
			name:      "存在しない名前で検索",
			query:     "存在しない大学",
			wantCount: 0,
			wantErr:   false,
		},
		{
			name:    "空のクエリ",
			query:   "",
			wantErr: true,
			errType: appErrors.NewInvalidInputError("query", "query cannot be empty", nil),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := repo.Search(tt.query)
			validateSearchResult(t, got, err, tt, university)
		})
	}
}

func TestTransactionRetry(t *testing.T) {
	repo, university := setupTest(t)

	// デッドロックシミュレーション用のカウンター
	retryCount := 0
	maxRetries := 3

	// デッドロックを発生させるテスト
	err := repo.Transaction(func(repo IUniversityRepository) error {
		retryCount++
		if retryCount < maxRetries {
			// デッドロックエラーをシミュレート
			return appErrors.NewDatabaseError("Update", fmt.Errorf("deadlock detected"), nil)
		}
		// 最後の試行では成功
		return repo.Update(university)
	})

	if err != nil {
		t.Errorf("Transaction retry failed: %v", err)
	}

	if retryCount != maxRetries {
		t.Errorf("Expected %d retries, got %d", maxRetries, retryCount)
	}
}

func TestTransactionTimeout(t *testing.T) {
	repo, _ := setupTest(t)

	// タイムアウトをシミュレートするテスト
	err := repo.Transaction(func(repo IUniversityRepository) error {
		// タイムアウトより長い時間スリープ
		time.Sleep(txTimeout + time.Second)
		return nil
	})

	if err == nil {
		t.Error("Expected timeout error, got nil")
	}

	if !strings.Contains(err.Error(), "context deadline exceeded") {
		t.Errorf("Expected context deadline exceeded error, got: %v", err)
	}
}

func TestTransactionPermanentError(t *testing.T) {
	repo, _ := setupTest(t)

	// 永続的なエラーのテスト
	permanentErr := errors.New("permanent error")
	err := repo.Transaction(func(repo IUniversityRepository) error {
		return permanentErr
	})

	if err == nil {
		t.Error("Expected permanent error, got nil")
	}

	if !strings.Contains(err.Error(), permanentErr.Error()) {
		t.Errorf("Expected error containing %q, got: %v", permanentErr.Error(), err)
	}
}

func TestCacheConsistency(t *testing.T) {
	repo, university := setupTest(t)

	// キャッシュの整合性テスト
	if _, err := repo.FindByID(university.ID); err != nil {
		t.Errorf("Cache consistency check failed: %v", err)
	}

	// キャッシュの更新テスト
	university.Name = "更新された大学名"
	if err := repo.Update(university); err != nil {
		t.Errorf("Failed to update university: %v", err)
	}

	// キャッシュが更新されていることを確認
	updated, err := repo.FindByID(university.ID)
	if err != nil {
		t.Errorf("Failed to find updated university: %v", err)
	}
	if updated.Name != university.Name {
		t.Errorf("Cache was not updated: got %v, want %v", updated.Name, university.Name)
	}
}

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
				t.Errorf("Validation test failed: got error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if tt.wantErr {
				var inputErr *appErrors.Error
				if !stdErrors.As(err, &inputErr) {
					t.Errorf("Expected Error, got %T", err)
					return
				}
				if inputErr.Code != appErrors.InvalidInput {
					t.Errorf("Expected error code %q, got %q", appErrors.InvalidInput, inputErr.Code)
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
				t.Errorf("validateName() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if tt.wantErr {
				var inputErr *appErrors.Error
				if !stdErrors.As(err, &inputErr) {
					t.Errorf("Expected Error, got %T", err)
					return
				}
				if inputErr.Code != appErrors.InvalidInput {
					t.Errorf("Expected error code %q, got %q", appErrors.InvalidInput, inputErr.Code)
				}
			}
		})
	}
}
