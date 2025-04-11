package repositories

import (
	"context"
	"fmt"
	"os"
	"testing"
	"university-exam-api/internal/domain/models"
	"university-exam-api/internal/infrastructure/database"

	"gorm.io/gorm"
)

// TestDBConfig はテスト用データベースの設定を保持します
type TestDBConfig struct {
	Host     string
	User     string
	Password string
	Name     string
	Port     string
	Schema   string
}

// DefaultTestDBConfig はデフォルトのテスト用データベース設定を返します
func DefaultTestDBConfig() *TestDBConfig {
	return &TestDBConfig{
		Host:     getEnvOrDefault("TEST_DB_HOST", "localhost"),
		User:     getEnvOrDefault("TEST_DB_USER", "user"),
		Password: getEnvOrDefault("TEST_DB_PASSWORD", "password"),
		Name:     getEnvOrDefault("TEST_DB_NAME", "university_exam_test_db"),
		Port:     getEnvOrDefault("TEST_DB_PORT", "5432"),
		Schema:   getEnvOrDefault("TEST_DB_SCHEMA", "test_schema"),
	}
}

// getEnvOrDefault は環境変数を取得し、存在しない場合はデフォルト値を返します
func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}

	return defaultValue
}

// SetupTestDB はテスト用のデータベース接続を作成します
func SetupTestDB(t *testing.T, config *TestDBConfig) *gorm.DB {
	t.Helper()

	if config == nil {
		config = DefaultTestDBConfig()
	}

	// 環境変数を設定
	t.Setenv("DB_HOST", config.Host)
	t.Setenv("DB_USER", config.User)
	t.Setenv("DB_PASSWORD", config.Password)
	t.Setenv("DB_NAME", config.Name)
	t.Setenv("DB_PORT", config.Port)
	t.Setenv("DB_SCHEMA", config.Schema)

	db, err := database.NewDB()
	if err != nil {
		t.Fatalf("データベース接続の初期化に失敗しました: %v", err)
	}

	// スキーマの設定
	if err := db.Exec("DROP SCHEMA IF EXISTS ? CASCADE", config.Schema).Error; err != nil {
		t.Fatalf("スキーマの削除に失敗: %v", err)
	}

	if err := db.Exec("CREATE SCHEMA ?", config.Schema).Error; err != nil {
		t.Fatalf("スキーマの作成に失敗: %v", err)
	}

	// マイグレーションを実行
	if _, err := database.RunMigrations(context.Background(), db, nil); err != nil {
		t.Fatalf("マイグレーションに失敗: %v", err)
	}

	// 検索パスを設定
	if err := db.Exec("SET search_path TO ?", config.Schema).Error; err != nil {
		t.Fatalf("検索パスの設定に失敗: %v", err)
	}

	// データベースのエンコーディングを設定
	if err := db.Exec("SET client_encoding TO 'UTF8'").Error; err != nil {
		t.Fatalf("クライアントエンコーディングの設定に失敗: %v", err)
	}

	// テスト終了時のクリーンアップを登録
	t.Cleanup(func() {
		if err := CleanupTestData(db); err != nil {
			t.Logf("テストデータのクリーンアップに失敗: %v", err)
		}
	})

	return db
}

// TestUniversityBuilder はテスト用の大学データを構築するビルダーです
type TestUniversityBuilder struct {
	university *models.University
}

// NewTestUniversityBuilder は新しいTestUniversityBuilderを作成します
func NewTestUniversityBuilder() *TestUniversityBuilder {
	return &TestUniversityBuilder{
		university: &models.University{
			BaseModel: models.BaseModel{
				Version: 1,
			},
		},
	}
}

// WithName は大学名を設定します
func (b *TestUniversityBuilder) WithName(name string) *TestUniversityBuilder {
	b.university.Name = name

	return b
}

// WithDepartment は学部を追加します
func (b *TestUniversityBuilder) WithDepartment(name string) *TestUniversityBuilder {
	department := models.Department{
		BaseModel: models.BaseModel{
			Version: 1,
		},
		Name: name,
	}
	b.university.Departments = append(b.university.Departments, department)
	return b
}

// Build は構築した大学データを返します
func (b *TestUniversityBuilder) Build() *models.University {
	return b.university
}

// CreateTestUniversity はテスト用の大学データを作成します
func CreateTestUniversity(db *gorm.DB, builder *TestUniversityBuilder) (*models.University, error) {
	if builder == nil {
		builder = NewTestUniversityBuilder()
	}

	university := builder.Build()
	if err := db.Create(university).Error; err != nil {
		return nil, fmt.Errorf("テストデータの作成に失敗: %w", err)
	}

	return university, nil
}

// CleanupTestData はテストデータをクリーンアップします
func CleanupTestData(db *gorm.DB) error {
	return db.Exec("TRUNCATE TABLE universities CASCADE").Error
}
