// Package department は学部関連のHTTPリクエストを処理するハンドラーを提供します。
// このパッケージは以下の機能を提供します：
// - 学部の取得、作成、更新、削除
// - リクエストのバリデーション
// - エラーハンドリング
// - パフォーマンスメトリクスの収集
package department

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

// Handler は学部関連のHTTPリクエストを処理する構造体です。
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

// NewDepartmentHandler は新しいHandlerインスタンスを生成します。
// この関数は以下の処理を行います：
// - リポジトリの初期化
// - タイムアウトの設定
// - メトリクスの初期化と登録
func NewDepartmentHandler(repo repositories.IUniversityRepository, timeout time.Duration) *Handler {
	return &Handler{
		repo:    repo,
		timeout: timeout,
		requestDuration: prometheus.NewHistogramVec(
			prometheus.HistogramOpts{
				Name:    "department_request_duration_seconds",
				Help:    "HTTPリクエストの処理時間（秒）",
				Buckets: prometheus.DefBuckets,
			},
			[]string{"method", "path", "status"},
		),
		errorCounter: prometheus.NewCounterVec(
			prometheus.CounterOpts{
				Name: "department_errors_total",
				Help: "エラーの総数",
			},
			[]string{"method", "path", "error_type"},
		),
		dbDuration: prometheus.NewHistogramVec(
			prometheus.HistogramOpts{
				Name:    "department_db_duration_seconds",
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

// validateDepartmentRequest は学部リクエストのバリデーションを共通化します。
// この関数は以下の処理を行います：
// - 学部名の検証
// - 大学IDの検証
// - エラーメッセージの生成
func (h *Handler) validateDepartmentRequest(department *models.Department) error {
	if department.Name == "" {
		return errors.NewValidationError("学部名は必須です")
	}

	if len(department.Name) > 100 {
		return errors.NewValidationError("学部名は100文字以内で入力してください")
	}

	if department.UniversityID == 0 {
		return errors.NewValidationError("大学IDは必須です")
	}

	return nil
}

// validateUniversityAndDepartmentID は大学IDと学部IDのバリデーションを共通化します。
// この関数は以下の処理を行います：
// - 大学IDの検証
// - 学部IDの検証
// - エラーハンドリング
func (h *Handler) validateUniversityAndDepartmentID(ctx context.Context, c echo.Context) (uint, uint, error) {
	universityID, err := validation.ValidateUniversityID(ctx, c.Param("universityId"))
	if err != nil {
		return 0, 0, err
	}

	departmentID, err := validation.ValidateDepartmentID(ctx, c.Param("departmentId"))
	if err != nil {
		return 0, 0, err
	}

	return universityID, departmentID, nil
}

// GetDepartment は指定された学部の情報を取得します。
// この関数は以下の処理を行います：
// - パラメータの検証
// - データベースからの取得
// - パフォーマンスメトリクスの収集
// - エラーハンドリング
func (h *Handler) GetDepartment(c echo.Context) error {
	start := time.Now()
	ctx, cancel := context.WithTimeout(c.Request().Context(), h.timeout)

	defer cancel()

	universityID, departmentID, err := h.validateUniversityAndDepartmentID(ctx, c)

	if err != nil {
		h.errorCounter.WithLabelValues(c.Request().Method, c.Path(), "validation").Inc()

		return errors.HandleError(c, err)
	}

	dbStart := time.Now()
	department, err := h.repo.FindDepartment(universityID, departmentID)

	if err != nil {
		h.errorCounter.WithLabelValues(c.Request().Method, c.Path(), "database").Inc()
		applogger.Error(ctx, "学部の取得に失敗しました (大学ID: %d, 学部ID: %d): %v", universityID, departmentID, err)

		return errors.HandleError(c, err)
	}

	h.dbDuration.WithLabelValues("find").Observe(time.Since(dbStart).Seconds())

	applogger.Info(ctx, applogger.LogGetDepartmentSuccess, universityID, departmentID)
	h.requestDuration.WithLabelValues(c.Request().Method, c.Path(), "200").Observe(time.Since(start).Seconds())

	return c.JSON(http.StatusOK, map[string]interface{}{
		"data": department,
	})
}

// CreateDepartment は新しい学部を作成します。
// この関数は以下の処理を行います：
// - リクエストのバリデーション
// - データベースへの保存
// - エラーハンドリング
func (h *Handler) CreateDepartment(c echo.Context) error {
	ctx, cancel := context.WithTimeout(c.Request().Context(), h.timeout)
	defer cancel()

	universityID, err := validation.ValidateUniversityID(ctx, c.Param("universityId"))
	if err != nil {
		return errors.HandleError(c, err)
	}

	var department models.Department
	if err := h.bindRequest(ctx, c, &department); err != nil {
		return err
	}

	if err := h.validateDepartmentRequest(&department); err != nil {
		return errors.HandleError(c, err)
	}

	department.UniversityID = universityID
	if err := h.repo.CreateDepartment(&department); err != nil {
		applogger.Error(ctx, "学部の作成に失敗しました: %v", err)
		return errors.HandleError(c, err)
	}

	applogger.Info(ctx, applogger.LogCreateDepartmentSuccess, department.ID)

	return c.JSON(http.StatusCreated, map[string]interface{}{
		"data": department,
	})
}

// UpdateDepartment は既存の学部を更新します。
// この関数は以下の処理を行います：
// - パラメータの検証
// - リクエストのバリデーション
// - データベースの更新
// - エラーハンドリング
func (h *Handler) UpdateDepartment(c echo.Context) error {
	ctx, cancel := context.WithTimeout(c.Request().Context(), h.timeout)
	defer cancel()

	_, departmentID, err := h.validateUniversityAndDepartmentID(ctx, c)
	if err != nil {
		return errors.HandleError(c, err)
	}

	var department models.Department
	if err := h.bindRequest(ctx, c, &department); err != nil {
		return err
	}

	if err := h.validateDepartmentRequest(&department); err != nil {
		return errors.HandleError(c, err)
	}

	department.ID = departmentID
	if err := h.repo.UpdateDepartment(&department); err != nil {
		applogger.Error(ctx, "学部ID %dの更新に失敗しました: %v", departmentID, err)
		return errors.HandleError(c, err)
	}

	applogger.Info(ctx, applogger.LogUpdateDepartmentSuccess, departmentID)

	return c.JSON(http.StatusOK, map[string]interface{}{
		"data": department,
	})
}

// DeleteDepartment は学部を削除します。
// この関数は以下の処理を行います：
// - パラメータの検証
// - データベースからの削除
// - エラーハンドリング
func (h *Handler) DeleteDepartment(c echo.Context) error {
	ctx, cancel := context.WithTimeout(c.Request().Context(), h.timeout)
	defer cancel()

	_, departmentID, err := h.validateUniversityAndDepartmentID(ctx, c)
	if err != nil {
		return errors.HandleError(c, err)
	}

	if err := h.repo.DeleteDepartment(departmentID); err != nil {
		applogger.Error(ctx, "学部ID %dの削除に失敗しました: %v", departmentID, err)
		return errors.HandleError(c, err)
	}

	applogger.Info(ctx, applogger.LogDeleteDepartmentSuccess, departmentID)

	return c.NoContent(http.StatusNoContent)
}
