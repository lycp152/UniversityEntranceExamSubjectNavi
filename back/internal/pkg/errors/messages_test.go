package errors

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestErrorMessages(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		code     string
		message  string
	}{
		{
			name:    "大学IDのエラーメッセージ",
			code:    ErrInvalidUniversityID,
			message: MsgInvalidUniversityID,
		},
		{
			name:    "学部IDのエラーメッセージ",
			code:    ErrInvalidDepartmentID,
			message: MsgInvalidDepartmentID,
		},
		{
			name:    "科目IDのエラーメッセージ",
			code:    ErrInvalidSubjectID,
			message: MsgInvalidSubjectID,
		},
		{
			name:    "スケジュールIDのエラーメッセージ",
			code:    ErrInvalidScheduleID,
			message: MsgInvalidScheduleID,
		},
		{
			name:    "学科IDのエラーメッセージ",
			code:    ErrInvalidMajorID,
			message: MsgInvalidMajorID,
		},
		{
			name:    "募集情報IDのエラーメッセージ",
			code:    ErrInvalidAdmissionInfoID,
			message: MsgInvalidAdmissionInfoID,
		},
		{
			name:    "リクエストボディのエラーメッセージ",
			code:    ErrInvalidRequestBody,
			message: MsgInvalidRequestBody,
		},
		{
			name:    "データバインドのエラーメッセージ",
			code:    ErrBindDataFailed,
			message: MsgBindDataFailed,
		},
		{
			name:    "リクエストバインドのエラーメッセージ",
			code:    ErrBindRequestFailed,
			message: MsgBindRequestFailed,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.NotEmpty(t, tt.code, "エラーコードが空です")
			assert.NotEmpty(t, tt.message, "エラーメッセージが空です")
		})
	}
}
