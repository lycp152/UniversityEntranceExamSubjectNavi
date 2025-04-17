// Package applogger はアプリケーションのログメッセージを管理します。
// このパッケージは以下の機能を提供します：
// - 環境変数からのメッセージ取得
// - デフォルト値の提供
// - カテゴリ別のメッセージ管理
package applogger

import "os"

// ログメッセージ定数
// 以下のカテゴリのメッセージを管理します：
// - 大学関連
// - 学部関連
// - 科目関連
// - 学科関連
// - 募集情報関連
var (
	// 大学関連のログメッセージ
	LogGetUniversitiesSuccess = getEnvOrDefault("LOG_GET_UNIVERSITIES_SUCCESS", "大学一覧の取得に成功しました")
	LogGetUniversitySuccess   = getEnvOrDefault("LOG_GET_UNIVERSITY_SUCCESS", "大学情報の取得に成功しました")
	LogSearchUniversitiesSuccess = getEnvOrDefault("LOG_SEARCH_UNIVERSITIES_SUCCESS", "大学の検索に成功しました")
	LogCreateUniversitySuccess = getEnvOrDefault("LOG_CREATE_UNIVERSITY_SUCCESS", "大学の作成に成功しました")
	LogUpdateUniversitySuccess = getEnvOrDefault("LOG_UPDATE_UNIVERSITY_SUCCESS", "大学の更新に成功しました")
	LogDeleteUniversitySuccess = getEnvOrDefault("LOG_DELETE_UNIVERSITY_SUCCESS", "大学の削除に成功しました")

	// 学部関連のログメッセージ
	LogGetDepartmentSuccess   = getEnvOrDefault("LOG_GET_DEPARTMENT_SUCCESS", "学部情報の取得に成功しました")
	LogCreateDepartmentSuccess = getEnvOrDefault("LOG_CREATE_DEPARTMENT_SUCCESS", "学部の作成に成功しました")
	LogUpdateDepartmentSuccess = getEnvOrDefault("LOG_UPDATE_DEPARTMENT_SUCCESS", "学部の更新に成功しました")
	LogDeleteDepartmentSuccess = getEnvOrDefault("LOG_DELETE_DEPARTMENT_SUCCESS", "学部の削除に成功しました")

	// 科目関連のログメッセージ
	LogGetSubjectSuccess      = getEnvOrDefault("LOG_GET_SUBJECT_SUCCESS", "科目情報の取得に成功しました")
	LogCreateSubjectSuccess   = getEnvOrDefault("LOG_CREATE_SUBJECT_SUCCESS", "科目の作成に成功しました")
	LogUpdateSubjectSuccess   = getEnvOrDefault("LOG_UPDATE_SUBJECT_SUCCESS", "科目の更新に成功しました")
	LogDeleteSubjectSuccess   = getEnvOrDefault("LOG_DELETE_SUBJECT_SUCCESS", "科目の削除に成功しました")
	LogBatchUpdateSubjectSuccess = getEnvOrDefault("LOG_BATCH_UPDATE_SUBJECT_SUCCESS", "科目の一括更新に成功しました")

	// 学科関連のログメッセージ
	LogGetMajorSuccess   = getEnvOrDefault("LOG_GET_MAJOR_SUCCESS", "学科情報の取得に成功しました")
	LogCreateMajorSuccess = getEnvOrDefault("LOG_CREATE_MAJOR_SUCCESS", "学科の作成に成功しました")
	LogUpdateMajorSuccess = getEnvOrDefault("LOG_UPDATE_MAJOR_SUCCESS", "学科の更新に成功しました")
	LogDeleteMajorSuccess = getEnvOrDefault("LOG_DELETE_MAJOR_SUCCESS", "学科の削除に成功しました")

	// 募集情報関連のログメッセージ
	LogGetAdmissionInfoSuccess   = getEnvOrDefault("LOG_GET_ADMISSION_INFO_SUCCESS", "募集情報の取得に成功しました")
	LogCreateAdmissionInfoSuccess = getEnvOrDefault("LOG_CREATE_ADMISSION_INFO_SUCCESS", "募集情報の作成に成功しました")
	LogUpdateAdmissionInfoSuccess = getEnvOrDefault("LOG_UPDATE_ADMISSION_INFO_SUCCESS", "募集情報の更新に成功しました")
	LogDeleteAdmissionInfoSuccess = getEnvOrDefault("LOG_DELETE_ADMISSION_INFO_SUCCESS", "募集情報の削除に成功しました")

	LogGetCSRFTokenSuccess = getEnvOrDefault("LOG_GET_CSRF_TOKEN_SUCCESS", "CSRFトークンの取得に成功しました")
)

// getEnvOrDefault は環境変数を取得し、存在しない場合はデフォルト値を返します。
// この関数は以下の処理を行います：
// - 環境変数の取得
// - デフォルト値の提供
// - 値の検証
func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}

	return defaultValue
}
