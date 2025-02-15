package main

import (
	"log"
	"os"
	"university-exam-api/internal/infrastructure/database"
	"university-exam-api/internal/interfaces/handlers"
	custommiddleware "university-exam-api/internal/interfaces/middleware"
	"university-exam-api/internal/repositories"
	"university-exam-api/pkg/logger"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

const (
    departmentPath = "/:universityId/departments/:departmentId"
    subjectPath = "/:universityId/departments/:departmentId/subjects/:subjectId"
)

func main() {
    // ロガーの初期化
    logger.InitLoggers()
    logger.Info("Starting the application...")

    // Load .env file
    if err := godotenv.Load(); err != nil {
        logger.Error("Warning: .env file not found")
    }

    // Initialize Echo instance
    e := echo.New()

    // セキュリティ設定
    securityConfig := custommiddleware.NewSecurityConfig()

    // Middleware
    e.Use(middleware.Logger())
    e.Use(middleware.Recover())
    e.Use(logger.AccessLogMiddleware())
    e.Use(custommiddleware.RequestValidationMiddleware())

    // セキュリティミドルウェアの適用
    securityMiddlewares := custommiddleware.SecurityMiddleware(securityConfig)
    for _, m := range securityMiddlewares {
        e.Use(m)
    }

    // Database connection
    db := database.NewDB()
    logger.Info("Database connection established")

    // Auto migrate database
    if err := database.AutoMigrate(db); err != nil {
        logger.Error("Failed to migrate database: %v", err)
        log.Fatal(err)
    }
    logger.Info("Database migration completed")

    // Initialize repositories
    universityRepo := repositories.NewUniversityRepository(db)

    // Initialize handlers
    universityHandler := handlers.NewUniversityHandler(universityRepo)

    // Routes
    api := e.Group("/api")
    {
        universities := api.Group("/universities")
        universities.GET("", universityHandler.GetUniversities)
        universities.GET("/search", universityHandler.SearchUniversities)
        universities.GET("/:id", universityHandler.GetUniversity)

        // Admin routes
        universities.POST("", universityHandler.CreateUniversity)
        universities.PUT("/:id", universityHandler.UpdateUniversity)
        universities.DELETE("/:id", universityHandler.DeleteUniversity)

        // Departments
        universities.GET(departmentPath, universityHandler.GetDepartment)
        universities.POST("/:universityId/departments", universityHandler.CreateDepartment)
        universities.PUT(departmentPath, universityHandler.UpdateDepartment)
        universities.DELETE(departmentPath, universityHandler.DeleteDepartment)

        // Subjects
        universities.GET(subjectPath, universityHandler.GetSubject)
        universities.POST("/:universityId/departments/:departmentId/subjects", universityHandler.CreateSubject)
        universities.PUT(subjectPath, universityHandler.UpdateSubject)
        universities.DELETE(subjectPath, universityHandler.DeleteSubject)
        universities.PUT("/:universityId/departments/:departmentId/subjects/batch", universityHandler.UpdateSubjectsBatch)
    }
    logger.Info("Routes configured")

    // Start server
    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }
    logger.Info("Server starting on port %s", port)
    if err := e.Start(":" + port); err != nil {
        logger.Error("Server failed to start: %v", err)
        log.Fatal(err)
    }
}
