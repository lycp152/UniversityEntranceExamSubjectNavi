// Package main はデータベースのマイグレーションスクリプトを提供します。
// このスクリプトは、データベースのテーブルを再作成し、必要なスキーマを適用します。
package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"
	"university-exam-api/internal/domain/models"
	"university-exam-api/internal/infrastructure/database"

	"github.com/joho/godotenv"
	"gorm.io/gorm"
)

// validateEnv は必要な環境変数が設定されているか確認します
func validateEnv() error {
	requiredEnvVars := []string{
		"DB_HOST",
		"DB_USER",
		"DB_PASSWORD",
		"DB_NAME",
		"DB_PORT",
	}

	for _, envVar := range requiredEnvVars {
		if os.Getenv(envVar) == "" {
			return fmt.Errorf("環境変数 %s が設定されていません", envVar)
		}
	}
	return nil
}

// handleMigrationError はマイグレーションエラーを処理します
func handleMigrationError(ctx context.Context, tx *gorm.DB, err error, message string) {
	if err := tx.Rollback().Error; err != nil {
		log.Printf("警告: ロールバックに失敗しました: %v", err)
	}
	log.Fatalf("エラー: %s: %v", message, err)
}

// main はマイグレーションスクリプトのエントリーポイントです。
// 環境変数の読み込み、データベース接続、テーブルの再作成を行います。
func main() {
	// コンテキストの作成（タイムアウト設定）
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// .envファイルの読み込み
	if err := godotenv.Load(); err != nil {
		log.Printf("警告: .envファイルが見つかりません")
		// デフォルトの環境変数を設定
		os.Setenv("DB_HOST", "localhost")
		os.Setenv("DB_USER", "user")
		os.Setenv("DB_PASSWORD", "password")
		os.Setenv("DB_NAME", "university_exam_db")
		os.Setenv("DB_PORT", "5432")
	}

	// 環境変数のバリデーション
	if err := validateEnv(); err != nil {
		log.Fatalf("エラー: 環境変数の検証に失敗しました: %v", err)
	}

	// データベースに接続
	db, err := database.NewDB()
	if err != nil {
		log.Fatalf("エラー: データベース接続に失敗しました: %v", err)
	}
	defer func() {
		sqlDB, err := db.DB()
		if err != nil {
			log.Printf("警告: データベース接続の取得に失敗しました: %v", err)
			return
		}
		if err := sqlDB.Close(); err != nil {
			log.Printf("警告: データベース接続のクローズに失敗しました: %v", err)
		}
	}()

	// データベース接続プールの設定
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("エラー: データベース接続の取得に失敗しました: %v", err)
	}
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	// トランザクションの開始（タイムアウト設定付き）
	tx := db.WithContext(ctx).Begin()
	if tx.Error != nil {
		log.Fatalf("エラー: トランザクションの開始に失敗しました: %v", tx.Error)
	}

	// 依存関係の逆順で既存のテーブルを削除
	if err := tx.Migrator().DropTable(
		&models.Subject{},
		&models.TestType{},
		&models.AdmissionInfo{},
		&models.AdmissionSchedule{},
		&models.Major{},
		&models.Department{},
		&models.University{},
	); err != nil {
		handleMigrationError(ctx, tx, err, "テーブルの削除に失敗しました")
	}

	// 依存関係の順で新しいテーブルを作成
	if err := tx.AutoMigrate(
		&models.University{},
		&models.Department{},
		&models.Major{},
		&models.AdmissionSchedule{},
		&models.AdmissionInfo{},
		&models.TestType{},
		&models.Subject{},
	); err != nil {
		handleMigrationError(ctx, tx, err, "データベースのマイグレーションに失敗しました")
	}

	// トランザクションのコミット
	if err := tx.Commit().Error; err != nil {
		log.Fatalf("エラー: トランザクションのコミットに失敗しました: %v", err)
	}

	log.Println("情報: データベースのマイグレーションが正常に完了しました")
}
