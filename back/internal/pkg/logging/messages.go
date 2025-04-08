package logging

// ログメッセージ定数
const (
	// 大学関連のログメッセージ
	LogGetUniversitiesSuccess = "%d件の大学を取得しました"
	LogGetUniversitySuccess   = "大学ID %dを取得しました"
	LogSearchUniversitiesSuccess = "検索クエリ '%s' で%d件の大学を検索しました"
	LogCreateUniversitySuccess = "大学ID %dを作成しました"
	LogUpdateUniversitySuccess = "大学ID %dを更新しました"
	LogDeleteUniversitySuccess = "大学ID %dを削除しました"

	// 学部関連のログメッセージ
	LogGetDepartmentSuccess   = "学部を取得しました (大学ID: %d, 学部ID: %d)"
	LogCreateDepartmentSuccess = "学部ID %dを作成しました"
	LogUpdateDepartmentSuccess = "学部ID %dを更新しました"
	LogDeleteDepartmentSuccess = "学部ID %dを削除しました"

	// 科目関連のログメッセージ
	LogGetSubjectSuccess      = "科目を取得しました (学部ID: %d, 科目ID: %d)"
	LogCreateSubjectSuccess   = "科目ID %dを作成しました"
	LogUpdateSubjectSuccess   = "科目ID %dを更新しました"
	LogDeleteSubjectSuccess   = "科目ID %dを削除しました"
	LogBatchUpdateSubjectSuccess = "科目の一括更新が完了しました"

	// 学科関連のログメッセージ
	LogGetMajorSuccess   = "学科を取得しました (学部ID: %d, 学科ID: %d)"
	LogCreateMajorSuccess = "学科ID %dを作成しました"
	LogUpdateMajorSuccess = "学科ID %dを更新しました"
	LogDeleteMajorSuccess = "学科ID %dを削除しました"

	// 募集情報関連のログメッセージ
	LogGetAdmissionInfoSuccess   = "募集情報を取得しました (入試日程ID: %d, 募集情報ID: %d)"
	LogCreateAdmissionInfoSuccess = "募集情報ID %dを作成しました"
	LogUpdateAdmissionInfoSuccess = "募集情報ID %dを更新しました"
	LogDeleteAdmissionInfoSuccess = "募集情報ID %dを削除しました"

	LogGetCSRFTokenSuccess = "CSRFトークンを正常に取得しました"
)
