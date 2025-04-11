// Package server はHTTPサーバーのルーティング設定を提供します。
// APIエンドポイントの定義、リクエストハンドラーの設定、ミドルウェアの適用などの機能を提供します。
package server

import (
	"context"
	"net/http"
	"regexp"
	"time"
	"university-exam-api/internal/config"
	"university-exam-api/internal/handlers/department"
	"university-exam-api/internal/handlers/search"
	"university-exam-api/internal/handlers/subject"
	"university-exam-api/internal/handlers/university"
	"university-exam-api/internal/repositories"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"gorm.io/gorm"
)

// パス定数
const (
	departmentPath = "/:universityId/departments/:departmentId" // 学部関連のパス
	subjectPath   = "/:universityId/departments/:departmentId/subjects/:subjectId" // 科目関連のパス
	departmentIdParam = "/:departmentId" // 学部IDパラメータ
	subjectIdParam = "/:subjectId" // 科目IDパラメータ
)

// タイムアウト定数
const (
	requestTimeout = 10 * time.Second
)

// バリデーション定数
var (
	universityIdRegex = regexp.MustCompile(`^[0-9]+$`)
	departmentIdRegex = regexp.MustCompile(`^[0-9]+$`)
	subjectIdRegex   = regexp.MustCompile(`^[0-9]+$`)
)

// エラーレスポンスの構造体
type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message"`
	Code    int    `json:"code"`
}

// Routes はルーティングの設定を管理する構造体です。
// Echoインスタンス、データベース接続、アプリケーション設定を保持します。
type Routes struct {
	echo *echo.Echo
	db   *gorm.DB
	cfg  *config.Config
}

// NewRoutes は新しいルーティングインスタンスを作成します。
// e: Echoインスタンス
// db: データベース接続
// cfg: アプリケーション設定
// 戻り値: 新しいRoutesインスタンス
func NewRoutes(e *echo.Echo, db *gorm.DB, cfg *config.Config) *Routes {
	return &Routes{
		echo: e,
		db:   db,
		cfg:  cfg,
	}
}

// validatePathParams はパスパラメータのバリデーションを行います。
func validatePathParams(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		universityId := c.Param("universityId")
		departmentId := c.Param("departmentId")
		subjectId := c.Param("subjectId")

		if universityId != "" && !universityIdRegex.MatchString(universityId) {
			return c.JSON(http.StatusBadRequest, ErrorResponse{
				Error:   "Invalid University ID",
				Message: "大学IDは数値である必要があります",
				Code:    http.StatusBadRequest,
			})
		}

		if departmentId != "" && !departmentIdRegex.MatchString(departmentId) {
			return c.JSON(http.StatusBadRequest, ErrorResponse{
				Error:   "Invalid Department ID",
				Message: "学部IDは数値である必要があります",
				Code:    http.StatusBadRequest,
			})
		}

		if subjectId != "" && !subjectIdRegex.MatchString(subjectId) {
			return c.JSON(http.StatusBadRequest, ErrorResponse{
				Error:   "Invalid Subject ID",
				Message: "科目IDは数値である必要があります",
				Code:    http.StatusBadRequest,
			})
		}

		return next(c)
	}
}

// validateRequestBody はリクエストボディのバリデーションを行います。
func validateRequestBody(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		if c.Request().ContentLength == 0 {
			return next(c)
		}

		contentType := c.Request().Header.Get("Content-Type")
		if contentType != "application/json" {
			return c.JSON(http.StatusUnsupportedMediaType, ErrorResponse{
				Error:   "Unsupported Media Type",
				Message: "Content-Typeはapplication/jsonである必要があります",
				Code:    http.StatusUnsupportedMediaType,
			})
		}

		// リクエストボディの最大サイズを制限
		if c.Request().ContentLength > 1024*1024 { // 1MB
			return c.JSON(http.StatusRequestEntityTooLarge, ErrorResponse{
				Error:   "Request Entity Too Large",
				Message: "リクエストボディのサイズが大きすぎます",
				Code:    http.StatusRequestEntityTooLarge,
			})
		}

		// リクエストボディのバリデーション
		if err := c.Request().ParseForm(); err != nil {
			return c.JSON(http.StatusBadRequest, ErrorResponse{
				Error:   "Invalid Request Body",
				Message: "リクエストボディの形式が不正です",
				Code:    http.StatusBadRequest,
			})
		}

		// リクエストボディのJSONバリデーション
		if err := c.Bind(nil); err != nil {
			return c.JSON(http.StatusBadRequest, ErrorResponse{
				Error:   "Invalid JSON",
				Message: "JSONの形式が不正です",
				Code:    http.StatusBadRequest,
			})
		}

		return next(c)
	}
}

// Setup はルーティングを設定します。
// リポジトリとハンドラーの初期化、APIエンドポイントの定義を行います。
// エラーが発生した場合は、エラーメッセージを返します。
func (r *Routes) Setup() error {
	// リポジトリの初期化
	universityRepo := repositories.NewUniversityRepository(r.db)

	// ハンドラーの初期化
	universityHandler := university.NewUniversityHandler(universityRepo, requestTimeout)
	departmentHandler := department.NewDepartmentHandler(universityRepo, requestTimeout)
	subjectHandler := subject.NewSubjectHandler(universityRepo, requestTimeout)
	searchHandler := search.NewSearchHandler(universityRepo, requestTimeout)

	// グローバルミドルウェアの設定
	r.echo.Use(middleware.Logger())
	r.echo.Use(middleware.Recover())
	r.echo.Use(middleware.CORS())
	r.echo.Use(middleware.TimeoutWithConfig(middleware.TimeoutConfig{
		Timeout: requestTimeout,
	}))
	r.echo.Use(middleware.RateLimiter(middleware.NewRateLimiterMemoryStore(20)))
	r.echo.Use(middleware.SecureWithConfig(middleware.SecureConfig{
		XSSProtection:         "1; mode=block",
		ContentTypeNosniff:    "nosniff",
		XFrameOptions:         "SAMEORIGIN",
		HSTSMaxAge:            31536000,
		ContentSecurityPolicy: "default-src 'self'",
	}))

	// データベースコンテキストの設定
	r.echo.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			ctx, cancel := context.WithTimeout(c.Request().Context(), requestTimeout)
			defer cancel()

			db := r.db.WithContext(ctx)
			c.Set("db", db)

			return next(c)
		}
	})

	// カスタムエラーハンドラーの設定
	r.echo.HTTPErrorHandler = func(err error, c echo.Context) {
		code := http.StatusInternalServerError
		message := "Internal Server Error"

		if he, ok := err.(*echo.HTTPError); ok {
			code = he.Code
			message = he.Message.(string)
		}

		// GORMのエラーを適切に処理
		if err == gorm.ErrRecordNotFound {
			code = http.StatusNotFound
			message = "リソースが見つかりません"
		}

		// バリデーションエラーの処理
		if err == echo.ErrBadRequest {
			code = http.StatusBadRequest
			message = "リクエストが不正です"
		}

		// タイムアウトエラーの処理
		if err == context.DeadlineExceeded {
			code = http.StatusRequestTimeout
			message = "リクエストがタイムアウトしました"
		}

		// データベースエラーの処理
		if err == gorm.ErrInvalidDB {
			code = http.StatusServiceUnavailable
			message = "データベースに接続できません"
		}

		// バリデーションエラーの詳細な処理
		if err == echo.ErrBadRequest {
			code = http.StatusBadRequest
			message = "リクエストの形式が不正です"
		}

		if err := c.JSON(code, ErrorResponse{
			Error:   http.StatusText(code),
			Message: message,
			Code:    code,
		}); err != nil {
			c.Logger().Errorf("レスポンスの書き込みに失敗しました: %v", err)
		}
	}

	// APIルーティングの設定
	api := r.echo.Group("/api")
	{
		// ヘルスチェックエンドポイント
		api.GET("/health", func(c echo.Context) error {
			return c.JSON(http.StatusOK, map[string]string{
				"status": "ok",
				"env":    r.cfg.Env,
			})
		})

		// 大学関連エンドポイント
		universities := api.Group("/universities")
		{
			// 検索エンドポイント
			universities.GET("/search", searchHandler.SearchUniversities)

			// 大学CRUDエンドポイント
			universities.GET("", universityHandler.GetUniversities)
			universities.GET("/:id", validatePathParams(universityHandler.GetUniversity))
			universities.POST("", validateRequestBody(universityHandler.CreateUniversity))
			universities.PUT("/:id", validatePathParams(validateRequestBody(universityHandler.UpdateUniversity)))
			universities.DELETE("/:id", validatePathParams(universityHandler.DeleteUniversity))

			// 学部関連エンドポイント
			departments := universities.Group("/:universityId/departments")
			{
				departments.GET(departmentIdParam, validatePathParams(departmentHandler.GetDepartment))
				departments.POST("", validateRequestBody(departmentHandler.CreateDepartment))
				departments.PUT(departmentIdParam, validatePathParams(validateRequestBody(departmentHandler.UpdateDepartment)))
				departments.DELETE(departmentIdParam, validatePathParams(departmentHandler.DeleteDepartment))

				// 科目関連エンドポイント
				subjects := departments.Group("/:departmentId/subjects")
				{
					subjects.GET(subjectIdParam, validatePathParams(subjectHandler.GetSubject))
					subjects.POST("", validateRequestBody(subjectHandler.CreateSubject))
					subjects.PUT(subjectIdParam, validatePathParams(validateRequestBody(subjectHandler.UpdateSubject)))
					subjects.DELETE(subjectIdParam, validatePathParams(subjectHandler.DeleteSubject))
					subjects.PUT("/batch", validateRequestBody(subjectHandler.UpdateSubjectsBatch))
				}
			}
		}
	}

	return nil
}
