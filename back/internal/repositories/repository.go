//go:generate mockgen -source=university_repository.go -destination=mocks/mock_university_repository.go

package repositories

import (
	"context"
	"fmt"
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

// インターフェースの分割
type IUniversityFinder interface {
	FindAll(ctx context.Context) ([]models.University, error)
	FindByID(id uint) (*models.University, error)
	Search(query string) ([]models.University, error)
}

type IUniversityManager interface {
	Create(university *models.University) error
	Update(university *models.University) error
	Delete(id uint) error
}

type IDepartmentManager interface {
	CreateDepartment(department *models.Department) error
	UpdateDepartment(department *models.Department) error
	DeleteDepartment(id uint) error
}

type ISubjectManager interface {
	CreateSubject(subject *models.Subject) error
	UpdateSubject(subject *models.Subject) error
	DeleteSubject(id uint) error
}

type IMajorManager interface {
	CreateMajor(major *models.Major) error
	UpdateMajor(major *models.Major) error
	DeleteMajor(id uint) error
}

type IAdmissionInfoManager interface {
	CreateAdmissionInfo(info *models.AdmissionInfo) error
	DeleteAdmissionInfo(id uint) error
	UpdateAdmissionInfo(info *models.AdmissionInfo) error
}

// メインのインターフェース
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

// UniversityRepository 実装
type universityRepository struct {
	db    *gorm.DB
	cache *cache.CacheManager
}

// NewUniversityRepository はリポジトリのインスタンスを生成します
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

// applyPreloads はプリロードを最適化して適用します
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

// FindAll は全ての大学を取得します
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
		FindInBatches(&universities, batchSize, func(tx *gorm.DB, batch int) error {
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

func (r *universityRepository) getUniversityFromCache(id uint) (*models.University, bool) {
	cacheKey := fmt.Sprintf(cache.CacheKeyUniversityFormat, id)
	if cached, found := r.cache.GetFromCache(cacheKey); found {
		applogger.Info(context.Background(), "Cache hit for FindByID: %d", id)

		if university, ok := cached.(models.University); ok {
			return &university, true
		}
	}

	return nil, false
}

func (r *universityRepository) getUniversityFromDB(id uint) (*models.University, error) {
	var university models.University
	if err := r.applyPreloads(r.db).First(&university, id).Error; err != nil {
		return nil, appErrors.TranslateDBError(err)
	}

	return &university, nil
}

func (r *universityRepository) FindByID(id uint) (*models.University, error) {
	if university, found := r.getUniversityFromCache(id); found {
		return university, nil
	}

	university, err := r.getUniversityFromDB(id)
	if err != nil {
		return nil, err
	}

	cacheKey := fmt.Sprintf(cache.CacheKeyUniversityFormat, id)
	r.cache.SetCache(cacheKey, university)
	applogger.Info(context.Background(), "Cached university with ID: %d", id)

	return university, nil
}

// Search は大学を検索します
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
		return nil, appErrors.NewDatabaseError("Search", fmt.Errorf(errSearchFailed, err), nil)
	}

	r.cache.SetCache(cacheKey, universities)
	applogger.Info(context.Background(), "検索結果をキャッシュしました: %d件", len(universities))

	return universities, nil
}

func (r *universityRepository) FindDepartment(universityID, departmentID uint) (*models.Department, error) {
	cacheKey := fmt.Sprintf(cache.CacheKeyDepartmentFormat, universityID, departmentID)

	// キャッシュをチェック
	if cached, found := r.cache.GetFromCache(cacheKey); found {
		applogger.Info(context.Background(), "Cache hit for FindDepartment: %d:%d", universityID, departmentID)

		department := cached.(models.Department)

		return &department, nil
	}

	var department models.Department
	err := r.db.Where("university_id = ? AND id = ?", universityID, departmentID).
		First(&department).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, appErrors.NewNotFoundError("Department", departmentID, nil)
		}

		return nil, appErrors.NewDatabaseError("FindDepartment", err, nil)
	}

	// キャッシュに保存
	r.cache.SetCache(cacheKey, department)
	applogger.Info(context.Background(), "Cached department: %d:%d", universityID, departmentID)

	return &department, nil
}

// FindSubject は科目を検索します
func (r *universityRepository) FindSubject(departmentID, subjectID uint) (*models.Subject, error) {
	cacheKey := fmt.Sprintf("subjects:%d:%d", departmentID, subjectID)

	// キャッシュをチェック
	if cached, found := r.cache.GetFromCache(cacheKey); found {
		applogger.Info(context.Background(), "Cache hit for FindSubject: %d:%d", departmentID, subjectID)

		subject := cached.(models.Subject)

		return &subject, nil
	}

	var subject models.Subject
	err := r.db.Preload("Department.University").
		Where("department_id = ? AND id = ?", departmentID, subjectID).
		First(&subject).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, appErrors.NewNotFoundError("Subject", subjectID, nil)
		}

		return nil, appErrors.NewDatabaseError("FindSubject", err, nil)
	}

	// キャッシュに保存
	r.cache.SetCache(cacheKey, subject)
	applogger.Info(context.Background(), "Cached subject: %d:%d", departmentID, subjectID)

	return &subject, nil
}

// sanitizeName は大学名をサニタイズします
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

// Create は新しい大学を作成します
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

// Update は既存の大学を更新します
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

// Delete は大学を削除します
func (r *universityRepository) Delete(id uint) error {
	err := r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Unscoped().Delete(&models.University{}, id).Error; err != nil {
			return err
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

// calculateTotalScore は総得点を計算します
func (r *universityRepository) calculateTotalScore(subjects []models.Subject) float64 {
	var total float64
	for _, s := range subjects {
		total += float64(s.Score)
	}

	return total
}

// updatePercentages はパーセンテージを更新します
func (r *universityRepository) updatePercentages(subjects []models.Subject, totalScore float64) {
	if totalScore > 0 {
		for i := range subjects {
			subjects[i].Percentage = float64(subjects[i].Score) / totalScore * 100
		}
	}
}

// saveSubjectWithScores は科目とスコアを保存します
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

// updateSubjectScores は科目のスコアを更新します
func (r *universityRepository) updateSubjectScores(tx *gorm.DB, subjects []models.Subject) error {
	totalScore := r.calculateTotalScore(subjects)
	r.updatePercentages(subjects, totalScore)

	for _, s := range subjects {
		if err := r.saveSubjectWithScores(tx, s); err != nil {
			return err
		}
	}

	return nil
}

// processBatch は科目のバッチを処理します
func (r *universityRepository) processBatch(tx *gorm.DB, batch []models.Subject, testTypeID uint) error {
	for _, subject := range batch {
		subject.TestTypeID = testTypeID
		if err := tx.Save(&subject).Error; err != nil {
			return fmt.Errorf("科目の更新に失敗: %w", err)
		}
	}

	return nil
}

// UpdateSubjectsBatch は科目のバッチ更新を行います
func (r *universityRepository) UpdateSubjectsBatch(testTypeID uint, subjects []models.Subject) error {
	applogger.Info(context.Background(), "バッチ更新開始: testTypeID=%d, 科目数=%d", testTypeID, len(subjects))

	const batchSize = 1000

	return r.db.Transaction(func(tx *gorm.DB) error {
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

// recalculateScores はスコアとパーセンテージを再計算します
func (r *universityRepository) recalculateScores(tx *gorm.DB, testTypeID uint) error {
	var subjects []models.Subject
	if err := tx.Where(testTypeIDQuery, testTypeID).Find(&subjects).Error; err != nil {
		return err
	}

	var totalScore float64
	for _, s := range subjects {
		totalScore += float64(s.Score)
	}

	// パーセンテージの更新
	for _, s := range subjects {
		percentage := 0.0
		if totalScore > 0 {
			percentage = (float64(s.Score) / totalScore) * 100
		}

		if err := tx.Model(&s).Update("percentage", percentage).Error; err != nil {
			return err
		}
	}

	return nil
}

// getExistingSubjects は既存の科目を取得します
func (r *universityRepository) getExistingSubjects(tx *gorm.DB, testTypeID uint) ([]models.Subject, error) {
	var subjects []models.Subject
	if err := tx.Where(testTypeIDQuery, testTypeID).
		Order(displayOrderASC).
		Find(&subjects).Error; err != nil {
		return nil, err
	}

	return subjects, nil
}

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

// UpdateSubject は科目を更新します
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

// DeleteSubject は科目を削除します
func (r *universityRepository) DeleteSubject(id uint) error {
	if err := r.db.Delete(&models.Subject{}, id).Error; err != nil {
		return err
	}

	return nil
}

// UpdateMajor は既存の学科を更新します
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

// UpdateAdmissionSchedule は既存の入試スケジュールを更新します
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

// UpdateAdmissionInfo は既存の入試情報を更新します
func (r *universityRepository) UpdateAdmissionInfo(info *models.AdmissionInfo) error {
	err := r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(info).Error; err != nil {
			return appErrors.NewDatabaseError("UpdateAdmissionInfo", err, nil)
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
			return nil, appErrors.NewNotFoundError("Major", majorID, nil)
		}

		return nil, appErrors.NewDatabaseError("FindMajor", err, nil)
	}

	// キャッシュに保存
	r.cache.SetCache(cacheKey, major)
	applogger.Info(context.Background(), "学科をキャッシュに保存: %d:%d", departmentID, majorID)

	return &major, nil
}

// CreateMajor は新しい学科を作成します
func (r *universityRepository) CreateMajor(major *models.Major) error {
	if err := r.db.Create(major).Error; err != nil {
		return appErrors.NewDatabaseError("CreateMajor", err, nil)
	}

	return nil
}

// DeleteMajor は学科を削除します
func (r *universityRepository) DeleteMajor(id uint) error {
	if err := r.db.Delete(&models.Major{}, id).Error; err != nil {
		return appErrors.NewDatabaseError("DeleteMajor", err, nil)
	}

	return nil
}

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
			return nil, appErrors.NewNotFoundError("AdmissionInfo", infoID, nil)
		}

		return nil, appErrors.NewDatabaseError("FindAdmissionInfo", err, nil)
	}

	// キャッシュに保存
	r.cache.SetCache(cacheKey, info)
	applogger.Info(context.Background(), "入試情報をキャッシュに保存: %d:%d", scheduleID, infoID)

	return &info, nil
}

// CreateAdmissionInfo は新しい募集情報を作成します
func (r *universityRepository) CreateAdmissionInfo(info *models.AdmissionInfo) error {
	if err := r.db.Create(info).Error; err != nil {
		return appErrors.NewDatabaseError("CreateAdmissionInfo", err, nil)
	}
	return nil
}

// DeleteAdmissionInfo は募集情報を削除します
func (r *universityRepository) DeleteAdmissionInfo(id uint) error {
	if err := r.db.Delete(&models.AdmissionInfo{}, id).Error; err != nil {
		return appErrors.NewDatabaseError("DeleteAdmissionInfo", err, nil)
	}

	return nil
}
