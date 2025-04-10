package unit

import (
	"sync"
	"testing"
	"time"

	"university-exam-api/tests/testutils"
	"university-exam-api/tests/unit/models"
	"university-exam-api/tests/unit/repositories"
)

// BenchmarkUserValidation はユーザー検証のパフォーマンスを測定します
func BenchmarkUserValidation(b *testing.B) {
	user := &models.User{
		Name:     testUserName,
		Email:    testUserEmail,
		Password: testUserPassword,
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_ = user.Validate()
	}
}

// BenchmarkUserRepository はユーザーリポジトリのパフォーマンスを測定します
func BenchmarkUserRepository(b *testing.B) {
	db := testutils.NewMockDB()
	defer db.Close()

	repo := repositories.NewUserRepository(db)
	user := &models.User{
		Name:     testUserName,
		Email:    testUserEmail,
		Password: testUserPassword,
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_ = repo.Create(user)
	}
}

// BenchmarkConcurrentUserCreation は並行処理でのユーザー作成のパフォーマンスを測定します
func BenchmarkConcurrentUserCreation(b *testing.B) {
	db := testutils.NewMockDB()
	defer db.Close()

	repo := repositories.NewUserRepository(db)
	users := createTestUsers(b, 100)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		var wg sync.WaitGroup
		wg.Add(len(users))

		for _, user := range users {
			go func(u *models.User) {
				defer wg.Done()
				_ = repo.Create(u)
			}(user)
		}

		wg.Wait()
	}
}

// BenchmarkMemoryUsage はメモリ使用量を測定します
func BenchmarkMemoryUsage(b *testing.B) {
	db := testutils.NewMockDB()
	defer db.Close()

	repo := repositories.NewUserRepository(db)
	users := createTestUsers(b, 1000)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		for _, user := range users {
			_ = repo.Create(user)
		}
	}
}

// BenchmarkResponseTime はAPIレスポンス時間を測定します
func BenchmarkResponseTime(b *testing.B) {
	db := testutils.NewMockDB()
	defer db.Close()

	repo := repositories.NewUserRepository(db)
	user := &models.User{
		Name:     "テストユーザー",
		Email:    "test@example.com",
		Password: "password123",
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		start := time.Now()
		_ = repo.Create(user)
		elapsed := time.Since(start)
		if elapsed > 100*time.Millisecond {
			b.Errorf("レスポンス時間が100msを超えています: %v", elapsed)
		}
	}
}

// BenchmarkDatabaseConnection はデータベース接続のパフォーマンスを測定します
func BenchmarkDatabaseConnection(b *testing.B) {
	db := testutils.NewMockDB()
	defer db.Close()

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_, err := db.Begin()
		if err != nil {
			b.Errorf("データベース接続に失敗しました: %v", err)
		}
	}
}

// BenchmarkCachePerformance はキャッシュのパフォーマンスを測定します
func BenchmarkCachePerformance(b *testing.B) {
	db := testutils.NewMockDB()
	defer db.Close()

	repo := repositories.NewUserRepository(db)
	user := &models.User{
		Name:     "テストユーザー",
		Email:    "test@example.com",
		Password: "password123",
	}

	// キャッシュのウォームアップ
	_ = repo.Create(user)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_, err := repo.FindByID(1)
		if err != nil {
			b.Errorf("キャッシュの取得に失敗しました: %v", err)
		}
	}
}
