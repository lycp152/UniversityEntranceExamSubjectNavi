package admission_schedule

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
	"university-exam-api/internal/domain/models"
	"university-exam-api/internal/testutils"

	"github.com/prometheus/client_golang/prometheus"
	dto "github.com/prometheus/client_model/go"
)

// admissionScheduleTestCase は入試日程関連のテストケースを定義します
type admissionScheduleTestCase struct {
	testutils.TestCase
	majorID    uint                              // 学科ID
	scheduleID uint                              // 入試日程ID
	validate   func(*testing.T, models.AdmissionSchedule) // 入試日程データの検証関数
}

// validateAdmissionScheduleData は入試日程データの検証を行います
func validateAdmissionScheduleData(t *testing.T, schedule models.AdmissionSchedule) {
	t.Helper()

	if schedule.MajorID == 0 {
		t.Errorf("学科IDが設定されていません")
	}
	if schedule.Name == "" {
		t.Errorf("入試日程名が設定されていません")
	}
}

// validateGetAdmissionScheduleResponse は入試日程取得のレスポンスを検証します
func validateGetAdmissionScheduleResponse(t *testing.T, rec *httptest.ResponseRecorder, tc admissionScheduleTestCase) {
	t.Helper()

	testutils.ValidateResponse(t, rec, tc.TestCase)

	var schedule models.AdmissionSchedule
	if err := testutils.ParseResponse(rec, &schedule); err != nil {
		t.Fatalf("レスポンスのパースに失敗しました: %v", err)
	}

	if tc.validate != nil {
		tc.validate(t, schedule)
	} else {
		validateAdmissionScheduleData(t, schedule)
	}
}

// TestUpdateAdmissionSchedule は入試日程更新のテストを行います
func TestUpdateAdmissionSchedule(t *testing.T) {
	e, handler := testutils.SetupTestHandler()
	admissionScheduleHandler := NewAdmissionScheduleHandler(handler.GetRepo(), 5*time.Second)

	tests := []admissionScheduleTestCase{
		{
			TestCase: testutils.TestCase{
				Name:       testutils.TestCaseNormalRequest,
				WantStatus: http.StatusOK,
			},
			majorID:    1,
			scheduleID: 1,
			validate:   validateAdmissionScheduleData,
		},
		{
			TestCase: testutils.TestCase{
				Name:       testutils.TestCaseNotFound,
				WantStatus: http.StatusNotFound,
				WantError:  fmt.Sprintf("ID %dの入試日程が見つかりません", 999),
			},
			majorID:    1,
			scheduleID: 999,
		},
		{
			TestCase: testutils.TestCase{
				Name:       testutils.TestCaseInvalidID,
				WantStatus: http.StatusBadRequest,
				WantError:  "無効な入試日程ID形式です",
			},
			majorID:    1,
			scheduleID: 0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.Name, func(t *testing.T) {
			body := map[string]interface{}{
				"name":       "前期日程",
				"start_date": "2024-01-15T00:00:00Z",
				"end_date":   "2024-01-16T00:00:00Z",
			}

			path := fmt.Sprintf("/api/majors/%d/schedules/%d", tt.majorID, tt.scheduleID)
			rec, err := testutils.ExecuteRequest(e, testutils.RequestConfig{
				Method: http.MethodPut,
				Path:   path,
				Body:   body,
			}, admissionScheduleHandler.UpdateAdmissionSchedule)
			if err != nil {
				t.Fatalf(testutils.ErrMsgRequestFailed, err)
			}
			validateGetAdmissionScheduleResponse(t, rec, tt)
		})
	}
}

// TestMetrics はメトリクスの収集をテストします
func TestMetrics(t *testing.T) {
	e, handler := testutils.SetupTestHandler()
	admissionScheduleHandler := NewAdmissionScheduleHandler(handler.GetRepo(), 5*time.Second)

	// 正常系のリクエストを実行
	path := fmt.Sprintf("/api/majors/%d/schedules/%d", 1, 1)
	body := map[string]interface{}{
		"name":       "前期日程",
		"start_date": "2024-01-15T00:00:00Z",
		"end_date":   "2024-01-16T00:00:00Z",
	}

	_, err := testutils.ExecuteRequest(e, testutils.RequestConfig{
		Method: http.MethodPut,
		Path:   path,
		Body:   body,
	}, admissionScheduleHandler.UpdateAdmissionSchedule)
	if err != nil {
		t.Fatalf("リクエストの実行に失敗しました: %v", err)
	}

	// メトリクスの検証
	validateMetrics(t, admissionScheduleHandler)
}

// validateMetrics はメトリクスの収集を検証します
func validateMetrics(t *testing.T, handler *AdmissionScheduleHandler) {
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
		if dtoMetric.Histogram.SampleSum == nil || *dtoMetric.Histogram.SampleSum < 0 {
			t.Error("ヒストグラムの合計値が不正です")
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
	requiredLabels := map[string]string{
		"method":     "HTTPメソッド",
		"path":       "リクエストパス",
		"status":     "HTTPステータスコード",
		"error_type": "エラータイプ",
		"operation":  "データベース操作",
	}

	if help, exists := requiredLabels[label.GetName()]; exists && label.GetValue() == "" {
		t.Errorf("%sが設定されていません: %s", help, label.GetName())
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
