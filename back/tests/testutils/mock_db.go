// Package testutils はテスト用のユーティリティ関数を提供します。
// このパッケージは以下の機能を提供します：
// - モックデータベースの実装
// - トランザクション管理のモック
// - スレッドセーフなデータベース操作
// - エラーシミュレーション機能
package testutils

import (
	"errors"
	"sync"
	"sync/atomic"
	"time"
)

// User はモックデータベースのユーザー構造体です
// この構造体は以下の情報を保持します：
// - ユーザーID
// - ユーザー名
// - メールアドレス
// - パスワード
// - 作成日時
// - 更新日時
type User struct {
	ID        int
	Name      string
	Email     string
	Password  string
	CreatedAt time.Time
	UpdatedAt time.Time
}

// MockDB はモックデータベースを表します
// この構造体は以下の機能を提供します：
// - ユーザーデータの管理
// - トランザクション管理
// - エラーシミュレーション
// - スレッドセーフな操作
type MockDB struct {
	mu            sync.Mutex
	users         map[int]*User
	nextID        int64
	shouldError   bool
	errorMsg      string
	inTransaction bool
	pendingUsers  map[int]*User
}

// NewMockDB は新しいモックデータベースを作成します
// この関数は以下の処理を行います：
// - ユーザーマップの初期化
// - トランザクション用マップの初期化
// - モックデータベースインスタンスの生成
func NewMockDB() *MockDB {
	return &MockDB{
		users:        make(map[int]*User),
		pendingUsers: make(map[int]*User),
	}
}

// Query はモックのクエリメソッドです
// この関数は以下の処理を行います：
// - エラーシミュレーション
// - クエリの実行
func (m *MockDB) Query(_ string, _ ...interface{}) (interface{}, error) {
	if m.shouldError {
		return nil, errors.New(m.errorMsg)
	}

	return nil, nil
}

// QueryRow はモックの単一行クエリメソッドです
// この関数は以下の処理を行います：
// - エラーシミュレーション
// - ユーザーIDによる検索
// - スレッドセーフな操作
func (m *MockDB) QueryRow(query string, args ...interface{}) *Row {
	if m.shouldError {
		return &Row{err: errors.New(m.errorMsg)}
	}

	m.mu.Lock()
	defer m.mu.Unlock()

	// IDによるユーザー検索
	if query == "SELECT id, name, email, password FROM users WHERE id = ?" {
		id := args[0].(int)
		user, ok := m.users[id]

		if !ok {
			return &Row{err: errors.New("ユーザーが見つかりません")}
		}

		return &Row{db: m, user: user}
	}

	return &Row{db: m}
}

// Exec はSQLクエリを実行します
// この関数は以下の処理を行います：
// - エラーシミュレーション
// - ユーザー登録処理
// - スレッドセーフな操作
func (m *MockDB) Exec(query string, args ...interface{}) (*Result, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.shouldError {
		return nil, errors.New(m.errorMsg)
	}

	// データベース接続エラーのシミュレーション
	if email, ok := args[1].(string); ok && email == "error@example.com" {
		return nil, errors.New("データベース接続エラー")
	}

	if query == "INSERT INTO users (name, email, password) VALUES (?, ?, ?)" {
		return m.handleUserInsert(args)
	}

	return &Result{db: m}, nil
}

// handleUserInsert はユーザー登録処理を行います
// この関数は以下の処理を行います：
// - メールアドレスの重複チェック
// - ユーザー情報の作成
// - トランザクション状態に応じた保存
func (m *MockDB) handleUserInsert(args []interface{}) (*Result, error) {
	email := args[1].(string)
	if err := m.checkDuplicateEmail(email); err != nil {
		return nil, err
	}

	user := m.createUser(args)
	if m.inTransaction {
		m.pendingUsers[int(m.nextID)] = user
	} else {
		m.users[int(m.nextID)] = user
	}

	return &Result{db: m}, nil
}

// checkDuplicateEmail はメールアドレスの重複をチェックします
// この関数は以下の処理を行います：
// - 既存ユーザーのメールアドレスチェック
// - トランザクション中のユーザーのメールアドレスチェック
func (m *MockDB) checkDuplicateEmail(email string) error {
	for _, user := range m.users {
		if user.Email == email {
			return errors.New("メールアドレスが重複しています")
		}
	}

	for _, user := range m.pendingUsers {
		if user.Email == email {
			return errors.New("メールアドレスが重複しています")
		}
	}

	return nil
}

// createUser は新しいユーザーを作成します
// この関数は以下の処理を行います：
// - ユーザーIDの生成
// - ユーザー情報の設定
func (m *MockDB) createUser(args []interface{}) *User {
	id := atomic.AddInt64(&m.nextID, 1)

	return &User{
		ID:       int(id),
		Name:     args[0].(string),
		Email:    args[1].(string),
		Password: args[2].(string),
	}
}

// Close はモックデータベースを閉じます
// この関数は以下の処理を行います：
// - ユーザーデータのクリア
// - トランザクション用データのクリア
func (m *MockDB) Close() error {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.users = make(map[int]*User)
	m.pendingUsers = make(map[int]*User)

	return nil
}

// Begin はトランザクションを開始します
// この関数は以下の処理を行います：
// - エラーシミュレーション
// - トランザクションフラグの設定
// - トランザクション用マップの初期化
func (m *MockDB) Begin() (*MockDB, error) {
	if m.shouldError {
		return nil, errors.New(m.errorMsg)
	}

	m.mu.Lock()
	defer m.mu.Unlock()

	// 既存のインスタンスを再利用し、トランザクションフラグを設定
	m.inTransaction = true
	m.pendingUsers = make(map[int]*User)

	return m, nil
}

// Commit はトランザクションをコミットします
// この関数は以下の処理を行います：
// - エラーシミュレーション
// - トランザクション中のデータのコミット
// - トランザクション状態のリセット
func (m *MockDB) Commit() error {
	if m.shouldError {
		return errors.New(m.errorMsg)
	}

	m.mu.Lock()
	defer m.mu.Unlock()

	// トランザクション中のユーザーを本番のユーザーマップに移動
	for id, user := range m.pendingUsers {
		m.users[id] = user
	}

	m.pendingUsers = make(map[int]*User)
	m.inTransaction = false

	return nil
}

// Rollback はトランザクションをロールバックします
// この関数は以下の処理を行います：
// - エラーシミュレーション
// - トランザクション中のデータの破棄
// - トランザクション状態のリセット
func (m *MockDB) Rollback() error {
	if m.shouldError {
		return errors.New(m.errorMsg)
	}

	m.mu.Lock()
	defer m.mu.Unlock()

	// トランザクション中のユーザーを破棄
	m.pendingUsers = make(map[int]*User)
	m.inTransaction = false

	return nil
}

// Result はモックの実行結果を表します
// この構造体は以下の情報を保持します：
// - データベースインスタンスへの参照
type Result struct {
	db *MockDB
}

// LastInsertId は最後に挿入されたレコードのIDを返します
// この関数は以下の処理を行います：
// - エラーシミュレーション
// - 最後に生成されたIDの取得
func (r *Result) LastInsertId() (int64, error) {
	if r.db.shouldError {
		return 0, errors.New(r.db.errorMsg)
	}

	return atomic.LoadInt64(&r.db.nextID), nil
}

// RowsAffected は影響を受けた行数を返します
// この関数は以下の処理を行います：
// - エラーシミュレーション
// - 影響を受けた行数の返却
func (r *Result) RowsAffected() (int64, error) {
	if r.db.shouldError {
		return 0, errors.New(r.db.errorMsg)
	}

	return 1, nil
}

// Row はモックの行を表します
// この構造体は以下の情報を保持します：
// - データベースインスタンスへの参照
// - エラー情報
// - ユーザー情報
type Row struct {
	db   *MockDB
	err  error
	user *User
}

// Scan は行の値をスキャンします
// この関数は以下の処理を行います：
// - エラーチェック
// - ユーザー情報のスキャン
func (r *Row) Scan(dest ...interface{}) error {
	if r.err != nil {
		return r.err
	}

	if r.db.shouldError {
		return errors.New(r.db.errorMsg)
	}

	if r.user != nil {
		*dest[0].(*int) = r.user.ID
		*dest[1].(*string) = r.user.Name
		*dest[2].(*string) = r.user.Email
		*dest[3].(*string) = r.user.Password
	}

	return nil
}

// SetError はモックデータベースにエラーを設定します
// この関数は以下の処理を行います：
// - エラーフラグの設定
// - エラーメッセージの設定
func (m *MockDB) SetError(errMsg string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.shouldError = true
	m.errorMsg = errMsg
}

// ClearError はモックデータベースのエラーをクリアします
// この関数は以下の処理を行います：
// - エラーフラグのクリア
// - エラーメッセージのクリア
func (m *MockDB) ClearError() {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.shouldError = false
	m.errorMsg = ""
}

// VerifyUser はユーザーが正しく作成されたことを検証します
// この関数は以下の処理を行います：
// - ユーザーの存在確認
// - ユーザー情報の検証
func (m *MockDB) VerifyUser(id int, expected *User) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	user, ok := m.users[id]
	if !ok {
		return errors.New("ユーザーが見つかりません")
	}

	if user.Name != expected.Name {
		return errors.New("名前が一致しません")
	}

	if user.Email != expected.Email {
		return errors.New("メールアドレスが一致しません")
	}

	if user.Password != expected.Password {
		return errors.New("パスワードが一致しません")
	}

	return nil
}

// GetUserCount はユーザーの総数を返します
// この関数は以下の処理を行います：
// - スレッドセーフな操作
// - ユーザー数の取得
func (m *MockDB) GetUserCount() int {
	m.mu.Lock()
	defer m.mu.Unlock()

	return len(m.users)
}

// ClearUsers はユーザーデータをクリアします
// この関数は以下の処理を行います：
// - ユーザーマップのクリア
// - トランザクション用マップのクリア
// - IDカウンタのリセット
// - トランザクション状態のリセット
func (m *MockDB) ClearUsers() error {
	m.mu.Lock()
	defer m.mu.Unlock()

	// すべてのマップをクリア
	m.users = make(map[int]*User)
	m.pendingUsers = make(map[int]*User)
	m.nextID = 0
	m.inTransaction = false

	return nil
}
