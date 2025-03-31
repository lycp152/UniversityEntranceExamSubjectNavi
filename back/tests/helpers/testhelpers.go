package helpers

import (
	"testing"
	"university-exam-api/internal/domain/models"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// SetupTestEnvironment テスト環境をセットアップします
func SetupTestEnvironment() (*models.TestEnv, error) {
	return &models.TestEnv{}, nil
}

// AssertNoError エラーがないことを確認します
func AssertNoError(t *testing.T, err error) {
	assert.NoError(t, err)
}

// RequireNoError エラーがないことを確認し、エラーがある場合はテストを中断します
func RequireNoError(t *testing.T, err error) {
	require.NoError(t, err)
}

// AssertEqual 値が等しいことを確認します
func AssertEqual(t *testing.T, expected, actual interface{}) {
	assert.Equal(t, expected, actual)
}

// RequireEqual 値が等しいことを確認し、等しくない場合はテストを中断します
func RequireEqual(t *testing.T, expected, actual interface{}) {
	require.Equal(t, expected, actual)
}

// AssertTrue 条件が真であることを確認します
func AssertTrue(t *testing.T, condition bool) {
	assert.True(t, condition)
}

// RequireTrue 条件が真であることを確認し、偽の場合はテストを中断します
func RequireTrue(t *testing.T, condition bool) {
	require.True(t, condition)
}
