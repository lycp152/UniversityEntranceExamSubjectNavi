//go:generate mockgen -source=university_repository.go -destination=mocks/mock_university_repository.go

package repositories

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"
	"university-exam-api/internal/domain/models"
	apperrors "university-exam-api/internal/errors"
	"university-exam-api/pkg/logger"

	"github.com/cenkalti/backoff/v4"
	"github.com/microcosm-cc/bluemonday"
	gocache "github.com/patrickmn/go-cache"
	"gorm.io/gorm"
)

const (
	preloadPath = "Departments.Majors.AdmissionSchedules.TestTypes.Subjects"
	cacheDuration = 5 * time.Minute
	cacheCleanupInterval = 10 * time.Minute
	departmentIDQuery = "department_id = ?"
	testTypeIDQuery = "test_type_id = ?"
	cacheKeyAllUniversities = "universities:all"
	displayOrderASC = "display_order ASC"
	cacheKeyUniversityFormat = "universities:%d"
	cacheKeyDepartmentFormat = "departments:%d:%d"
	maxRetries = 3
	txTimeout = 30 * time.Second
	initialInterval = 100 * time.Millisecond
	maxInterval = 2 * time.Second
	multiplier = 2.0
	randomizationFactor = 0.1
	maxNameLength = 100
	minNameLength = 1
	maxDepartmentsPerUniversity = 50
	maxMajorsPerDepartment = 30
	maxSubjectsPerTestType = 20
	notDeletedCondition = "deleted_at IS NULL"
	errInvalidVersion = "バージョンは1以上である必要があります"
	errEmptyUniversity = "大学データが指定されていません"
	errDuplicateKey = "重複するキーが存在します"
	errDeadlock = "デッドロックが発生しました: %w"
	errUnexpectedDB = "予期せぬデータベースエラー: %w"
	errMinLength = "%sは1文字以上である必要があります"
	errMaxLength = "%sは%d文字以下である必要があります"
	errDuplicateName = "%s「%s」が重複しています"
	errMaxItems = "%sは%d以下である必要があります"
	errNonNegative = "%sは0以上である必要があります"
	errPercentageRange = "パーセンテージは0以上100以下である必要があります"
	errLockTimeout = "ロックタイムアウトの設定に失敗しました: %w"
	errTransactionFailed = "トランザクションが失敗しました: %w"
)

// UniversityRepository インターフェース
type IUniversityRepository interface {
	WithTx(tx *gorm.DB) IUniversityRepository
	Transaction(fn func(repo IUniversityRepository) error) error
	FindAll(ctx context.Context) ([]models.University, error)
	FindByID(id uint) (*models.University, error)
	Search(query string) ([]models.University, error)
	FindDepartment(universityID, departmentID uint) (*models.Department, error)
	FindSubject(departmentID, subjectID uint) (*models.Subject, error)
	Create(university *models.University) error
	Update(university *models.University) error
	Delete(id uint) error
	CreateDepartment(department *models.Department) error
	UpdateDepartment(department *models.Department) error
	DeleteDepartment(id uint) error
	CreateSubject(subject *models.Subject) error
	UpdateSubject(subject *models.Subject) error
	DeleteSubject(id uint) error
	UpdateSubjectsBatch(testTypeID uint, subjects []models.Subject) error
	UpdateMajor(major *models.Major) error
	UpdateAdmissionSchedule(schedule *models.AdmissionSchedule) error
	UpdateAdmissionInfo(info *models.AdmissionInfo) error
}

// UniversityRepository 実装
type universityRepository struct {
	db    *gorm.DB
	cache *gocache.Cache
	mutex *sync.RWMutex
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
		cache: gocache.New(cacheDuration, cacheCleanupInterval),
		mutex: &sync.RWMutex{},
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

func (r *universityRepository) getFromCache(key string) (interface{}, bool) {
	r.mutex.RLock()
	defer r.mutex.RUnlock()
	return r.cache.Get(key)
}

func (r *universityRepository) setCache(key string, value interface{}) {
	r.mutex.Lock()
	defer r.mutex.Unlock()
	r.cache.Set(key, value, cacheDuration)
}

// FindAll は全ての大学を取得します
func (r *universityRepository) FindAll(ctx context.Context) ([]models.University, error) {
	if cached, found := r.getFromCache(cacheKeyAllUniversities); found {
		logger.Info("キャッシュから全大学データを取得しました")
		return cached.([]models.University), nil
	}

	var universities []models.University
	var totalCount int64

	// 総件数を取得
	if err := r.db.WithContext(ctx).Model(&models.University{}).Count(&totalCount).Error; err != nil {
		return nil, &apperrors.ErrDatabaseOperation{
			Operation: "FindAll",
			Err:      fmt.Errorf("総件数の取得に失敗しました: %w", err),
		}
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
			logger.Info("バッチ処理進捗: %d/%d レコードを処理", processedCount, totalCount)
			return nil
		}).Error

	if err != nil {
		return nil, &apperrors.ErrDatabaseOperation{
			Operation: "FindAll",
			Err:      fmt.Errorf("データ取得中にエラーが発生しました: %w", err),
		}
	}

	// キャッシュに保存（有効期限を設定）
	r.mutex.Lock()
	r.cache.Set(cacheKeyAllUniversities, universities, 5*time.Minute)
	r.mutex.Unlock()

	logger.Info("全大学データを取得しました（%d件）", len(universities))
	return universities, nil
}

func (r *universityRepository) getUniversityFromCache(id uint) (*models.University, bool) {
	cacheKey := fmt.Sprintf(cacheKeyUniversityFormat, id)
	if cached, found := r.getFromCache(cacheKey); found {
		logger.Info("Cache hit for FindByID: %d", id)
		if university, ok := cached.(*models.University); ok {
			return university, true
		}
	}
	return nil, false
}

func (r *universityRepository) getUniversityFromDB(id uint) (*models.University, error) {
	var university models.University
	if err := r.applyPreloads(r.db).First(&university, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, &apperrors.ErrNotFound{Resource: "University", ID: id}
		}
		return nil, &apperrors.ErrDatabaseOperation{Operation: "FindByID", Err: err}
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

	cacheKey := fmt.Sprintf(cacheKeyUniversityFormat, id)
	r.setCache(cacheKey, university)
	logger.Info("Cached university with ID: %d", id)

	return university, nil
}

// Search は大学を検索します
func (r *universityRepository) Search(query string) ([]models.University, error) {
	if query == "" {
		return nil, &apperrors.ErrInvalidInput{Field: "query", Message: "検索クエリが空です"}
	}

	cacheKey := fmt.Sprintf("universities:search:%s", query)
	if cached, found := r.getFromCache(cacheKey); found {
		logger.Info("キャッシュからデータを取得: %d件", len(cached.([]models.University)))
		return cached.([]models.University), nil
	}

	var universities []models.University

	// サブクエリの最適化：インデックスを効率的に使用
	subQuery := r.db.Table("universities").
		Select("DISTINCT universities.id").
		Joins("USE INDEX (idx_universities_name)").
		Joins("LEFT JOIN departments USE INDEX (idx_departments_university_id) ON departments.university_id = universities.id AND "+notDeletedCondition).
		Joins("LEFT JOIN majors USE INDEX (idx_majors_department_id) ON majors.department_id = departments.id AND "+notDeletedCondition).
		Where("universities."+notDeletedCondition).
		Where(`(
			LOWER(universities.name) LIKE LOWER(?) OR
			LOWER(departments.name) LIKE LOWER(?) OR
			LOWER(majors.name) LIKE LOWER(?)
		)`, "%"+query+"%", "%"+query+"%", "%"+query+"%")

	// メインクエリの最適化：必要なカラムのみを選択
	err := r.db.
		Where("id IN (?)", subQuery).
		Select("DISTINCT universities.id, universities.name, universities.version, universities.created_at, universities.updated_at").
		Scopes(func(db *gorm.DB) *gorm.DB {
			return r.applyPreloads(db)
		}).
		Find(&universities).Error

	if err != nil {
		return nil, &apperrors.ErrDatabaseOperation{
			Operation: "Search",
			Err:      fmt.Errorf("検索中にエラーが発生しました: %w", err),
		}
	}

	// キャッシュの保存（検索結果は短めの有効期限を設定）
	r.mutex.Lock()
	r.cache.Set(cacheKey, universities, time.Minute)
	r.mutex.Unlock()

	logger.Info("検索結果をキャッシュしました: %d件", len(universities))
	return universities, nil
}

func (r *universityRepository) FindDepartment(universityID, departmentID uint) (*models.Department, error) {
	cacheKey := fmt.Sprintf(cacheKeyDepartmentFormat, universityID, departmentID)

	// キャッシュをチェック
	if cached, found := r.getFromCache(cacheKey); found {
		logger.Info("Cache hit for FindDepartment: %d:%d", universityID, departmentID)
		department := cached.(models.Department)
		return &department, nil
	}

	var department models.Department
	err := r.db.Where("university_id = ? AND id = ?", universityID, departmentID).
		First(&department).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, &apperrors.ErrNotFound{Resource: "Department", ID: departmentID}
		}
		return nil, &apperrors.ErrDatabaseOperation{Operation: "FindDepartment", Err: err}
	}

	// キャッシュに保存
	r.setCache(cacheKey, department)
	logger.Info("Cached department: %d:%d", universityID, departmentID)

	return &department, nil
}

func (r *universityRepository) FindSubject(departmentID, subjectID uint) (*models.Subject, error) {
	cacheKey := fmt.Sprintf("subjects:%d:%d", departmentID, subjectID)

	// キャッシュをチェック
	if cached, found := r.getFromCache(cacheKey); found {
		logger.Info("Cache hit for FindSubject: %d:%d", departmentID, subjectID)
		subject := cached.(models.Subject)
		return &subject, nil
	}

	var subject models.Subject
	err := r.db.Preload("Department.University").
		Where("department_id = ? AND id = ?", departmentID, subjectID).
		First(&subject).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, &apperrors.ErrNotFound{Resource: "Subject", ID: subjectID}
		}
		return nil, &apperrors.ErrDatabaseOperation{Operation: "FindSubject", Err: err}
	}

	// キャッシュに保存
	r.setCache(cacheKey, subject)
	logger.Info("Cached subject: %d:%d", departmentID, subjectID)

	return &subject, nil
}

// translateDBError はデータベースエラーを適切な日本語メッセージに変換します
func translateDBError(err error) error {
	if err == nil {
		return nil
	}

	var dbErr *apperrors.ErrDatabaseOperation
	if errors.As(err, &dbErr) {
		return dbErr
	}

	switch {
	case errors.Is(err, gorm.ErrRecordNotFound):
		return &apperrors.ErrNotFound{Resource: "Resource", ID: 0}
	case errors.Is(err, gorm.ErrDuplicatedKey):
		return &apperrors.ErrInvalidInput{Field: "key", Message: errDuplicateKey}
	case strings.Contains(err.Error(), "deadlock"):
		return &apperrors.ErrDatabaseOperation{
			Operation: "database_operation",
			Err:      fmt.Errorf(errDeadlock, err),
		}
	default:
		return &apperrors.ErrDatabaseOperation{
			Operation: "database_operation",
			Err:      fmt.Errorf(errUnexpectedDB, err),
		}
	}
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

// validateName は名前の共通バリデーションを行います
func validateName(name string, field string) error {
	name = strings.TrimSpace(name)
	if len(name) < minNameLength {
		return &apperrors.ErrInvalidInput{
			Field:   field,
			Message: fmt.Sprintf(errMinLength, field),
		}
	}
	if len(name) > maxNameLength {
		return &apperrors.ErrInvalidInput{
			Field:   field,
			Message: fmt.Sprintf(errMaxLength, field, maxNameLength),
		}
	}
	return nil
}

// validateUniversity は大学のバリデーションを行います
func (r *universityRepository) validateUniversity(university *models.University) error {
	if university == nil {
		return &apperrors.ErrInvalidInput{
			Field:   "university",
			Message: errEmptyUniversity,
		}
	}

	// 大学名のバリデーション
	if err := validateName(university.Name, "大学名"); err != nil {
		return err
	}

	// バージョンチェック
	if university.Version < 1 {
		return &apperrors.ErrInvalidInput{
			Field:   "version",
			Message: errInvalidVersion,
		}
	}

	// 学部数のバリデーション
	if len(university.Departments) > maxDepartmentsPerUniversity {
		return &apperrors.ErrInvalidInput{
			Field:   "departments",
			Message: fmt.Sprintf(errMaxItems, "学部数", maxDepartmentsPerUniversity),
		}
	}

	// 関連エンティティのバリデーション
	if err := r.validateUniversityRelations(university); err != nil {
		return err
	}

	return nil
}

func (r *universityRepository) validateUniversityRelations(university *models.University) error {
	departmentNames := make(map[string]bool)

	for i, dept := range university.Departments {
		// 学部名の重複チェック
		if departmentNames[dept.Name] {
			return &apperrors.ErrInvalidInput{
				Field:   fmt.Sprintf("departments[%d].name", i),
				Message: fmt.Sprintf(errDuplicateName, "学部名", dept.Name),
			}
		}
		departmentNames[dept.Name] = true

		// 学部のバリデーション
		if err := r.validateDepartment(dept, i); err != nil {
			return err
		}
	}
	return nil
}

func (r *universityRepository) validateDepartment(dept models.Department, index int) error {
	// 学部名のバリデーション
	if err := validateName(dept.Name, fmt.Sprintf("departments[%d].name", index)); err != nil {
		return err
	}

	// バージョンチェック
	if dept.Version < 1 {
		return &apperrors.ErrInvalidInput{
			Field:   fmt.Sprintf("departments[%d].version", index),
			Message: errInvalidVersion,
		}
	}

	// 学科数のバリデーション
	if len(dept.Majors) > maxMajorsPerDepartment {
		return &apperrors.ErrInvalidInput{
			Field:   fmt.Sprintf("departments[%d].majors", index),
			Message: fmt.Sprintf(errMaxItems, "学科数", maxMajorsPerDepartment),
		}
	}

	majorNames := make(map[string]bool)
	for j, major := range dept.Majors {
		// 学科名の重複チェック
		if majorNames[major.Name] {
			return &apperrors.ErrInvalidInput{
				Field:   fmt.Sprintf("departments[%d].majors[%d].name", index, j),
				Message: fmt.Sprintf(errDuplicateName, "学科名", major.Name),
			}
		}
		majorNames[major.Name] = true

		// 学科のバリデーション
		if err := r.validateMajor(major, index, j); err != nil {
			return err
		}
	}
	return nil
}

func (r *universityRepository) validateMajor(major models.Major, deptIndex, majorIndex int) error {
	// 学科名のバリデーション
	if err := validateName(major.Name, fmt.Sprintf("departments[%d].majors[%d].name", deptIndex, majorIndex)); err != nil {
		return err
	}

	// バージョンチェック
	if major.Version < 1 {
		return &apperrors.ErrInvalidInput{
			Field:   fmt.Sprintf("departments[%d].majors[%d].version", deptIndex, majorIndex),
			Message: errInvalidVersion,
		}
	}

	// 入試スケジュールのバリデーション
	for k, schedule := range major.AdmissionSchedules {
		if err := r.validateAdmissionSchedule(schedule, deptIndex, majorIndex, k); err != nil {
			return err
		}
	}
	return nil
}

func (r *universityRepository) validateAdmissionSchedule(schedule models.AdmissionSchedule, deptIndex, majorIndex, scheduleIndex int) error {
	// スケジュール名のバリデーション
	if err := validateName(schedule.Name, fmt.Sprintf("departments[%d].majors[%d].admissionSchedules[%d].name", deptIndex, majorIndex, scheduleIndex)); err != nil {
		return err
	}

	// バージョンチェック
	if schedule.Version < 1 {
		return &apperrors.ErrInvalidInput{
			Field:   fmt.Sprintf("departments[%d].majors[%d].admissionSchedules[%d].version", deptIndex, majorIndex, scheduleIndex),
			Message: errInvalidVersion,
		}
	}

	// 表示順序のバリデーション
	if schedule.DisplayOrder < 0 {
		return &apperrors.ErrInvalidInput{
			Field:   fmt.Sprintf("departments[%d].majors[%d].admissionSchedules[%d].displayOrder", deptIndex, majorIndex, scheduleIndex),
			Message: fmt.Sprintf(errNonNegative, "表示順序"),
		}
	}

	// テストタイプのバリデーション
	for l, testType := range schedule.TestTypes {
		if err := r.validateTestType(testType, deptIndex, majorIndex, scheduleIndex, l); err != nil {
			return err
		}
	}
	return nil
}

func (r *universityRepository) validateTestType(testType models.TestType, deptIndex, majorIndex, scheduleIndex, testTypeIndex int) error {
	// テストタイプ名のバリデーション
	if err := validateName(testType.Name, fmt.Sprintf("departments[%d].majors[%d].admissionSchedules[%d].testTypes[%d].name", deptIndex, majorIndex, scheduleIndex, testTypeIndex)); err != nil {
		return err
	}

	// バージョンチェック
	if testType.Version < 1 {
		return &apperrors.ErrInvalidInput{
			Field:   fmt.Sprintf("departments[%d].majors[%d].admissionSchedules[%d].testTypes[%d].version", deptIndex, majorIndex, scheduleIndex, testTypeIndex),
			Message: errInvalidVersion,
		}
	}

	// 科目数のバリデーション
	if len(testType.Subjects) > maxSubjectsPerTestType {
		return &apperrors.ErrInvalidInput{
			Field:   fmt.Sprintf("departments[%d].majors[%d].admissionSchedules[%d].testTypes[%d].subjects", deptIndex, majorIndex, scheduleIndex, testTypeIndex),
			Message: fmt.Sprintf(errMaxItems, "科目数", maxSubjectsPerTestType),
		}
	}

	subjectNames := make(map[string]bool)
	for m, subject := range testType.Subjects {
		// 科目名の重複チェック
		if subjectNames[subject.Name] {
			return &apperrors.ErrInvalidInput{
				Field:   fmt.Sprintf("departments[%d].majors[%d].admissionSchedules[%d].testTypes[%d].subjects[%d].name", deptIndex, majorIndex, scheduleIndex, testTypeIndex, m),
				Message: fmt.Sprintf(errDuplicateName, "科目名", subject.Name),
			}
		}
		subjectNames[subject.Name] = true

		// 科目のバリデーション
		if err := r.validateSubject(subject, deptIndex, majorIndex, scheduleIndex, testTypeIndex, m); err != nil {
			return err
		}
	}
	return nil
}

func (r *universityRepository) validateSubject(subject models.Subject, deptIndex, majorIndex, scheduleIndex, testTypeIndex, subjectIndex int) error {
	// 科目名のバリデーション
	if err := validateName(subject.Name, fmt.Sprintf("departments[%d].majors[%d].admissionSchedules[%d].testTypes[%d].subjects[%d].name", deptIndex, majorIndex, scheduleIndex, testTypeIndex, subjectIndex)); err != nil {
		return err
	}

	// バージョンチェック
	if subject.Version < 1 {
		return &apperrors.ErrInvalidInput{
			Field:   fmt.Sprintf("departments[%d].majors[%d].admissionSchedules[%d].testTypes[%d].subjects[%d].version", deptIndex, majorIndex, scheduleIndex, testTypeIndex, subjectIndex),
			Message: errInvalidVersion,
		}
	}

	// スコアのバリデーション
	if subject.Score < 0 {
		return &apperrors.ErrInvalidInput{
			Field:   fmt.Sprintf("departments[%d].majors[%d].admissionSchedules[%d].testTypes[%d].subjects[%d].score", deptIndex, majorIndex, scheduleIndex, testTypeIndex, subjectIndex),
			Message: fmt.Sprintf(errNonNegative, "得点"),
		}
	}

	// パーセンテージのバリデーション
	if subject.Percentage < 0 || subject.Percentage > 100 {
		return &apperrors.ErrInvalidInput{
			Field:   fmt.Sprintf("departments[%d].majors[%d].admissionSchedules[%d].testTypes[%d].subjects[%d].percentage", deptIndex, majorIndex, scheduleIndex, testTypeIndex, subjectIndex),
			Message: errPercentageRange,
		}
	}

	// 表示順序のバリデーション
	if subject.DisplayOrder < 0 {
		return &apperrors.ErrInvalidInput{
			Field:   fmt.Sprintf("departments[%d].majors[%d].admissionSchedules[%d].testTypes[%d].subjects[%d].displayOrder", deptIndex, majorIndex, scheduleIndex, testTypeIndex, subjectIndex),
			Message: fmt.Sprintf(errNonNegative, "表示順序"),
		}
	}

	return nil
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
		return translateDBError(err)
	}
		return nil
	})

	if err != nil {
		return err
	}

	// キャッシュをクリア
	r.clearAllRelatedCache(university.ID)
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
			return &apperrors.ErrDatabaseOperation{Operation: "Update", Err: err}
	}
		return nil
	})

	if err != nil {
		return err
	}

	// 全てのキャッシュをクリア
	r.clearAllRelatedCache(university.ID)
	return nil
}

// Delete は大学を削除します
func (r *universityRepository) Delete(id uint) error {
	err := r.db.Transaction(func(tx *gorm.DB) error {
	if err := tx.Unscoped().Delete(&models.University{}, id).Error; err != nil {
			return &apperrors.ErrDatabaseOperation{Operation: "Delete", Err: err}
	}
		return nil
	})

	if err != nil {
		return err
	}

	// キャッシュをクリア
	r.clearAllRelatedCache(id)
	return nil
}

// CreateDepartment は新しい学部を作成します
func (r *universityRepository) CreateDepartment(department *models.Department) error {
	if err := r.db.Create(department).Error; err != nil {
		return &apperrors.ErrDatabaseOperation{Operation: "CreateDepartment", Err: err}
	}
	return nil
}

// UpdateDepartment は既存の学部を更新します
func (r *universityRepository) UpdateDepartment(department *models.Department) error {
	err := r.db.Transaction(func(tx *gorm.DB) error {
	if err := tx.Save(department).Error; err != nil {
			return &apperrors.ErrDatabaseOperation{Operation: "UpdateDepartment", Err: err}
	}
		return nil
	})

	if err != nil {
		return err
	}

	// 全てのキャッシュをクリア
	r.clearAllRelatedCache(department.UniversityID)
	return nil
}

// DeleteDepartment は学部を削除します
func (r *universityRepository) DeleteDepartment(id uint) error {
	if err := r.db.Delete(&models.Department{}, id).Error; err != nil {
		return &apperrors.ErrDatabaseOperation{Operation: "DeleteDepartment", Err: err}
	}
	return nil
}

// CreateSubject は新しい科目を作成します
func (r *universityRepository) CreateSubject(subject *models.Subject) error {
	if err := r.db.Create(subject).Error; err != nil {
		return &apperrors.ErrDatabaseOperation{Operation: "CreateSubject", Err: err}
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
	logger.Info("バッチ更新開始: testTypeID=%d, 科目数=%d", testTypeID, len(subjects))

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

func (r *universityRepository) updateSubjectInList(allSubjects []models.Subject, subject *models.Subject) []models.Subject {
	for i, s := range allSubjects {
		if s.ID == subject.ID {
			subject.DisplayOrder = s.DisplayOrder
			allSubjects[i] = *subject
			break
		}
	}
	return allSubjects
}

func (r *universityRepository) UpdateSubject(subject *models.Subject) error {
	err := r.db.Transaction(func(tx *gorm.DB) error {
	allSubjects, err := r.getExistingSubjects(tx, subject.TestTypeID)
	if err != nil {
			return &apperrors.ErrDatabaseOperation{Operation: "UpdateSubject", Err: err}
	}

	allSubjects = r.updateSubjectInList(allSubjects, subject)

	if err := r.updateSubjectScores(tx, allSubjects); err != nil {
			return &apperrors.ErrDatabaseOperation{Operation: "UpdateSubject", Err: err}
	}
		return nil
	})

	if err != nil {
		return err
	}

	r.clearSubjectsCache(subject.TestTypeID)
	r.clearAllRelatedCache(0)
	return nil
}

// DeleteSubject は科目を削除します
func (r *universityRepository) DeleteSubject(id uint) error {
	if err := r.db.Delete(&models.Subject{}, id).Error; err != nil {
		return &apperrors.ErrDatabaseOperation{Operation: "DeleteSubject", Err: err}
	}
	return nil
}

func (r *universityRepository) clearSubjectsCache(testTypeID uint) {
	var subjects []models.Subject
	if err := r.db.Where(testTypeIDQuery, testTypeID).Find(&subjects).Error; err == nil {
		for _, subj := range subjects {
			r.cache.Delete(fmt.Sprintf("subjects:%d:%d", testTypeID, subj.ID))
		}
	}
}

func (r *universityRepository) clearAllRelatedCache(universityID uint) {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	// バッチ処理でキャッシュをクリア
	keys := []string{
		cacheKeyAllUniversities,
		fmt.Sprintf(cacheKeyUniversityFormat, universityID),
	}

	var departments []models.Department
	if err := r.db.Where("university_id = ?", universityID).Find(&departments).Error; err == nil {
		for _, dept := range departments {
			keys = append(keys, fmt.Sprintf("departments:%d:%d", universityID, dept.ID))
		}
	}

	for _, key := range keys {
		r.cache.Delete(key)
	}

	logger.Info("Cleared all related cache for university ID: %d", universityID)
}

// TransactionOption はトランザクションのオプションを定義します
type TransactionOption struct {
	Isolation   sql.IsolationLevel
	Timeout     time.Duration
	RetryPolicy *backoff.ExponentialBackOff
}

// DefaultTransactionOption はデフォルトのトランザクションオプションを返します
func DefaultTransactionOption() *TransactionOption {
	return &TransactionOption{
		Isolation: sql.LevelDefault,
		Timeout:   txTimeout,
		RetryPolicy: &backoff.ExponentialBackOff{
			InitialInterval:     initialInterval,
			MaxInterval:         maxInterval,
			MaxElapsedTime:     txTimeout,
			Multiplier:         multiplier,
			RandomizationFactor: randomizationFactor,
		},
	}
}

// Transaction はトランザクション内でリポジトリの操作を実行します
func (r *universityRepository) Transaction(fn func(repo IUniversityRepository) error) error {
	return r.TransactionWithOption(fn, DefaultTransactionOption())
}

// TransactionWithOption は指定されたオプションでトランザクションを実行します
func (r *universityRepository) TransactionWithOption(fn func(repo IUniversityRepository) error, opt *TransactionOption) error {
	operation := func() error {
		return r.db.Transaction(func(tx *gorm.DB) error {
			ctx, cancel := context.WithTimeout(context.Background(), opt.Timeout)
			defer cancel()

			// トランザクション分離レベルの設定
			if err := tx.Exec(fmt.Sprintf("SET TRANSACTION ISOLATION LEVEL %v", opt.Isolation)).Error; err != nil {
				return fmt.Errorf("failed to set isolation level: %w", err)
			}

			// デッドロック検出のためのロックタイムアウト設定
			if err := tx.Exec("SET LOCAL lock_timeout = ?", opt.Timeout.Milliseconds()).Error; err != nil {
				return fmt.Errorf(errLockTimeout, err)
			}

			// コンテキストの設定
			tx = tx.WithContext(ctx)
			txRepo := r.WithTx(tx)

			// トランザクション本体の実行
			if err := fn(txRepo); err != nil {
				var dbErr *apperrors.ErrDatabaseOperation
				if errors.As(err, &dbErr) && strings.Contains(err.Error(), "deadlock") {
					return err // リトライ可能なエラー
				}
				return backoff.Permanent(fmt.Errorf(errTransactionFailed, err))
			}
			return nil
		})
	}

	return backoff.RetryNotify(operation, opt.RetryPolicy, func(err error, duration time.Duration) {
		logger.Error("トランザクションの再試行: %v後 エラー: %v", duration, err)
	})
}

// WithTx はトランザクション用のリポジトリインスタンスを返します
func (r *universityRepository) WithTx(tx *gorm.DB) IUniversityRepository {
	return &universityRepository{
		db:    tx,
		cache: r.cache,
		mutex: r.mutex,
	}
}

// UpdateMajor は既存の学科を更新します
func (r *universityRepository) UpdateMajor(major *models.Major) error {
	err := r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(major).Error; err != nil {
			return &apperrors.ErrDatabaseOperation{Operation: "UpdateMajor", Err: err}
		}
		return nil
	})

	if err != nil {
		return err
	}

	// 全てのキャッシュをクリア
	r.clearAllRelatedCache(major.DepartmentID)
	return nil
}

// UpdateAdmissionSchedule は既存の入試スケジュールを更新します
func (r *universityRepository) UpdateAdmissionSchedule(schedule *models.AdmissionSchedule) error {
	err := r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(schedule).Error; err != nil {
			return &apperrors.ErrDatabaseOperation{Operation: "UpdateAdmissionSchedule", Err: err}
		}
		return nil
	})

	if err != nil {
		return err
	}

	// 全てのキャッシュをクリア
	r.clearAllRelatedCache(schedule.MajorID)
	return nil
}

// UpdateAdmissionInfo は既存の入試情報を更新します
func (r *universityRepository) UpdateAdmissionInfo(info *models.AdmissionInfo) error {
	err := r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(info).Error; err != nil {
			return &apperrors.ErrDatabaseOperation{Operation: "UpdateAdmissionInfo", Err: err}
		}
		return nil
	})

	if err != nil {
		return err
	}

	// 全てのキャッシュをクリア
	r.clearAllRelatedCache(info.AdmissionScheduleID)
	return nil
}
