package api

import (
	"testing"
	"time"
	"university-exam-api/internal/domain/models"
	"university-exam-api/internal/repositories"
)

func TestDataIntegrity(t *testing.T) {
	// テスト用のデータベースをセットアップ
	db := repositories.SetupTestDB()
	if db == nil {
		t.Fatal("データベースの初期化に失敗しました")
	}

	repo := repositories.NewUniversityRepository(db)

	// テストデータの作成
	university := &models.University{
		BaseModel: models.BaseModel{
			Version: 1,
		},
		Name: "テスト大学",
		Departments: []models.Department{
			{
				BaseModel: models.BaseModel{
					Version: 1,
				},
				Name: "テスト学部",
				Majors: []models.Major{
					{
						BaseModel: models.BaseModel{
							Version: 1,
						},
						Name: "テスト学科",
						AdmissionSchedules: []models.AdmissionSchedule{
							{
								BaseModel: models.BaseModel{
									Version: 1,
								},
								Name:         "前期",
								DisplayOrder: 1,
								AdmissionInfos: []models.AdmissionInfo{
									{
										BaseModel: models.BaseModel{
											Version: 1,
										},
										Enrollment:   100,
										AcademicYear: time.Now().Year(),
										ValidFrom:    time.Now(),
										ValidUntil:   time.Now().AddDate(1, 0, 0),
										Status:       "draft",
									},
								},
								TestTypes: []models.TestType{
									{
										BaseModel: models.BaseModel{
											Version: 1,
										},
										Name: "共通",
										Subjects: []models.Subject{
											{
												BaseModel: models.BaseModel{
													Version: 1,
												},
												Name:         "数学",
												Score:        200,
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
	}

	// データの作成
	if err := repo.Create(university); err != nil {
		t.Fatalf("データの作成に失敗: %v", err)
	}

	// データの取得と検証
	retrieved, err := repo.FindByID(university.ID)
	if err != nil {
		t.Fatalf("データの取得に失敗: %v", err)
	}

	// 基本情報の検証
	if retrieved.Name != university.Name {
		t.Errorf("大学名が一致しません: got %v want %v", retrieved.Name, university.Name)
	}

	// 学部情報の検証
	if len(retrieved.Departments) != 1 {
		t.Fatalf("学部数が一致しません: got %v want 1", len(retrieved.Departments))
	}

	dept := retrieved.Departments[0]
	if dept.Name != university.Departments[0].Name {
		t.Errorf("学部名が一致しません: got %v want %v", dept.Name, university.Departments[0].Name)
	}

	// 学科情報の検証
	if len(dept.Majors) != 1 {
		t.Fatalf("学科数が一致しません: got %v want 1", len(dept.Majors))
	}

	major := dept.Majors[0]
	if major.Name != university.Departments[0].Majors[0].Name {
		t.Errorf("学科名が一致しません: got %v want %v", major.Name, university.Departments[0].Majors[0].Name)
	}

	// 入試情報の検証
	if len(major.AdmissionSchedules) != 1 {
		t.Fatalf("入試スケジュール数が一致しません: got %v want 1", len(major.AdmissionSchedules))
	}

	schedule := major.AdmissionSchedules[0]
	info := schedule.AdmissionInfos[0]
	if info.Enrollment != university.Departments[0].Majors[0].AdmissionSchedules[0].AdmissionInfos[0].Enrollment {
		t.Errorf("募集人数が一致しません: got %v want %v", info.Enrollment,
			university.Departments[0].Majors[0].AdmissionSchedules[0].AdmissionInfos[0].Enrollment)
	}

	// 科目情報の検証
	testType := schedule.TestTypes[0]
	subject := testType.Subjects[0]

	expectedSubject := university.Departments[0].Majors[0].AdmissionSchedules[0].TestTypes[0].Subjects[0]
	if subject.Name != expectedSubject.Name {
		t.Errorf("科目名が一致しません: got %v want %v", subject.Name, expectedSubject.Name)
	}
	if subject.Score != expectedSubject.Score {
		t.Errorf("得点が一致しません: got %v want %v", subject.Score, expectedSubject.Score)
	}
	if subject.Percentage != expectedSubject.Percentage {
		t.Errorf("パーセンテージが一致しません: got %v want %v", subject.Percentage, expectedSubject.Percentage)
	}

	// データの削除
	if err := repo.Delete(university.ID); err != nil {
		t.Fatalf("データの削除に失敗: %v", err)
	}

	// 削除の確認
	_, err = repo.FindByID(university.ID)
	if err == nil {
		t.Error("削除されたデータが取得できてしまいました")
	}
}
