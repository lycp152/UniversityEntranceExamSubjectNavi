// Package main はデータベースのマイグレーションスクリプトを提供します。
// このスクリプトは以下の機能を提供します：
// - データベースのテーブル再作成
// - スキーマの適用
// - 環境変数の検証
// - エラーハンドリング
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
// この関数は以下の処理を行います：
// - 必須環境変数の検証
// - エラーメッセージの生成
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
// この関数は以下の処理を行います：
// - トランザクションのロールバック
// - エラーログの出力
func handleMigrationError(_ context.Context, tx *gorm.DB, err error, message string) {
	if err := tx.Rollback().Error; err != nil {
		log.Printf("警告: ロールバックに失敗しました: %v", err)
	}

	log.Fatalf("エラー: %s: %v", message, err)
}

// setupEnvironment は環境変数を設定します
// この関数は以下の処理を行います：
// - .envファイルの読み込み
// - デフォルト値の設定
// - 環境変数の検証
func setupEnvironment() error {
	if err := godotenv.Load(); err != nil {
		log.Printf("警告: .envファイルが見つかりません")
		// デフォルトの環境変数を設定

		if err := os.Setenv("DB_HOST", "localhost"); err != nil {
			log.Printf("警告: DB_HOSTの設定に失敗しました: %v", err)
		}

		if err := os.Setenv("DB_USER", "user"); err != nil {
			log.Printf("警告: DB_USERの設定に失敗しました: %v", err)
		}

		if err := os.Setenv("DB_PASSWORD", "password"); err != nil {
			log.Printf("警告: DB_PASSWORDの設定に失敗しました: %v", err)
		}

		if err := os.Setenv("DB_NAME", "university_exam_db"); err != nil {
			log.Printf("警告: DB_NAMEの設定に失敗しました: %v", err)
		}

		if err := os.Setenv("DB_PORT", "5432"); err != nil {
			log.Printf("警告: DB_PORTの設定に失敗しました: %v", err)
		}
	}

	if err := validateEnv(); err != nil {
		return err
	}

	return nil
}

// connectToDatabase はデータベースに接続し、接続を返します
// この関数は以下の処理を行います：
// - データベース接続の確立
// - 接続プールの設定
// - クリーンアップ関数の提供
func connectToDatabase() (*gorm.DB, func()) {
	db, err := database.NewDB()
	if err != nil {
		log.Fatalf("エラー: データベース接続に失敗しました: %v", err)
	}

	cleanup := func() {
		sqlDB, err := db.DB()
		if err != nil {
			log.Printf("警告: データベース接続の取得に失敗しました: %v", err)
			return
		}

		if err := sqlDB.Close(); err != nil {
			log.Printf("警告: データベース接続のクローズに失敗しました: %v", err)
		}
	}

	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("エラー: データベース接続の取得に失敗しました: %v", err)
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	return db, cleanup
}

// migrateDatabase はデータベースのテーブルを削除し、新たに作成します
// この関数は以下の処理を行います：
// - トランザクションの開始
// - テーブルの削除
// - スキーマの適用
// - トランザクションのコミット
func migrateDatabase(ctx context.Context, db *gorm.DB) {
	tx := db.WithContext(ctx).Begin()
	if tx.Error != nil {
		log.Fatalf("エラー: トランザクションの開始に失敗しました: %v", tx.Error)
	}

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

	if err := tx.Commit().Error; err != nil {
		log.Fatalf("エラー: トランザクションのコミットに失敗しました: %v", err)
	}

	log.Println("情報: データベースのマイグレーションが正常に完了しました")
}

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// 環境変数の設定
	if err := setupEnvironment(); err != nil {
		log.Printf("環境変数の設定に失敗しました: %v", err)
		cancel()

		return
	}

	db, cleanup := connectToDatabase()
	defer cleanup()

	migrateDatabase(ctx, db)
}
