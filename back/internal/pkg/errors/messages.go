// Package errors はアプリケーションのエラーメッセージを管理するパッケージです。
// このパッケージは以下の機能を提供します：
// - エラーコードの定義
// - エラーメッセージの定義
// - エラーコードとメッセージの対応関係の管理
package errors

// エラーコードの定義
// このセクションでは、アプリケーションで使用するエラーコードを定義します。
// エラーコードは以下のカテゴリに分類されます：
// - ID関連のエラー
// - リクエスト関連のエラー
const (
	// ID関連のエラーコード
	ErrInvalidUniversityID    = "INVALID_UNIVERSITY_ID"
	ErrInvalidDepartmentID    = "INVALID_DEPARTMENT_ID"
	ErrInvalidSubjectID       = "INVALID_SUBJECT_ID"
	ErrInvalidScheduleID      = "INVALID_SCHEDULE_ID"
	ErrInvalidMajorID         = "INVALID_MAJOR_ID"
	ErrInvalidAdmissionInfoID = "INVALID_ADMISSION_INFO_ID"

	// リクエスト関連のエラーコード
	ErrInvalidRequestBody = "INVALID_REQUEST_BODY"
	ErrBindDataFailed     = "BIND_DATA_FAILED"
	ErrBindRequestFailed  = "BIND_REQUEST_FAILED"
)

// エラーメッセージの定義
// このセクションでは、エラーコードに対応するエラーメッセージを定義します。
// メッセージは以下の特徴を持ちます：
// - 日本語での明確な説明
// - フォーマット文字列の適切な使用
// - エラーコードとの一対一対応
const (
	// ID関連のエラーメッセージ
	MsgInvalidUniversityID    = "大学IDの形式が不正です: %v"
	MsgInvalidDepartmentID    = "学部IDの形式が不正です: %v"
	MsgInvalidSubjectID       = "科目IDの形式が不正です: %v"
	MsgInvalidScheduleID      = "スケジュールIDの形式が不正です: %v"
	MsgInvalidMajorID         = "学科IDの形式が不正です: %v"
	MsgInvalidAdmissionInfoID = "募集情報IDの形式が不正です: %v"

	// リクエスト関連のエラーメッセージ
	MsgInvalidRequestBody = "リクエストボディが不正です"
	MsgBindDataFailed     = "データのバインドに失敗しました: %v"
	MsgBindRequestFailed  = "リクエストのバインドに失敗しました: %v"
)
