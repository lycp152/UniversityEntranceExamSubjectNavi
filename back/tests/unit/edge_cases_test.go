package unit

import (
	"strings"
	"sync"
	"testing"
	"university-exam-api/tests/testutils"
	"university-exam-api/tests/unit/models"
	"university-exam-api/tests/unit/repositories"
)

// TestEdgeCases はエッジケースのテストケースです
func TestEdgeCases(t *testing.T) {
	tests := []struct {
		name    string
		user    models.User
		wantErr bool
	}{
		{
			name: "空のユーザー名",
			user: models.User{
				Name:     "",
				Email:    TestUserEmail,
				Password: TestUserPassword,
			},
			wantErr: true,
		},
		{
			name: "最大長のユーザー名",
			user: models.User{
				Name:     strings.Repeat("あ", 255),
				Email:    TestUserEmail,
				Password: TestUserPassword,
			},
			wantErr: false,
		},
		{
			name: "無効なメールアドレス形式",
			user: models.User{
				Name:     TestUserName,
				Email:    "invalid-email",
				Password: TestUserPassword,
			},
			wantErr: true,
		},
		{
			name: "短すぎるパスワード",
			user: models.User{
				Name:     TestUserName,
				Email:    TestUserEmail,
				Password: "pass",
			},
			wantErr: true,
		},
		{
			name: "特殊文字を含むユーザー名",
			user: models.User{
				Name:     "テスト!@#$%^&*()ユーザー",
				Email:    TestUserEmail,
				Password: TestUserPassword,
			},
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.user.Validate()
			if tt.wantErr {
				if err == nil {
					t.Errorf("エラーが期待されましたが、発生しませんでした")
				}
			} else {
				if err != nil {
					t.Errorf("予期しないエラーが発生しました: %v", err)
				}
			}
		})
	}
}

// TestConcurrentAccess は並行アクセスのテストケースです
func TestConcurrentAccess(t *testing.T) {
	db := testutils.NewMockDB()
	defer db.Close()

	repo := repositories.NewUserRepository(db)
	users := createTestUsers(t, 100)

	var wg sync.WaitGroup
	wg.Add(len(users))

	for _, user := range users {
		go func(u *models.User) {
			defer wg.Done()
			err := repo.Create(u)
			if err != nil {
				t.Errorf("ユーザーの作成に失敗しました: %v", err)
			}
		}(user)
	}

	wg.Wait()
}

// TestDatabaseErrorHandling はデータベースエラーハンドリングのテストケースです
func TestDatabaseErrorHandling(t *testing.T) {
	db := testutils.NewMockDB()
	defer db.Close()

	repo := repositories.NewUserRepository(db)

	// データベースエラーをシミュレート
	db.SetError("データベース接続エラー")

	user := &models.User{
		Name:     TestUserName,
		Email:    "error@example.com", // エラーを発生させるための特別なメールアドレス
		Password: TestUserPassword,
	}

	err := repo.Create(user)
	if err == nil {
		t.Errorf("データベースエラーが期待されましたが、発生しませんでした")
	}

	// エラーをクリア
	db.ClearError()

	// 新しいユーザーで再試行
	user.Email = "new@example.com"
	err = repo.Create(user)
	if err != nil {
		t.Errorf("ユーザーの作成に失敗しました: %v", err)
	}
}
