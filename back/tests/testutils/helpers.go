// Package testutils はテスト用のユーティリティ関数を提供します。
// このパッケージは以下の機能を提供します：
// - テストデータの生成
// - アサーション関数
// - テスト条件の待機

package testutils

import (
	"fmt"
	"testing"
	"time"

	"university-exam-api/tests/unit/models"
)

// テストユーザーのデフォルト値
// これらの定数は以下の情報を定義します：
// - テストユーザーの基本情報
// - デフォルトの認証情報
const (
	// TestUserName はテストユーザーのデフォルト名です
	TestUserName = "テストユーザー"
	// TestUserEmail はテストユーザーのデフォルトメールアドレスです
	TestUserEmail = "test@example.com"
	// TestUserPassword はテストユーザーのデフォルトパスワードです
	TestUserPassword = "password123"
)

// CreateTestUser はテスト用のユーザーを作成するヘルパー関数です
// この関数は以下の処理を行います：
// - ユーザー情報の設定
// - テストヘルパーの登録
func CreateTestUser(t testing.TB, name, email, password string) *models.User {
	t.Helper()

	return &models.User{
		Name:     name,
		Email:    email,
		Password: password,
	}
}

// CreateTestUsers は複数のテストユーザーを作成するヘルパー関数です
// この関数は以下の処理を行います：
// - 指定数のユーザー作成
// - 一意のメールアドレス生成
// - テストヘルパーの登録
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
// この関数は以下の処理を行います：
// - ユーザー名の比較
// - メールアドレスの比較
// - パスワードの比較
func AssertUserEqual(t *testing.T, got, want *models.User) {
	t.Helper()

	if got.Name != want.Name {
		t.Errorf("名前: 取得値 %v, 期待値 %v", got.Name, want.Name)
	}

	if got.Email != want.Email {
		t.Errorf("メールアドレス: 取得値 %v, 期待値 %v", got.Email, want.Email)
	}

	if got.Password != want.Password {
		t.Errorf("パスワード: 取得値 %v, 期待値 %v", got.Password, want.Password)
	}
}

// WaitForCondition は条件が満たされるまで待機するヘルパー関数です
// この関数は以下の処理を行います：
// - タイムアウトの設定
// - 条件の定期的なチェック
// - 結果の返却
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
// この関数は以下の処理を行います：
// - 値の比較
// - エラーメッセージの生成
// - テストヘルパーの登録
func AssertEqual(t *testing.T, got, want interface{}, msg string) {
	t.Helper()

	if got != want {
		t.Errorf("%s: 取得値 %v, 期待値 %v", msg, got, want)
	}
}

// AssertNotEqual は2つの値が等しくないことを確認するヘルパー関数です
// この関数は以下の処理を行います：
// - 値の比較
// - エラーメッセージの生成
// - テストヘルパーの登録
func AssertNotEqual(t *testing.T, got, want interface{}, msg string) {
	t.Helper()

	if got == want {
		t.Errorf("%s: 取得値 %v, 期待値と異なる値であるべき", msg, got)
	}
}

// AssertNil は値がnilであることを確認するヘルパー関数です
// この関数は以下の処理を行います：
// - nilチェック
// - エラーメッセージの生成
// - テストヘルパーの登録
func AssertNil(t *testing.T, got interface{}, msg string) {
	t.Helper()

	if got != nil {
		t.Errorf("%s: 取得値 %v, nilであるべき", msg, got)
	}
}

// AssertNotNil は値がnilでないことを確認するヘルパー関数です
// この関数は以下の処理を行います：
// - nilチェック
// - エラーメッセージの生成
// - テストヘルパーの登録
func AssertNotNil(t *testing.T, got interface{}, msg string) {
	t.Helper()

	if got == nil {
		t.Errorf("%s: 取得値 nil, nil以外の値であるべき", msg)
	}
}
