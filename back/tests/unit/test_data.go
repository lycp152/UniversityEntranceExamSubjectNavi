// Package unit はユニットテスト用のテストデータを提供します。
// このパッケージは以下の機能を提供します：
// - テストデータの初期化
// - テストデータのリセット
// - テストデータの再利用
package unit

import (
	"university-exam-api/tests/testutils"
	"university-exam-api/tests/unit/models"
)

// TestData はテストデータを保持する構造体です
// この構造体は以下のデータを管理します：
// - Users: テスト用のユーザーリスト
type TestData struct {
	Users []*models.User // テスト用のユーザーリスト
}

// NewTestData は新しいテストデータを作成します
// この関数は以下の処理を行います：
// - デフォルトのテストユーザーを作成
// - テストデータ構造体を初期化
// 戻り値：
// - *TestData: 初期化されたテストデータ
func NewTestData() *TestData {
	return &TestData{
		Users: []*models.User{
			{
				Name:     testutils.TestUserName,    // テストユーザー名
				Email:    testutils.TestUserEmail,   // テストユーザーのメールアドレス
				Password: testutils.TestUserPassword, // テストユーザーのパスワード
			},
		},
	}
}

// Reset はテストデータをリセットします
// このメソッドは以下の処理を行います：
// - ユーザーリストをデフォルト値にリセット
// - テストの再実行時に使用
func (td *TestData) Reset() {
	td.Users = []*models.User{
		{
			Name:     testutils.TestUserName,    // テストユーザー名
			Email:    testutils.TestUserEmail,   // テストユーザーのメールアドレス
			Password: testutils.TestUserPassword, // テストユーザーのパスワード
		},
	}
}
