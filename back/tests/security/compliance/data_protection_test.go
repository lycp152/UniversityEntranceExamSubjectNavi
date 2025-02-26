package compliance

import (
	"testing"
	"time"
	"university-exam-api/internal/domain/models"
)

func TestDataRetentionPolicy(t *testing.T) {
	tests := []struct {
		name          string
		validFrom    time.Time
		validUntil   time.Time
		academicYear int
		wantErr     bool
	}{
		{
			name:          "有効期限内のデータ",
			validFrom:    time.Now(),
			validUntil:   time.Now().AddDate(1, 0, 0),
			academicYear: time.Now().Year(),
			wantErr:     false,
		},
		{
			name:          "過去のデータ",
			validFrom:    time.Now().AddDate(-2, 0, 0),
			validUntil:   time.Now().AddDate(-1, 0, 0),
			academicYear: time.Now().Year() - 2,
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

			err := validateDataRetention(info)
			if (err != nil) != tt.wantErr {
				t.Errorf("validateDataRetention() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func validateDataRetention(info *models.AdmissionInfo) error {
	// データ保持期間のチェック（2年以上前のデータは保持しない）
	if time.Since(info.ValidUntil) > time.Hour*24*365*2 {
		return models.ErrDataRetentionPeriodExceeded
	}
	return nil
}
