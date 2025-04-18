// Package unit はユニットテストを提供します。
// このパッケージは以下の機能を提供します：
// - ユーザー検証のテスト
// - ユーザーリポジトリのテスト
// - 並行処理のテスト
// - トランザクションのテスト
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

// TestUserValidation はユーザー検証のテストケースです
// この関数は以下のテストケースを実行します：
// - 正常系: 有効なユーザー
// - 異常系: 無効なメールアドレス
// - 異常系: 短すぎるパスワード
// - エッジケース: 最大長の名前
// - エッジケース: 空の名前
// - エッジケース: 特殊文字を含む名前
// - エッジケース: 国際化ドメイン名
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
				Name:     testutils.TestUserName,
				Email:    testutils.TestUserEmail,
				Password: testutils.TestUserPassword,
			},
			wantErr: false,
		},
		{
			name: "異常系: 無効なメールアドレス",
			user: models.User{
				Name:     testutils.TestUserName,
				Email:    "invalid-email",
				Password: testutils.TestUserPassword,
			},
			wantErr: true,
		},
		{
			name: "異常系: 短すぎるパスワード",
			user: models.User{
				Name:     testutils.TestUserName,
				Email:    testutils.TestUserEmail,
				Password: "pass",
			},
			wantErr: true,
		},
		// エッジケースの追加
		{
			name: "エッジケース: 最大長の名前",
			user: models.User{
				Name:     strings.Repeat("a", 255),
				Email:    testutils.TestUserEmail,
				Password: testutils.TestUserPassword,
			},
			wantErr: false,
		},
		{
			name: "エッジケース: 空の名前",
			user: models.User{
				Name:     "",
				Email:    testutils.TestUserEmail,
				Password: testutils.TestUserPassword,
			},
			wantErr: true,
		},
		{
			name: "エッジケース: 特殊文字を含む名前",
			user: models.User{
				Name:     "テスト!@#$%^&*()",
				Email:    testutils.TestUserEmail,
				Password: testutils.TestUserPassword,
			},
			wantErr: false,
		},
		{
			name: "エッジケース: 国際化ドメイン名",
			user: models.User{
				Name:     testutils.TestUserName,
				Email:    "test@例え.テスト",
				Password: testutils.TestUserPassword,
			},
			wantErr: false,
		},
	}

	for _, tt := range tests {
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
// この関数は以下のテストケースを実行します：
// - 正常系: ユーザーの作成
// - 異常系: 重複するメールアドレス
// - 異常系: データベース接続エラー
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
				Name:     testutils.TestUserName,
				Email:    testutils.TestUserEmail,
				Password: testutils.TestUserPassword,
			},
			wantErr: false,
		},
		// エラーハンドリングのテスト
		{
			name: "異常系: 重複するメールアドレス",
			user: models.User{
				Name:     testutils.TestUserName,
				Email:    testutils.TestUserEmail,
				Password: testutils.TestUserPassword,
			},
			wantErr: true,
		},
		{
			name: "異常系: データベース接続エラー",
			user: models.User{
				Name:     testutils.TestUserName,
				Email:    "error@example.com",
				Password: testutils.TestUserPassword,
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
// この関数は以下の処理をテストします：
// - 複数のゴルーチンによる同時ユーザー作成
// - データベースの並行処理の安全性
func TestUserRepositoryConcurrent(t *testing.T) {
	t.Parallel()

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

			assert.NoError(t, err, "ユーザーの作成に失敗しました")
		}(user)
	}

	wg.Wait()
}

// TestUserRepositoryTransaction はトランザクションのテストケースです
// この関数は以下の処理をテストします：
// - トランザクションの開始とロールバック
// - トランザクション内でのユーザー作成
// - ロールバック後のデータ整合性
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
		Name:     testutils.TestUserName,
		Email:    testutils.TestUserEmail,
		Password: testutils.TestUserPassword,
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
