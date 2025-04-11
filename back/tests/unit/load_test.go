package unit

import (
	"sync"
	"testing"
	"time"

	"university-exam-api/tests/testutils"
	"university-exam-api/tests/unit/models"
	"university-exam-api/tests/unit/repositories"
)

// TestLoad は負荷テストのテストケースです
func TestLoad(t *testing.T) {
	db := testutils.NewMockDB()
	defer db.Close()

	repo := repositories.NewUserRepository(db)
	users := createTestUsers(t, 1000)

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

// TestConcurrentLoad は並行アクセスのテストケースです
func TestConcurrentLoad(t *testing.T) {
	db := testutils.NewMockDB()
	defer db.Close()

	repo := repositories.NewUserRepository(db)
	users := createTestUsers(t, 100)

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
