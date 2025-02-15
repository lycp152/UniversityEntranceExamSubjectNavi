package main

import (
	"log"
	"os"
	"time"
	"university-exam-api/internal/domain/models"
	"university-exam-api/internal/infrastructure/database"

	"github.com/joho/godotenv"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: .env file not found")
		// Set default environment variables
		os.Setenv("DB_HOST", "localhost")
		os.Setenv("DB_USER", "user")
		os.Setenv("DB_PASSWORD", "password")
		os.Setenv("DB_NAME", "university_exam_db")
		os.Setenv("DB_PORT", "5432")
	}

	// Connect to database
	db := database.NewDB()

	// Drop existing tables
	if err := db.Migrator().DropTable(
		&models.TestScore{},
		&models.Subject{},
		&models.ExamInfo{},
		&models.Schedule{},
		&models.Major{},
		&models.Department{},
		&models.University{},
	); err != nil {
		log.Fatalf("Failed to drop tables: %v", err)
	}

	// Create new tables with updated structure
	if err := db.AutoMigrate(
		&models.University{},
		&models.Department{},
		&models.Major{},
		&models.Schedule{},
		&models.ExamInfo{},
		&models.Subject{},
		&models.TestScore{},
	); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	// Create default schedules
	schedules := []models.Schedule{
		{
			Name:         "前期",
			DisplayOrder: 1,
			Description:  "前期日程試験",
			StartDate:    time.Date(time.Now().Year(), 2, 25, 0, 0, 0, 0, time.Local),
			EndDate:      time.Date(time.Now().Year(), 3, 7, 23, 59, 59, 0, time.Local),
		},
		{
			Name:         "中期",
			DisplayOrder: 2,
			Description:  "中期日程試験",
			StartDate:    time.Date(time.Now().Year(), 3, 8, 0, 0, 0, 0, time.Local),
			EndDate:      time.Date(time.Now().Year(), 3, 14, 23, 59, 59, 0, time.Local),
		},
		{
			Name:         "後期",
			DisplayOrder: 3,
			Description:  "後期日程試験",
			StartDate:    time.Date(time.Now().Year(), 3, 15, 0, 0, 0, 0, time.Local),
			EndDate:      time.Date(time.Now().Year(), 3, 25, 23, 59, 59, 0, time.Local),
		},
	}

	for _, schedule := range schedules {
		if err := db.Create(&schedule).Error; err != nil {
			log.Fatalf("Failed to create schedule: %v", err)
		}
	}

	log.Println("Successfully migrated database")
}
