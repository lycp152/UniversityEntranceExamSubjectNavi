// Package models はドメインモデルのテストを提供します。
// このパッケージには以下の機能が含まれます：
// 1. 各モデルのバリデーションテスト
// 2. テストヘルパー関数
// 3. テストデータの作成と管理
package models

import (
	"testing"
	"time"
	"university-exam-api/internal/domain/errors"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// テストで使用する定数
const (
	// longString はテスト用の長い文字列です。
	// バリデーションの上限チェックに使用されます。
	longString = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん"
	// errExpected はエラーが期待される場合のメッセージです。
	errExpected = "エラーが期待されましたが、発生しませんでした"
	// errUnexpected は予期しないエラーが発生した場合のメッセージです。
	errUnexpected = "エラーが発生しました: %v"
)

// testHelper はテストヘルパー関数を提供する構造体です。
// 以下の機能を提供します：
// 1. テストデータの作成
// 2. テスト環境のセットアップ
// 3. クリーンアップ処理
type testHelper struct {
	t testing.TB
}

// newTestHelper は新しいテストヘルパーを作成します。
// 引数：
//   - t: テストコンテキスト
// 戻り値：
//   - *testHelper: 初期化されたテストヘルパー
func newTestHelper(t testing.TB) *testHelper {
	helper := &testHelper{t: t}
	t.Cleanup(func() {
		// テスト終了時のクリーンアップ処理
		// 必要に応じてデータベースのクリーンアップなどを実装
	})

	return helper
}

// createTestUniversity はテスト用の大学データを作成します。
// 引数：
//   - name: 大学名
// 戻り値：
//   - University: 作成された大学データ
func (h *testHelper) createTestUniversity(name string) University {
	return University{
		BaseModel: BaseModel{
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
			Version:   1,
		},
		Name: name,
	}
}

// createTestDepartment はテスト用の学部データを作成します。
// 引数：
//   - name: 学部名
//   - universityID: 大学ID
// 戻り値：
//   - Department: 作成された学部データ
func (h *testHelper) createTestDepartment(name string, universityID uint) Department {
	return Department{
		BaseModel: BaseModel{
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
			Version:   1,
		},
		Name:         name,
		UniversityID: universityID,
	}
}

// createTestMajor はテスト用の学科データを作成します。
// 引数：
//   - name: 学科名
//   - departmentID: 学部ID
// 戻り値：
//   - Major: 作成された学科データ
func (h *testHelper) createTestMajor(name string, departmentID uint) Major {
	return Major{
		BaseModel: BaseModel{
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
			Version:   1,
		},
		Name:         name,
		DepartmentID: departmentID,
	}
}

// createTestAdmissionSchedule はテスト用の入試日程データを作成します。
// 引数：
//   - name: 日程名
//   - majorID: 学科ID
//   - displayOrder: 表示順
// 戻り値：
//   - AdmissionSchedule: 作成された入試日程データ
func (h *testHelper) createTestAdmissionSchedule(name string, majorID uint, displayOrder int) AdmissionSchedule {
	return AdmissionSchedule{
		BaseModel: BaseModel{
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
			Version:   1,
		},
		Name:         name,
		MajorID:      majorID,
		DisplayOrder: displayOrder,
	}
}

// createTestAdmissionInfo はテスト用の入試情報データを作成します。
// 引数：
//   - scheduleID: 入試日程ID
//   - enrollment: 募集人数
//   - academicYear: 学年度
//   - status: ステータス
// 戻り値：
//   - AdmissionInfo: 作成された入試情報データ
func (h *testHelper) createTestAdmissionInfo(
	scheduleID uint,
	enrollment int,
	academicYear int,
	status string,
) AdmissionInfo {
	return AdmissionInfo{
		BaseModel: BaseModel{
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
			Version:   1,
		},
		AdmissionScheduleID: scheduleID,
		Enrollment:         enrollment,
		AcademicYear:       academicYear,
		Status:            status,
	}
}

// createTestTestType はテスト用の試験種別データを作成します。
// 引数：
//   - name: 試験種別名
//   - scheduleID: 入試日程ID
// 戻り値：
//   - TestType: 作成された試験種別データ
func (h *testHelper) createTestTestType(name string, scheduleID uint) TestType {
	return TestType{
		BaseModel: BaseModel{
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
			Version:   1,
		},
		Name:               name,
		AdmissionScheduleID: scheduleID,
	}
}

// createTestSubject はテスト用の科目データを作成します。
// 引数：
//   - testTypeID: 試験種別ID
//   - score: 配点
//   - percentage: 配点比率
// 戻り値：
//   - Subject: 作成された科目データ
func (h *testHelper) createTestSubject(
	testTypeID uint,
	score int,
	percentage float64,
) Subject {
	return Subject{
		BaseModel: BaseModel{
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
			Version:   1,
		},
		Name:         "数学",
		TestTypeID:   testTypeID,
		Score:        score,
		Percentage:   percentage,
		DisplayOrder: 1,
	}
}

// validateAcademicYear は学年度のバリデーションを行います。
// 引数：
//   - info: 入試情報
// 戻り値：
//   - error: バリデーションエラー
func validateAcademicYear(info *AdmissionInfo) error {
	if info.AcademicYear < 2000 || info.AcademicYear > 2100 {
		return errors.ErrInvalidAcademicYear
	}

	return nil
}

// TestAcademicYear は学年度のバリデーションテストを実行します。
// 以下のケースをテストします：
// 1. 正常な学年度（範囲内）
// 2. 学年度の範囲外（過去）
// 3. 学年度の範囲外（未来）
func TestAcademicYear(t *testing.T) {
	t.Parallel() // テストの並列実行を有効化

	h := newTestHelper(t)

	tests := []struct {
		name          string
		academicYear int
		wantErr     bool
	}{
		{
			name:          "正常な学年度（範囲内）",
			academicYear: 2024,
			wantErr:     false,
		},
		{
			name:          "学年度の範囲外（過去）",
			academicYear: 1999,
			wantErr:     true,
		},
		{
			name:          "学年度の範囲外（未来）",
			academicYear: 2101,
			wantErr:     true,
		},
	}

	for _, tt := range tests {
		tt := tt // ループ変数のシャドウイング
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel() // サブテストの並列実行を有効化

			info := h.createTestAdmissionInfo(1, 100, tt.academicYear, "draft")
			err := validateAcademicYear(&info)

			if tt.wantErr {
				assert.Error(t, err, errExpected)
				assert.ErrorIs(t, err, errors.ErrInvalidAcademicYear, "期待されたエラー型ではありません")
			} else {
				assert.NoError(t, err, errUnexpected, err)
			}
		})
	}
}

// TestUniversityValidation は大学モデルのバリデーションテストを実行します。
// 以下のケースをテストします：
// 1. 正常な大学名
// 2. 空の大学名
// 3. 長すぎる大学名
// 4. 特殊文字を含む大学名
func TestUniversityValidation(t *testing.T) {
	t.Parallel()

	h := newTestHelper(t)

	tests := []struct {
		name       string
		university University
		wantErr    bool
	}{
		{
			name:       "正常な大学名（日本語）",
			university: h.createTestUniversity("テスト大学"),
			wantErr:    false,
		},
		{
			name:       "空の大学名",
			university: h.createTestUniversity(""),
			wantErr:    true,
		},
		{
			name:       "特殊文字を含む大学名",
			university: h.createTestUniversity("テスト大学\n"),
			wantErr:    true,
		},
		{
			name:       "長すぎる大学名",
			university: h.createTestUniversity(longString),
			wantErr:    true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			err := tt.university.Validate()
			if tt.wantErr {
				assert.Error(t, err, errExpected)
			} else {
				assert.NoError(t, err, errUnexpected, err)
			}
		})
	}
}

// TestDepartmentValidation は学部モデルのバリデーションテストを実行します。
// 以下のケースをテストします：
// 1. 正常な学部名（日本語）
// 2. 空の学部名
// 3. 無効な大学ID
// 4. 長すぎる学部名
func TestDepartmentValidation(t *testing.T) {
	t.Parallel()

	h := newTestHelper(t)

	tests := []struct {
		name       string
		department Department
		wantErr    bool
	}{
		{
			name:       "正常な学部名（日本語）",
			department: h.createTestDepartment("テスト学部", 1),
			wantErr:    false,
		},
		{
			name:       "空の学部名",
			department: h.createTestDepartment("", 1),
			wantErr:    true,
		},
		{
			name:       "無効な大学ID",
			department: h.createTestDepartment("テスト学部", 0),
			wantErr:    true,
		},
		{
			name:       "長すぎる学部名",
			department: h.createTestDepartment(longString, 1),
			wantErr:    true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			err := tt.department.Validate()
			if tt.wantErr {
				assert.Error(t, err, errExpected)
			} else {
				assert.NoError(t, err, errUnexpected, err)
			}
		})
	}
}

// TestMajorValidation は学科モデルのバリデーションテストを実行します。
// 以下のケースをテストします：
// 1. 正常な学科名（日本語）
// 2. 空の学科名
// 3. 無効な学部ID
// 4. 長すぎる学科名
func TestMajorValidation(t *testing.T) {
	t.Parallel()

	h := newTestHelper(t)

	tests := []struct {
		name  string
		major Major
		wantErr bool
	}{
		{
			name:  "正常な学科名（日本語）",
			major: h.createTestMajor("テスト学科", 1),
			wantErr: false,
		},
		{
			name:  "空の学科名",
			major: h.createTestMajor("", 1),
			wantErr: true,
		},
		{
			name:  "無効な学部ID",
			major: h.createTestMajor("テスト学科", 0),
			wantErr: true,
		},
		{
			name:  "長すぎる学科名",
			major: h.createTestMajor(longString, 1),
			wantErr: true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			err := tt.major.Validate()
			if tt.wantErr {
				assert.Error(t, err, errExpected)
			} else {
				assert.NoError(t, err, errUnexpected, err)
			}
		})
	}
}

// TestAdmissionScheduleValidation は入試日程モデルのバリデーションテストを実行します。
// 以下のケースをテストします：
// 1. 正常な入試日程（前期）
// 2. 無効な日程名
// 3. 無効な表示順
// 4. 無効な学科ID
func TestAdmissionScheduleValidation(t *testing.T) {
	t.Parallel()

	h := newTestHelper(t)

	tests := []struct {
		name             string
		admissionSchedule AdmissionSchedule
		wantErr          bool
	}{
		{
			name:             "正常な入試日程（前期）",
			admissionSchedule: h.createTestAdmissionSchedule("前期", 1, 1),
			wantErr:          false,
		},
		{
			name:             "無効な日程名",
			admissionSchedule: h.createTestAdmissionSchedule("無効", 1, 1),
			wantErr:          true,
		},
		{
			name:             "無効な表示順",
			admissionSchedule: h.createTestAdmissionSchedule("前期", 1, -1),
			wantErr:          true,
		},
		{
			name:             "無効な学科ID",
			admissionSchedule: h.createTestAdmissionSchedule("前期", 0, 1),
			wantErr:          true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			err := tt.admissionSchedule.Validate()
			if tt.wantErr {
				assert.Error(t, err, errExpected)
			} else {
				assert.NoError(t, err, errUnexpected, err)
			}
		})
	}
}

// TestAdmissionInfoValidation は入試情報モデルのバリデーションテストを実行します。
// 以下のケースをテストします：
// 1. 正常な入試情報
// 2. 無効な募集人数
// 3. 無効なステータス
// 4. 無効な入試日程ID
func TestAdmissionInfoValidation(t *testing.T) {
	t.Parallel()

	h := newTestHelper(t)

	tests := []struct {
		name          string
		admissionInfo AdmissionInfo
		wantErr      bool
	}{
		{
			name:          "正常な入試情報",
			admissionInfo: h.createTestAdmissionInfo(1, 100, 2024, "draft"),
			wantErr:      false,
		},
		{
			name:          "無効な募集人数",
			admissionInfo: h.createTestAdmissionInfo(1, -1, 2024, "draft"),
			wantErr:      true,
		},
		{
			name:          "無効なステータス",
			admissionInfo: h.createTestAdmissionInfo(1, 100, 2024, "invalid"),
			wantErr:      true,
		},
		{
			name:          "無効な入試日程ID",
			admissionInfo: h.createTestAdmissionInfo(0, 100, 2024, "draft"),
			wantErr:      true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			err := tt.admissionInfo.Validate()
			if tt.wantErr {
				assert.Error(t, err, errExpected)
			} else {
				assert.NoError(t, err, errUnexpected, err)
			}
		})
	}
}

// TestTestTypeValidation は試験種別モデルのバリデーションテストを実行します。
// 以下のケースをテストします：
// 1. 正常な試験種別（共通）
// 2. 無効な試験種別名
// 3. 無効な入試日程ID
func TestTestTypeValidation(t *testing.T) {
	t.Parallel()

	h := newTestHelper(t)

	tests := []struct {
		name     string
		testType TestType
		wantErr  bool
	}{
		{
			name:     "正常な試験種別（共通）",
			testType: h.createTestTestType("共通", 1),
			wantErr:  false,
		},
		{
			name:     "無効な試験種別名",
			testType: h.createTestTestType("無効", 1),
			wantErr:  true,
		},
		{
			name:     "無効な入試日程ID",
			testType: h.createTestTestType("共通", 0),
			wantErr:  true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			err := tt.testType.Validate()
			if tt.wantErr {
				assert.Error(t, err, errExpected)
			} else {
				assert.NoError(t, err, errUnexpected, err)
			}
		})
	}
}

// TestSubjectValidation は科目モデルのバリデーションテストを実行します。
// 以下のケースをテストします：
// 1. 正常な科目
// 2. 無効な配点
// 3. 無効な配点比率
// 4. 無効な試験種別ID
func TestSubjectValidation(t *testing.T) {
	t.Parallel()

	h := newTestHelper(t)

	tests := []struct {
		name    string
		subject Subject
		wantErr bool
	}{
		{
			name:    "正常な科目",
			subject: h.createTestSubject(1, 100, 50.0),
			wantErr: false,
		},
		{
			name:    "無効な配点",
			subject: h.createTestSubject(1, -1, 50.0),
			wantErr: true,
		},
		{
			name:    "無効な配点比率",
			subject: h.createTestSubject(1, 100, -1.0),
			wantErr: true,
		},
		{
			name:    "無効な試験種別ID",
			subject: h.createTestSubject(0, 100, 50.0),
			wantErr: true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			err := tt.subject.Validate()
			if tt.wantErr {
				assert.Error(t, err, errExpected)
			} else {
				assert.NoError(t, err, errUnexpected, err)
			}
		})
	}
}

// TestBaseModelValidation は基本モデルのバリデーションテストを実行します。
// 以下のケースをテストします：
// 1. 正常な基本モデル
// 2. 無効なバージョン
func TestBaseModelValidation(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		baseModel BaseModel
		wantErr  bool
	}{
		{
			name: "正常な基本モデル",
			baseModel: BaseModel{
				Version: 1,
			},
			wantErr: false,
		},
		{
			name: "無効なバージョン",
			baseModel: BaseModel{
				Version: 0,
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			err := tt.baseModel.Validate()
			if tt.wantErr {
				assert.Error(t, err, errExpected)
			} else {
				assert.NoError(t, err, errUnexpected, err)
			}
		})
	}
}

// TestBaseModelBeforeUpdate は基本モデルの更新前フックのテストを実行します。
// 以下のケースをテストします：
// 1. バージョンの更新
func TestBaseModelBeforeUpdate(t *testing.T) {
	t.Parallel()

	baseModel := BaseModel{
		Version: 1,
	}

	err := baseModel.BeforeUpdate()
	require.NoError(t, err, "BeforeUpdate() がエラーを返しました")
	assert.Equal(t, 2, baseModel.Version, "バージョンが期待通りに更新されていません")
}
