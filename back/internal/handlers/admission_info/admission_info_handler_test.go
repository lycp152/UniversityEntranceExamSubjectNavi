package admission_info

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
	"university-exam-api/internal/domain/models"
	"university-exam-api/internal/pkg/errors"
	"university-exam-api/internal/testutils"

	"github.com/labstack/echo/v4"
	"github.com/prometheus/client_golang/prometheus"
	dto "github.com/prometheus/client_model/go"
)

// テストケースの種類を定義
const (
	TestCaseTypeNormal              = "正常系"
	TestCaseTypeError               = "異常系"
	TestCaseTypeRequestBindingError = "リクエストバインディングエラー"
)

// エラーメッセージを構造化
type errorMessages struct {
	Timeout           string
	InvalidScheduleID string
	InvalidInfoID     string
	NotFound          string
	InvalidStatus     string
	InvalidEnrollment string
	InvalidYear       string
	ParseResponse     string
	RequestFailed     string
}

var (
	ErrMsg = errorMessages{
		Timeout:           "タイムアウトが発生しました",
		InvalidScheduleID: "無効な入試日程ID形式です",
		InvalidInfoID:     "無効な募集情報ID形式です",
		NotFound:          "募集情報ID %dが見つかりません",
		InvalidStatus:     "ステータスが不正です",
		InvalidEnrollment: "募集人数が0以下です",
		InvalidYear:       "学年度が不正です（2000-2100の範囲外）",
		ParseResponse:     "レスポンスのパースに失敗しました: %v",
		RequestFailed:     "リクエストの実行に失敗しました: %v",
	}
)

// テストデータを定義
type testData struct {
	normalAdmissionInfo   models.AdmissionInfo
	invalidAdmissionInfo models.AdmissionInfo
	errorCases          []errorCase
}

type errorCase struct {
	name        string
	scheduleID  uint
	infoID      uint
	expectedErr string
}

var testDataInstance = testData{
	normalAdmissionInfo: models.AdmissionInfo{
		AdmissionScheduleID: 1,
		Enrollment:         100,
		AcademicYear:       2024,
		Status:            "draft",
	},
	invalidAdmissionInfo: models.AdmissionInfo{
		AdmissionScheduleID: 0,
		Enrollment:         0,
		AcademicYear:       1999,
		Status:            "invalid",
	},
	errorCases: []errorCase{
		{
			name:        "無効な入試日程ID",
			scheduleID:  0,
			infoID:      1,
			expectedErr: ErrMsg.InvalidScheduleID,
		},
		{
			name:        "無効な募集情報ID",
			scheduleID:  1,
			infoID:      0,
			expectedErr: ErrMsg.InvalidInfoID,
		},
		{
			name:        "存在しない募集情報",
			scheduleID:  1,
			infoID:      999,
			expectedErr: fmt.Sprintf(ErrMsg.NotFound, 999),
		},
	},
}

// admissionInfoTestCase は募集情報関連のテストケースを定義します
type admissionInfoTestCase struct {
	testutils.TestCase
	scheduleID uint
	infoID     uint
	validate   func(*testing.T, models.AdmissionInfo)
}

// validateAdmissionInfoData は募集情報データの検証を行います
func validateAdmissionInfoData(t *testing.T, info models.AdmissionInfo) {
	t.Helper()

	if info.AdmissionScheduleID == 0 {
		t.Error(ErrMsg.InvalidScheduleID)
	}
	if info.Enrollment <= 0 {
		t.Error(ErrMsg.InvalidEnrollment)
	}
	if info.AcademicYear < 2000 || info.AcademicYear > 2100 {
		t.Error(ErrMsg.InvalidYear)
	}
	if info.Status != "draft" && info.Status != "published" && info.Status != "archived" {
		t.Error(ErrMsg.InvalidStatus)
	}
}

// validateTestCase はテストケースの検証を共通化します
func validateTestCase(t *testing.T, rec *httptest.ResponseRecorder, tc admissionInfoTestCase) {
	t.Helper()

	testutils.ValidateResponse(t, rec, tc.TestCase)

	if tc.WantStatus == http.StatusOK || tc.WantStatus == http.StatusCreated {
		var info models.AdmissionInfo
		if err := testutils.ParseResponse(rec, &info); err != nil {
			t.Fatalf(ErrMsg.ParseResponse, err)
		}

		if tc.validate != nil {
			tc.validate(t, info)
		} else {
			validateAdmissionInfoData(t, info)
		}
	}
}

// executeTestCase はテストケースの実行を共通化します
func executeTestCase(t *testing.T, e *echo.Echo, handler *AdmissionInfoHandler, tc admissionInfoTestCase, method string, path string, body interface{}) {
	t.Helper()

	rec, err := testutils.ExecuteRequest(e, testutils.RequestConfig{
		Method: method,
		Path:   path,
		Body:   body,
	}, handler.GetAdmissionInfo)
	if err != nil {
		t.Fatalf(ErrMsg.RequestFailed, err)
	}
	validateTestCase(t, rec, tc)
}

// TestGetAdmissionInfo は募集情報取得のテストを行います
func TestGetAdmissionInfo(t *testing.T) {
	e, handler := testutils.SetupTestHandler()
	admissionInfoHandler := NewAdmissionHandler(handler.GetRepo(), 5*time.Second)

	tests := []admissionInfoTestCase{
		{
			TestCase: testutils.TestCase{
				Name:       TestCaseTypeNormal,
				WantStatus: http.StatusOK,
			},
			scheduleID: 1,
			infoID:     1,
			validate:   validateAdmissionInfoData,
		},
	}

	// エラーケースのテストを追加
	for _, ec := range testDataInstance.errorCases {
		tests = append(tests, admissionInfoTestCase{
			TestCase: testutils.TestCase{
				Name:       ec.name,
				WantStatus: http.StatusBadRequest,
				WantError:  ec.expectedErr,
			},
			scheduleID: ec.scheduleID,
			infoID:     ec.infoID,
		})
	}

	for _, tt := range tests {
		t.Run(tt.Name, func(t *testing.T) {
			path := fmt.Sprintf(testutils.APIAdmissionScheduleInfoPath, tt.scheduleID, tt.infoID)
			executeTestCase(t, e, admissionInfoHandler, tt, http.MethodGet, path, nil)
		})
	}
}

// TestCreateAdmissionInfo は募集情報作成のテストを行います
func TestCreateAdmissionInfo(t *testing.T) {
	e, handler := testutils.SetupTestHandler()
	admissionInfoHandler := NewAdmissionHandler(handler.GetRepo(), 5*time.Second)

	tests := []admissionInfoTestCase{
		{
			TestCase: testutils.TestCase{
				Name:       TestCaseTypeNormal,
				WantStatus: http.StatusCreated,
			},
			scheduleID: 1,
			infoID:     0,
		},
		{
			TestCase: testutils.TestCase{
				Name:       TestCaseTypeRequestBindingError,
				WantStatus: http.StatusBadRequest,
				WantError:  errors.MsgBindRequestFailed,
			},
			scheduleID: 1,
			infoID:     0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.Name, func(t *testing.T) {
			var body interface{}
			if tt.Name == TestCaseTypeNormal {
				body = testDataInstance.normalAdmissionInfo
			} else {
				body = "invalid"
			}

			path := fmt.Sprintf("/api/admission-schedules/%d/info", tt.scheduleID)
			executeTestCase(t, e, admissionInfoHandler, tt, http.MethodPost, path, body)
		})
	}
}

// TestMetrics はメトリクスの収集をテストします
func TestMetrics(t *testing.T) {
	e, handler := testutils.SetupTestHandler()
	admissionInfoHandler := NewAdmissionHandler(handler.GetRepo(), 5*time.Second)

	// 正常系のリクエストを実行
	path := fmt.Sprintf(testutils.APIAdmissionScheduleInfoPath, 1, 1)
	_, err := testutils.ExecuteRequest(e, testutils.RequestConfig{
		Method: http.MethodGet,
		Path:   path,
	}, admissionInfoHandler.GetAdmissionInfo)
	if err != nil {
		t.Fatalf(ErrMsg.RequestFailed, err)
	}

	// メトリクスの検証
	validateMetrics(t, admissionInfoHandler)
}

// validateMetrics はメトリクスの収集を検証します
func validateMetrics(t *testing.T, handler *AdmissionInfoHandler) {
	t.Helper()

	metrics := make(chan prometheus.Metric, 100)
	handler.requestDuration.Collect(metrics)
	handler.errorCounter.Collect(metrics)
	handler.dbDuration.Collect(metrics)

	metricCount := 0
	metricTypes := make(map[string]bool)
	metricLabels := make(map[string]map[string]string)

	for metric := range metrics {
		metricCount++
		validateSingleMetric(t, metric, metricTypes, metricLabels)
	}

	validateMetricCount(t, metricCount)
	validateMetricTypes(t, metricTypes)
	validateMetricLabelsMap(t, metricLabels)
}

func validateSingleMetric(t *testing.T, metric prometheus.Metric, metricTypes map[string]bool, metricLabels map[string]map[string]string) {
	var dtoMetric dto.Metric
	if err := metric.Write(&dtoMetric); err != nil {
		t.Errorf("メトリクスの書き込みに失敗しました: %v", err)
		return
	}

	validateMetricType(t, &dtoMetric, metricTypes)
	validateMetricLabel(t, &dtoMetric, metric, metricLabels)
}

func validateMetricType(t *testing.T, dtoMetric *dto.Metric, metricTypes map[string]bool) {
	if dtoMetric.Histogram != nil {
		metricTypes["histogram"] = true
		if dtoMetric.Histogram.SampleCount == nil || *dtoMetric.Histogram.SampleCount == 0 {
			t.Error("ヒストグラムのサンプル数が0です")
		}
	}
	if dtoMetric.Counter != nil {
		metricTypes["counter"] = true
		if dtoMetric.Counter.Value == nil || *dtoMetric.Counter.Value < 0 {
			t.Error("カウンターの値が不正です")
		}
	}
}

func validateMetricLabel(t *testing.T, dtoMetric *dto.Metric, metric prometheus.Metric, metricLabels map[string]map[string]string) {
	if dtoMetric.Label != nil {
		labels := make(map[string]string)
		for _, label := range dtoMetric.Label {
			labels[label.GetName()] = label.GetValue()
			validateRequiredLabel(t, label)
		}
		metricLabels[metric.Desc().String()] = labels
	}
}

func validateRequiredLabel(t *testing.T, label *dto.LabelPair) {
	if label.GetName() == "method" && label.GetValue() == "" {
		t.Error("methodラベルが設定されていません")
	}
	if label.GetName() == "path" && label.GetValue() == "" {
		t.Error("pathラベルが設定されていません")
	}
}

func validateMetricCount(t *testing.T, count int) {
	if count == 0 {
		t.Error("メトリクスが収集されていません")
	}
}

func validateMetricTypes(t *testing.T, types map[string]bool) {
	requiredTypes := []string{"histogram", "counter"}
	for _, typ := range requiredTypes {
		if !types[typ] {
			t.Errorf("必要なメトリクスタイプ %s が収集されていません", typ)
		}
	}
}

func validateMetricLabelsMap(t *testing.T, labels map[string]map[string]string) {
	for desc, label := range labels {
		if len(label) == 0 {
			t.Errorf("メトリクス %s にラベルが設定されていません", desc)
		}
	}
}
