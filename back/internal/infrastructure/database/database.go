package database

import (
	"fmt"
	"log"
	"os"
	"university-exam-api/internal/domain/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func NewDB() *gorm.DB {
	// Get database connection info from environment variables
	host := os.Getenv("DB_HOST")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")
	port := os.Getenv("DB_PORT")

	// Create connection string
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Tokyo",
		host, user, password, dbname, port)

	// Open connection to database
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	return db
}

func AutoMigrate(db *gorm.DB) error {
	// Auto migrate all models
	return db.AutoMigrate(
		&models.University{},
		&models.Department{},
		&models.Major{},
		&models.ExamInfo{},
		&models.Subject{},
		&models.TestScore{},
	)
}
