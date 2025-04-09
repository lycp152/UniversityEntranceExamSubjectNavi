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
	errCleanupTestData = "テストデータのクリーンアップに失敗: %v"
	errCreateTestData  = "テストデータの作成に失敗: %v"
	testFieldName      = "テストフィールド"
)

// setupTest はテストの共通セットアップを行います
func setupTest(t *testing.T) (*universityRepository, *models.University) {
	t.Helper()
	db := SetupTestDB(t, nil)
	repo := NewUniversityRepository(db)

	if err := CleanupTestData(db); err != nil {
		t.Fatalf(errCleanupTestData, err)
	}

	university, err := CreateTestUniversity(db, nil)
	if err != nil {
		t.Fatalf(errCreateTestData, err)
	}

	return repo.(*universityRepository), university
}

// TestFindAll は大学一覧取得のテストを行います
func TestFindAll(t *testing.T) {
	repo, university := setupTest(t)

	tests := []struct {
		name    string
		wantErr bool
	}{
		{
			name:    "正常系：大学一覧の取得",
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			universities, err := repo.FindAll(context.Background())
			if (err != nil) != tt.wantErr {
				t.Errorf("FindAll() エラー = %v, 期待するエラー %v", err, tt.wantErr)
				return
			}

			if len(universities) != 1 {
				t.Errorf("FindAll() 取得数 = %v 大学, 期待値 1", len(universities))
			}

			if universities[0].Name != university.Name {
				t.Errorf("FindAll() 大学名 = %v, 期待値 %v", universities[0].Name, university.Name)
			}
		})
	}
}

// TestFindByID は大学IDによる検索のテストを行います
func TestFindByID(t *testing.T) {
	repo, university := setupTest(t)

	tests := []struct {
		name    string
		id      uint
		wantErr bool
		errType error
	}{
		{
			name:    "正常系：存在するIDでの検索",
			id:      university.ID,
			wantErr: false,
		},
		{
			name:    "異常系：存在しないIDでの検索",
			id:      999,
			wantErr: true,
			errType: appErrors.NewNotFoundError("university", 999, nil),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := repo.FindByID(tt.id)
			if (err != nil) != tt.wantErr {
				t.Errorf("FindByID() エラー = %v, 期待するエラー %v", err, tt.wantErr)
				return
			}
			if tt.wantErr {
				var notFoundErr *appErrors.Error
				if !stdErrors.As(err, &notFoundErr) || notFoundErr.Code != appErrors.NotFound {
					t.Errorf("FindByID() エラータイプ = %T, 期待するエラータイプ %T", err, tt.errType)
				}
				return
			}
			if got.ID != university.ID {
				t.Errorf("FindByID() 取得値 = %v, 期待値 %v", got.ID, university.ID)
			}
		})
	}
}

// TestSearch は大学検索のテストを行います
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
			name:      "正常系：大学名での検索",
			query:     "テスト大学",
			wantCount: 1,
			wantErr:   false,
		},
		{
			name:      "正常系：学部名での検索",
			query:     "テスト学部",
			wantCount: 1,
			wantErr:   false,
		},
		{
			name:      "正常系：存在しない名前での検索",
			query:     "存在しない大学",
			wantCount: 0,
			wantErr:   false,
		},
		{
			name:    "異常系：空のクエリ",
			query:   "",
			wantErr: true,
			errType: appErrors.NewInvalidInputError("query", "クエリは空にできません", nil),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := repo.Search(tt.query)
			validateSearchResult(t, got, err, tt, university)
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
		t.Errorf("Search() エラー = %v, 期待するエラー %v", err, tt.wantErr)
		return
	}
	if tt.wantErr {
		var invalidInputErr *appErrors.Error
		if !stdErrors.As(err, &invalidInputErr) || invalidInputErr.Code != appErrors.InvalidInput {
			t.Errorf("Search() エラータイプ = %T, 期待するエラータイプ %T", err, tt.errType)
		}
		return
	}
	if len(got) != tt.wantCount {
		t.Errorf("Search() 取得数 = %v 件, 期待値 %v", len(got), tt.wantCount)
	}
	if tt.wantCount > 0 && got[0].ID != university.ID {
		t.Errorf("Search() 大学ID = %v, 期待値 %v", got[0].ID, university.ID)
	}
}

// TestTransactionRetry はトランザクションのリトライテストを行います
func TestTransactionRetry(t *testing.T) {
	repo, university := setupTest(t)

	tests := []struct {
		name       string
		retryCount int
		maxRetries int
		wantErr    bool
	}{
		{
			name:       "正常系：リトライ成功",
			retryCount: 0,
			maxRetries: 3,
			wantErr:    false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			retryCount := 0
			err := repo.Transaction(func(repo IUniversityRepository) error {
				retryCount++
				if retryCount < tt.maxRetries {
					return appErrors.NewDatabaseError("Update", fmt.Errorf("デッドロックが検出されました"), nil)
				}
				return repo.Update(university)
			})

			if (err != nil) != tt.wantErr {
				t.Errorf("トランザクションリトライに失敗: %v", err)
			}

			if retryCount != tt.maxRetries {
				t.Errorf("期待するリトライ回数 %d, 実際のリトライ回数 %d", tt.maxRetries, retryCount)
			}
		})
	}
}

// TestTransactionTimeout はトランザクションのタイムアウトテストを行います
func TestTransactionTimeout(t *testing.T) {
	repo, _ := setupTest(t)

	tests := []struct {
		name    string
		wantErr bool
	}{
		{
			name:    "異常系：タイムアウト発生",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := repo.Transaction(func(repo IUniversityRepository) error {
				time.Sleep(txTimeout + time.Second)
				return nil
			})

			if (err != nil) != tt.wantErr {
				t.Error("タイムアウトエラーを期待しましたが、nilが返されました")
			}

			if !strings.Contains(err.Error(), "コンテキストの期限切れ") {
				t.Errorf("コンテキストの期限切れエラーを期待しましたが、実際のエラー: %v", err)
			}
		})
	}
}

// TestTransactionPermanentError は永続的なエラーのテストを行います
func TestTransactionPermanentError(t *testing.T) {
	repo, _ := setupTest(t)

	tests := []struct {
		name    string
		wantErr bool
	}{
		{
			name:    "異常系：永続的なエラー",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			permanentErr := errors.New("永続的なエラー")
			err := repo.Transaction(func(repo IUniversityRepository) error {
				return permanentErr
			})

			if (err != nil) != tt.wantErr {
				t.Error("永続的なエラーを期待しましたが、nilが返されました")
			}

			if !strings.Contains(err.Error(), permanentErr.Error()) {
				t.Errorf("エラーに %q が含まれることを期待しましたが、実際のエラー: %v", permanentErr.Error(), err)
			}
		})
	}
}

// TestCacheConsistency はキャッシュの整合性テストを行います
func TestCacheConsistency(t *testing.T) {
	repo, university := setupTest(t)

	tests := []struct {
		name    string
		wantErr bool
	}{
		{
			name:    "正常系：キャッシュの整合性確認",
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if _, err := repo.FindByID(university.ID); err != nil {
				t.Errorf("キャッシュの整合性チェックに失敗: %v", err)
			}

			university.Name = "更新された大学名"
			if err := repo.Update(university); err != nil {
				t.Errorf("大学の更新に失敗: %v", err)
			}

			updated, err := repo.FindByID(university.ID)
			if err != nil {
				t.Errorf("更新された大学の取得に失敗: %v", err)
			}
			if updated.Name != university.Name {
				t.Errorf("キャッシュが更新されていません: 取得値 %v, 期待値 %v", updated.Name, university.Name)
			}
		})
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
				t.Errorf("バリデーションテストに失敗: エラー = %v, 期待するエラー %v", err, tt.wantErr)
				return
			}
			if tt.wantErr {
				var inputErr *appErrors.Error
				if !stdErrors.As(err, &inputErr) {
					t.Errorf("エラーを期待しましたが、%T が返されました", err)
					return
				}
				if inputErr.Code != appErrors.InvalidInput {
					t.Errorf("エラーコード %q を期待しましたが、%q が返されました", appErrors.InvalidInput, inputErr.Code)
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
				if inputErr.Code != appErrors.InvalidInput {
					t.Errorf("エラーコード %q を期待しましたが、%q が返されました", appErrors.InvalidInput, inputErr.Code)
				}
			}
		})
	}
}
