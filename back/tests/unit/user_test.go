package unit

import (
	"strings"
	"sync"
	"testing"

	"university-exam-api/tests/testutils"
	"university-exam-api/tests/unit/models"
	"university-exam-api/tests/unit/repositories"

	"github.com/stretchr/testify/assert"
)

const (
	testUserName     = "テストユーザー"
	testUserEmail    = "test@example.com"
	testUserPassword = "password123"
)

// TestUserValidation はユーザー検証のテストケースです
func TestUserValidation(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		user    models.User
		wantErr bool
	}{
		{
			name: "正常系: 有効なユーザー",
			user: models.User{
				Name:     testUserName,
				Email:    testUserEmail,
				Password: testUserPassword,
			},
			wantErr: false,
		},
		{
			name: "異常系: 無効なメールアドレス",
			user: models.User{
				Name:     testUserName,
				Email:    "invalid-email",
				Password: testUserPassword,
			},
			wantErr: true,
		},
		{
			name: "異常系: 短すぎるパスワード",
			user: models.User{
				Name:     testUserName,
				Email:    testUserEmail,
				Password: "pass",
			},
			wantErr: true,
		},
		// エッジケースの追加
		{
			name: "エッジケース: 最大長の名前",
			user: models.User{
				Name:     strings.Repeat("a", 255),
				Email:    testUserEmail,
				Password: testUserPassword,
			},
			wantErr: false,
		},
		{
			name: "エッジケース: 空の名前",
			user: models.User{
				Name:     "",
				Email:    testUserEmail,
				Password: testUserPassword,
			},
			wantErr: true,
		},
		{
			name: "エッジケース: 特殊文字を含む名前",
			user: models.User{
				Name:     "テスト!@#$%^&*()",
				Email:    testUserEmail,
				Password: testUserPassword,
			},
			wantErr: false,
		},
		{
			name: "エッジケース: 国際化ドメイン名",
			user: models.User{
				Name:     testUserName,
				Email:    "test@例え.テスト",
				Password: testUserPassword,
			},
			wantErr: false,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			err := tt.user.Validate()

			if tt.wantErr {
				assert.Error(t, err, "エラーが期待されましたが、発生しませんでした")
			} else {
				assert.NoError(t, err, "予期しないエラーが発生しました")
			}
		})
	}
}

// TestUserRepository はユーザーリポジトリのテストケースです
func TestUserRepository(t *testing.T) {
	db := testutils.NewMockDB()
	defer func() {
		if err := db.Close(); err != nil {
			t.Errorf("データベースのクローズに失敗しました: %v", err)
		}
	}()

	repo := repositories.NewUserRepository(db)

	tests := []struct {
		name    string
		user    models.User
		wantErr bool
	}{
		{
			name: "正常系: ユーザーの作成",
			user: models.User{
				Name:     testUserName,
				Email:    testUserEmail,
				Password: testUserPassword,
			},
			wantErr: false,
		},
		// エラーハンドリングのテスト
		{
			name: "異常系: 重複するメールアドレス",
			user: models.User{
				Name:     testUserName,
				Email:    testUserEmail,
				Password: testUserPassword,
			},
			wantErr: true,
		},
		{
			name: "異常系: データベース接続エラー",
			user: models.User{
				Name:     testUserName,
				Email:    "error@example.com",
				Password: testUserPassword,
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := repo.Create(&tt.user)
			if tt.wantErr {
				assert.Error(t, err, "エラーが期待されましたが、発生しませんでした")
			} else {
				assert.NoError(t, err, "予期しないエラーが発生しました")
			}
		})
	}
}

// TestUserRepositoryConcurrent は並行処理のテストケースです
func TestUserRepositoryConcurrent(t *testing.T) {
	t.Parallel()

	db := testutils.NewMockDB()
	defer func() {
		if err := db.Close(); err != nil {
			t.Errorf("データベースのクローズに失敗しました: %v", err)
		}
	}()

	repo := repositories.NewUserRepository(db)
	users := createTestUsers(t, 100)

	var wg sync.WaitGroup
	wg.Add(len(users))

	for _, user := range users {
		go func(u *models.User) {
			defer wg.Done()
			err := repo.Create(u)

			assert.NoError(t, err, "ユーザーの作成に失敗しました")
		}(user)
	}

	wg.Wait()
}

// TestUserRepositoryTransaction はトランザクションのテストケースです
func TestUserRepositoryTransaction(t *testing.T) {
	// モックDBの作成
	db := testutils.NewMockDB()
	repo := repositories.NewUserRepository(db)

	// トランザクションの開始
	tx, err := db.Begin()
	if err != nil {
		t.Fatalf("トランザクションの開始に失敗: %v", err)
	}

	// テストユーザーの作成
	user := &models.User{
		Name:     testUserName,
		Email:    testUserEmail,
		Password: testUserPassword,
	}

	// ユーザーの作成
	err = repo.Create(user)
	if err != nil {
		t.Fatalf("ユーザーの作成に失敗: %v", err)
	}

	// トランザクションのロールバック
	err = tx.Rollback()
	if err != nil {
		t.Fatalf("トランザクションのロールバックに失敗: %v", err)
	}

	// ユーザーが存在しないことを確認
	_, err = repo.FindByID(user.ID)
	if err == nil {
		t.Error("ロールバック後にユーザーが存在しています")
	}
}
