package logging

import "os"

// ログメッセージ定数
var (
	// 大学関連のログメッセージ
	LogGetUniversitiesSuccess = os.Getenv("LOG_GET_UNIVERSITIES_SUCCESS")
	LogGetUniversitySuccess   = os.Getenv("LOG_GET_UNIVERSITY_SUCCESS")
	LogSearchUniversitiesSuccess = os.Getenv("LOG_SEARCH_UNIVERSITIES_SUCCESS")
	LogCreateUniversitySuccess = os.Getenv("LOG_CREATE_UNIVERSITY_SUCCESS")
	LogUpdateUniversitySuccess = os.Getenv("LOG_UPDATE_UNIVERSITY_SUCCESS")
	LogDeleteUniversitySuccess = os.Getenv("LOG_DELETE_UNIVERSITY_SUCCESS")

	// 学部関連のログメッセージ
	LogGetDepartmentSuccess   = os.Getenv("LOG_GET_DEPARTMENT_SUCCESS")
	LogCreateDepartmentSuccess = os.Getenv("LOG_CREATE_DEPARTMENT_SUCCESS")
	LogUpdateDepartmentSuccess = os.Getenv("LOG_UPDATE_DEPARTMENT_SUCCESS")
	LogDeleteDepartmentSuccess = os.Getenv("LOG_DELETE_DEPARTMENT_SUCCESS")

	// 科目関連のログメッセージ
	LogGetSubjectSuccess      = os.Getenv("LOG_GET_SUBJECT_SUCCESS")
	LogCreateSubjectSuccess   = os.Getenv("LOG_CREATE_SUBJECT_SUCCESS")
	LogUpdateSubjectSuccess   = os.Getenv("LOG_UPDATE_SUBJECT_SUCCESS")
	LogDeleteSubjectSuccess   = os.Getenv("LOG_DELETE_SUBJECT_SUCCESS")
	LogBatchUpdateSubjectSuccess = os.Getenv("LOG_BATCH_UPDATE_SUBJECT_SUCCESS")

	// 学科関連のログメッセージ
	LogGetMajorSuccess   = os.Getenv("LOG_GET_MAJOR_SUCCESS")
	LogCreateMajorSuccess = os.Getenv("LOG_CREATE_MAJOR_SUCCESS")
	LogUpdateMajorSuccess = os.Getenv("LOG_UPDATE_MAJOR_SUCCESS")
	LogDeleteMajorSuccess = os.Getenv("LOG_DELETE_MAJOR_SUCCESS")

	// 募集情報関連のログメッセージ
	LogGetAdmissionInfoSuccess   = os.Getenv("LOG_GET_ADMISSION_INFO_SUCCESS")
	LogCreateAdmissionInfoSuccess = os.Getenv("LOG_CREATE_ADMISSION_INFO_SUCCESS")
	LogUpdateAdmissionInfoSuccess = os.Getenv("LOG_UPDATE_ADMISSION_INFO_SUCCESS")
	LogDeleteAdmissionInfoSuccess = os.Getenv("LOG_DELETE_ADMISSION_INFO_SUCCESS")

	LogGetCSRFTokenSuccess = os.Getenv("LOG_GET_CSRF_TOKEN_SUCCESS")
)
