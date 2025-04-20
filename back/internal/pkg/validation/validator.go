// Package validation は入力値のバリデーション機能を提供します。
// このパッケージは以下の機能を提供します：
// - IDの検証
// - 文字列から数値への変換
// - エラーハンドリング
// - ログ記録
package validation

import (
	"context"
	"strconv"
	appErrors "university-exam-api/internal/errors"
	applogger "university-exam-api/internal/logger"
	"university-exam-api/internal/pkg/errors"
)

// ParseID は文字列IDをuintに変換します。
// この関数は以下の処理を行います：
// - 文字列をuintに変換
// - 変換失敗時のエラーハンドリング
// - ログ記録
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
// この関数は以下の処理を行います：
// - 大学IDの形式チェック
// - エラーハンドリング
// - ログ記録
func ValidateUniversityID(ctx context.Context, idStr string) (uint, error) {
	return ParseID(ctx, idStr, errors.MsgInvalidUniversityID, "大学IDの形式が不正です")
}

// ValidateDepartmentID は学部IDのバリデーションを行います。
// この関数は以下の処理を行います：
// - 学部IDの形式チェック
// - エラーハンドリング
// - ログ記録
func ValidateDepartmentID(ctx context.Context, idStr string) (uint, error) {
	return ParseID(ctx, idStr, errors.MsgInvalidDepartmentID, "学部IDの形式が不正です")
}

// ValidateSubjectID は科目IDのバリデーションを行います。
// この関数は以下の処理を行います：
// - 科目IDの形式チェック
// - エラーハンドリング
// - ログ記録
func ValidateSubjectID(ctx context.Context, idStr string) (uint, error) {
	return ParseID(ctx, idStr, errors.MsgInvalidSubjectID, "科目IDの形式が不正です")
}

// ValidateScheduleID はスケジュールIDのバリデーションを行います。
// この関数は以下の処理を行います：
// - スケジュールIDの形式チェック
// - エラーハンドリング
// - ログ記録
func ValidateScheduleID(ctx context.Context, idStr string) (uint, error) {
	return ParseID(ctx, idStr, errors.MsgInvalidScheduleID, "スケジュールIDの形式が不正です")
}

// ValidateMajorID は学科IDのバリデーションを行います。
// この関数は以下の処理を行います：
// - 学科IDの形式チェック
// - エラーハンドリング
// - ログ記録
func ValidateMajorID(ctx context.Context, idStr string) (uint, error) {
	return ParseID(ctx, idStr, errors.MsgInvalidMajorID, "学科IDの形式が不正です")
}

// ValidateAdmissionInfoID は募集情報IDのバリデーションを行います。
// この関数は以下の処理を行います：
// - 募集情報IDの形式チェック
// - エラーハンドリング
// - ログ記録
func ValidateAdmissionInfoID(ctx context.Context, idStr string) (uint, error) {
	return ParseID(ctx, idStr, errors.MsgInvalidAdmissionInfoID, "募集情報IDの形式が不正です")
}
