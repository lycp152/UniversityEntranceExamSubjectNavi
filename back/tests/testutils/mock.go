package testutils

import (
	"errors"
	"sync"
	"sync/atomic"
	"time"
)

// User はモックデータベースのユーザー構造体です
type User struct {
	ID        int
	Name      string
	Email     string
	Password  string
	CreatedAt time.Time
	UpdatedAt time.Time
}

// MockDB はモックデータベースを表します
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
func NewMockDB() *MockDB {
	return &MockDB{
		users:        make(map[int]*User),
		pendingUsers: make(map[int]*User),
	}
}

// Query はモックのクエリメソッドです
func (m *MockDB) Query(_ string, _ ...interface{}) (interface{}, error) {
	if m.shouldError {
		return nil, errors.New(m.errorMsg)
	}

	return nil, nil
}

// QueryRow はモックの単一行クエリメソッドです
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
func (m *MockDB) Close() error {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.users = make(map[int]*User)
	m.pendingUsers = make(map[int]*User)

	return nil
}

// Begin はトランザクションを開始します
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
type Result struct {
	db *MockDB
}

// LastInsertId は最後に挿入されたレコードのIDを返します
func (r *Result) LastInsertId() (int64, error) {
	if r.db.shouldError {
		return 0, errors.New(r.db.errorMsg)
	}

	return atomic.LoadInt64(&r.db.nextID), nil
}

// RowsAffected は影響を受けた行数を返します
func (r *Result) RowsAffected() (int64, error) {
	if r.db.shouldError {
		return 0, errors.New(r.db.errorMsg)
	}

	return 1, nil
}

// Row はモックの行を表します
type Row struct {
	db   *MockDB
	err  error
	user *User
}

// Scan は行の値をスキャンします
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
func (m *MockDB) SetError(errMsg string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.shouldError = true
	m.errorMsg = errMsg
}

// ClearError はモックデータベースのエラーをクリアします
func (m *MockDB) ClearError() {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.shouldError = false
	m.errorMsg = ""
}

// VerifyUser はユーザーが正しく作成されたことを検証します
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
func (m *MockDB) GetUserCount() int {
	m.mu.Lock()
	defer m.mu.Unlock()

	return len(m.users)
}

// ClearUsers はユーザーデータをクリアします
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
