package validation

import (
	"context"
	"strconv"
	appErrors "university-exam-api/internal/errors"
	applogger "university-exam-api/internal/logger"
	"university-exam-api/internal/pkg/errors"
)

// ParseID は文字列IDをuintに変換
func ParseID(ctx context.Context, idStr string, errFormat string, errMsg string) (uint, error) {
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		applogger.Error(ctx, errFormat, err)
		return 0, appErrors.NewInvalidInputError("id", errMsg, nil)
	}
	return uint(id), nil
}

// ValidateUniversityID は大学IDのバリデーション
func ValidateUniversityID(ctx context.Context, idStr string) (uint, error) {
	return ParseID(ctx, idStr, errors.MsgInvalidUniversityID, errors.MsgInvalidUniversityID)
}

// ValidateDepartmentID は学部IDのバリデーション
func ValidateDepartmentID(ctx context.Context, idStr string) (uint, error) {
	return ParseID(ctx, idStr, errors.MsgInvalidDepartmentID, errors.MsgInvalidDepartmentID)
}

// ValidateSubjectID は科目IDのバリデーション
func ValidateSubjectID(ctx context.Context, idStr string) (uint, error) {
	return ParseID(ctx, idStr, errors.MsgInvalidSubjectID, errors.MsgInvalidSubjectID)
}

// ValidateScheduleID はスケジュールIDのバリデーション
func ValidateScheduleID(ctx context.Context, idStr string) (uint, error) {
	return ParseID(ctx, idStr, errors.ErrInvalidScheduleID, errors.ErrInvalidScheduleID)
}

// ValidateMajorID は学科IDのバリデーション
func ValidateMajorID(ctx context.Context, idStr string) (uint, error) {
	return ParseID(ctx, idStr, errors.ErrInvalidMajorID, errors.ErrInvalidMajorID)
}

// ValidateAdmissionInfoID は募集情報IDのバリデーション
func ValidateAdmissionInfoID(ctx context.Context, idStr string) (uint, error) {
	return ParseID(ctx, idStr, errors.ErrInvalidAdmissionInfoID, errors.ErrInvalidAdmissionInfoID)
}
