package repositories

import (
	"context"
	"database/sql"
	"errors"
	"os"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

const errSetenvFailed = "os.Setenv failed: %v"
const errUnsetenvFailed = "os.Unsetenv failed: %v"
const errInMemoryDBFailed = "インメモリDBの作成に失敗: %v"
const sqliteInMemory = ":memory:"

// getEnvOrDefaultDurationのテスト
func TestGetEnvOrDefaultDuration(t *testing.T) {
	err := os.Setenv("TEST_DUR", "2s")
	if err != nil {
		t.Fatalf(errSetenvFailed, err)
	}

	defer func() {
		err := os.Unsetenv("TEST_DUR")
		if err != nil {
			t.Fatalf(errUnsetenvFailed, err)
		}
	}()
	assert.Equal(t, 2*time.Second, getEnvOrDefaultDuration("TEST_DUR", time.Second))
	assert.Equal(t, time.Second, getEnvOrDefaultDuration("NOT_SET", time.Second))

	err = os.Setenv("TEST_DUR", "invalid")

	if err != nil {
		t.Fatalf(errSetenvFailed, err)
	}

	assert.Equal(t, time.Second, getEnvOrDefaultDuration("TEST_DUR", time.Second))
}

// getEnvOrDefaultFloatのテスト
func TestGetEnvOrDefaultFloat(t *testing.T) {
	err := os.Setenv("TEST_FLOAT", "1.5")
	if err != nil {
		t.Fatalf(errSetenvFailed, err)
	}

	defer func() {
		err := os.Unsetenv("TEST_FLOAT")
		if err != nil {
			t.Fatalf(errUnsetenvFailed, err)
		}
	}()
	assert.Equal(t, 1.5, getEnvOrDefaultFloat("TEST_FLOAT", 2.0))
	assert.Equal(t, 2.0, getEnvOrDefaultFloat("NOT_SET", 2.0))

	err = os.Setenv("TEST_FLOAT", "invalid")

	if err != nil {
		t.Fatalf(errSetenvFailed, err)
	}

	assert.Equal(t, 2.0, getEnvOrDefaultFloat("TEST_FLOAT", 2.0))
}

// getEnvOrDefaultBoolのテスト
func TestGetEnvOrDefaultBool(t *testing.T) {
	err := os.Setenv("TEST_BOOL", "true")
	if err != nil {
		t.Fatalf(errSetenvFailed, err)
	}

	defer func() {
		err := os.Unsetenv("TEST_BOOL")
		if err != nil {
			t.Fatalf(errUnsetenvFailed, err)
		}
	}()
	assert.Equal(t, true, getEnvOrDefaultBool("TEST_BOOL", false))
	assert.Equal(t, false, getEnvOrDefaultBool("NOT_SET", false))

	// defaultValue=true のケース
	err = os.Unsetenv("TEST_BOOL")
	if err != nil {
		t.Fatalf(errUnsetenvFailed, err)
	}

	assert.Equal(t, true, getEnvOrDefaultBool("NOT_SET", true))

	err = os.Setenv("TEST_BOOL", "invalid")

	if err != nil {
		t.Fatalf(errSetenvFailed, err)
	}

	assert.Equal(t, false, getEnvOrDefaultBool("TEST_BOOL", false))
}

// isRetryableErrorのテスト
func TestIsRetryableError(t *testing.T) {
	t.Parallel()

	r := &universityRepository{}
	cases := []struct {
		name string
		err  error
		want bool
	}{
		{name: "nil error", err: nil, want: false},
		{name: "context deadline exceeded", err: context.DeadlineExceeded, want: true},
		{name: "context canceled", err: context.Canceled, want: false},
		{name: "general error", err: assert.AnError, want: false},
		{name: "deadlock error", err: &customError{"deadlock detected"}, want: true},
		{name: "timeout error", err: &customError{"timeout occurred"}, want: true},
		{name: "connection error", err: &customError{"connection lost"}, want: true},
		{name: "serialization error", err: &customError{"serialization failure"}, want: true},
		{name: "lock timeout error", err: &customError{"lock wait timeout"}, want: true},
	}

	for _, c := range cases {
		c := c
		t.Run(c.name, func(t *testing.T) {
			t.Parallel()

			got := r.isRetryableError(c.err)
			assert.Equal(t, c.want, got, "err=%v", c.err)
		})
	}
}

type customError struct{ msg string }
func (e *customError) Error() string { return e.msg }

// TransactionWithOption, Savepoint, RollbackToのインテグレーションテスト
func TestTransactionWithOptionSavepointRollback(t *testing.T) {
	db, err := gorm.Open(sqlite.Open(sqliteInMemory), &gorm.Config{})
	if err != nil {
		t.Fatalf(errInMemoryDBFailed, err)
	}

	r := &universityRepository{db: db}

	err = r.TransactionWithOption(func(_ IUniversityRepository) error {
		tx := db.Begin()
		defer tx.Rollback()
		// テーブル作成をトランザクション内で実行
		err := tx.AutoMigrate(&testModel{})
		if err != nil {
			return err
		}
		// セーブポイント作成
		err = r.Savepoint(tx, "sp1")
		assert.NoError(t, err)
		// データ挿入
		m := &testModel{Name: "test"}
		err = tx.Create(m).Error
		assert.NoError(t, err)
		// セーブポイントまでロールバック
		err = r.RollbackTo(tx, "sp1")
		assert.NoError(t, err)
		// データがロールバックされていることを確認
		var count int64

		tx.Model(&testModel{}).Count(&count)
		assert.Equal(t, int64(0), count)

		return nil
	}, DefaultTransactionOption())
	assert.NoError(t, err)
}

type testModel struct {
	ID   uint
	Name string
}

func TestTransaction(t *testing.T) {
	t.Parallel()

	// テスト用のデータベース接続を設定
	db, err := gorm.Open(sqlite.Open(sqliteInMemory), &gorm.Config{})
	if err != nil {
		t.Fatalf(errInMemoryDBFailed, err)
	}

	repo := &universityRepository{db: db}

	tests := []struct {
		name          string
		fn            func(repo IUniversityRepository) error
		expectedError error
	}{
		{
			name: "正常なトランザクション",
			fn: func(_ IUniversityRepository) error {
				return nil
			},
			expectedError: nil,
		},
		{
			name: "エラー発生時のロールバック",
			fn: func(_ IUniversityRepository) error {
				return errors.New("test error")
			},
			expectedError: errors.New("トランザクションが失敗しました: test error"),
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			err := repo.Transaction(tt.fn)

			if tt.expectedError != nil {
				assert.Error(t, err)
				assert.Equal(t, tt.expectedError.Error(), err.Error())
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestTransactionWithOption(t *testing.T) {
	t.Parallel()

	// テスト用のデータベース接続を設定
	db, err := gorm.Open(sqlite.Open(sqliteInMemory), &gorm.Config{})
	if err != nil {
		t.Fatalf(errInMemoryDBFailed, err)
	}

	repo := &universityRepository{db: db}
	ctx := context.Background()
	opts := DefaultTransactionOption()

	tests := []struct {
		name          string
		ctx           context.Context
		opts          *TransactionOption
		fn            func(repo IUniversityRepository) error
		expectedError error
	}{
		{
			name: "コンテキスト付き正常なトランザクション",
			ctx:  ctx,
			opts: opts,
			fn: func(_ IUniversityRepository) error {
				return nil
			},
			expectedError: nil,
		},
		{
			name: "コンテキスト付きエラー発生時のロールバック",
			ctx:  ctx,
			opts: opts,
			fn: func(_ IUniversityRepository) error {
				return errors.New("test error")
			},
			expectedError: errors.New("トランザクションが失敗しました: test error"),
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			err := repo.TransactionWithOption(tt.fn, tt.opts)

			if tt.expectedError != nil {
				assert.Error(t, err)
				assert.Equal(t, tt.expectedError.Error(), err.Error())
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestSavepoint(t *testing.T) {
	t.Parallel()

	// テスト用のデータベース接続を設定
	db, err := gorm.Open(sqlite.Open(sqliteInMemory), &gorm.Config{})
	if err != nil {
		t.Fatalf(errInMemoryDBFailed, err)
	}

	repo := &universityRepository{
		db: db,
	}

	tests := []struct {
		name          string
		savepointName string
		wantErr       bool
	}{
		{
			name:          "正常なセーブポイント",
			savepointName: "test_savepoint",
			wantErr:       false,
		},
		{
			name:          "空のセーブポイント名",
			savepointName: "",
			wantErr:       true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			err := repo.Savepoint(db, tt.savepointName)

			if (err != nil) != tt.wantErr {
				t.Errorf("Savepoint() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestDefaultTransactionOption(t *testing.T) {
	t.Parallel()

	opts := DefaultTransactionOption()

	assert.NotNil(t, opts)
	assert.Equal(t, sql.LevelReadCommitted, opts.Isolation)
	assert.Equal(t, defaultTxTimeout, opts.Timeout)
	assert.False(t, opts.ReadOnly)
	assert.NotNil(t, opts.RetryPolicy)
	assert.NotNil(t, opts.Monitor)
}
