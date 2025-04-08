package department

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

// departmentTestCase は学部関連のテストケースを定義します
// この構造体は学部関連のテストケースで使用される情報を保持します
type departmentTestCase struct {
	testutils.TestCase
	universityID string                              // 大学ID
	departmentID string                              // 学部ID
	validate     func(*testing.T, models.Department) // 学部データの検証関数
}

// validateDepartmentData は学部データの検証を行います
func validateDepartmentData(t *testing.T, department models.Department) {
	t.Helper()

	if department.UniversityID == 0 {
		t.Errorf("大学IDが設定されていません")
	}
	if department.Name == "" {
		t.Errorf("学部名が設定されていません")
	}
	if len(department.Majors) == 0 {
		t.Errorf("学科データが存在しません")
	}
}

// validateGetDepartmentResponse は学部取得のレスポンスを検証します
func validateGetDepartmentResponse(t *testing.T, rec *httptest.ResponseRecorder, tc departmentTestCase) {
	t.Helper()

	testutils.ValidateResponse(t, rec, tc.TestCase)

	var department models.Department
	if err := testutils.ParseResponse(rec, &department); err != nil {
		t.Fatalf("レスポンスのパースに失敗しました: %v", err)
	}

	if tc.validate != nil {
		tc.validate(t, department)
	} else {
		validateDepartmentData(t, department)
	}
}

// TestGetDepartment は学部取得のテストを行います
// このテストは以下のケースを検証します：
// - 正常なリクエスト
// - 存在しない大学IDでの取得
// - 不正な大学ID形式での取得
func TestGetDepartment(t *testing.T) {
	e, handler := testutils.SetupTestHandler()
	departmentHandler := NewDepartmentHandler(handler.GetRepo(), 5*time.Second)

	tests := []departmentTestCase{
		{
			TestCase: testutils.TestCase{
				Name:       testutils.TestCaseNormalRequest,
				WantStatus: http.StatusOK,
			},
			universityID: "1",
			departmentID: "1",
			validate:    validateDepartmentData,
		},
		{
			TestCase: testutils.TestCase{
				Name:       testutils.TestCaseNotFound,
				WantStatus: http.StatusNotFound,
				WantError:  fmt.Sprintf(testutils.ErrMsgNotFound, "1", "学部"),
			},
			universityID: "999",
			departmentID: "1",
		},
		{
			TestCase: testutils.TestCase{
				Name:       testutils.TestCaseInvalidID,
				WantStatus: http.StatusBadRequest,
				WantError:  fmt.Sprintf(testutils.ErrMsgInvalidIDFormat, "大学"),
			},
			universityID: "invalid",
			departmentID: "1",
		},
	}

	for _, tt := range tests {
		t.Run(tt.Name, func(t *testing.T) {
			path := fmt.Sprintf(testutils.APIDepartmentPath, tt.universityID, tt.departmentID)
			rec, err := testutils.ExecuteRequest(e, testutils.RequestConfig{
				Method: http.MethodGet,
				Path:   path,
			}, departmentHandler.GetDepartment)
			if err != nil {
				t.Fatalf(testutils.ErrMsgRequestFailed, err)
			}
			validateGetDepartmentResponse(t, rec, tt)
		})
	}
}

// TestCreateDepartment は学部作成のテストを行います
func TestCreateDepartment(t *testing.T) {
	e, handler := testutils.SetupTestHandler()
	departmentHandler := NewDepartmentHandler(handler.GetRepo(), 5*time.Second)

	tests := []departmentTestCase{
		{
			TestCase: testutils.TestCase{
				Name:       testutils.TestCaseNormalRequest,
				WantStatus: http.StatusCreated,
			},
			universityID: "1",
			departmentID: "0",
		},
		{
			TestCase: testutils.TestCase{
				Name:       testutils.TestCaseInvalidBody,
				WantStatus: http.StatusBadRequest,
				WantError:  "リクエストボディの解析に失敗しました",
			},
			universityID: "1",
			departmentID: "0",
		},
	}

	for _, tt := range tests {
		t.Run(tt.Name, func(t *testing.T) {
			var body interface{}
			if tt.Name == testutils.TestCaseNormalRequest {
				body = map[string]interface{}{
					"university_id": 1,
					"name":         "テスト学部",
				}
			} else {
				body = "invalid"
			}

			path := fmt.Sprintf("/api/universities/%s/departments", tt.universityID)
			rec, err := testutils.ExecuteRequest(e, testutils.RequestConfig{
				Method: http.MethodPost,
				Path:   path,
				Body:   body,
			}, departmentHandler.CreateDepartment)
			if err != nil {
				t.Fatalf(testutils.ErrMsgRequestFailed, err)
			}
			validateGetDepartmentResponse(t, rec, tt)
		})
	}
}

// TestUpdateDepartment は学部更新のテストを行います
func TestUpdateDepartment(t *testing.T) {
	e, handler := testutils.SetupTestHandler()
	departmentHandler := NewDepartmentHandler(handler.GetRepo(), 5*time.Second)

	tests := []departmentTestCase{
		{
			TestCase: testutils.TestCase{
				Name:       testutils.TestCaseNormalRequest,
				WantStatus: http.StatusOK,
			},
			universityID: "1",
			departmentID: "1",
		},
		{
			TestCase: testutils.TestCase{
				Name:       testutils.TestCaseNotFound,
				WantStatus: http.StatusNotFound,
				WantError:  fmt.Sprintf("ID %sの学部が見つかりません", "999"),
			},
			universityID: "1",
			departmentID: "999",
		},
	}

	for _, tt := range tests {
		t.Run(tt.Name, func(t *testing.T) {
			body := map[string]interface{}{
				"university_id": 1,
				"name":         "更新されたテスト学部",
			}

			path := fmt.Sprintf("/api/universities/%s/departments/%s", tt.universityID, tt.departmentID)
			rec, err := testutils.ExecuteRequest(e, testutils.RequestConfig{
				Method: http.MethodPut,
				Path:   path,
				Body:   body,
			}, departmentHandler.UpdateDepartment)
			if err != nil {
				t.Fatalf(testutils.ErrMsgRequestFailed, err)
			}
			validateGetDepartmentResponse(t, rec, tt)
		})
	}
}

// TestDeleteDepartment は学部削除のテストを行います
func TestDeleteDepartment(t *testing.T) {
	e, handler := testutils.SetupTestHandler()
	departmentHandler := NewDepartmentHandler(handler.GetRepo(), 5*time.Second)

	tests := []departmentTestCase{
		{
			TestCase: testutils.TestCase{
				Name:       testutils.TestCaseNormalRequest,
				WantStatus: http.StatusNoContent,
			},
			universityID: "1",
			departmentID: "1",
		},
		{
			TestCase: testutils.TestCase{
				Name:       testutils.TestCaseNotFound,
				WantStatus: http.StatusNotFound,
				WantError:  fmt.Sprintf("ID %sの学部が見つかりません", "999"),
			},
			universityID: "1",
			departmentID: "999",
		},
	}

	for _, tt := range tests {
		t.Run(tt.Name, func(t *testing.T) {
			path := fmt.Sprintf("/api/universities/%s/departments/%s", tt.universityID, tt.departmentID)
			rec, err := testutils.ExecuteRequest(e, testutils.RequestConfig{
				Method: http.MethodDelete,
				Path:   path,
			}, departmentHandler.DeleteDepartment)
			if err != nil {
				t.Fatalf(testutils.ErrMsgRequestFailed, err)
			}
			testutils.ValidateResponse(t, rec, tt.TestCase)
		})
	}
}

// TestMetrics はメトリクスの収集をテストします
func TestMetrics(t *testing.T) {
	e, handler := testutils.SetupTestHandler()
	departmentHandler := NewDepartmentHandler(handler.GetRepo(), 5*time.Second)

	// 正常系のリクエストを実行
	path := fmt.Sprintf("/api/universities/%d/departments/%d", 1, 1)
	_, err := testutils.ExecuteRequest(e, testutils.RequestConfig{
		Method: http.MethodGet,
		Path:   path,
	}, departmentHandler.GetDepartment)
	if err != nil {
		t.Fatalf("リクエストの実行に失敗しました: %v", err)
	}

	// メトリクスの検証
	validateMetrics(t, departmentHandler)
}

// validateMetrics はメトリクスの収集を検証します
func validateMetrics(t *testing.T, handler *DepartmentHandler) {
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
		validateHistogram(t, dtoMetric.Histogram)
		metricTypes["histogram"] = true
	}
	if dtoMetric.Counter != nil {
		validateCounter(t, dtoMetric.Counter)
		metricTypes["counter"] = true
	}
}

func validateHistogram(t *testing.T, histogram *dto.Histogram) {
	if histogram.SampleCount == nil || *histogram.SampleCount == 0 {
		t.Error("ヒストグラムのサンプル数が0です")
	}
	if histogram.SampleSum == nil || *histogram.SampleSum < 0 {
		t.Error("ヒストグラムの合計値が不正です")
	}
	if len(histogram.Bucket) == 0 {
		t.Error("ヒストグラムのバケットが設定されていません")
	}
	for i, bucket := range histogram.Bucket {
		validateBucket(t, i, bucket)
	}
}

func validateBucket(t *testing.T, index int, bucket *dto.Bucket) {
	if bucket.GetUpperBound() < 0 {
		t.Errorf("バケット %d の上限値が不正です: %f", index, bucket.GetUpperBound())
	}
	if bucket.GetCumulativeCount() < 0 {
		t.Errorf("バケット %d の累積数が不正です: %d", index, bucket.GetCumulativeCount())
	}
}

func validateCounter(t *testing.T, counter *dto.Counter) {
	if counter.Value == nil || *counter.Value < 0 {
		t.Error("カウンターの値が不正です")
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

	if help, exists := requiredLabels[label.GetName()]; exists {
		if label.GetValue() == "" {
			t.Errorf("%sが設定されていません: %s", help, label.GetName())
			return
		}
		validateLabelValue(t, label)
	}
}

func validateLabelValue(t *testing.T, label *dto.LabelPair) {
	switch label.GetName() {
	case "status":
		if !isValidStatusCode(label.GetValue()) {
			t.Errorf("不正なステータスコード: %s", label.GetValue())
		}
	case "method":
		if !isValidHTTPMethod(label.GetValue()) {
			t.Errorf("不正なHTTPメソッド: %s", label.GetValue())
		}
	case "error_type":
		if !isValidErrorType(label.GetValue()) {
			t.Errorf("不正なエラータイプ: %s", label.GetValue())
		}
	case "operation":
		if !isValidOperation(label.GetValue()) {
			t.Errorf("不正なデータベース操作: %s", label.GetValue())
		}
	}
}

func isValidStatusCode(status string) bool {
	code := 0
	fmt.Sscanf(status, "%d", &code)
	return code >= 100 && code <= 599
}

func isValidHTTPMethod(method string) bool {
	validMethods := map[string]bool{
		http.MethodGet:     true,
		http.MethodPost:    true,
		http.MethodPut:     true,
		http.MethodDelete:  true,
		http.MethodPatch:   true,
		http.MethodHead:    true,
		http.MethodOptions: true,
	}
	return validMethods[method]
}

func isValidErrorType(errorType string) bool {
	validErrorTypes := map[string]bool{
		"validation": true,
		"database":   true,
		"internal":   true,
		"not_found":  true,
	}
	return validErrorTypes[errorType]
}

func isValidOperation(operation string) bool {
	validOperations := map[string]bool{
		"find":    true,
		"create":  true,
		"update":  true,
		"delete":  true,
		"list":    true,
	}
	return validOperations[operation]
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
