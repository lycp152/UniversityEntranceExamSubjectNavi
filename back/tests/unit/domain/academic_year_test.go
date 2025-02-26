package domain

import (
	"testing"
	"time"
	"university-exam-api/internal/domain/models"
)

func TestAcademicYear(t *testing.T) {
	tests := []struct {
		name          string
		validFrom    time.Time
		validUntil   time.Time
		academicYear int
		wantErr     bool
	}{
		{
			name:          "正常な学年度",
			validFrom:    time.Date(2024, 4, 1, 0, 0, 0, 0, time.UTC),
			validUntil:   time.Date(2025, 3, 31, 23, 59, 59, 0, time.UTC),
			academicYear: 2024,
			wantErr:     false,
		},
		{
			name:          "学年度の範囲外（過去）",
			validFrom:    time.Date(1999, 4, 1, 0, 0, 0, 0, time.UTC),
			validUntil:   time.Date(2000, 3, 31, 23, 59, 59, 0, time.UTC),
			academicYear: 1999,
			wantErr:     true,
		},
		{
			name:          "学年度の範囲外（未来）",
			validFrom:    time.Date(2101, 4, 1, 0, 0, 0, 0, time.UTC),
			validUntil:   time.Date(2102, 3, 31, 23, 59, 59, 0, time.UTC),
			academicYear: 2101,
			wantErr:     true,
		},
		{
			name:          "期間が1年未満",
			validFrom:    time.Date(2024, 4, 1, 0, 0, 0, 0, time.UTC),
			validUntil:   time.Date(2024, 12, 31, 23, 59, 59, 0, time.UTC),
			academicYear: 2024,
			wantErr:     true,
		},
		{
			name:          "期間が1年超過",
			validFrom:    time.Date(2024, 4, 1, 0, 0, 0, 0, time.UTC),
			validUntil:   time.Date(2026, 3, 31, 23, 59, 59, 0, time.UTC),
			academicYear: 2024,
			wantErr:     true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			info := &models.AdmissionInfo{
				AcademicYear: tt.academicYear,
				ValidFrom:    tt.validFrom,
				ValidUntil:   tt.validUntil,
			}

			err := validateAcademicYear(info)
			if (err != nil) != tt.wantErr {
				t.Errorf("validateAcademicYear() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func validateAcademicYear(info *models.AdmissionInfo) error {
	// 学年度の範囲チェック（2000年から2100年まで）
	if info.AcademicYear < 2000 || info.AcademicYear > 2100 {
		return models.ErrInvalidAcademicYear
	}

	// 有効期間のチェック
	duration := info.ValidUntil.Sub(info.ValidFrom)
	if duration < time.Hour*24*364 || duration > time.Hour*24*366 {
		return models.ErrInvalidValidPeriod
	}

	return nil
}
