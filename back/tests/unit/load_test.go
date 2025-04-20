// Package unit はユニットテストと負荷テストを提供します。
// このパッケージは以下の機能を提供します：
// - 大量のデータ処理のテスト
// - 並行処理のパフォーマンステスト
// - データベースの負荷テスト
package unit

import (
	"sync"
	"testing"
	"time"

	"university-exam-api/tests/testutils"
	"university-exam-api/tests/unit/models"
	"university-exam-api/tests/unit/repositories"
)

// TestLoad は大量のデータ処理のパフォーマンスをテストします
// この関数は以下の処理を行います：
// - モックデータベースの作成
// - 1000ユーザーの作成
// - 処理時間の測定
// - パフォーマンスの検証
func TestLoad(t *testing.T) {
	db := testutils.NewMockDB()
	defer func() {
		if err := db.Close(); err != nil {
			t.Errorf("データベースのクローズに失敗しました: %v", err)
		}
	}()

	repo := repositories.NewUserRepository(db)
	users := testutils.CreateTestUsers(t, 1000)

	start := time.Now()

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

	duration := time.Since(start)
	t.Logf("1000ユーザーの作成にかかった時間: %v", duration)

	if duration > 5*time.Second {
		t.Errorf("パフォーマンスが期待値を下回っています: %v", duration)
	}
}

// TestConcurrentLoad は並行処理のパフォーマンスをテストします
// この関数は以下の処理を行います：
// - モックデータベースの作成
// - 100ユーザーの並行作成
// - 処理時間の測定
// - 並行処理のパフォーマンス検証
func TestConcurrentLoad(t *testing.T) {
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

	start := time.Now()

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

	duration := time.Since(start)
	t.Logf("100ユーザーの並行作成にかかった時間: %v", duration)

	if duration > 1*time.Second {
		t.Errorf("並行処理のパフォーマンスが期待値を下回っています: %v", duration)
	}
}
