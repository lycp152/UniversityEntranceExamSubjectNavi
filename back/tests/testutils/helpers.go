// Package testutils はテスト用のユーティリティ関数を提供します。
package testutils

import (
	"fmt"
	"testing"
	"time"

	"university-exam-api/tests/unit/models"
)

// テストユーザーのデフォルト値
const (
	// TestUserName はテストユーザーのデフォルト名です
	TestUserName = "テストユーザー"
	// TestUserEmail はテストユーザーのデフォルトメールアドレスです
	TestUserEmail = "test@example.com"
	// TestUserPassword はテストユーザーのデフォルトパスワードです
	TestUserPassword = "password123"
)

// CreateTestUser はテスト用のユーザーを作成するヘルパー関数です
func CreateTestUser(t testing.TB, name, email, password string) *models.User {
	t.Helper()

	return &models.User{
		Name:     name,
		Email:    email,
		Password: password,
	}
}

// CreateTestUsers は複数のテストユーザーを作成するヘルパー関数です
func CreateTestUsers(t testing.TB, count int) []*models.User {
	t.Helper()

	users := make([]*models.User, count)

	for i := 0; i < count; i++ {
		email := fmt.Sprintf("test%d@example.com", i)
		users[i] = CreateTestUser(t,
			TestUserName,
			email,
			TestUserPassword,
		)
	}

	return users
}

// AssertUserEqual は2つのユーザーが等しいことを確認するヘルパー関数です
func AssertUserEqual(t *testing.T, got, want *models.User) {
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

// WaitForCondition は条件が満たされるまで待機するヘルパー関数です
func WaitForCondition(t *testing.T, condition func() bool, timeout time.Duration) bool {
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

// AssertEqual は2つの値が等しいことを確認するヘルパー関数です
func AssertEqual(t *testing.T, got, want interface{}, msg string) {
	t.Helper()

	if got != want {
		t.Errorf("%s: got %v, want %v", msg, got, want)
	}
}

// AssertNotEqual は2つの値が等しくないことを確認するヘルパー関数です
func AssertNotEqual(t *testing.T, got, want interface{}, msg string) {
	t.Helper()

	if got == want {
		t.Errorf("%s: got %v, want not %v", msg, got, want)
	}
}

// AssertNil は値がnilであることを確認するヘルパー関数です
func AssertNil(t *testing.T, got interface{}, msg string) {
	t.Helper()

	if got != nil {
		t.Errorf("%s: got %v, want nil", msg, got)
	}
}

// AssertNotNil は値がnilでないことを確認するヘルパー関数です
func AssertNotNil(t *testing.T, got interface{}, msg string) {
	t.Helper()

	if got == nil {
		t.Errorf("%s: got nil, want not nil", msg)
	}
}
