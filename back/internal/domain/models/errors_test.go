package models

import (
	"errors"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

const testOtherError = "other error"

func TestDBError(t *testing.T) {
	t.Parallel()

	now := time.Now()
	originalErr := errors.New("original error")
	details := "詳細情報"

	t.Run("正常系: DBErrorの生成と取得", func(t *testing.T) {
		t.Parallel()

		dbErr := NewDBError(originalErr, CodeNotFound, "SELECT", "users", details)
		assert.NotNil(t, dbErr)
		assert.Equal(t, originalErr, dbErr.Err)
		assert.Equal(t, CodeNotFound, dbErr.Code)
		assert.Equal(t, "SELECT", dbErr.Operation)
		assert.Equal(t, "users", dbErr.Table)
		assert.Equal(t, details, dbErr.Details)
		assert.True(t, dbErr.Timestamp.After(now))
	})

	t.Run("正常系: エラーメッセージのフォーマット", func(t *testing.T) {
		t.Parallel()

		dbErr := NewDBError(originalErr, CodeNotFound, "SELECT", "users", details)
		expected := "users テーブルでの SELECT 操作中にエラーが発生しました: original error " +
			"(エラーコード: NOT_FOUND, 時刻: " + dbErr.Timestamp.Format(time.RFC3339) + ", 詳細: 詳細情報)"
		assert.Equal(t, expected, dbErr.Error())
	})

	t.Run("正常系: Unwrapの動作確認", func(t *testing.T) {
		t.Parallel()

		dbErr := NewDBError(originalErr, CodeNotFound, "SELECT", "users", details)
		assert.Equal(t, originalErr, dbErr.Unwrap())
	})
}

func TestErrorCheckers(t *testing.T) {
	t.Parallel()

	t.Run("正常系: IsNotFound", func(t *testing.T) {
		t.Parallel()

		// DBErrorの場合
		dbErr := NewDBError(ErrRecordNotFound, CodeNotFound, "SELECT", "users")
		assert.True(t, IsNotFound(dbErr))

		// 直接ErrRecordNotFoundの場合
		assert.True(t, IsNotFound(ErrRecordNotFound))

		// 他のエラーの場合
		assert.False(t, IsNotFound(errors.New(testOtherError)))
	})

	t.Run("正常系: IsDuplicateKey", func(t *testing.T) {
		t.Parallel()

		// DBErrorの場合
		dbErr := NewDBError(ErrDuplicateKey, CodeDuplicateKey, "INSERT", "users")
		assert.True(t, IsDuplicateKey(dbErr))

		// 直接ErrDuplicateKeyの場合
		assert.True(t, IsDuplicateKey(ErrDuplicateKey))

		// 他のエラーの場合
		assert.False(t, IsDuplicateKey(errors.New(testOtherError)))
	})

	t.Run("正常系: IsValidationError", func(t *testing.T) {
		t.Parallel()

		// DBErrorの場合
		dbErr := NewDBError(ErrValidationFailed, CodeValidationError, "UPDATE", "users")
		assert.True(t, IsValidationError(dbErr))

		// 直接ErrValidationFailedの場合
		assert.True(t, IsValidationError(ErrValidationFailed))

		// 他のエラーの場合
		assert.False(t, IsValidationError(errors.New(testOtherError)))
	})

	t.Run("正常系: IsTimeout", func(t *testing.T) {
		t.Parallel()

		// DBErrorの場合
		dbErr := NewDBError(ErrTimeout, CodeTimeout, "SELECT", "users")
		assert.True(t, IsTimeout(dbErr))

		// 直接ErrTimeoutの場合
		assert.True(t, IsTimeout(ErrTimeout))

		// 他のエラーの場合
		assert.False(t, IsTimeout(errors.New(testOtherError)))
	})

	t.Run("正常系: IsDeadlock", func(t *testing.T) {
		t.Parallel()

		// DBErrorの場合
		dbErr := NewDBError(ErrDeadlock, CodeDeadlock, "UPDATE", "users")
		assert.True(t, IsDeadlock(dbErr))

		// 直接ErrDeadlockの場合
		assert.True(t, IsDeadlock(ErrDeadlock))

		// 他のエラーの場合
		assert.False(t, IsDeadlock(errors.New(testOtherError)))
	})
}
