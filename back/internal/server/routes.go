// Package server はHTTPサーバーのルーティング設定を提供します。
// APIエンドポイントの定義、リクエストハンドラーの設定、ミドルウェアの適用などの機能を提供します。
package server

import (
	"net/http"
	"time"
	"university-exam-api/internal/config"
	"university-exam-api/internal/handlers/department"
	"university-exam-api/internal/handlers/search"
	"university-exam-api/internal/handlers/subject"
	"university-exam-api/internal/handlers/university"
	"university-exam-api/internal/repositories"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

// パス定数
const (
	departmentPath = "/:universityId/departments/:departmentId" // 学部関連のパス
	subjectPath   = "/:universityId/departments/:departmentId/subjects/:subjectId" // 科目関連のパス
)

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

// Setup はルーティングを設定します。
// リポジトリとハンドラーの初期化、APIエンドポイントの定義を行います。
// エラーが発生した場合は、エラーメッセージを返します。
func (r *Routes) Setup() error {
	// リポジトリの初期化
	universityRepo := repositories.NewUniversityRepository(r.db)

	// ハンドラーの初期化
	universityHandler := university.NewUniversityHandler(universityRepo, 5*time.Second)
	departmentHandler := department.NewDepartmentHandler(universityRepo, 5*time.Second)
	subjectHandler := subject.NewSubjectHandler(universityRepo, 5*time.Second)
	searchHandler := search.NewSearchHandler(universityRepo, 5*time.Second)

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
		universities.GET("", universityHandler.GetUniversities)
		universities.GET("/search", searchHandler.SearchUniversities)
		universities.GET("/:id", universityHandler.GetUniversity)
		universities.POST("", universityHandler.CreateUniversity)
		universities.PUT("/:id", universityHandler.UpdateUniversity)
		universities.DELETE("/:id", universityHandler.DeleteUniversity)

		// 学部関連エンドポイント
		universities.GET(departmentPath, departmentHandler.GetDepartment)
		universities.POST("/:universityId/departments", departmentHandler.CreateDepartment)
		universities.PUT(departmentPath, departmentHandler.UpdateDepartment)
		universities.DELETE(departmentPath, departmentHandler.DeleteDepartment)

		// 科目関連エンドポイント
		universities.GET(subjectPath, subjectHandler.GetSubject)
		universities.POST("/:universityId/departments/:departmentId/subjects", subjectHandler.CreateSubject)
		universities.PUT(subjectPath, subjectHandler.UpdateSubject)
		universities.DELETE(subjectPath, subjectHandler.DeleteSubject)
		universities.PUT("/:universityId/departments/:departmentId/subjects/batch", subjectHandler.UpdateSubjectsBatch)
	}

	return nil
}
