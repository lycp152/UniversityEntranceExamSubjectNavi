package errors

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
	errorDetails := "詳細情報"

	t.Run("正常系: DBErrorの生成と取得", func(t *testing.T) {
		t.Parallel()

		dbErr := NewDatabaseError(originalErr, CodeNotFound, "SELECT", "users", errorDetails)
		assert.NotNil(t, dbErr)
		assert.Equal(t, originalErr, dbErr.Err)
		assert.Equal(t, CodeNotFound, dbErr.Code)
		assert.Equal(t, "SELECT", dbErr.Operation)
		assert.Equal(t, "users", dbErr.Table)
		assert.Equal(t, errorDetails, dbErr.Details.Message)
		assert.Empty(t, dbErr.Details.Context)
		assert.True(t, dbErr.Timestamp.After(now))
	})

	t.Run("正常系: エラーメッセージのフォーマット", func(t *testing.T) {
		t.Parallel()

		dbErr := NewDatabaseError(originalErr, CodeNotFound, "SELECT", "users", errorDetails)
		expected := "users テーブルでの SELECT 操作中にエラーが発生しました: original error " +
			"(エラーコード: NOT_FOUND, 時刻: " + dbErr.Timestamp.Format(time.RFC3339) + ", 詳細: 詳細情報)"
		assert.Equal(t, expected, dbErr.Error())
	})

	t.Run("正常系: Unwrapの動作確認", func(t *testing.T) {
		t.Parallel()

		dbErr := NewDatabaseError(originalErr, CodeNotFound, "SELECT", "users", errorDetails)
		assert.Equal(t, originalErr, dbErr.Unwrap())
	})

	t.Run("正常系: コンテキスト情報の追加", func(t *testing.T) {
		t.Parallel()

		dbErr := NewDatabaseError(originalErr, CodeNotFound, "SELECT", "users", errorDetails)
		dbErr = dbErr.WithContext("key1", "value1")
		dbErr = dbErr.WithContext("key2", "value2")

		assert.Equal(t, "value1", dbErr.Details.Context["key1"])
		assert.Equal(t, "value2", dbErr.Details.Context["key2"])
	})

	t.Run("正常系: エラー詳細の取得", func(t *testing.T) {
		t.Parallel()

		dbErr := NewDatabaseError(originalErr, CodeNotFound, "SELECT", "users", errorDetails)
		details, ok := GetErrorDetails(dbErr)
		assert.True(t, ok)
		assert.Equal(t, errorDetails, details.Message)
		assert.NotEmpty(t, details.StackTrace)
		assert.Empty(t, details.Context)
	})
}

func TestErrorCheckers(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		err      error
		checker  func(error) bool
		expected bool
	}{
		{
			name:     "IsNotFound - DBErrorの場合",
			err:      NewDatabaseError(ErrRecordNotFound, CodeNotFound, "SELECT", "users"),
			checker:  IsNotFound,
			expected: true,
		},
		{
			name:     "IsNotFound - 直接ErrRecordNotFoundの場合",
			err:      ErrRecordNotFound,
			checker:  IsNotFound,
			expected: true,
		},
		{
			name:     "IsNotFound - 他のエラーの場合",
			err:      errors.New(testOtherError),
			checker:  IsNotFound,
			expected: false,
		},
		{
			name:     "IsDuplicateKey - DBErrorの場合",
			err:      NewDatabaseError(ErrDuplicateKey, CodeDuplicateKey, "INSERT", "users"),
			checker:  IsDuplicateKey,
			expected: true,
		},
		{
			name:     "IsDuplicateKey - 直接ErrDuplicateKeyの場合",
			err:      ErrDuplicateKey,
			checker:  IsDuplicateKey,
			expected: true,
		},
		{
			name:     "IsDuplicateKey - 他のエラーの場合",
			err:      errors.New(testOtherError),
			checker:  IsDuplicateKey,
			expected: false,
		},
		{
			name:     "IsValidationError - DBErrorの場合",
			err:      NewDatabaseError(ErrValidationFailed, CodeValidationError, "UPDATE", "users"),
			checker:  IsValidationError,
			expected: true,
		},
		{
			name:     "IsValidationError - 直接ErrValidationFailedの場合",
			err:      ErrValidationFailed,
			checker:  IsValidationError,
			expected: true,
		},
		{
			name:     "IsValidationError - 他のエラーの場合",
			err:      errors.New(testOtherError),
			checker:  IsValidationError,
			expected: false,
		},
		{
			name:     "IsTimeout - DBErrorの場合",
			err:      NewDatabaseError(ErrTimeout, CodeTimeout, "SELECT", "users"),
			checker:  IsTimeout,
			expected: true,
		},
		{
			name:     "IsTimeout - 直接ErrTimeoutの場合",
			err:      ErrTimeout,
			checker:  IsTimeout,
			expected: true,
		},
		{
			name:     "IsTimeout - 他のエラーの場合",
			err:      errors.New(testOtherError),
			checker:  IsTimeout,
			expected: false,
		},
		{
			name:     "IsDeadlock - DBErrorの場合",
			err:      NewDatabaseError(ErrDeadlock, CodeDeadlock, "UPDATE", "users"),
			checker:  IsDeadlock,
			expected: true,
		},
		{
			name:     "IsDeadlock - 直接ErrDeadlockの場合",
			err:      ErrDeadlock,
			checker:  IsDeadlock,
			expected: true,
		},
		{
			name:     "IsDeadlock - 他のエラーの場合",
			err:      errors.New(testOtherError),
			checker:  IsDeadlock,
			expected: false,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.expected, tt.checker(tt.err))
		})
	}
}
