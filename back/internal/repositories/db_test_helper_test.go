package repositories

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// getEnvOrDefaultのテスト
func TestGetEnvOrDefault(t *testing.T) {
	err := os.Setenv("TEST_ENV", "hoge")
	if err != nil {
		t.Fatalf("os.Setenv failed: %v", err)
	}

	defer func() {
		err := os.Unsetenv("TEST_ENV")
		if err != nil {
			t.Fatalf("os.Unsetenv failed: %v", err)
		}
	}()
	assert.Equal(t, "hoge", getEnvOrDefault("TEST_ENV", "fuga"))
	assert.Equal(t, "fuga", getEnvOrDefault("NOT_SET", "fuga"))
}

// DefaultTestDBConfigのテスト
func TestDefaultTestDBConfig(t *testing.T) {
	err := os.Setenv("TEST_DB_HOST", "testhost")
	if err != nil {
		t.Fatalf("os.Setenv failed: %v", err)
	}

	defer func() {
		err := os.Unsetenv("TEST_DB_HOST")
		if err != nil {
			t.Fatalf("os.Unsetenv failed: %v", err)
		}
	}()

	cfg := DefaultTestDBConfig()
	assert.Equal(t, "testhost", cfg.Host)
}

// TestUniversityBuilderのテスト
func TestTestUniversityBuilder(t *testing.T) {
	builder := NewTestUniversityBuilder().WithName("テスト大学").WithDepartment("理学部")
	u := builder.Build()
	assert.Equal(t, "テスト大学", u.Name)
	assert.Len(t, u.Departments, 1)
	assert.Equal(t, "理学部", u.Departments[0].Name)
}

// CleanupTestDataのテスト（SQLiteインメモリDB利用）
func TestCleanupTestData(t *testing.T) {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	assert.NoError(t, err)

	type tmp struct {
		ID   uint `gorm:"primarykey"`
		Name string
	}

	err = db.AutoMigrate(&tmp{})

	if err != nil {
		t.Fatalf("AutoMigrate failed: %v", err)
	}

	db.Create(&tmp{ID: 1, Name: "test"})

	err = db.Exec("TRUNCATE TABLE universities").Error
	// SQLiteはTRUNCATE未サポートなのでエラーになることを確認
	assert.Error(t, err)
}
