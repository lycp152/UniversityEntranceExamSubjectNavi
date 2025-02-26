package models

import "errors"

var (
	// ErrInvalidAcademicYear は学年度が無効な場合のエラー
	ErrInvalidAcademicYear = errors.New("学年度は2000年から2100年の間である必要があります")

	// ErrInvalidValidPeriod は有効期間が無効な場合のエラー
	ErrInvalidValidPeriod = errors.New("有効期間は1年間である必要があります")

	// ErrDataRetentionPeriodExceeded はデータ保持期間を超過した場合のエラー
	ErrDataRetentionPeriodExceeded = errors.New("データ保持期間（2年）を超過しています")
)
