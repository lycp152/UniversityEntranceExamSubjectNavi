// Package unit はユニットテストとセキュリティテストを提供します。
// このパッケージは以下の機能を提供します：
// - セキュリティバリデーションのテスト
// - 攻撃パターンの検出
// - 入力値の検証
package unit

import (
	"testing"
	"university-exam-api/tests/testutils"
	"university-exam-api/tests/unit/models"
)

// TestSecurityValidation はセキュリティ関連のバリデーションテストです
// この関数は以下の処理を行います：
// - XSS攻撃の検出
// - SQLインジェクション攻撃の検出
// - 長すぎる入力の検出
// - 特殊文字の検出
func TestSecurityValidation(t *testing.T) {
	tests := []struct {
		name    string // テストケースの名前
		user    models.User // テスト対象のユーザー
		wantErr bool   // エラーが期待されるかどうか
	}{
		{
			name: "XSS攻撃の検出",
			user: models.User{
				Name:     "<script>alert('xss')</script>", // XSS攻撃の例
				Email:    testutils.TestUserEmail,
				Password: testutils.TestUserPassword,
			},
			wantErr: true, // エラーが期待される
		},
		{
			name: "SQLインジェクション攻撃の検出",
			user: models.User{
				Name:     "test'; DROP TABLE users; --", // SQLインジェクション攻撃の例
				Email:    testutils.TestUserEmail,
				Password: testutils.TestUserPassword,
			},
			wantErr: true, // エラーが期待される
		},
		{
			name: "長すぎる入力の検出",
			user: models.User{
				Name:     string(make([]byte, 1001)), // 1001バイトの文字列（制限を超える）
				Email:    testutils.TestUserEmail,
				Password: testutils.TestUserPassword,
			},
			wantErr: true, // エラーが期待される
		},
		{
			name: "特殊文字の検出",
			user: models.User{
				Name:     "テスト\u0000ユーザー", // NULL文字を含む（特殊文字の例）
				Email:    testutils.TestUserEmail,
				Password: testutils.TestUserPassword,
			},
			wantErr: true, // エラーが期待される
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.user.Validate()
			if tt.wantErr {
				if err == nil {
					t.Errorf("エラーが期待されましたが、発生しませんでした")
				}
			} else {
				if err != nil {
					t.Errorf("予期しないエラーが発生しました: %v", err)
				}
			}
		})
	}
}
