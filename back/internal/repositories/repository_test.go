package repositories

import (
	"context"
	stdErrors "errors"
	"testing"
	"university-exam-api/internal/domain/models"
	appErrors "university-exam-api/internal/errors"
)

// テストケースの定数
const (
	testUniversityName = "テスト大学"
	testDepartmentName = "テスト学部"
	testMajorName     = "テスト学科"
)

// エラーメッセージの定数
const (
	errCleanupTestData = "テストデータのクリーンアップに失敗: %v"
	errCreateTestData  = "テストデータの作成に失敗: %v"
	errAssertCount     = "取得数 = %v 大学, 期待値 %v"
	errAssertName      = "大学名 = %v, 期待値 %v"
	errAssertError     = "エラー = %v, 期待するエラー %v"
	errAssertType      = "エラータイプ = %T, 期待するエラータイプ %T"
)

// テストヘルパー関数
func assertError(t *testing.T, err error, wantErr bool, errType error) {
	t.Helper()
	if (err != nil) != wantErr {
		t.Errorf(errAssertError, err, wantErr)
		return
	}
	if wantErr {
		var targetErr *appErrors.Error
		if !stdErrors.As(err, &targetErr) || targetErr.Code != errType.(*appErrors.Error).Code {
			t.Errorf(errAssertType, err, errType)
		}
	}
}

func assertUniversityCount(t *testing.T, got []models.University, want int) {
	t.Helper()
	if len(got) != want {
		t.Errorf(errAssertCount, len(got), want)
	}
}

func assertUniversityName(t *testing.T, got, want string) {
	t.Helper()
	if got != want {
		t.Errorf(errAssertName, got, want)
	}
}

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
			assertError(t, err, tt.wantErr, nil)
			if !tt.wantErr {
				assertUniversityCount(t, universities, 1)
				assertUniversityName(t, universities[0].Name, university.Name)
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
			assertError(t, err, tt.wantErr, tt.errType)
			if !tt.wantErr {
				assertUniversityName(t, got.Name, university.Name)
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
			errType: appErrors.NewInvalidInputError("query", "検索クエリが空です", nil),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := repo.Search(tt.query)
			assertError(t, err, tt.wantErr, tt.errType)
			if !tt.wantErr {
				assertUniversityCount(t, got, tt.wantCount)
				if tt.wantCount > 0 {
					assertUniversityName(t, got[0].Name, university.Name)
				}
			}
		})
	}
}
