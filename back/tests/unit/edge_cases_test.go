// Package unit はユニットテストとエッジケースのテストを提供します。
// このパッケージは以下の機能を提供します：
// - ユーザー入力のエッジケーステスト
// - 並行アクセスのテスト
// - データベースエラーハンドリングのテスト
package unit

import (
	"strings"
	"sync"
	"testing"
	"university-exam-api/tests/testutils"
	"university-exam-api/tests/unit/models"
	"university-exam-api/tests/unit/repositories"
)

// TestEdgeCases はユーザー入力のエッジケースをテストします
// この関数は以下のケースをテストします：
// - 空のユーザー名
// - 最大長のユーザー名
// - 無効なメールアドレス形式
// - 短すぎるパスワード
// - 特殊文字を含むユーザー名
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
				Email:    testutils.TestUserEmail,
				Password: testutils.TestUserPassword,
			},
			wantErr: true,
		},
		{
			name: "最大長のユーザー名",
			user: models.User{
				Name:     strings.Repeat("あ", 255),
				Email:    testutils.TestUserEmail,
				Password: testutils.TestUserPassword,
			},
			wantErr: false,
		},
		{
			name: "無効なメールアドレス形式",
			user: models.User{
				Name:     testutils.TestUserName,
				Email:    "invalid-email",
				Password: testutils.TestUserPassword,
			},
			wantErr: true,
		},
		{
			name: "短すぎるパスワード",
			user: models.User{
				Name:     testutils.TestUserName,
				Email:    testutils.TestUserEmail,
				Password: "pass",
			},
			wantErr: true,
		},
		{
			name: "特殊文字を含むユーザー名",
			user: models.User{
				Name:     "テスト!@#$%^&*()ユーザー",
				Email:    testutils.TestUserEmail,
				Password: testutils.TestUserPassword,
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

// TestConcurrentAccess は並行アクセスのテストを行います
// この関数は以下の処理を行います：
// - モックデータベースの作成
// - 複数のテストユーザーの作成
// - 並行処理でのユーザー作成
// - エラーハンドリング
func TestConcurrentAccess(t *testing.T) {
	db := testutils.NewMockDB()
	defer func() {
		if err := db.Close(); err != nil {
			t.Errorf("データベースのクローズに失敗しました: %v", err)
		}
	}()

	repo := repositories.NewUserRepository(db)
	users := testutils.CreateTestUsers(t, 100)

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

// TestDatabaseErrorHandling はデータベースエラーハンドリングをテストします
// この関数は以下の処理を行います：
// - モックデータベースの作成
// - エラーのシミュレーション
// - エラー発生時の動作確認
// - エラークリア後の動作確認
func TestDatabaseErrorHandling(t *testing.T) {
	db := testutils.NewMockDB()
	defer func() {
		if err := db.Close(); err != nil {
			t.Errorf("データベースのクローズに失敗しました: %v", err)
		}
	}()

	repo := repositories.NewUserRepository(db)

	// データベースエラーをシミュレート
	db.SetError("データベース接続エラー")

	user := &models.User{
		Name:     testutils.TestUserName,
		Email:    "error@example.com", // エラーを発生させるための特別なメールアドレス
		Password: testutils.TestUserPassword,
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
