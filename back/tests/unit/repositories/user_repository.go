// Package repositories はユニットテスト用のモックリポジトリを提供します。
// このパッケージは以下の機能を提供します：
// - テストデータの作成
// - テストデータの検索
// - テストデータの更新
// - テストデータの削除
// - トランザクション管理
package repositories

import (
	"university-exam-api/tests/testutils"
	"university-exam-api/tests/unit/models"
)

// UserRepository はユーザー情報を操作するリポジトリです
// この構造体は以下の機能を提供します：
// - ユーザー情報の永続化
// - ユーザー情報の検索
// - ユーザー情報の更新
// - ユーザー情報の削除
type UserRepository struct {
	db *testutils.MockDB
}

// NewUserRepository は新しいユーザーリポジトリを作成します
// この関数は以下の処理を行います：
// - モックデータベースの設定
// - リポジトリインスタンスの生成
func NewUserRepository(db *testutils.MockDB) *UserRepository {
	return &UserRepository{
		db: db,
	}
}

// Create は新しいユーザーを作成します
// この関数は以下の処理を行います：
// - ユーザー情報のバリデーション
// - データベースへのユーザー情報の保存
// - 生成されたIDの取得
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
// この関数は以下の処理を行います：
// - データベースからのユーザー情報の取得
// - 取得した情報の構造体へのマッピング
// - エラーチェック
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
