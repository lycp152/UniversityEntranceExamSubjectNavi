// Package repositories はユニットテスト用のモックリポジトリを提供します。
// テストデータの作成、検索、更新、削除などの操作をシミュレートします。
package repositories

import (
	"university-exam-api/tests/testutils"
	"university-exam-api/tests/unit/models"
)

// UserRepository はユーザー情報を操作するリポジトリです
type UserRepository struct {
	db *testutils.MockDB
}

// NewUserRepository は新しいユーザーリポジトリを作成します
func NewUserRepository(db *testutils.MockDB) *UserRepository {
	return &UserRepository{
		db: db,
	}
}

// Create は新しいユーザーを作成します
func (r *UserRepository) Create(user *models.User) error {
	// バリデーション
	if err := user.Validate(); err != nil {
		return err
	}

	// ユーザーの作成
	result, err := r.db.Exec(
		"INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
		user.Name,
		user.Email,
		user.Password,
	)
	if err != nil {
		return err
	}

	// 生成されたIDを取得
	id, err := result.LastInsertId()
	if err != nil {
		return err
	}

	user.ID = int(id)

	return nil
}

// FindByID はIDでユーザーを検索します
func (r *UserRepository) FindByID(id int) (*models.User, error) {
	// ユーザーの検索
	row := r.db.QueryRow("SELECT id, name, email, password FROM users WHERE id = ?", id)

	user := &models.User{}
	err := row.Scan(&user.ID, &user.Name, &user.Email, &user.Password)

	if err != nil {
		return nil, err
	}

	return user, nil
}
