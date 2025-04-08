package errors

// エラーメッセージ定数
const (
	// ID関連のエラーメッセージ
	ErrInvalidUniversityIDFormat = "大学IDの形式が不正です: %v"
	ErrMsgInvalidUniversityID    = "大学IDの形式が不正です"
	ErrInvalidDepartmentIDFormat = "学部IDの形式が不正です: %v"
	ErrMsgInvalidDepartmentID    = "学部IDの形式が不正です"
	ErrInvalidSubjectIDFormat    = "科目IDの形式が不正です: %v"
	ErrMsgInvalidSubjectID       = "科目IDの形式が不正です"
	ErrInvalidScheduleIDFormat   = "スケジュールIDの形式が不正です: %v"
	ErrMsgInvalidScheduleID      = "スケジュールIDの形式が不正です"
	ErrInvalidMajorIDFormat      = "学科IDの形式が不正です: %v"
	ErrMsgInvalidMajorID         = "学科IDの形式が不正です"
	ErrInvalidAdmissionInfoIDFormat = "募集情報IDの形式が不正です: %v"
	ErrMsgInvalidAdmissionInfoID    = "募集情報IDの形式が不正です"

	// リクエスト関連のエラーメッセージ
	ErrMsgInvalidRequestBody = "リクエストボディが不正です"
	ErrMsgBindData          = "データのバインドに失敗しました: %v"
	ErrMsgBindRequest       = "リクエストのバインドに失敗しました: %v"
)
