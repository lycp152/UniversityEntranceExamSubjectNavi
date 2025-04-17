package unit

import (
	"testing"
	"university-exam-api/tests/unit/models"
)

// TestSecurityValidation はセキュリティ関連のバリデーションテストです
func TestSecurityValidation(t *testing.T) {
	tests := []struct {
		name    string
		user    models.User
		wantErr bool
	}{
		{
			name: "XSS攻撃の検出",
			user: models.User{
				Name:     "<script>alert('xss')</script>",
				Email:    testUserEmail,
				Password: testUserPassword,
			},
			wantErr: true,
		},
		{
			name: "SQLインジェクション攻撃の検出",
			user: models.User{
				Name:     "test'; DROP TABLE users; --",
				Email:    testUserEmail,
				Password: testUserPassword,
			},
			wantErr: true,
		},
		{
			name: "長すぎる入力の検出",
			user: models.User{
				Name:     string(make([]byte, 1001)), // 1001バイトの文字列
				Email:    testUserEmail,
				Password: testUserPassword,
			},
			wantErr: true,
		},
		{
			name: "特殊文字の検出",
			user: models.User{
				Name:     "テスト\u0000ユーザー", // NULL文字を含む
				Email:    testUserEmail,
				Password: testUserPassword,
			},
			wantErr: true,
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
