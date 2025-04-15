package validation

import (
	"context"
	"testing"
	applogger "university-exam-api/internal/logger"
)

const (
	errInvalidID = "IDの形式が不正です"
)

func TestMain(m *testing.M) {
	applogger.InitTestLogger()
	m.Run()
}

func TestParseID(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	cases := []struct {
		name      string
		idStr     string
		errFormat string
		errMsg    string
		want      uint
		wantErr   bool
	}{
		{
			name:      "正常なID",
			idStr:     "123",
			errFormat: "invalid_id",
			errMsg:    errInvalidID,
			want:      123,
			wantErr:   false,
		},
		{
			name:      "不正なID（文字列）",
			idStr:     "abc",
			errFormat: "invalid_id",
			errMsg:    errInvalidID,
			want:      0,
			wantErr:   true,
		},
		{
			name:      "不正なID（負の数）",
			idStr:     "-123",
			errFormat: "invalid_id",
			errMsg:    errInvalidID,
			want:      0,
			wantErr:   true,
		},
	}

	for _, tt := range cases {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got, err := ParseID(ctx, tt.idStr, tt.errFormat, tt.errMsg)

			if (err != nil) != tt.wantErr {
				t.Errorf("ParseID() error = %v, wantErr %v", err, tt.wantErr)
				return
			}

			if got != tt.want {
				t.Errorf("ParseID() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestValidateUniversityID(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	cases := []struct {
		name    string
		idStr   string
		want    uint
		wantErr bool
	}{
		{
			name:    "正常な大学ID",
			idStr:   "123",
			want:    123,
			wantErr: false,
		},
		{
			name:    "不正な大学ID",
			idStr:   "abc",
			want:    0,
			wantErr: true,
		},
	}

	for _, tt := range cases {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got, err := ValidateUniversityID(ctx, tt.idStr)

			if (err != nil) != tt.wantErr {
				t.Errorf("ValidateUniversityID() error = %v, wantErr %v", err, tt.wantErr)
				return
			}

			if got != tt.want {
				t.Errorf("ValidateUniversityID() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestValidateDepartmentID(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	cases := []struct {
		name    string
		idStr   string
		want    uint
		wantErr bool
	}{
		{
			name:    "正常な学部ID",
			idStr:   "123",
			want:    123,
			wantErr: false,
		},
		{
			name:    "不正な学部ID",
			idStr:   "abc",
			want:    0,
			wantErr: true,
		},
	}

	for _, tt := range cases {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got, err := ValidateDepartmentID(ctx, tt.idStr)

			if (err != nil) != tt.wantErr {
				t.Errorf("ValidateDepartmentID() error = %v, wantErr %v", err, tt.wantErr)
				return
			}

			if got != tt.want {
				t.Errorf("ValidateDepartmentID() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestValidateSubjectID(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	cases := []struct {
		name    string
		idStr   string
		want    uint
		wantErr bool
	}{
		{
			name:    "正常な科目ID",
			idStr:   "123",
			want:    123,
			wantErr: false,
		},
		{
			name:    "不正な科目ID",
			idStr:   "abc",
			want:    0,
			wantErr: true,
		},
	}

	for _, tt := range cases {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got, err := ValidateSubjectID(ctx, tt.idStr)

			if (err != nil) != tt.wantErr {
				t.Errorf("ValidateSubjectID() error = %v, wantErr %v", err, tt.wantErr)
				return
			}

			if got != tt.want {
				t.Errorf("ValidateSubjectID() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestValidateScheduleID(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	cases := []struct {
		name    string
		idStr   string
		want    uint
		wantErr bool
	}{
		{
			name:    "正常なスケジュールID",
			idStr:   "123",
			want:    123,
			wantErr: false,
		},
		{
			name:    "不正なスケジュールID",
			idStr:   "abc",
			want:    0,
			wantErr: true,
		},
	}

	for _, tt := range cases {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got, err := ValidateScheduleID(ctx, tt.idStr)

			if (err != nil) != tt.wantErr {
				t.Errorf("ValidateScheduleID() error = %v, wantErr %v", err, tt.wantErr)
				return
			}

			if got != tt.want {
				t.Errorf("ValidateScheduleID() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestValidateMajorID(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	cases := []struct {
		name    string
		idStr   string
		want    uint
		wantErr bool
	}{
		{
			name:    "正常な学科ID",
			idStr:   "123",
			want:    123,
			wantErr: false,
		},
		{
			name:    "不正な学科ID",
			idStr:   "abc",
			want:    0,
			wantErr: true,
		},
	}

	for _, tt := range cases {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got, err := ValidateMajorID(ctx, tt.idStr)

			if (err != nil) != tt.wantErr {
				t.Errorf("ValidateMajorID() error = %v, wantErr %v", err, tt.wantErr)
				return
			}

			if got != tt.want {
				t.Errorf("ValidateMajorID() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestValidateAdmissionInfoID(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	cases := []struct {
		name    string
		idStr   string
		want    uint
		wantErr bool
	}{
		{
			name:    "正常な募集情報ID",
			idStr:   "123",
			want:    123,
			wantErr: false,
		},
		{
			name:    "不正な募集情報ID",
			idStr:   "abc",
			want:    0,
			wantErr: true,
		},
	}

	for _, tt := range cases {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got, err := ValidateAdmissionInfoID(ctx, tt.idStr)

			if (err != nil) != tt.wantErr {
				t.Errorf("ValidateAdmissionInfoID() error = %v, wantErr %v", err, tt.wantErr)
				return
			}

			if got != tt.want {
				t.Errorf("ValidateAdmissionInfoID() = %v, want %v", got, tt.want)
			}
		})
	}
}
