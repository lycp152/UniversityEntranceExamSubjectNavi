package main

import (
	"log"
	"os"
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
		&models.Subject{},
		&models.TestType{},
		&models.AdmissionSchedule{},
		&models.AdmissionInfo{},
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
		&models.AdmissionInfo{},
		&models.AdmissionSchedule{},
		&models.TestType{},
		&models.Subject{},
	); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	// Create default schedules
	schedules := []models.AdmissionSchedule{
		{
			Name:         "前期",
			DisplayOrder: 1,
		},
		{
			Name:         "中期",
			DisplayOrder: 2,
		},
		{
			Name:         "後期",
			DisplayOrder: 3,
		},
	}

	for _, schedule := range schedules {
		if err := db.Create(&schedule).Error; err != nil {
			log.Fatalf("Failed to create schedule: %v", err)
		}
	}

	log.Println("Successfully migrated database")
}
