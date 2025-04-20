// Package unit はユニットテストとベンチマークテストを提供します。
// このパッケージは以下の機能を提供します：
// - パフォーマンス測定
// - 並行処理のテスト
// - メモリ使用量の測定
// - データベース接続のテスト
// - キャッシュパフォーマンスの測定
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

// BenchmarkUserValidation はユーザー検証のパフォーマンスを測定します
// この関数は以下の処理を行います：
// - テストユーザーの作成
// - バリデーションの実行
// - 実行時間の測定
func BenchmarkUserValidation(b *testing.B) {
	user := &models.User{
		Name:     testutils.TestUserName,
		Email:    testutils.TestUserEmail,
		Password: testutils.TestUserPassword,
	}

	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_ = user.Validate()
	}
}

// BenchmarkUserRepository はユーザーリポジトリのパフォーマンスを測定します
// この関数は以下の処理を行います：
// - モックデータベースの作成
// - リポジトリの初期化
// - ユーザー作成の実行
// - 実行時間の測定
func BenchmarkUserRepository(b *testing.B) {
	db := testutils.NewMockDB()
	defer func() {
		if err := db.Close(); err != nil {
			b.Errorf(errDBClose, err)
		}
	}()

	repo := repositories.NewUserRepository(db)
	user := &models.User{
		Name:     testutils.TestUserName,
		Email:    testutils.TestUserEmail,
		Password: testutils.TestUserPassword,
	}

	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_ = repo.Create(user)
	}
}

// BenchmarkConcurrentUserCreation は並行ユーザー作成のパフォーマンスを測定します
// この関数は以下の処理を行います：
// - モックデータベースの作成
// - テストユーザーの作成
// - 並行処理でのユーザー作成
// - 実行時間の測定
func BenchmarkConcurrentUserCreation(b *testing.B) {
	db := testutils.NewMockDB()
	defer func() {
		if err := db.Close(); err != nil {
			b.Errorf(errDBClose, err)
		}
	}()

	repo := repositories.NewUserRepository(db)
	users := testutils.CreateTestUsers(b, b.N)

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
// この関数は以下の処理を行います：
// - モックデータベースの作成
// - 大量のテストユーザーの作成
// - メモリ使用量の測定
func BenchmarkMemoryUsage(b *testing.B) {
	db := testutils.NewMockDB()
	defer func() {
		if err := db.Close(); err != nil {
			b.Errorf(errDBClose, err)
		}
	}()

	repo := repositories.NewUserRepository(db)
	users := testutils.CreateTestUsers(b, 1000)

	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		for _, user := range users {
			_ = repo.Create(user)
		}
	}
}

// BenchmarkResponseTime はAPIレスポンス時間を測定します
// この関数は以下の処理を行います：
// - モックデータベースの作成
// - テストユーザーの作成
// - レスポンス時間の測定
// - タイムアウトチェック
func BenchmarkResponseTime(b *testing.B) {
	db := testutils.NewMockDB()
	defer func() {
		if err := db.Close(); err != nil {
			b.Errorf(errDBClose, err)
		}
	}()

	repo := repositories.NewUserRepository(db)
	user := &models.User{
		Name:     testutils.TestUserName,
		Email:    testutils.TestUserEmail,
		Password: testutils.TestUserPassword,
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
// この関数は以下の処理を行います：
// - モックデータベースの作成
// - 接続の確立
// - 接続時間の測定
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
// この関数は以下の処理を行います：
// - モックデータベースの作成
// - キャッシュのウォームアップ
// - キャッシュアクセスの測定
func BenchmarkCachePerformance(b *testing.B) {
	db := testutils.NewMockDB()
	defer func() {
		if err := db.Close(); err != nil {
			b.Errorf(errDBClose, err)
		}
	}()

	repo := repositories.NewUserRepository(db)
	user := &models.User{
		Name:     testutils.TestUserName,
		Email:    testutils.TestUserEmail,
		Password: testutils.TestUserPassword,
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
