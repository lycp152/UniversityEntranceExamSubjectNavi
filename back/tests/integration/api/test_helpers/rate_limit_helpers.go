package test_helpers

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"sync"
	"testing"
	"time"

	"github.com/labstack/echo/v4"
)

// RateLimitTestResult はレート制限テストの結果を保持します
type RateLimitTestResult struct {
	TotalRequests    int     // 総リクエスト数
	LimitedRequests  int     // 制限されたリクエスト数
	SuccessRequests  int     // 成功したリクエスト数
	AverageResponse  float64 // 平均レスポンス時間（ミリ秒）
	MaxResponseTime  float64 // 最大レスポンス時間（ミリ秒）
	MinResponseTime  float64 // 最小レスポンス時間（ミリ秒）
	ResponseTimes    []float64 // レスポンス時間の配列
	Percentile95     float64 // 95パーセンタイルのレスポンス時間
	Percentile99     float64 // 99パーセンタイルのレスポンス時間
	RateLimitRatio   float64 // レート制限の比率
	SuccessRatio     float64 // 成功リクエストの比率
	Throughput       float64 // 1秒あたりの処理リクエスト数
}

// TestReport はテスト結果のレポートを保持します
type TestReport struct {
	Timestamp     time.Time
	TestName      string
	Results       []*RateLimitTestResult
	Configuration struct {
		NumRequests  int
		TimeWindow   int
		MaxRequests  int
		CooldownTime time.Duration
	}
}

// ExecuteRateLimitTest はレート制限テストを実行し、結果を返します
func ExecuteRateLimitTest(t *testing.T, handler interface{}, e *echo.Echo, numRequests int, timeWindow int) *RateLimitTestResult {
	results := make([]int, numRequests)
	responseTimes := make([]float64, numRequests)

	for i := 0; i < numRequests; i++ {
		start := time.Now()
		rec, c := CreateTestContext(e, http.MethodGet, APIUniversitiesPath, nil)
		if err := handler.(interface{ GetUniversities(echo.Context) error }).GetUniversities(c); err != nil {
			t.Errorf("リクエストが失敗: %v", err)
		}
		results[i] = rec.Code
		responseTimes[i] = float64(time.Since(start).Milliseconds())
		time.Sleep(time.Duration(timeWindow) * time.Second / time.Duration(numRequests))
	}

	return AnalyzeRateLimitResults(results, responseTimes)
}

// ExecuteConcurrentRateLimitTest は並行レート制限テストを実行し、結果を返します
func ExecuteConcurrentRateLimitTest(t *testing.T, handler interface{}, e *echo.Echo, numGoroutines int, numRequests int) *RateLimitTestResult {
	var (
		wg            sync.WaitGroup
		results       = make([][]int, numGoroutines)
		responseTimes = make([][]float64, numGoroutines)
	)

	for i := 0; i < numGoroutines; i++ {
		wg.Add(1)
		go func(index int) {
			defer wg.Done()
			results[index] = make([]int, numRequests)
			responseTimes[index] = make([]float64, numRequests)

			for j := 0; j < numRequests; j++ {
				start := time.Now()
				rec, c := CreateTestContext(e, http.MethodGet, APIUniversitiesPath, nil)
				if err := handler.(interface{ GetUniversities(echo.Context) error }).GetUniversities(c); err != nil {
					t.Errorf("リクエストが失敗: %v", err)
				}
				results[index][j] = rec.Code
				responseTimes[index][j] = float64(time.Since(start).Milliseconds())
				time.Sleep(50 * time.Millisecond)
			}
		}(i)
	}

	wg.Wait()

	// 結果を結合
	allResults := make([]int, 0, numGoroutines*numRequests)
	allResponseTimes := make([]float64, 0, numGoroutines*numRequests)

	for i := 0; i < numGoroutines; i++ {
		allResults = append(allResults, results[i]...)
		allResponseTimes = append(allResponseTimes, responseTimes[i]...)
	}

	return AnalyzeRateLimitResults(allResults, allResponseTimes)
}

// AnalyzeRateLimitResults はレート制限テストの結果を分析します
func AnalyzeRateLimitResults(results []int, responseTimes []float64) *RateLimitTestResult {
	var (
		totalRequests   = len(results)
		limitedRequests = 0
		successRequests = 0
		sumResponseTime = 0.0
		maxResponseTime = 0.0
		minResponseTime = responseTimes[0]
	)

	// レスポンス時間のソート
	sortedTimes := make([]float64, len(responseTimes))
	copy(sortedTimes, responseTimes)
	sort.Float64s(sortedTimes)

	// パーセンタイルの計算
	percentile95 := calculatePercentile(sortedTimes, 95)
	percentile99 := calculatePercentile(sortedTimes, 99)

	for i, code := range results {
		if code == http.StatusTooManyRequests {
			limitedRequests++
		} else if code == http.StatusOK {
			successRequests++
		}

		responseTime := responseTimes[i]
		sumResponseTime += responseTime
		if responseTime > maxResponseTime {
			maxResponseTime = responseTime
		}
		if responseTime < minResponseTime {
			minResponseTime = responseTime
		}
	}

	// 比率の計算
	rateLimitRatio := float64(limitedRequests) / float64(totalRequests)
	successRatio := float64(successRequests) / float64(totalRequests)
	throughput := float64(successRequests) / (float64(totalRequests) * 0.001) // 1秒あたりの処理リクエスト数

	return &RateLimitTestResult{
		TotalRequests:    totalRequests,
		LimitedRequests:  limitedRequests,
		SuccessRequests:  successRequests,
		AverageResponse:  sumResponseTime / float64(totalRequests),
		MaxResponseTime:  maxResponseTime,
		MinResponseTime:  minResponseTime,
		ResponseTimes:    responseTimes,
		Percentile95:     percentile95,
		Percentile99:     percentile99,
		RateLimitRatio:   rateLimitRatio,
		SuccessRatio:     successRatio,
		Throughput:       throughput,
	}
}

// calculatePercentile は指定されたパーセンタイル値を計算します
func calculatePercentile(sortedTimes []float64, percentile float64) float64 {
	if len(sortedTimes) == 0 {
		return 0
	}
	index := int(float64(len(sortedTimes)-1) * percentile / 100)
	return sortedTimes[index]
}

// AssertRateLimitResult はレート制限テストの結果を検証します
func AssertRateLimitResult(t *testing.T, result *RateLimitTestResult, expectedMinLimited int, expectedMinSuccess int) {
	if result.LimitedRequests < expectedMinLimited {
		t.Errorf("制限されたリクエスト数が期待値を下回っています: got %d, want at least %d", result.LimitedRequests, expectedMinLimited)
	}

	if result.SuccessRequests < expectedMinSuccess {
		t.Errorf("成功したリクエスト数が期待値を下回っています: got %d, want at least %d", result.SuccessRequests, expectedMinSuccess)
	}

	// 詳細な統計情報の出力
	t.Logf("レート制限テスト結果:")
	t.Logf("  総リクエスト数: %d", result.TotalRequests)
	t.Logf("  制限されたリクエスト: %d (%.2f%%)", result.LimitedRequests, result.RateLimitRatio*100)
	t.Logf("  成功したリクエスト: %d (%.2f%%)", result.SuccessRequests, result.SuccessRatio*100)
	t.Logf("  スループット: %.2f req/s", result.Throughput)
	t.Logf("  レスポンス時間統計:")
	t.Logf("    平均: %.2f ms", result.AverageResponse)
	t.Logf("    最大: %.2f ms", result.MaxResponseTime)
	t.Logf("    最小: %.2f ms", result.MinResponseTime)
	t.Logf("    95パーセンタイル: %.2f ms", result.Percentile95)
	t.Logf("    99パーセンタイル: %.2f ms", result.Percentile99)

	// パフォーマンス警告
	if result.AverageResponse > 1000 {
		t.Logf("警告: 平均レスポンス時間が1秒を超えています")
	}
	if result.Percentile95 > 2000 {
		t.Logf("警告: 95パーセンタイルのレスポンス時間が2秒を超えています")
	}
	if result.RateLimitRatio > 0.5 {
		t.Logf("警告: レート制限の比率が50%%を超えています")
	}
}

// GenerateTestIPAddresses はテスト用のIPアドレスを生成します
func GenerateTestIPAddresses(count int) []string {
	addresses := make([]string, count)
	for i := 0; i < count; i++ {
		addresses[i] = fmt.Sprintf("192.168.1.%d", i+1)
	}
	return addresses
}

// GenerateTestEndpoints はテスト用のエンドポイントを生成します
func GenerateTestEndpoints() []string {
	return []string{
		APIUniversitiesPath,
		"/api/v1/departments",
		"/api/v1/majors",
	}
}

// GenerateTestReport はテスト結果のレポートを生成します
func GenerateTestReport(t *testing.T, testName string, results []*RateLimitTestResult, config struct {
	NumRequests  int
	TimeWindow   int
	MaxRequests  int
	CooldownTime time.Duration
}) *TestReport {
	report := &TestReport{
		Timestamp: time.Now(),
		TestName:  testName,
		Results:   results,
	}
	report.Configuration = config

	// レポートディレクトリの作成
	reportDir := "test_reports"
	if err := os.MkdirAll(reportDir, 0755); err != nil {
		t.Logf("レポートディレクトリの作成に失敗: %v", err)
		return report
	}

	// JSONレポートの生成
	jsonData, err := json.MarshalIndent(report, "", "  ")
	if err != nil {
		t.Logf("JSONレポートの生成に失敗: %v", err)
		return report
	}

	// レポートファイルの保存
	reportFile := filepath.Join(reportDir, fmt.Sprintf("%s_%s.json", testName, time.Now().Format("20060102_150405")))
	if err := os.WriteFile(reportFile, jsonData, 0644); err != nil {
		t.Logf("レポートファイルの保存に失敗: %v", err)
		return report
	}

	// CSVレポートの生成
	if err := generateResponseTimeCSV(t, report); err != nil {
		t.Logf("レスポンス時間CSVの生成に失敗: %v", err)
	}
	if err := generateRateLimitCSV(t, report); err != nil {
		t.Logf("レート制限CSVの生成に失敗: %v", err)
	}

	return report
}

// generateResponseTimeCSV はレスポンス時間のCSVを生成します
func generateResponseTimeCSV(t *testing.T, report *TestReport) error {
	csvFile := filepath.Join("test_reports", fmt.Sprintf("%s_response_time_%s.csv", report.TestName, time.Now().Format("20060102_150405")))
	f, err := os.Create(csvFile)
	if err != nil {
		return err
	}
	defer f.Close()

	writer := csv.NewWriter(f)
	defer writer.Flush()

	// ヘッダーの書き込み
	headers := []string{"リクエスト数"}
	for i := range report.Results {
		headers = append(headers, fmt.Sprintf("テスト%d", i+1))
	}
	if err := writer.Write(headers); err != nil {
		return err
	}

	// データの書き込み
	maxRequests := 0
	for _, result := range report.Results {
		if len(result.ResponseTimes) > maxRequests {
			maxRequests = len(result.ResponseTimes)
		}
	}

	for i := 0; i < maxRequests; i++ {
		row := []string{fmt.Sprintf("%d", i+1)}
		for _, result := range report.Results {
			if i < len(result.ResponseTimes) {
				row = append(row, fmt.Sprintf("%.2f", result.ResponseTimes[i]))
			} else {
				row = append(row, "")
			}
		}
		if err := writer.Write(row); err != nil {
			return err
		}
	}

	return nil
}

// generateRateLimitCSV はレート制限のCSVを生成します
func generateRateLimitCSV(t *testing.T, report *TestReport) error {
	csvFile := filepath.Join("test_reports", fmt.Sprintf("%s_rate_limit_%s.csv", report.TestName, time.Now().Format("20060102_150405")))
	f, err := os.Create(csvFile)
	if err != nil {
		return err
	}
	defer f.Close()

	writer := csv.NewWriter(f)
	defer writer.Flush()

	// ヘッダーの書き込み
	headers := []string{
		"テスト番号",
		"総リクエスト数",
		"制限されたリクエスト数",
		"成功したリクエスト数",
		"レート制限比率 (%)",
		"成功比率 (%)",
		"スループット (req/s)",
		"平均レスポンス時間 (ms)",
		"最大レスポンス時間 (ms)",
		"最小レスポンス時間 (ms)",
		"95パーセンタイル (ms)",
		"99パーセンタイル (ms)",
	}
	if err := writer.Write(headers); err != nil {
		return err
	}

	// データの書き込み
	for i, result := range report.Results {
		row := []string{
			fmt.Sprintf("%d", i+1),
			fmt.Sprintf("%d", result.TotalRequests),
			fmt.Sprintf("%d", result.LimitedRequests),
			fmt.Sprintf("%d", result.SuccessRequests),
			fmt.Sprintf("%.2f", result.RateLimitRatio*100),
			fmt.Sprintf("%.2f", result.SuccessRatio*100),
			fmt.Sprintf("%.2f", result.Throughput),
			fmt.Sprintf("%.2f", result.AverageResponse),
			fmt.Sprintf("%.2f", result.MaxResponseTime),
			fmt.Sprintf("%.2f", result.MinResponseTime),
			fmt.Sprintf("%.2f", result.Percentile95),
			fmt.Sprintf("%.2f", result.Percentile99),
		}
		if err := writer.Write(row); err != nil {
			return err
		}
	}

	return nil
}

// AnalyzeTestTrends はテスト結果のトレンドを分析します
func AnalyzeTestTrends(t *testing.T, report *TestReport) {
	t.Logf("テスト結果のトレンド分析:")
	t.Logf("  テスト実行日時: %s", report.Timestamp.Format("2006-01-02 15:04:05"))
	t.Logf("  テスト名: %s", report.TestName)

	// レスポンス時間のトレンド
	var avgResponseTimes []float64
	for _, result := range report.Results {
		avgResponseTimes = append(avgResponseTimes, result.AverageResponse)
	}

	// レスポンス時間の傾向を分析
	if len(avgResponseTimes) > 1 {
		trend := avgResponseTimes[len(avgResponseTimes)-1] - avgResponseTimes[0]
		if trend > 0 {
			t.Logf("  レスポンス時間の傾向: 増加傾向 (%.2f ms)", trend)
		} else if trend < 0 {
			t.Logf("  レスポンス時間の傾向: 減少傾向 (%.2f ms)", -trend)
		} else {
			t.Logf("  レスポンス時間の傾向: 安定")
		}
	}

	// レート制限の傾向を分析
	var rateLimitRatios []float64
	for _, result := range report.Results {
		rateLimitRatios = append(rateLimitRatios, result.RateLimitRatio)
	}

	if len(rateLimitRatios) > 1 {
		trend := rateLimitRatios[len(rateLimitRatios)-1] - rateLimitRatios[0]
		if trend > 0 {
			t.Logf("  レート制限の傾向: 増加傾向 (%.2f%%)", trend*100)
		} else if trend < 0 {
			t.Logf("  レート制限の傾向: 減少傾向 (%.2f%%)", -trend*100)
		} else {
			t.Logf("  レート制限の傾向: 安定")
		}
	}

	// スループットの傾向を分析
	var throughputs []float64
	for _, result := range report.Results {
		throughputs = append(throughputs, result.Throughput)
	}

	if len(throughputs) > 1 {
		trend := throughputs[len(throughputs)-1] - throughputs[0]
		if trend > 0 {
			t.Logf("  スループットの傾向: 増加傾向 (%.2f req/s)", trend)
		} else if trend < 0 {
			t.Logf("  スループットの傾向: 減少傾向 (%.2f req/s)", -trend)
		} else {
			t.Logf("  スループットの傾向: 安定")
		}
	}

	// 異常値の検出と分析
	t.Logf("\n異常値分析:")
	for i, result := range report.Results {
		// レスポンス時間の異常値検出
		threshold := result.AverageResponse + (2 * result.Percentile95)
		anomalies := 0
		for _, rt := range result.ResponseTimes {
			if rt > threshold {
				anomalies++
			}
		}
		if anomalies > 0 {
			t.Logf("  テスト%d: %d件の異常なレスポンス時間を検出 (閾値: %.2f ms)", i+1, anomalies, threshold)
		}

		// レート制限の異常値検出
		if result.RateLimitRatio > 0.8 {
			t.Logf("  テスト%d: 高いレート制限率を検出 (%.2f%%)", i+1, result.RateLimitRatio*100)
		}

		// スループットの異常値検出
		if result.Throughput < 1.0 {
			t.Logf("  テスト%d: 低いスループットを検出 (%.2f req/s)", i+1, result.Throughput)
		}
	}

	// パフォーマンスメトリクスの集計
	t.Logf("\nパフォーマンスメトリクス:")
	var totalRequests, totalLimited, totalSuccess int
	var totalResponseTime float64
	var maxResponseTime float64
	var minResponseTime = report.Results[0].MinResponseTime

	for _, result := range report.Results {
		totalRequests += result.TotalRequests
		totalLimited += result.LimitedRequests
		totalSuccess += result.SuccessRequests
		totalResponseTime += result.AverageResponse * float64(result.TotalRequests)
		if result.MaxResponseTime > maxResponseTime {
			maxResponseTime = result.MaxResponseTime
		}
		if result.MinResponseTime < minResponseTime {
			minResponseTime = result.MinResponseTime
		}
	}

	avgResponseTime := totalResponseTime / float64(totalRequests)
	successRate := float64(totalSuccess) / float64(totalRequests) * 100
	limitRate := float64(totalLimited) / float64(totalRequests) * 100

	t.Logf("  総リクエスト数: %d", totalRequests)
	t.Logf("  成功率: %.2f%%", successRate)
	t.Logf("  レート制限率: %.2f%%", limitRate)
	t.Logf("  平均レスポンス時間: %.2f ms", avgResponseTime)
	t.Logf("  最大レスポンス時間: %.2f ms", maxResponseTime)
	t.Logf("  最小レスポンス時間: %.2f ms", minResponseTime)

	// パフォーマンス警告
	if avgResponseTime > 1000 {
		t.Logf("\n警告: 全体的な平均レスポンス時間が1秒を超えています")
	}
	if limitRate > 50 {
		t.Logf("警告: 全体的なレート制限率が50%%を超えています")
	}
	if successRate < 50 {
		t.Logf("警告: 全体的な成功率が50%%を下回っています")
	}
}
