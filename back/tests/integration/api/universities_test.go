package api

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
	"university-exam-api/internal/domain/models"
	"university-exam-api/internal/interfaces/handlers"
	"university-exam-api/internal/repositories"
	"university-exam-api/pkg/logger"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

// createScheduleData はテスト用のスケジュールデータを作成します
func createScheduleData(db *gorm.DB) error {
	schedule := &models.AdmissionSchedule{
		Name:         "前期",
		DisplayOrder: 1,
		TestTypes: []models.TestType{
			{
				Name: "共通",
			},
			{
				Name: "二次",
			},
		},
	}

	return db.Create(schedule).Error
}

// createTestData はテスト用の大学データを作成します
func createTestData(db *gorm.DB) error {
	university := &models.University{
		Name: "テスト大学",
		Departments: []models.Department{
			{
				Name: "テスト学部",
				Majors: []models.Major{
					{
						Name: "テスト学科",
						AdmissionInfos: []models.AdmissionInfo{
							{
								Enrollment:   100,
								AcademicYear: 2024,
								ValidFrom:    time.Now(),
								ValidUntil:   time.Now().AddDate(1, 0, 0),
								Status:       "active",
								CreatedBy:    "system",
								UpdatedBy:    "system",
								AdmissionSchedules: []models.AdmissionSchedule{
									{
										Name:         "前期",
										DisplayOrder: 1,
										TestTypes: []models.TestType{
											{
												Name: "共通",
												Subjects: []models.Subject{
													{
														Name:         "テスト科目1",
														Score:        80,
														Percentage:   20.0,
														DisplayOrder: 1,
													},
												},
											},
										},
									},
								},
							},
						},
					},
				},
			},
		},
	}

	return db.Create(university).Error
}

func setupTestServer() (*echo.Echo, *handlers.UniversityHandler) {
	// ロガーの初期化
	logger.InitLoggers()

	e := echo.New()
	db := repositories.SetupTestDB()

	// データベースをクリーンアップ
	if err := db.Exec("TRUNCATE universities CASCADE").Error; err != nil {
		panic(err)
	}

	// スケジュールデータを作成
	if err := createScheduleData(db); err != nil {
		panic(err)
	}

	// テストデータを作成
	if err := createTestData(db); err != nil {
		panic(err)
	}

	repo := repositories.NewUniversityRepository(db)
	handler := handlers.NewUniversityHandler(repo)

	return e, handler
}

func TestGetUniversities(t *testing.T) {
	e, handler := setupTestServer()

	req := httptest.NewRequest(http.MethodGet, "/api/universities", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	if err := handler.GetUniversities(c); err != nil {
		t.Fatalf("Failed to handle request: %v", err)
	}

	if rec.Code != http.StatusOK {
		t.Errorf("Wrong status code: got %v want %v", rec.Code, http.StatusOK)
	}

	var universities []models.University
	if err := json.Unmarshal(rec.Body.Bytes(), &universities); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	// レスポンスの検証
	if len(universities) == 0 {
		t.Error("Expected universities, got empty array")
	}

	// 最初の大学のデータを検証
	firstUniv := universities[0]
	if firstUniv.Name == "" {
		t.Error("University name should not be empty")
	}
	if len(firstUniv.Departments) == 0 {
		t.Error("University should have departments")
	}
}
