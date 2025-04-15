package errors

// エラーコードの定義
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
