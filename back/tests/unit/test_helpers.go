package unit

import (
	"fmt"
	"testing"
	"time"

	"university-exam-api/tests/unit/models"
)

const (
	testUserName     = "テストユーザー"
	testUserEmail    = "test@example.com"
	testUserPassword = "password123"
)

// createTestUser はテスト用のユーザーを作成するヘルパー関数です
func createTestUser(t testing.TB, name, email, password string) *models.User {
	t.Helper()

	return &models.User{
		Name:     name,
		Email:    email,
		Password: password,
	}
}

// createTestUsers は複数のテストユーザーを作成するヘルパー関数です
func createTestUsers(t testing.TB, count int) []*models.User {
	t.Helper()

	users := make([]*models.User, count)

	for i := 0; i < count; i++ {
		email := fmt.Sprintf("test%d@example.com", i)
		users[i] = createTestUser(t,
			testUserName,
			email,
			testUserPassword,
		)
	}

	return users
}

// assertUserEqual は2つのユーザーが等しいことを確認するヘルパー関数です
var _ = func(t *testing.T, got, want *models.User) {
	t.Helper()

	if got.Name != want.Name {
		t.Errorf("Name: got %v, want %v", got.Name, want.Name)
	}

	if got.Email != want.Email {
		t.Errorf("Email: got %v, want %v", got.Email, want.Email)
	}

	if got.Password != want.Password {
		t.Errorf("Password: got %v, want %v", got.Password, want.Password)
	}
}

// waitForCondition は条件が満たされるまで待機するヘルパー関数です
var _ = func(t *testing.T, condition func() bool, timeout time.Duration) bool {
	t.Helper()

	deadline := time.Now().Add(timeout)

	for time.Now().Before(deadline) {
		if condition() {
			return true
		}

		time.Sleep(100 * time.Millisecond)
	}

	return false
}
