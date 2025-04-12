// Package admission_info は募集情報関連のHTTPリクエストを処理するハンドラーを提供します。
// 募集情報の取得、作成、更新、削除のエンドポイントを実装しています。
package admission_info

import (
	"context"
	"encoding/json"
	"net/http"
	"time"
	"university-exam-api/internal/domain/models"
	applogger "university-exam-api/internal/logger"
	"university-exam-api/internal/pkg/errors"
	"university-exam-api/internal/pkg/logging"
	"university-exam-api/internal/pkg/validation"
	"university-exam-api/internal/repositories"

	"github.com/labstack/echo/v4"
	"github.com/prometheus/client_golang/prometheus"
)

const (
	// ErrMsgGetAdmissionInfo は募集情報取得失敗時のエラーメッセージフォーマットです
	ErrMsgGetAdmissionInfo    = "募集情報の取得に失敗しました (入試日程ID: %d, 募集情報ID: %d): %v"
	// ErrMsgCreateAdmissionInfo は募集情報作成失敗時のエラーメッセージフォーマットです
	ErrMsgCreateAdmissionInfo = "募集情報の作成に失敗しました: %v"
	// ErrMsgUpdateAdmissionInfo は募集情報更新失敗時のエラーメッセージフォーマットです
	ErrMsgUpdateAdmissionInfo = "募集情報ID %dの更新に失敗しました: %v"
	// ErrMsgDeleteAdmissionInfo は募集情報削除失敗時のエラーメッセージフォーマットです
	ErrMsgDeleteAdmissionInfo = "募集情報ID %dの削除に失敗しました: %v"
	// AdmissionInfoPath は募集情報のエンドポイントパスです
	AdmissionInfoPath         = "/admission-info"
)

// Handler は募集情報関連のHTTPリクエストを処理
type Handler struct {
	repo    repositories.IUniversityRepository
	timeout time.Duration
	// メトリクス
	requestDuration *prometheus.HistogramVec
	errorCounter   *prometheus.CounterVec
	requestSize    *prometheus.HistogramVec
	responseSize   *prometheus.HistogramVec
	dbDuration     *prometheus.HistogramVec
}

// NewHandler は新しいAdmissionHandlerインスタンスを生成
func NewHandler(repo repositories.IUniversityRepository, timeout time.Duration) *Handler {
	// メトリクスの初期化
	requestDuration := prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "admission_info_request_duration_seconds",
			Help:    "HTTPリクエストの処理時間（秒）",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"method", "path"},
	)

	errorCounter := prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "admission_info_errors_total",
			Help: "エラーの総数",
		},
		[]string{"method", "path", "error_type"},
	)

	requestSize := prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "admission_info_request_size_bytes",
			Help:    "HTTPリクエストのサイズ（バイト）",
			Buckets: prometheus.ExponentialBuckets(100, 10, 8),
		},
		[]string{"method", "path"},
	)

	responseSize := prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "admission_info_response_size_bytes",
			Help:    "HTTPレスポンスのサイズ（バイト）",
			Buckets: prometheus.ExponentialBuckets(100, 10, 8),
		},
		[]string{"method", "path"},
	)

	dbDuration := prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "admission_info_db_duration_seconds",
			Help:    "データベース操作の処理時間（秒）",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"operation"},
	)

	prometheus.MustRegister(requestDuration)
	prometheus.MustRegister(errorCounter)
	prometheus.MustRegister(requestSize)
	prometheus.MustRegister(responseSize)
	prometheus.MustRegister(dbDuration)

	return &Handler{
		repo:           repo,
		timeout:        timeout,
		requestDuration: requestDuration,
		errorCounter:   errorCounter,
		requestSize:    requestSize,
		responseSize:   responseSize,
		dbDuration:     dbDuration,
	}
}

// bindRequest はリクエストボディのバインディングを共通化
func (h *Handler) bindRequest(ctx context.Context, c echo.Context, data interface{}) error {
	if err := c.Bind(data); err != nil {
		applogger.Error(ctx, errors.MsgBindRequestFailed, err)
		return errors.NewValidationError(errors.MsgBindRequestFailed)
	}

	return nil
}

// validateScheduleAndInfoID はスケジュールIDと情報IDのバリデーションを共通化
func (h *Handler) validateScheduleAndInfoID(ctx context.Context, c echo.Context) (uint, uint, error) {
	scheduleID, err := validation.ValidateScheduleID(ctx, c.Param("scheduleId"))
	if err != nil {
		return 0, 0, errors.NewValidationError("無効な入試日程ID形式です")
	}

	infoID, err := validation.ValidateAdmissionInfoID(ctx, c.Param("infoId"))
	if err != nil {
		return 0, 0, errors.NewValidationError("無効な募集情報ID形式です")
	}

	return scheduleID, infoID, nil
}

// GetAdmissionInfo は指定された募集情報を取得
func (h *Handler) GetAdmissionInfo(c echo.Context) error {
	start := time.Now()
	defer func() {
		h.requestDuration.WithLabelValues("GET", AdmissionInfoPath).Observe(time.Since(start).Seconds())
	}()

	// リクエストサイズの計測
	if contentLength := c.Request().ContentLength; contentLength > 0 {
		h.requestSize.WithLabelValues("GET", AdmissionInfoPath).Observe(float64(contentLength))
	}

	ctx, cancel := context.WithTimeout(c.Request().Context(), h.timeout)
	defer cancel()

	scheduleID, infoID, err := h.validateScheduleAndInfoID(ctx, c)
	if err != nil {
		h.errorCounter.WithLabelValues("GET", AdmissionInfoPath, "validation").Inc()
		return errors.HandleError(c, err)
	}

	// データベース操作の処理時間計測
	dbStart := time.Now()
	info, err := h.repo.FindAdmissionInfo(scheduleID, infoID)
	h.dbDuration.WithLabelValues("find").Observe(time.Since(dbStart).Seconds())

	if err != nil {
		h.errorCounter.WithLabelValues("GET", AdmissionInfoPath, "database").Inc()
		applogger.Error(ctx, ErrMsgGetAdmissionInfo, scheduleID, infoID, err)

		return errors.HandleError(c, err)
	}

	// レスポンスサイズの計測
	if responseData, err := json.Marshal(info); err == nil {
		h.responseSize.WithLabelValues("GET", AdmissionInfoPath).Observe(float64(len(responseData)))
	}

	applogger.Info(ctx, logging.LogGetAdmissionInfoSuccess, scheduleID, infoID)

	return c.JSON(http.StatusOK, info)
}

// CreateAdmissionInfo は新しい募集情報を作成
func (h *Handler) CreateAdmissionInfo(c echo.Context) error {
	ctx, cancel := context.WithTimeout(c.Request().Context(), h.timeout)
	defer cancel()

	scheduleID, err := validation.ValidateScheduleID(ctx, c.Param("scheduleId"))
	if err != nil {
		return errors.NewValidationError("無効な入試日程ID形式です")
	}

	var info models.AdmissionInfo
	if err := h.bindRequest(ctx, c, &info); err != nil {
		return err
	}

	info.AdmissionScheduleID = scheduleID
	if err := h.repo.CreateAdmissionInfo(&info); err != nil {
		applogger.Error(ctx, ErrMsgCreateAdmissionInfo, err)

		return errors.HandleError(c, err)
	}

	applogger.Info(ctx, logging.LogCreateAdmissionInfoSuccess, info.ID)

	return c.JSON(http.StatusCreated, info)
}

// UpdateAdmissionInfo は既存の募集情報を更新
func (h *Handler) UpdateAdmissionInfo(c echo.Context) error {
	ctx, cancel := context.WithTimeout(c.Request().Context(), h.timeout)
	defer cancel()

	scheduleID, infoID, err := h.validateScheduleAndInfoID(ctx, c)
	if err != nil {
		return errors.HandleError(c, err)
	}

	var info models.AdmissionInfo
	if err := h.bindRequest(ctx, c, &info); err != nil {
		return err
	}

	info.ID = infoID
	info.AdmissionScheduleID = scheduleID

	if err := h.repo.UpdateAdmissionInfo(&info); err != nil {
		applogger.Error(ctx, ErrMsgUpdateAdmissionInfo, infoID, err)
		return errors.HandleError(c, err)
	}

	applogger.Info(ctx, logging.LogUpdateAdmissionInfoSuccess, infoID)

	return c.JSON(http.StatusOK, info)
}

// DeleteAdmissionInfo は募集情報を削除
func (h *Handler) DeleteAdmissionInfo(c echo.Context) error {
	ctx, cancel := context.WithTimeout(c.Request().Context(), h.timeout)
	defer cancel()

	infoID, err := validation.ValidateAdmissionInfoID(ctx, c.Param("infoId"))
	if err != nil {
		return errors.NewValidationError("無効な募集情報ID形式です")
	}

	if err := h.repo.DeleteAdmissionInfo(infoID); err != nil {
		applogger.Error(ctx, ErrMsgDeleteAdmissionInfo, infoID, err)

		return errors.HandleError(c, err)
	}

	applogger.Info(ctx, logging.LogDeleteAdmissionInfoSuccess, infoID)

	return c.NoContent(http.StatusNoContent)
}
