package applogger

import (
	"fmt"
	"os"
	"path/filepath"
	"testing"

	"github.com/joho/godotenv"
	"github.com/stretchr/testify/assert"
)

func setupEnv() error {
	// カレントディレクトリを確認
	wd, err := os.Getwd()
	if err != nil {
		return fmt.Errorf("カレントディレクトリの取得に失敗しました: %w", err)
	}

	fmt.Printf("カレントディレクトリ: %s\n", wd)

	// プロジェクトのルートディレクトリを特定
	// 1. カレントディレクトリがback/internal/loggerの場合
	envPath := filepath.Join(wd, "..", "..", "..", "tests", "testdata", ".env")

	// 2. カレントディレクトリがbackの場合
	if _, err := os.Stat(envPath); os.IsNotExist(err) {
		envPath = filepath.Join(wd, "tests", "testdata", ".env")
	}

	// 3. カレントディレクトリがプロジェクトルートの場合
	if _, err := os.Stat(envPath); os.IsNotExist(err) {
		envPath = filepath.Join(wd, "back", "tests", "testdata", ".env")
	}

	fmt.Printf("環境変数ファイルのパス: %s\n", envPath)

	// .envファイルが存在しない場合は、デフォルトの環境変数を使用
	if _, err := os.Stat(envPath); os.IsNotExist(err) {
		fmt.Println("警告: .envファイルが見つかりません。デフォルトの環境変数を使用します。")
	} else {
		// .envファイルを読み込む
		if err := godotenv.Load(envPath); err != nil {
			return fmt.Errorf("環境変数の設定に失敗しました: %w", err)
		}
	}

	// テスト用の環境変数を設定
	envVars := map[string]string{
		"LOG_GET_UNIVERSITIES_SUCCESS": "大学一覧の取得に成功しました",
		"LOG_GET_UNIVERSITY_SUCCESS": "大学情報の取得に成功しました",
		"LOG_SEARCH_UNIVERSITIES_SUCCESS": "大学の検索に成功しました",
		"LOG_CREATE_UNIVERSITY_SUCCESS": "大学の作成に成功しました",
		"LOG_UPDATE_UNIVERSITY_SUCCESS": "大学の更新に成功しました",
		"LOG_DELETE_UNIVERSITY_SUCCESS": "大学の削除に成功しました",
		"LOG_GET_DEPARTMENT_SUCCESS": "学部情報の取得に成功しました",
		"LOG_CREATE_DEPARTMENT_SUCCESS": "学部の作成に成功しました",
		"LOG_UPDATE_DEPARTMENT_SUCCESS": "学部の更新に成功しました",
		"LOG_DELETE_DEPARTMENT_SUCCESS": "学部の削除に成功しました",
		"LOG_GET_SUBJECT_SUCCESS": "科目情報の取得に成功しました",
		"LOG_CREATE_SUBJECT_SUCCESS": "科目の作成に成功しました",
		"LOG_UPDATE_SUBJECT_SUCCESS": "科目の更新に成功しました",
		"LOG_DELETE_SUBJECT_SUCCESS": "科目の削除に成功しました",
		"LOG_BATCH_UPDATE_SUBJECT_SUCCESS": "科目の一括更新に成功しました",
		"LOG_GET_MAJOR_SUCCESS": "学科情報の取得に成功しました",
		"LOG_CREATE_MAJOR_SUCCESS": "学科の作成に成功しました",
		"LOG_UPDATE_MAJOR_SUCCESS": "学科の更新に成功しました",
		"LOG_DELETE_MAJOR_SUCCESS": "学科の削除に成功しました",
		"LOG_GET_ADMISSION_INFO_SUCCESS": "募集情報の取得に成功しました",
		"LOG_CREATE_ADMISSION_INFO_SUCCESS": "募集情報の作成に成功しました",
		"LOG_UPDATE_ADMISSION_INFO_SUCCESS": "募集情報の更新に成功しました",
		"LOG_DELETE_ADMISSION_INFO_SUCCESS": "募集情報の削除に成功しました",
		"LOG_GET_CSRF_TOKEN_SUCCESS": "CSRFトークンの取得に成功しました",
	}

	// テスト用の環境変数を設定
	for key, value := range envVars {
		if err := os.Setenv(key, value); err != nil {
			return err
		}
	}

	return nil
}

func TestMain(m *testing.M) {
	// 環境変数の設定
	if err := setupEnv(); err != nil {
		panic("環境変数の設定に失敗しました: " + err.Error())
	}

	// テストの実行
	code := m.Run()
	os.Exit(code)
}

func TestLogMessages(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		message  string
	}{
		{
			name:    "大学一覧取得のログメッセージ",
			message: LogGetUniversitiesSuccess,
		},
		{
			name:    "大学情報取得のログメッセージ",
			message: LogGetUniversitySuccess,
		},
		{
			name:    "大学検索のログメッセージ",
			message: LogSearchUniversitiesSuccess,
		},
		{
			name:    "大学作成のログメッセージ",
			message: LogCreateUniversitySuccess,
		},
		{
			name:    "大学更新のログメッセージ",
			message: LogUpdateUniversitySuccess,
		},
		{
			name:    "大学削除のログメッセージ",
			message: LogDeleteUniversitySuccess,
		},
		{
			name:    "学部情報取得のログメッセージ",
			message: LogGetDepartmentSuccess,
		},
		{
			name:    "学部作成のログメッセージ",
			message: LogCreateDepartmentSuccess,
		},
		{
			name:    "学部更新のログメッセージ",
			message: LogUpdateDepartmentSuccess,
		},
		{
			name:    "学部削除のログメッセージ",
			message: LogDeleteDepartmentSuccess,
		},
		{
			name:    "科目情報取得のログメッセージ",
			message: LogGetSubjectSuccess,
		},
		{
			name:    "科目作成のログメッセージ",
			message: LogCreateSubjectSuccess,
		},
		{
			name:    "科目更新のログメッセージ",
			message: LogUpdateSubjectSuccess,
		},
		{
			name:    "科目削除のログメッセージ",
			message: LogDeleteSubjectSuccess,
		},
		{
			name:    "科目一括更新のログメッセージ",
			message: LogBatchUpdateSubjectSuccess,
		},
		{
			name:    "学科情報取得のログメッセージ",
			message: LogGetMajorSuccess,
		},
		{
			name:    "学科作成のログメッセージ",
			message: LogCreateMajorSuccess,
		},
		{
			name:    "学科更新のログメッセージ",
			message: LogUpdateMajorSuccess,
		},
		{
			name:    "学科削除のログメッセージ",
			message: LogDeleteMajorSuccess,
		},
		{
			name:    "募集情報取得のログメッセージ",
			message: LogGetAdmissionInfoSuccess,
		},
		{
			name:    "募集情報作成のログメッセージ",
			message: LogCreateAdmissionInfoSuccess,
		},
		{
			name:    "募集情報更新のログメッセージ",
			message: LogUpdateAdmissionInfoSuccess,
		},
		{
			name:    "募集情報削除のログメッセージ",
			message: LogDeleteAdmissionInfoSuccess,
		},
		{
			name:    "CSRFトークン取得のログメッセージ",
			message: LogGetCSRFTokenSuccess,
		},
	}

	for _, tt := range tests {
		tt := tt // ループ変数のキャプチャ
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.NotEmpty(t, tt.message, "ログメッセージが空です")
		})
	}
}
