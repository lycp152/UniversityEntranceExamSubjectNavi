package test_helpers

import (
	"university-exam-api/internal/domain/models"
)

const (
	// テストデータのデフォルト値
	DefaultMajorName = "テスト学科"
	DefaultScheduleName = "前期"
	DefaultTestTypeName = "一般選抜"
	DefaultSubjectName = "テスト科目"
	DefaultEnrollment = 100
	DefaultScore = 100
)

// CreateTestUniversity はテスト用の大学データを生成します
func CreateTestUniversity(name string, deptName string) models.University {
	return models.University{
		Name: name,
		Departments: []models.Department{
			{
				Name: deptName,
				Majors: []models.Major{
					{
						Name: DefaultMajorName,
						AdmissionSchedules: []models.AdmissionSchedule{
							{
								Name: DefaultScheduleName,
								AdmissionInfos: []models.AdmissionInfo{
									{
										Enrollment: DefaultEnrollment,
									},
								},
								TestTypes: []models.TestType{
									{
										Name: DefaultTestTypeName,
										Subjects: []models.Subject{
											{
												Name:  DefaultSubjectName,
												Score: DefaultScore,
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
}

// CreateMaliciousUniversity は悪意のある入力を含む大学データを生成します
func CreateMaliciousUniversity(maliciousInput string) models.University {
	return CreateTestUniversity(maliciousInput, "テスト学部")
}

// CreateXSSUniversity はXSS攻撃用のテストデータを生成します
func CreateXSSUniversity() models.University {
	return models.University{
		Name: `<script>alert("XSS")</script>テスト大学`,
		Departments: []models.Department{
			{
				Name: `<div onclick="alert('XSS')">テスト学部</div>`,
			},
		},
	}
}

// CreateCSRFUniversity はCSRFテスト用の大学データを生成します
func CreateCSRFUniversity() models.University {
	return CreateTestUniversity("CSRFテスト大学", "CSRFテスト学部")
}

// CreateXSSUniversityWithEvent はJavaScriptイベントを含むXSSテスト用の大学データを生成します
func CreateXSSUniversityWithEvent() models.University {
	return models.University{
		Name: "テスト大学",
		Departments: []models.Department{
			{
				Name: `<div onclick="alert('XSS')">テスト学部</div>`,
			},
		},
	}
}

// CreateXSSUniversityWithURLEncoding はURLエンコードされたスクリプトを含むXSSテスト用の大学データを生成します
func CreateXSSUniversityWithURLEncoding() models.University {
	return models.University{
		Name: "テスト大学",
		Departments: []models.Department{
			{
				Name: `%3Cscript%3Ealert('XSS')%3C/script%3Eテスト学部`,
			},
		},
	}
}

// CreateSanitizationUniversityWithHTML はHTMLタグを含むサニタイズテスト用の大学データを生成します
func CreateSanitizationUniversityWithHTML() models.University {
	return models.University{
		Name: "<p>テスト大学</p>",
		Departments: []models.Department{
			{
				Name: "<div>テスト学部</div>",
			},
		},
	}
}

// CreateSanitizationUniversityWithControlChars は制御文字を含むサニタイズテスト用の大学データを生成します
func CreateSanitizationUniversityWithControlChars() models.University {
	return models.University{
		Name: "テスト\u0000大学\u0008",
		Departments: []models.Department{
			{
				Name: "テスト\u0000学部\u0008",
			},
		},
	}
}

// CreateSanitizationUniversityWithFullWidthSpace は全角スペースを含むサニタイズテスト用の大学データを生成します
func CreateSanitizationUniversityWithFullWidthSpace() models.University {
	return models.University{
		Name: "テスト　大学",
		Departments: []models.Department{
			{
				Name: "テスト　学部",
			},
		},
	}
}
