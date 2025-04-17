// Package repositories はデータベースのテストヘルパーを提供します。
// このパッケージは以下の機能を提供します：
// - テスト用データベースの設定
// - テストデータの構築
// - テストデータのクリーンアップ
// - 環境変数の管理
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

// TestDBConfig はテスト用データベースの設定を保持します。
// この構造体は以下の設定を管理します：
// - ホスト名
// - ユーザー名
// - パスワード
// - データベース名
// - ポート番号
// - スキーマ名
type TestDBConfig struct {
	Host     string
	User     string
	Password string
	Name     string
	Port     string
	Schema   string
}

// DefaultTestDBConfig はデフォルトのテスト用データベース設定を返します。
// この関数は以下の処理を行います：
// - 環境変数の取得
// - デフォルト値の設定
// - 設定オブジェクトの生成
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

// getEnvOrDefault は環境変数を取得し、存在しない場合はデフォルト値を返します。
// この関数は以下の処理を行います：
// - 環境変数の取得
// - デフォルト値の設定
// - 値の返却
func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}

	return defaultValue
}

// SetupTestDB はテスト用のデータベース接続を作成します。
// この関数は以下の処理を行います：
// - データベース接続の初期化
// - スキーマの設定
// - マイグレーションの実行
// - クリーンアップの登録
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

// TestUniversityBuilder はテスト用の大学データを構築するビルダーです。
// この構造体は以下の機能を提供します：
// - 大学データの構築
// - 学部データの追加
// - データの生成
type TestUniversityBuilder struct {
	university *models.University
}

// NewTestUniversityBuilder は新しいTestUniversityBuilderを作成します。
// この関数は以下の処理を行います：
// - ビルダーの初期化
// - デフォルト値の設定
// - ビルダーの返却
func NewTestUniversityBuilder() *TestUniversityBuilder {
	return &TestUniversityBuilder{
		university: &models.University{
			BaseModel: models.BaseModel{
				Version: 1,
			},
		},
	}
}

// WithName は大学名を設定します。
// この関数は以下の処理を行います：
// - 大学名の設定
// - ビルダーの返却
func (b *TestUniversityBuilder) WithName(name string) *TestUniversityBuilder {
	b.university.Name = name

	return b
}

// WithDepartment は学部を追加します。
// この関数は以下の処理を行います：
// - 学部データの作成
// - 学部の追加
// - ビルダーの返却
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

// Build は構築した大学データを返します。
// この関数は以下の処理を行います：
// - 大学データの生成
// - データの返却
func (b *TestUniversityBuilder) Build() *models.University {
	return b.university
}

// CreateTestUniversity はテスト用の大学データを作成します。
// この関数は以下の処理を行います：
// - 大学データの作成
// - エラーハンドリング
// - データの返却
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

// CleanupTestData はテストデータをクリーンアップします。
// この関数は以下の処理を行います：
// - テストデータの削除
// - エラーハンドリング
func CleanupTestData(db *gorm.DB) error {
	return db.Exec("TRUNCATE TABLE universities CASCADE").Error
}
