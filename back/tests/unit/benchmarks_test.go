// Package unit はユニットテストとベンチマークテストを提供します。
// パフォーマンス測定、並行処理、メモリ使用量、データベース接続などの
// ベンチマークテストを含みます。
package unit

import (
	"sync"
	"testing"
	"time"

	"university-exam-api/tests/testutils"
	"university-exam-api/tests/unit/models"
	"university-exam-api/tests/unit/repositories"
)

const (
	errDBClose = "データベースのクローズに失敗しました: %v"
)

// テスト用の定数をインポート
var (
	_ = TestUserName
	_ = TestUserEmail
	_ = TestUserPassword
)

// BenchmarkUserValidation はユーザー検証のパフォーマンスを測定します
func BenchmarkUserValidation(b *testing.B) {
	user := &models.User{
		Name:     TestUserName,
		Email:    TestUserEmail,
		Password: TestUserPassword,
	}

	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_ = user.Validate()
	}
}

// BenchmarkUserRepository はユーザーリポジトリのパフォーマンスを測定します
func BenchmarkUserRepository(b *testing.B) {
	db := testutils.NewMockDB()
	defer func() {
		if err := db.Close(); err != nil {
			b.Errorf(errDBClose, err)
		}
	}()

	repo := repositories.NewUserRepository(db)
	user := &models.User{
		Name:     TestUserName,
		Email:    TestUserEmail,
		Password: TestUserPassword,
	}

	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_ = repo.Create(user)
	}
}

// BenchmarkConcurrentUserCreation は並行ユーザー作成のパフォーマンスを測定します
func BenchmarkConcurrentUserCreation(b *testing.B) {
	db := testutils.NewMockDB()
	defer func() {
		if err := db.Close(); err != nil {
			b.Errorf(errDBClose, err)
		}
	}()

	repo := repositories.NewUserRepository(db)
	users := createTestUsers(b, b.N)

	b.ResetTimer()

	var wg sync.WaitGroup
	for i := 0; i < b.N; i++ {
		wg.Add(1)

		user := users[i]
		go func() {
			defer wg.Done()

			_ = repo.Create(user)
		}()
	}

	wg.Wait()
}

// BenchmarkMemoryUsage はメモリ使用量を測定します
func BenchmarkMemoryUsage(b *testing.B) {
	db := testutils.NewMockDB()
	defer func() {
		if err := db.Close(); err != nil {
			b.Errorf(errDBClose, err)
		}
	}()

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
	defer func() {
		if err := db.Close(); err != nil {
			b.Errorf(errDBClose, err)
		}
	}()

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
	defer func() {
		if err := db.Close(); err != nil {
			b.Errorf(errDBClose, err)
		}
	}()

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
	defer func() {
		if err := db.Close(); err != nil {
			b.Errorf(errDBClose, err)
		}
	}()

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
