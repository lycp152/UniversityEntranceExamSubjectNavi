package repositories

import (
	"testing"
	"university-exam-api/internal/domain/models"
	"university-exam-api/internal/errors"
)

const (
	errCleanupTestData = "Failed to cleanup test data: %v"
	errCreateTestData  = "Failed to create test data: %v"
)

// setupTest はテストの共通セットアップを行います
func setupTest(t *testing.T) (*UniversityRepository, *models.University) {
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

	return repo, university
}

func TestFindAll(t *testing.T) {
	repo, university := setupTest(t)

	universities, err := repo.FindAll()
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
			errType: &errors.ErrNotFound{},
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
				if _, ok := err.(*errors.ErrNotFound); !ok {
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
		if _, ok := err.(*errors.ErrInvalidInput); !ok {
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
			errType: &errors.ErrInvalidInput{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := repo.Search(tt.query)
			validateSearchResult(t, got, err, tt, university)
		})
	}
}
