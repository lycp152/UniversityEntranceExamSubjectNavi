package unit

import "university-exam-api/tests/unit/models"

// TestData はテストデータを保持する構造体です
type TestData struct {
	Users []*models.User
}

// NewTestData は新しいテストデータを作成します
func NewTestData() *TestData {
	return &TestData{
		Users: []*models.User{
			{
				Name:     TestUserName,
				Email:    TestUserEmail,
				Password: TestUserPassword,
			},
		},
	}
}

// Reset はテストデータをリセットします
func (td *TestData) Reset() {
	td.Users = []*models.User{
		{
			Name:     TestUserName,
			Email:    TestUserEmail,
			Password: TestUserPassword,
		},
	}
}
