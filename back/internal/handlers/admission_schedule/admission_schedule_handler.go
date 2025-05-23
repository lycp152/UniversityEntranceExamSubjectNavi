// Package admissionschedule は入試日程関連のHTTPリクエストを処理するハンドラーを提供します。
// このパッケージは以下の機能を提供します：
// - 入試日程の取得、作成、更新、削除
// - リクエストのバリデーション
// - エラーハンドリング
// - パフォーマンスメトリクスの収集
package admissionschedule

import (
	"context"
	"net/http"
	"time"
	"university-exam-api/internal/domain/models"
	applogger "university-exam-api/internal/logger"
	"university-exam-api/internal/pkg/errors"
	"university-exam-api/internal/pkg/validation"
	"university-exam-api/internal/repositories"

	"github.com/labstack/echo/v4"
	"github.com/prometheus/client_golang/prometheus"
)

// Handler は入試日程関連のHTTPリクエストを処理する構造体です。
// この構造体は以下の機能を提供します：
// - リポジトリとの連携
// - リクエストタイムアウトの管理
// - パフォーマンスメトリクスの収集
type Handler struct {
	repo            repositories.IUniversityRepository
	timeout         time.Duration
	requestDuration *prometheus.HistogramVec
	errorCounter    *prometheus.CounterVec
	dbDuration      *prometheus.HistogramVec
}

// NewHandler は新しいHandlerインスタンスを生成します。
// この関数は以下の処理を行います：
// - リポジトリの初期化
// - タイムアウトの設定
// - メトリクスの初期化と登録
func NewHandler(
	repo repositories.IUniversityRepository,
	timeout time.Duration,
) *Handler {
	return &Handler{
		repo:    repo,
		timeout: timeout,
		requestDuration: prometheus.NewHistogramVec(
			prometheus.HistogramOpts{
				Name:    "admission_schedule_request_duration_seconds",
				Help:    "HTTPリクエストの処理時間（秒）",
				Buckets: prometheus.DefBuckets,
			},
			[]string{"method", "path", "status"},
		),
		errorCounter: prometheus.NewCounterVec(
			prometheus.CounterOpts{
				Name: "admission_schedule_errors_total",
				Help: "エラーの総数",
			},
			[]string{"method", "path", "error_type"},
		),
		dbDuration: prometheus.NewHistogramVec(
			prometheus.HistogramOpts{
				Name:    "admission_schedule_db_duration_seconds",
				Help:    "データベース操作の処理時間（秒）",
				Buckets: prometheus.DefBuckets,
			},
			[]string{"operation"},
		),
	}
}

// bindRequest はリクエストボディのバインディングを共通化します。
// この関数は以下の処理を行います：
// - リクエストボディのバインディング
// - エラーログの記録
// - バリデーションエラーの生成
func (h *Handler) bindRequest(ctx context.Context, c echo.Context, data interface{}) error {
	if err := c.Bind(data); err != nil {
		applogger.Error(ctx, errors.MsgBindRequestFailed, err)
		return errors.HandleError(c, err)
	}

	return nil
}

// validateMajorAndScheduleID は学科IDとスケジュールIDのバリデーションを共通化します。
// この関数は以下の処理を行います：
// - 学科IDの検証
// - スケジュールIDの検証
// - エラーハンドリング
func (h *Handler) validateMajorAndScheduleID(ctx context.Context, c echo.Context) (uint, uint, error) {
	majorID, err := validation.ValidateMajorID(ctx, c.Param("majorId"))
	if err != nil {
		return 0, 0, err
	}

	scheduleID, err := validation.ValidateScheduleID(ctx, c.Param("scheduleId"))
	if err != nil {
		return 0, 0, err
	}

	return majorID, scheduleID, nil
}

// UpdateAdmissionSchedule は入試日程を更新します。
// この関数は以下の処理を行います：
// - パラメータの検証
// - リクエストのバリデーション
// - データベースの更新
// - パフォーマンスメトリクスの収集
// - エラーハンドリング
func (h *Handler) UpdateAdmissionSchedule(c echo.Context) error {
	start := time.Now()
	ctx, cancel := context.WithTimeout(c.Request().Context(), h.timeout)

	defer cancel()

	majorID, scheduleID, err := h.validateMajorAndScheduleID(ctx, c)
	if err != nil {
		h.errorCounter.WithLabelValues(c.Request().Method, c.Path(), "validation").Inc()
		return errors.HandleError(c, err)
	}

	var schedule models.AdmissionSchedule
	if err := h.bindRequest(ctx, c, &schedule); err != nil {
		h.errorCounter.WithLabelValues(c.Request().Method, c.Path(), "binding").Inc()
		return err
	}

	schedule.ID = scheduleID
	schedule.MajorID = majorID

	dbStart := time.Now()
	err = h.repo.UpdateAdmissionSchedule(&schedule)

	if err != nil {
		h.errorCounter.WithLabelValues(c.Request().Method, c.Path(), "database").Inc()
		applogger.Error(ctx, "入試日程ID %dの更新に失敗しました: %v", scheduleID, err)

		return errors.HandleError(c, err)
	}

	h.dbDuration.WithLabelValues("update").Observe(time.Since(dbStart).Seconds())

	applogger.Info(ctx, "入試日程ID %dを更新しました", scheduleID)
	h.requestDuration.WithLabelValues(c.Request().Method, c.Path(), "200").Observe(time.Since(start).Seconds())

	return c.JSON(http.StatusOK, schedule)
}
