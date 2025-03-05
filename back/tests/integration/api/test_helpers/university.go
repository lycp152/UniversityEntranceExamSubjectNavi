package test_helpers

import (
	"university-exam-api/internal/domain/models"
)

// CreateSanitizationUniversityWithSQLInjection はSQLインジェクション攻撃を含むテストデータを生成します
func CreateSanitizationUniversityWithSQLInjection() models.University {
	return models.University{
		Name: "1' OR '1'='1; DROP TABLE users; --",
		Departments: []models.Department{
			{
				Name: "1' UNION SELECT * FROM users --",
				Majors: []models.Major{
					{
						Name: "1' OR '1'='1",
					},
				},
			},
		},
	}
}

// CreateSanitizationUniversityWithXSS はXSS攻撃を含むテストデータを生成します
func CreateSanitizationUniversityWithXSS() models.University {
	return models.University{
		Name: "<script>alert('XSS')</script>テスト大学",
		Departments: []models.Department{
			{
				Name: "<img src=x onerror=alert('XSS')>テスト学部",
				Majors: []models.Major{
					{
						Name: "javascript:alert('XSS')",
					},
				},
			},
		},
	}
}
