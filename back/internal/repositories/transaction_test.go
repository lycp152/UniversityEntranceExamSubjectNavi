package repositories

import (
	"context"
	"os"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

const errSetenvFailed = "os.Setenv failed: %v"
const errUnsetenvFailed = "os.Unsetenv failed: %v"

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
	r := &universityRepository{}
	cases := []struct {
		err  error
		want bool
	}{
		{err: nil, want: false},
		{err: context.DeadlineExceeded, want: true},
		{err: context.Canceled, want: false},
		{err: assert.AnError, want: false},
		{err: &customError{"deadlock detected"}, want: true},
		{err: &customError{"timeout occurred"}, want: true},
		{err: &customError{"connection lost"}, want: true},
		{err: &customError{"serialization failure"}, want: true},
		{err: &customError{"lock wait timeout"}, want: true},
	}

	for _, c := range cases {
		got := r.isRetryableError(c.err)
		assert.Equal(t, c.want, got, "err=%v", c.err)
	}
}

type customError struct{ msg string }
func (e *customError) Error() string { return e.msg }

// TransactionWithOption, Savepoint, RollbackToのインテグレーションテスト
func TestTransactionWithOptionSavepointRollback(t *testing.T) {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("インメモリDBの作成に失敗: %v", err)
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
