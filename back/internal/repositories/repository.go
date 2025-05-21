// Package repositories はデータベースのリポジトリ機能を提供します。
// このパッケージは以下の機能を提供します：
// - 大学データの管理
// - 学部データの管理
// - 科目データの管理
// - 学科データの管理
// - 入試情報の管理
// - キャッシュの管理
package repositories

import (
	"context"
	"errors"
	"fmt"
	"math"
	"strings"
	"time"
	"university-exam-api/internal/domain/models"
	appErrors "university-exam-api/internal/errors"
	"university-exam-api/internal/infrastructure/cache"
	applogger "university-exam-api/internal/logger"

	"github.com/microcosm-cc/bluemonday"
	"gorm.io/gorm"
)

const (
	preloadPath = "Departments.Majors.AdmissionSchedules.TestTypes.Subjects"
	departmentIDQuery = "department_id = ?"
	testTypeIDQuery = "test_type_id = ?"
	displayOrderASC = "display_order ASC"
	notDeletedCondition = "deleted_at IS NULL"
)

// エラーメッセージの定数化
const (
	errEmptyQuery = "検索クエリが空です"
	errInvalidQuery = "検索クエリは1文字以上である必要があります"
	errSearchFailed = "検索中にエラーが発生しました: %w"
)

// IUniversityFinder は大学の検索に関するインターフェースを定義します。
// このインターフェースは以下の機能を提供します：
// - 全大学の取得
// - IDによる大学の取得
// - 検索クエリによる大学の取得
type IUniversityFinder interface {
	FindAll(ctx context.Context) ([]models.University, error)
	FindByID(id uint) (*models.University, error)
	Search(query string) ([]models.University, error)
}

// IUniversityManager は大学の管理に関するインターフェースを定義します。
// このインターフェースは以下の機能を提供します：
// - 大学の作成
// - 大学の更新
// - 大学の削除
type IUniversityManager interface {
	Create(university *models.University) error
	Update(university *models.University) error
	Delete(id uint) error
}

// IDepartmentManager は学部の管理に関するインターフェースを定義します。
// このインターフェースは以下の機能を提供します：
// - 学部の作成
// - 学部の更新
// - 学部の削除
type IDepartmentManager interface {
	CreateDepartment(department *models.Department) error
	UpdateDepartment(department *models.Department) error
	DeleteDepartment(id uint) error
}

// ISubjectManager は科目の管理に関するインターフェースを定義します。
// このインターフェースは以下の機能を提供します：
// - 科目の作成
// - 科目の更新
// - 科目の削除
type ISubjectManager interface {
	CreateSubject(subject *models.Subject) error
	UpdateSubject(subject *models.Subject) error
	DeleteSubject(id uint) error
}

// IMajorManager は学科の管理に関するインターフェースを定義します。
// このインターフェースは以下の機能を提供します：
// - 学科の作成
// - 学科の更新
// - 学科の削除
type IMajorManager interface {
	CreateMajor(major *models.Major) error
	UpdateMajor(major *models.Major) error
	DeleteMajor(id uint) error
}

// IAdmissionInfoManager は入試情報の管理に関するインターフェースを定義します。
// このインターフェースは以下の機能を提供します：
// - 入試情報の作成
// - 入試情報の更新
// - 入試情報の削除
type IAdmissionInfoManager interface {
	CreateAdmissionInfo(info *models.AdmissionInfo) error
	DeleteAdmissionInfo(id uint) error
	UpdateAdmissionInfo(info *models.AdmissionInfo) error
}

// IUniversityRepository は大学リポジトリのメインインターフェースを定義します。
// このインターフェースは以下の機能を提供します：
// - 大学の検索と管理
// - 学部の検索と管理
// - 科目の検索と管理
// - 学科の検索と管理
// - 入試情報の検索と管理
type IUniversityRepository interface {
	IUniversityFinder
	IUniversityManager
	IDepartmentManager
	ISubjectManager
	IMajorManager
	IAdmissionInfoManager
	FindDepartment(universityID, departmentID uint) (*models.Department, error)
	FindSubject(departmentID, subjectID uint) (*models.Subject, error)
	FindMajor(departmentID, majorID uint) (*models.Major, error)
	FindAdmissionInfo(scheduleID, infoID uint) (*models.AdmissionInfo, error)
	UpdateSubjectsBatch(testTypeID uint, subjects []models.Subject) error
	UpdateAdmissionSchedule(schedule *models.AdmissionSchedule) error
}

// UniversityRepository は大学リポジトリの実装です。
// この構造体は以下の機能を提供します：
// - データベース接続の管理
// - キャッシュの管理
// - トランザクションの管理
type universityRepository struct {
	db    *gorm.DB
	cache *cache.Manager
}

// NewUniversityRepository はリポジトリのインスタンスを生成します。
// この関数は以下の処理を行います：
// - データベース接続の初期化
// - キャッシュマネージャーの初期化
// - リポジトリの生成
func NewUniversityRepository(db *gorm.DB) IUniversityRepository {
	// コネクションプールの設定
	sqlDB, err := db.DB()
	if err != nil {
		panic(err)
	}

	// 最大接続数の設定
	sqlDB.SetMaxOpenConns(25)
	sqlDB.SetMaxIdleConns(5)
	sqlDB.SetConnMaxLifetime(5 * time.Minute)

	return &universityRepository{
		db:    db,
		cache: cache.NewCacheManager(),
	}
}

// applyPreloads はプリロードを最適化して適用します。
// この関数は以下の処理を行います：
// - 必要なカラムの選択
// - JOINの最適化
// - ソート順の設定
func (r *universityRepository) applyPreloads(query *gorm.DB) *gorm.DB {
	if query == nil {
		return nil
	}

	// プリロードの最適化: 必要なカラムのみを選択し、JOINを効率化
	return query.
		Preload("Departments", func(db *gorm.DB) *gorm.DB {
			return db.
				Select("id, university_id, name, version").
				Where(notDeletedCondition).
				Order("departments.name ASC")
		}).
		Preload("Departments.Majors", func(db *gorm.DB) *gorm.DB {
			return db.
				Select("id, department_id, name, version").
				Where(notDeletedCondition).
				Order("majors.name ASC")
		}).
		Preload("Departments.Majors.AdmissionSchedules", func(db *gorm.DB) *gorm.DB {
			return db.
				Select("id, major_id, name, version, display_order").
				Where(notDeletedCondition).
				Order("admission_schedules.display_order ASC")
		}).
		Preload("Departments.Majors.AdmissionSchedules.AdmissionInfos", func(db *gorm.DB) *gorm.DB {
			return db.
				Select("id, admission_schedule_id, enrollment, academic_year, status, created_at").
				Where(notDeletedCondition).
				Order("admission_infos.created_at ASC")
		}).
		Preload("Departments.Majors.AdmissionSchedules.TestTypes", func(db *gorm.DB) *gorm.DB {
			return db.
				Select("id, admission_schedule_id, name, version").
				Where(notDeletedCondition).
				Order("test_types.name ASC")
		}).
		Preload("Departments.Majors.AdmissionSchedules.TestTypes.Subjects", func(db *gorm.DB) *gorm.DB {
			return db.
				Select("id, test_type_id, name, score, percentage, display_order, version").
				Where(notDeletedCondition).
				Order(displayOrderASC)
		})
}

// FindAll は全ての大学を取得します。
// この関数は以下の処理を行います：
// - キャッシュのチェック
// - データベースからの取得
// - キャッシュへの保存
func (r *universityRepository) FindAll(ctx context.Context) ([]models.University, error) {
	if cached, found := r.cache.GetFromCache(cache.CacheKeyAllUniversities); found {
		applogger.Info(context.Background(), "キャッシュから全大学データを取得しました")
		return cached.([]models.University), nil
	}

	var universities []models.University

	var totalCount int64

	// 総件数を取得
	if err := r.db.WithContext(ctx).Model(&models.University{}).Count(&totalCount).Error; err != nil {
		return nil, appErrors.TranslateDBError(err)
	}

	// メモリ使用量を最適化するため、スライスの初期サイズを設定
	universities = make([]models.University, 0, totalCount)

	// バッチサイズを設定
	const batchSize = 100

	var processedCount int64

	// バッチ処理でデータを取得
	err := r.db.WithContext(ctx).
		Select("DISTINCT universities.*").
		Scopes(func(db *gorm.DB) *gorm.DB {
			return r.applyPreloads(db)
		}).
		FindInBatches(&universities, batchSize, func(tx *gorm.DB, _ int) error {
			processedCount += tx.RowsAffected
			applogger.Info(context.Background(), "バッチ処理進捗: %d/%d レコードを処理", processedCount, totalCount)
			return nil
		}).Error

	if err != nil {
		return nil, appErrors.TranslateDBError(err)
	}

	// キャッシュに保存
	r.cache.SetCache(cache.CacheKeyAllUniversities, universities)

	applogger.Info(context.Background(), "全大学データを取得しました（%d件）", len(universities))

	return universities, nil
}

// getUniversityFromCache はキャッシュから大学データを取得します。
// この関数は以下の処理を行います：
// - キャッシュキーの生成
// - キャッシュのチェック
// - データの返却
func (r *universityRepository) getUniversityFromCache(id uint) (*models.University, bool) {
	cacheKey := fmt.Sprintf(cache.CacheKeyUniversityFormat, id)
	if cached, found := r.cache.GetFromCache(cacheKey); found {
		applogger.Info(context.Background(), "FindByIDのキャッシュヒット: %d", id)

		if university, ok := cached.(models.University); ok {
			return &university, true
		}
	}

	return nil, false
}

// getUniversityFromDB はデータベースから大学データを取得します。
// この関数は以下の処理を行います：
// - データベースクエリの実行
// - エラーハンドリング
// - データの返却
func (r *universityRepository) getUniversityFromDB(id uint) (*models.University, error) {
	var university models.University
	if err := r.applyPreloads(r.db).First(&university, id).Error; err != nil {
		return nil, appErrors.TranslateDBError(err)
	}

	return &university, nil
}

// FindByID はIDで大学を取得します。
// この関数は以下の処理を行います：
// - キャッシュのチェック
// - データベースからの取得
// - キャッシュへの保存
func (r *universityRepository) FindByID(id uint) (*models.University, error) {
	if university, found := r.getUniversityFromCache(id); found {
		applogger.Info(context.Background(), "FindByIDのキャッシュヒット: %d", id)
		return university, nil
	}

	university, err := r.getUniversityFromDB(id)
	if err != nil {
		return nil, err
	}

	cacheKey := fmt.Sprintf(cache.CacheKeyUniversityFormat, id)
	r.cache.SetCache(cacheKey, university)
	applogger.Info(context.Background(), "大学ID: %d をキャッシュしました", id)

	return university, nil
}

// Search は大学を検索します。
// この関数は以下の処理を行います：
// - 検索クエリの検証
// - キャッシュのチェック
// - データベースからの取得
// - キャッシュへの保存
func (r *universityRepository) Search(query string) ([]models.University, error) {
	if query == "" {
		return nil, appErrors.NewInvalidInputError("query", errEmptyQuery, nil)
	}

	if len(strings.TrimSpace(query)) < 1 {
		return nil, appErrors.NewInvalidInputError("query", errInvalidQuery, nil)
	}

	cacheKey := fmt.Sprintf("universities:search:%s", query)
	if cached, found := r.cache.GetFromCache(cacheKey); found {
		applogger.Info(context.Background(), "キャッシュからデータを取得: %d件", len(cached.([]models.University)))
		return cached.([]models.University), nil
	}

	var universities []models.University

	subQuery := r.db.Model(&models.University{}).
		Select("DISTINCT universities.id").
		Joins("LEFT JOIN departments ON departments.university_id = universities.id AND departments.deleted_at IS NULL").
		Joins("LEFT JOIN majors ON majors.department_id = departments.id AND majors.deleted_at IS NULL").
		Where("universities.deleted_at IS NULL").
		Where(`
			LOWER(universities.name) LIKE LOWER(?) OR
			LOWER(departments.name) LIKE LOWER(?) OR
			LOWER(majors.name) LIKE LOWER(?)
		`, "%"+query+"%", "%"+query+"%", "%"+query+"%")

	err := r.db.
		Where("id IN (?)", subQuery).
		Select(
			"DISTINCT universities.id, universities.name, "+
			"universities.version, universities.created_at, "+
			"universities.updated_at",
		).
		Scopes(func(db *gorm.DB) *gorm.DB {
			return r.applyPreloads(db)
		}).
		Find(&universities).Error

	if err != nil {
		return nil, appErrors.NewDatabaseError("大学検索処理", fmt.Errorf(errSearchFailed, err), nil)
	}

	r.cache.SetCache(cacheKey, universities)
	applogger.Info(context.Background(), "検索結果をキャッシュしました: %d件", len(universities))

	return universities, nil
}

func (r *universityRepository) FindDepartment(universityID, departmentID uint) (*models.Department, error) {
	cacheKey := fmt.Sprintf(cache.CacheKeyDepartmentFormat, universityID, departmentID)

	// キャッシュをチェック
	if cached, found := r.cache.GetFromCache(cacheKey); found {
		applogger.Info(context.Background(), "FindDepartmentのキャッシュヒット: 学部 %d:%d", universityID, departmentID)

		department := cached.(models.Department)

		return &department, nil
	}

	var department models.Department
	err := r.db.Where("university_id = ? AND id = ?", universityID, departmentID).
		First(&department).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, appErrors.NewNotFoundError("学部", departmentID, nil)
		}

		return nil, appErrors.NewDatabaseError("学部検索処理", err, nil)
	}

	// キャッシュに保存
	r.cache.SetCache(cacheKey, department)
	applogger.Info(context.Background(), "学部 %d:%d をキャッシュしました", universityID, departmentID)

	return &department, nil
}

// FindSubject は科目を検索します
func (r *universityRepository) FindSubject(departmentID, subjectID uint) (*models.Subject, error) {
	cacheKey := fmt.Sprintf("subjects:%d:%d", departmentID, subjectID)

	// キャッシュをチェック
	if cached, found := r.cache.GetFromCache(cacheKey); found {
		applogger.Info(context.Background(), "FindSubjectのキャッシュヒット: 科目 %d:%d", departmentID, subjectID)

		subject := cached.(models.Subject)

		return &subject, nil
	}

	var subject models.Subject
	err := r.db.Preload("TestType.AdmissionSchedule.Major.Department.University").
		Joins("JOIN test_types ON subjects.test_type_id = test_types.id").
		Joins("JOIN admission_schedules ON test_types.admission_schedule_id = admission_schedules.id").
		Joins("JOIN majors ON admission_schedules.major_id = majors.id").
		Where("majors.department_id = ? AND subjects.id = ?", departmentID, subjectID).
		First(&subject).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, appErrors.NewNotFoundError("科目", subjectID, nil)
		}

		return nil, appErrors.NewDatabaseError("科目検索処理", err, nil)
	}

	// キャッシュに保存
	r.cache.SetCache(cacheKey, subject)
	applogger.Info(context.Background(), "科目 %d:%d をキャッシュしました", departmentID, subjectID)

	return &subject, nil
}

// sanitizeName は大学名をサニタイズします。
// この関数は以下の処理を行います：
// - HTMLタグの除去
// - 制御文字の除去
// - スペースの正規化
func sanitizeName(name string) string {
	// HTMLタグを除去（bluemondayを使用）
	p := bluemonday.UGCPolicy()
	name = p.Sanitize(name)

	// 制御文字を除去
	name = strings.Map(func(r rune) rune {
		if r < 32 || r == 127 {
			return -1
		}

		return r
	}, name)

	// 全角スペースを半角スペースに正規化
	name = strings.ReplaceAll(name, "　", " ")

	// 連続する空白を1つに
	name = strings.Join(strings.Fields(name), " ")

	// 前後の空白を除去
	name = strings.TrimSpace(name)

	return name
}

// Create は新しい大学を作成します。
// この関数は以下の処理を行います：
// - データの検証
// - データのサニタイズ
// - トランザクションの実行
// - キャッシュのクリア
func (r *universityRepository) Create(university *models.University) error {
	if err := r.validateUniversity(university); err != nil {
		return err
	}

	// 大学名をサニタイズ
	university.Name = sanitizeName(university.Name)

	// 学部名もサニタイズ
	for i := range university.Departments {
		university.Departments[i].Name = sanitizeName(university.Departments[i].Name)
	}

	err := r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(university).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return err
	}

	// キャッシュをクリア
	r.cache.ClearAllRelatedCache(university.ID)

	return nil
}

// Update は既存の大学を更新します。
// この関数は以下の処理を行います：
// - データのサニタイズ
// - トランザクションの実行
// - キャッシュのクリア
func (r *universityRepository) Update(university *models.University) error {
	// 大学名をサニタイズ
	university.Name = sanitizeName(university.Name)

	// 学部名もサニタイズ
	for i := range university.Departments {
		university.Departments[i].Name = sanitizeName(university.Departments[i].Name)
		// 学科名もサニタイズ
		for j := range university.Departments[i].Majors {
			university.Departments[i].Majors[j].Name = sanitizeName(university.Departments[i].Majors[j].Name)
		}
	}

	err := r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(university).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return err
	}

	// 全てのキャッシュをクリア
	r.cache.ClearAllRelatedCache(university.ID)

	return nil
}

// Delete は大学を削除します。
// この関数は以下の処理を行います：
// - トランザクションの実行
// - キャッシュのクリア
func (r *universityRepository) Delete(id uint) error {
	err := r.db.Transaction(func(tx *gorm.DB) error {
		result := tx.Unscoped().Delete(&models.University{}, id)
		if result.Error != nil {
			return result.Error
		}

		if result.RowsAffected == 0 {
			return appErrors.NewNotFoundError("大学", id, nil)
		}

		return nil
	})

	if err != nil {
		return err
	}

	// キャッシュをクリア
	r.cache.ClearAllRelatedCache(id)

	return nil
}

// CreateDepartment は新しい学部を作成します
func (r *universityRepository) CreateDepartment(department *models.Department) error {
	if err := r.db.Create(department).Error; err != nil {
		return err
	}

	return nil
}

// UpdateDepartment は既存の学部を更新します
func (r *universityRepository) UpdateDepartment(department *models.Department) error {
	if strings.TrimSpace(department.Name) == "" {
		return errors.New("学部名が空です")
	}

	err := r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(department).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return err
	}

	// 全てのキャッシュをクリア
	r.cache.ClearAllRelatedCache(department.UniversityID)

	return nil
}

// DeleteDepartment は学部を削除します
func (r *universityRepository) DeleteDepartment(id uint) error {
	if err := r.db.Delete(&models.Department{}, id).Error; err != nil {
		return err
	}

	return nil
}

// CreateSubject は新しい科目を作成します
func (r *universityRepository) CreateSubject(subject *models.Subject) error {
	if err := r.db.Create(subject).Error; err != nil {
		return err
	}

	return nil
}

/* // calculateTotalScore は総得点を計算します。
// この関数は以下の処理を行います：
// - 科目のスコアの合計
// - 総得点の返却
func (r *universityRepository) calculateTotalScore(subjects []models.Subject) float64 {
	var total float64
	for _, s := range subjects {
		total += float64(s.Score)
	}

	return total
} */

// updatePercentages はパーセンテージを更新します。
func (r *universityRepository) updatePercentages(
	subjects []models.Subject,
	commonTestTotalScore float64,
	secondaryTestTotalScore float64,
) {
	// 共通テストと二次試験の合計点を分母とする
	denominator := commonTestTotalScore + secondaryTestTotalScore

	if denominator > 0 {
		for i := range subjects {
			percentage := float64(subjects[i].Score) / denominator * 100
			subjects[i].Percentage = math.Round(percentage*100) / 100
		}
	} else {
		for i := range subjects {
			subjects[i].Percentage = 0
		}
	}
}

// saveSubjectWithScores は科目とスコアを保存します。
// この関数は以下の処理を行います：
// - 科目データの更新
// - エラーハンドリング
func (r *universityRepository) saveSubjectWithScores(tx *gorm.DB, subject models.Subject) error {
	if err := tx.Model(&models.Subject{}).Where("id = ?", subject.ID).Updates(map[string]interface{}{
		"test_type_id":   subject.TestTypeID,
		"name":          subject.Name,
		"score":         subject.Score,
		"percentage":    subject.Percentage,
		"display_order": subject.DisplayOrder,
	}).Error; err != nil {
		return err
	}

	return nil
}

// getRelevantTestTypeScores は、指定されたTestTypeに関連する共通テストと二次試験の合計点を取得します。
// 同じAdmissionSchedule内の "共通" と "二次" のTestTypeを検索し、それぞれの合計点を返します。
// 対象のTestTypeが見つからない場合やエラー時は 0.0 とエラーを返します。
func (r *universityRepository) getRelevantTestTypeScores(
	tx *gorm.DB,
	admissionScheduleID uint,
) (commonTotal float64, secondaryTotal float64, err error) {
	if admissionScheduleID == 0 {
		applogger.Warn(context.Background(),
			"関連試験種別スコア取得試行時に AdmissionScheduleID がゼロです。0,0 を返します。")
		return 0.0, 0.0, nil
	}

	var testTypesInSchedule []models.TestType
	if err := tx.Where(
		"admission_schedule_id = ? AND name IN (?)",
		admissionScheduleID,
		[]string{"共通", "二次"},
	).Find(&testTypesInSchedule).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			applogger.Info(context.Background(), "試験日程ID %d に「共通」または「二次」の試験種別が見つかりませんでした", admissionScheduleID)
			return 0.0, 0.0, nil
		}

		return 0.0, 0.0, fmt.Errorf("試験日程ID %d の試験種別検索に失敗しました: %w", admissionScheduleID, err)
	}

	for _, tt := range testTypesInSchedule {
		var subjectsInTestType []models.Subject
		if errDb := tx.Where(testTypeIDQuery, tt.ID).Find(&subjectsInTestType).Error; errDb != nil {
			if errors.Is(errDb, gorm.ErrRecordNotFound) {
				// このTestTypeに科目がなくてもエラーではない。合計は0のまま。
				continue
			}

			return 0.0, 0.0, fmt.Errorf("試験種別ID %d (名称: %s) の科目取得に失敗しました: %w", tt.ID, tt.Name, errDb)
		}

		var currentTypeSum float64

		for _, s := range subjectsInTestType {
			currentTypeSum += float64(s.Score)
		}

		switch tt.Name {
		case "共通":
			commonTotal = currentTypeSum
		case "二次":
			secondaryTotal = currentTypeSum
		}
	}

	return commonTotal, secondaryTotal, nil
}

// updateSubjectScores は科目のスコアを更新します。
func (r *universityRepository) updateSubjectScores(tx *gorm.DB, subjects []models.Subject) error {
	if len(subjects) == 0 {
		return nil
	}

	testTypeID := subjects[0].TestTypeID

	var currentTestType models.TestType

	if err := tx.First(&currentTestType, testTypeID).Error; err != nil {
		return fmt.Errorf("試験種別ID %d が見つかりませんでした: %w", testTypeID, err)
	}

	commonTestTotalScore, secondaryTestTotalScore, err := r.getRelevantTestTypeScores(
		tx,
		currentTestType.AdmissionScheduleID,
	)
	if err != nil {
		return fmt.Errorf(
			"試験日程ID %d の関連試験種別スコア取得に失敗しました: %w",
			currentTestType.AdmissionScheduleID,
			err,
		)
	}

	r.updatePercentages(
		subjects,
		commonTestTotalScore,
		secondaryTestTotalScore,
	)

	for _, s := range subjects {
		if err := r.saveSubjectWithScores(tx, s); err != nil {
			return err
		}
	}

	return nil
}

// processBatch は科目のバッチを処理します。
// この関数は以下の処理を行います：
// - バッチデータの処理
// - エラーハンドリング
func (r *universityRepository) processBatch(tx *gorm.DB, batch []models.Subject, testTypeID uint) error {
	for _, subject := range batch {
		subject.TestTypeID = testTypeID

		// 科目が存在するか確認
		var existingSubject models.Subject
		if err := tx.First(&existingSubject, subject.ID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return fmt.Errorf("科目ID %d が見つかりませんでした", subject.ID)
			}

			return fmt.Errorf("科目の検索に失敗: %w", err)
		}

		if err := tx.Save(&subject).Error; err != nil {
			return fmt.Errorf("科目の更新に失敗: %w", err)
		}
	}

	return nil
}

// UpdateSubjectsBatch は科目のバッチ更新を行います。
// この関数は以下の処理を行います：
// - バッチサイズの設定
// - バッチ処理の実行
// - スコアの再計算
func (r *universityRepository) UpdateSubjectsBatch(testTypeID uint, subjects []models.Subject) error {
	applogger.Info(context.Background(), "バッチ更新開始: testTypeID=%d, 科目数=%d", testTypeID, len(subjects))

	const batchSize = 1000

	return r.db.Transaction(func(tx *gorm.DB) error {
		// TestTypeの存在チェック
		var testType models.TestType
		if err := tx.First(&testType, testTypeID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return fmt.Errorf("試験種別ID %d が見つかりませんでした", testTypeID)
			}

			return fmt.Errorf("試験種別の検索に失敗: %w", err)
		}

		// バッチ処理を実行
		for i := 0; i < len(subjects); i += batchSize {
			end := i + batchSize
			if end > len(subjects) {
				end = len(subjects)
			}

			if err := r.processBatch(tx, subjects[i:end], testTypeID); err != nil {
				return err
			}
		}

		return r.recalculateScores(tx, testTypeID)
	})
}

// recalculateScores はスコアとパーセンテージを再計算します。
func (r *universityRepository) recalculateScores(tx *gorm.DB, testTypeID uint) error {
	var subjects []models.Subject
	if err := tx.Where(testTypeIDQuery, testTypeID).Order(displayOrderASC).Find(&subjects).Error; err != nil {
		return fmt.Errorf("試験種別ID %d の科目検索に失敗しました: %w", testTypeID, err)
	}

	if len(subjects) == 0 {
		applogger.Info(context.Background(),
			"recalculateScores 中に試験種別ID %d の科目が見つかりませんでした。スキップします。", testTypeID)
		return nil
	}

	var currentTestType models.TestType
	if err := tx.First(&currentTestType, testTypeID).Error; err != nil {
		return fmt.Errorf("試験種別ID %d が見つかりませんでした: %w", testTypeID, err)
	}

	commonTestTotalScore, secondaryTestTotalScore, err := r.getRelevantTestTypeScores(
		tx,
		currentTestType.AdmissionScheduleID,
	)
	if err != nil {
		return fmt.Errorf(
			"recalculateScores 中に試験日程ID %d の関連試験種別スコア取得に失敗しました: %w",
			currentTestType.AdmissionScheduleID,
			err,
		)
	}

	r.updatePercentages(
		subjects,
		commonTestTotalScore,
		secondaryTestTotalScore,
	)

	for i := range subjects {
		if err := tx.Model(&subjects[i]).Update("percentage", subjects[i].Percentage).Error; err != nil {
			return fmt.Errorf("科目ID %d のパーセンテージ更新に失敗しました: %w", subjects[i].ID, err)
		}
	}

	return nil
}

// getExistingSubjects は既存の科目を取得します。
// この関数は以下の処理を行います：
// - 科目データの取得
// - ソート順の設定
// - データの返却
func (r *universityRepository) getExistingSubjects(tx *gorm.DB, testTypeID uint) ([]models.Subject, error) {
	var subjects []models.Subject
	if err := tx.Where(testTypeIDQuery, testTypeID).
		Order(displayOrderASC).
		Find(&subjects).Error; err != nil {
		return nil, err
	}

	return subjects, nil
}

// updateSubjectInList は科目リストを更新します。
// この関数は以下の処理を行います：
// - 科目の検索
// - 表示順の保持
// - リストの更新
func (r *universityRepository) updateSubjectInList(
	allSubjects []models.Subject,
	subject *models.Subject,
) []models.Subject {
	for i, s := range allSubjects {
		if s.ID == subject.ID {
			subject.DisplayOrder = s.DisplayOrder
			allSubjects[i] = *subject

			break
		}
	}

	return allSubjects
}

// UpdateSubject は科目を更新します。
// この関数は以下の処理を行います：
// - 既存科目の取得
// - 科目リストの更新
// - スコアの更新
// - キャッシュのクリア
func (r *universityRepository) UpdateSubject(subject *models.Subject) error {
	err := r.db.Transaction(func(tx *gorm.DB) error {
		allSubjects, err := r.getExistingSubjects(tx, subject.TestTypeID)
		if err != nil {
			return err
		}

		allSubjects = r.updateSubjectInList(allSubjects, subject)

		if err := r.updateSubjectScores(tx, allSubjects); err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return err
	}

	r.cache.ClearSubjectsCache(subject.TestTypeID)
	r.cache.ClearAllRelatedCache(0)

	return nil
}

// DeleteSubject は科目を削除します。
// この関数は以下の処理を行います：
// - 科目の削除
// - エラーハンドリング
func (r *universityRepository) DeleteSubject(id uint) error {
	if err := r.db.Delete(&models.Subject{}, id).Error; err != nil {
		return err
	}

	return nil
}

// UpdateMajor は既存の学科を更新します。
// この関数は以下の処理を行います：
// - トランザクションの実行
// - キャッシュのクリア
func (r *universityRepository) UpdateMajor(major *models.Major) error {
	err := r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(major).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return err
	}

	// 全てのキャッシュをクリア
	r.cache.ClearAllRelatedCache(major.DepartmentID)

	return nil
}

// UpdateAdmissionSchedule は既存の入試スケジュールを更新します。
// この関数は以下の処理を行います：
// - トランザクションの実行
// - キャッシュのクリア
func (r *universityRepository) UpdateAdmissionSchedule(schedule *models.AdmissionSchedule) error {
	err := r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(schedule).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return err
	}

	// 全てのキャッシュをクリア
	r.cache.ClearAllRelatedCache(schedule.MajorID)

	return nil
}

// UpdateAdmissionInfo は既存の入試情報を更新します。
// この関数は以下の処理を行います：
// - トランザクションの実行
// - キャッシュのクリア
func (r *universityRepository) UpdateAdmissionInfo(info *models.AdmissionInfo) error {
	err := r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(info).Error; err != nil {
			return appErrors.NewDatabaseError("入試情報更新処理", err, nil)
		}

		return nil
	})

	if err != nil {
		return err
	}

	// 全てのキャッシュをクリア
	r.cache.ClearAllRelatedCache(info.AdmissionScheduleID)

	return nil
}

// FindMajor は学科を取得します。
// この関数は以下の処理を行います：
// - キャッシュのチェック
// - データベースからの取得
// - キャッシュへの保存
func (r *universityRepository) FindMajor(departmentID, majorID uint) (*models.Major, error) {
	cacheKey := fmt.Sprintf("majors:%d:%d", departmentID, majorID)

	// キャッシュをチェック
	if cached, found := r.cache.GetFromCache(cacheKey); found {
		applogger.Info(context.Background(), "学科のキャッシュヒット: %d:%d", departmentID, majorID)

		major := cached.(models.Major)

		return &major, nil
	}

	var major models.Major
	err := r.db.Where("department_id = ? AND id = ?", departmentID, majorID).
		First(&major).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, appErrors.NewNotFoundError("学科", majorID, nil)
		}

		return nil, appErrors.NewDatabaseError("学科検索処理", err, nil)
	}

	// キャッシュに保存
	r.cache.SetCache(cacheKey, major)
	applogger.Info(context.Background(), "学科をキャッシュに保存: %d:%d", departmentID, majorID)

	return &major, nil
}

// CreateMajor は新しい学科を作成します。
// この関数は以下の処理を行います：
// - 学科の作成
// - エラーハンドリング
func (r *universityRepository) CreateMajor(major *models.Major) error {
	if err := r.db.Create(major).Error; err != nil {
		return appErrors.NewDatabaseError("学科作成処理", err, nil)
	}

	return nil
}

// DeleteMajor は学科を削除します。
// この関数は以下の処理を行います：
// - 学科の削除
// - エラーハンドリング
func (r *universityRepository) DeleteMajor(id uint) error {
	if err := r.db.Delete(&models.Major{}, id).Error; err != nil {
		return appErrors.NewDatabaseError("学科削除処理", err, nil)
	}

	return nil
}

// FindAdmissionInfo は入試情報を取得します。
// この関数は以下の処理を行います：
// - キャッシュのチェック
// - データベースからの取得
// - キャッシュへの保存
func (r *universityRepository) FindAdmissionInfo(scheduleID, infoID uint) (*models.AdmissionInfo, error) {
	cacheKey := fmt.Sprintf("admission_infos:%d:%d", scheduleID, infoID)

	// キャッシュをチェック
	if cached, found := r.cache.GetFromCache(cacheKey); found {
		applogger.Info(context.Background(), "入試情報のキャッシュヒット: %d:%d", scheduleID, infoID)

		info := cached.(models.AdmissionInfo)

		return &info, nil
	}

	var info models.AdmissionInfo
	err := r.db.Where("admission_schedule_id = ? AND id = ?", scheduleID, infoID).
		First(&info).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, appErrors.NewNotFoundError("入試情報", infoID, nil)
		}

		return nil, appErrors.NewDatabaseError("入試情報検索処理", err, nil)
	}

	// キャッシュに保存
	r.cache.SetCache(cacheKey, info)
	applogger.Info(context.Background(), "入試情報をキャッシュに保存: %d:%d", scheduleID, infoID)

	return &info, nil
}

// CreateAdmissionInfo は新しい募集情報を作成します。
// この関数は以下の処理を行います：
// - 募集情報の作成
// - エラーハンドリング
func (r *universityRepository) CreateAdmissionInfo(info *models.AdmissionInfo) error {
	if err := r.db.Create(info).Error; err != nil {
		return appErrors.NewDatabaseError("入試情報作成処理", err, nil)
	}

	return nil
}

// DeleteAdmissionInfo は募集情報を削除します。
// この関数は以下の処理を行います：
// - 募集情報の削除
// - エラーハンドリング
func (r *universityRepository) DeleteAdmissionInfo(id uint) error {
	if err := r.db.Delete(&models.AdmissionInfo{}, id).Error; err != nil {
		return appErrors.NewDatabaseError("入試情報削除処理", err, nil)
	}

	return nil
}
