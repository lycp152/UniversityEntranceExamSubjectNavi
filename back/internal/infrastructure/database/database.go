package database

import (
	"fmt"
	"log"
	"os"
	"university-exam-api/internal/domain/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// NewDB はデータベース接続を作成します
func NewDB() *gorm.DB {
	schema := os.Getenv("DB_SCHEMA")
	if schema == "" {
		schema = "public"
	}

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s search_path=%s sslmode=disable TimeZone=Asia/Tokyo client_encoding=UTF8",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
		schema,
	)

	config := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	}

	db, err := gorm.Open(postgres.Open(dsn), config)
	if err != nil {
		log.Fatalf("データベースへの接続に失敗: %v", err)
	}

	// スキーマの設定
	if err := db.Exec(fmt.Sprintf("SET search_path TO %s", schema)).Error; err != nil {
		log.Printf("スキーマの設定に失敗: %v", err)
	}

	return db
}

// CloseDB はデータベース接続を閉じます
func CloseDB(db *gorm.DB) error {
	sqlDB, err := db.DB()
	if err != nil {
		return fmt.Errorf("SQLデータベースの取得に失敗: %w", err)
	}
	return sqlDB.Close()
}

func AutoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&models.University{},
		&models.Department{},
		&models.Major{},
		&models.AdmissionSchedule{},
		&models.AdmissionInfo{},
		&models.TestType{},
		&models.Subject{},
	)
}
