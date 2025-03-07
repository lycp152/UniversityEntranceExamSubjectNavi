package models

import (
	"testing"
)

func TestAcademicYear(t *testing.T) {
	tests := []struct {
		name          string
		academicYear int
		wantErr     bool
	}{
		{
			name:          "正常な学年度",
			academicYear: 2024,
			wantErr:     false,
		},
		{
			name:          "学年度の範囲外（過去）",
			academicYear: 1999,
			wantErr:     true,
		},
		{
			name:          "学年度の範囲外（未来）",
			academicYear: 2101,
			wantErr:     true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			info := &AdmissionInfo{
				AcademicYear: tt.academicYear,
			}

			err := validateAcademicYear(info)
			if (err != nil) != tt.wantErr {
				t.Errorf("validateAcademicYear() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func validateAcademicYear(info *AdmissionInfo) error {
	// 学年度の範囲チェック（2000年から2100年まで）
	if info.AcademicYear < 2000 || info.AcademicYear > 2100 {
		return ErrInvalidAcademicYear
	}

	return nil
}
