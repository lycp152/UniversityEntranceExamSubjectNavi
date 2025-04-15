// Package validation は入力値のバリデーション機能を提供します。
// IDの検証や文字列から数値への変換などの基本的なバリデーション機能を含みます。
package validation

import (
	"context"
	"strconv"
	appErrors "university-exam-api/internal/errors"
	applogger "university-exam-api/internal/logger"
	"university-exam-api/internal/pkg/errors"
)

// ParseID は文字列IDをuintに変換します。
// 変換に失敗した場合はエラーを返します。
func ParseID(ctx context.Context, idStr string, errFormat string, errMsg string) (uint, error) {
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		applogger.Error(ctx, errFormat, map[string]interface{}{
			"error": err,
			"id":    idStr,
		})

		return 0, appErrors.NewInvalidInputError("id", errMsg, map[string]string{
			"id": idStr,
		})
	}

	return uint(id), nil
}

// ValidateUniversityID は大学IDのバリデーションを行います。
func ValidateUniversityID(ctx context.Context, idStr string) (uint, error) {
	return ParseID(ctx, idStr, errors.MsgInvalidUniversityID, "大学IDの形式が不正です")
}

// ValidateDepartmentID は学部IDのバリデーションを行います。
func ValidateDepartmentID(ctx context.Context, idStr string) (uint, error) {
	return ParseID(ctx, idStr, errors.MsgInvalidDepartmentID, "学部IDの形式が不正です")
}

// ValidateSubjectID は科目IDのバリデーションを行います。
func ValidateSubjectID(ctx context.Context, idStr string) (uint, error) {
	return ParseID(ctx, idStr, errors.MsgInvalidSubjectID, "科目IDの形式が不正です")
}

// ValidateScheduleID はスケジュールIDのバリデーションを行います。
func ValidateScheduleID(ctx context.Context, idStr string) (uint, error) {
	return ParseID(ctx, idStr, errors.MsgInvalidScheduleID, "スケジュールIDの形式が不正です")
}

// ValidateMajorID は学科IDのバリデーションを行います。
func ValidateMajorID(ctx context.Context, idStr string) (uint, error) {
	return ParseID(ctx, idStr, errors.MsgInvalidMajorID, "学科IDの形式が不正です")
}

// ValidateAdmissionInfoID は募集情報IDのバリデーションを行います。
func ValidateAdmissionInfoID(ctx context.Context, idStr string) (uint, error) {
	return ParseID(ctx, idStr, errors.MsgInvalidAdmissionInfoID, "募集情報IDの形式が不正です")
}
