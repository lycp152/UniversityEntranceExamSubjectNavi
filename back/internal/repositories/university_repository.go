package repositories

import (
	"fmt"
	"strings"
	"sync"
	"time"
	"university-exam-api/internal/domain/models"
	"university-exam-api/internal/errors"
	"university-exam-api/pkg/logger"

	"github.com/microcosm-cc/bluemonday"
	gocache "github.com/patrickmn/go-cache"
	"gorm.io/gorm"
)

const (
	preloadPath = "Departments.Majors.AdmissionSchedules.TestTypes.Subjects"
	cacheDuration = 5 * time.Minute
	cacheCleanupInterval = 10 * time.Minute
	departmentIDQuery = "department_id = ?"
	cacheKeyAllUniversities = "universities:all"
	displayOrderASC = "display_order ASC"
	cacheKeyUniversityFormat = "universities:%d"
	maxRetries = 3
)

// UniversityRepository インターフェース
type IUniversityRepository interface {
	WithTx(tx *gorm.DB) IUniversityRepository
	Transaction(fn func(repo IUniversityRepository) error) error
	FindAll() ([]models.University, error)
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
}

// UniversityRepository 実装
type universityRepository struct {
	db    *gorm.DB
	cache *gocache.Cache
	mutex sync.RWMutex
}

// NewUniversityRepository はリポジトリのインスタンスを生成します
func NewUniversityRepository(db *gorm.DB) IUniversityRepository {
	return &universityRepository{
		db:    db,
		cache: gocache.New(cacheDuration, cacheCleanupInterval),
		mutex: sync.RWMutex{},
	}
}

func (r *universityRepository) applyPreloads(query *gorm.DB) *gorm.DB {
	if query == nil {
		return nil
	}
	return query.Preload("Departments").
		Preload("Departments.Majors").
		Preload("Departments.Majors.AdmissionSchedules").
		Preload("Departments.Majors.AdmissionSchedules.AdmissionInfos", func(db *gorm.DB) *gorm.DB {
			return db.Order("created_at ASC")
		}).
		Preload("Departments.Majors.AdmissionSchedules.TestTypes", func(db *gorm.DB) *gorm.DB {
			return db.Order("name ASC")
		}).
		Preload("Departments.Majors.AdmissionSchedules.TestTypes.Subjects", func(db *gorm.DB) *gorm.DB {
			return db.Order(displayOrderASC)
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

func (r *universityRepository) FindAll() ([]models.University, error) {
	var universities []models.University

	if cached, found := r.getFromCache(cacheKeyAllUniversities); found {
		return cached.([]models.University), nil
	}

	for i := 0; i < maxRetries; i++ {
		if err := r.applyPreloads(r.db).Find(&universities).Error; err != nil {
			if i == maxRetries-1 {
				return nil, translateDBError(err)
			}
			time.Sleep(time.Millisecond * 100 * time.Duration(i+1))
			continue
		}
		break
	}

	r.setCache(cacheKeyAllUniversities, universities)
	return universities, nil
}

func (r *universityRepository) getUniversityFromCache(id uint) (*models.University, bool) {
	cacheKey := fmt.Sprintf(cacheKeyUniversityFormat, id)
	if cached, found := r.getFromCache(cacheKey); found {
		logger.Info("Cache hit for FindByID: %d", id)
		university := cached.(models.University)
		return &university, true
	}
	return nil, false
}

func (r *universityRepository) getUniversityFromDB(id uint) (*models.University, error) {
	var university models.University
	if err := r.applyPreloads(r.db).First(&university, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, &errors.ErrNotFound{Resource: "University", ID: id}
		}
		return nil, &errors.ErrDatabaseOperation{Operation: "FindByID", Err: err}
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
	r.setCache(cacheKey, *university)
	logger.Info("Cached university with ID: %d", id)

	return university, nil
}

func (r *universityRepository) Search(query string) ([]models.University, error) {
	if query == "" {
		return nil, &errors.ErrInvalidInput{Field: "query", Message: "search query cannot be empty"}
	}

	cacheKey := fmt.Sprintf("universities:search:%s", query)
	if cached, found := r.getFromCache(cacheKey); found {
		return cached.([]models.University), nil
	}

	var universities []models.University
	err := r.db.Preload(preloadPath).
		Where("universities.name LIKE ?", "%"+query+"%").
		Or("departments.name LIKE ?", "%"+query+"%").
		Or("departments.major LIKE ?", "%"+query+"%").
		Joins("LEFT JOIN departments ON departments.university_id = universities.id").
		Group("universities.id").
		Find(&universities).Error

	if err != nil {
		return nil, &errors.ErrDatabaseOperation{Operation: "Search", Err: err}
	}

	r.setCache(cacheKey, universities)
	logger.Info("Cached search results for query: %s", query)

	return universities, nil
}

func (r *universityRepository) FindDepartment(universityID, departmentID uint) (*models.Department, error) {
	cacheKey := fmt.Sprintf("departments:%d:%d", universityID, departmentID)

	// キャッシュをチェック
	if cached, found := r.getFromCache(cacheKey); found {
		logger.Info("Cache hit for FindDepartment: %d:%d", universityID, departmentID)
		department := cached.(models.Department)
		return &department, nil
	}

	var department models.Department
	err := r.db.Preload("Subjects", func(db *gorm.DB) *gorm.DB {
		return db.Order(displayOrderASC)
	}).
		Where("university_id = ? AND id = ?", universityID, departmentID).
		First(&department).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, &errors.ErrNotFound{Resource: "Department", ID: departmentID}
		}
		return nil, &errors.ErrDatabaseOperation{Operation: "FindDepartment", Err: err}
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
			return nil, &errors.ErrNotFound{Resource: "Subject", ID: subjectID}
		}
		return nil, &errors.ErrDatabaseOperation{Operation: "FindSubject", Err: err}
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

	switch {
	case strings.Contains(err.Error(), "duplicate key"):
		return fmt.Errorf("データが重複しています: %w", err)
	case strings.Contains(err.Error(), "foreign key"):
		return fmt.Errorf("関連するデータが存在しません: %w", err)
	default:
		return fmt.Errorf("データベースエラー: %w", err)
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

// validateUniversity は大学のバリデーションを行います
func (r *universityRepository) validateUniversity(university *models.University) error {
	// 空の文字列のチェック
	if university.Name == "" {
		return fmt.Errorf("university name cannot be empty")
	}

	// null byteのチェック
	if strings.Contains(university.Name, "\x00") {
		return fmt.Errorf("university name contains null byte")
	}

	// 学部名のチェック
	for i := range university.Departments {
		if university.Departments[i].Name == "" {
			return fmt.Errorf("department name cannot be empty")
		}
		if strings.Contains(university.Departments[i].Name, "\x00") {
			return fmt.Errorf("department name contains null byte")
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

	// トランザクションを開始
	tx := r.db.Begin()
	if tx.Error != nil {
		return &errors.ErrDatabaseOperation{Operation: "Create", Err: tx.Error}
	}

	// 大学を作成
	if err := tx.Create(university).Error; err != nil {
		tx.Rollback()
		return translateDBError(err)
	}

	// トランザクションをコミット
	if err := tx.Commit().Error; err != nil {
		return &errors.ErrDatabaseOperation{Operation: "Create", Err: err}
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

	// トランザクションを開始
	tx := r.db.Begin()
	if tx.Error != nil {
		return &errors.ErrDatabaseOperation{Operation: "Update", Err: tx.Error}
	}

	// 更新を実行
	if err := tx.Save(university).Error; err != nil {
		tx.Rollback()
		return &errors.ErrDatabaseOperation{Operation: "Update", Err: err}
	}

	// トランザクションをコミット
	if err := tx.Commit().Error; err != nil {
		return &errors.ErrDatabaseOperation{Operation: "Update", Err: err}
	}

	// 全てのキャッシュをクリア
	r.clearAllRelatedCache(university.ID)
	return nil
}

// Delete は大学を削除します
func (r *universityRepository) Delete(id uint) error {
	// トランザクションを開始
	tx := r.db.Begin()
	if tx.Error != nil {
		return &errors.ErrDatabaseOperation{Operation: "Delete", Err: tx.Error}
	}

	// 大学を物理削除（関連レコードも含めて）
	if err := tx.Unscoped().Delete(&models.University{}, id).Error; err != nil {
		tx.Rollback()
		return &errors.ErrDatabaseOperation{Operation: "Delete", Err: err}
	}

	// トランザクションをコミット
	if err := tx.Commit().Error; err != nil {
		return &errors.ErrDatabaseOperation{Operation: "Delete", Err: err}
	}

	// キャッシュをクリア
	r.clearAllRelatedCache(id)
	return nil
}

// CreateDepartment は新しい学部を作成します
func (r *universityRepository) CreateDepartment(department *models.Department) error {
	if err := r.db.Create(department).Error; err != nil {
		return &errors.ErrDatabaseOperation{Operation: "CreateDepartment", Err: err}
	}
	return nil
}

// UpdateDepartment は既存の学部を更新します
func (r *universityRepository) UpdateDepartment(department *models.Department) error {
	// トランザクションを開始
	tx := r.db.Begin()
	if tx.Error != nil {
		return &errors.ErrDatabaseOperation{Operation: "UpdateDepartment", Err: tx.Error}
	}

	// 更新を実行
	if err := tx.Save(department).Error; err != nil {
		tx.Rollback()
		return &errors.ErrDatabaseOperation{Operation: "UpdateDepartment", Err: err}
	}

	// トランザクションをコミット
	if err := tx.Commit().Error; err != nil {
		return &errors.ErrDatabaseOperation{Operation: "UpdateDepartment", Err: err}
	}

	// 全てのキャッシュをクリア
	r.clearAllRelatedCache(department.UniversityID)
	return nil
}

// DeleteDepartment は学部を削除します
func (r *universityRepository) DeleteDepartment(id uint) error {
	if err := r.db.Delete(&models.Department{}, id).Error; err != nil {
		return &errors.ErrDatabaseOperation{Operation: "DeleteDepartment", Err: err}
	}
	return nil
}

// CreateSubject は新しい科目を作成します
func (r *universityRepository) CreateSubject(subject *models.Subject) error {
	if err := r.db.Create(subject).Error; err != nil {
		return &errors.ErrDatabaseOperation{Operation: "CreateSubject", Err: err}
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

func (r *universityRepository) updateSubjectsWithOrder(existingSubjects []models.Subject, newSubjects []models.Subject, testTypeID uint) []models.Subject {
	updatedSubjects := make([]models.Subject, len(existingSubjects))
	copy(updatedSubjects, existingSubjects)

	for i, existingSubject := range existingSubjects {
		for _, newSubject := range newSubjects {
			if existingSubject.ID == newSubject.ID {
				newSubject.TestTypeID = testTypeID
				newSubject.DisplayOrder = existingSubject.DisplayOrder
				updatedSubjects[i] = newSubject
				break
			}
		}
	}
	return updatedSubjects
}

func (r *universityRepository) executeInTransaction(operation func(*gorm.DB) error) error {
	tx := r.db.Begin()
	if tx.Error != nil {
		return &errors.ErrDatabaseOperation{Operation: "Transaction", Err: tx.Error}
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	if err := operation(tx); err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}

func (r *universityRepository) UpdateSubjectsBatch(testTypeID uint, subjects []models.Subject) error {
	logger.Info("Starting UpdateSubjectsBatch for testTypeID: %d with %d subjects", testTypeID, len(subjects))

	err := r.executeInTransaction(func(tx *gorm.DB) error {
		existingSubjects, err := r.getExistingSubjects(tx, testTypeID)
		if err != nil {
			return &errors.ErrDatabaseOperation{Operation: "UpdateSubjectsBatch", Err: err}
		}

		updatedSubjects := r.updateSubjectsWithOrder(existingSubjects, subjects, testTypeID)
		if err := r.updateSubjectScores(tx, updatedSubjects); err != nil {
			return &errors.ErrDatabaseOperation{Operation: "UpdateSubjectsBatch", Err: err}
		}
		return nil
	})

	if err != nil {
		return err
	}

	r.clearSubjectsCache(testTypeID)
	r.clearAllRelatedCache(0)
	logger.Info("Successfully updated subjects batch")
	return nil
}

// getExistingSubjects は既存の科目を取得します
func (r *universityRepository) getExistingSubjects(tx *gorm.DB, testTypeID uint) ([]models.Subject, error) {
	var subjects []models.Subject
	if err := tx.Where("test_type_id = ?", testTypeID).
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
	tx := r.db.Begin()
	if tx.Error != nil {
		return &errors.ErrDatabaseOperation{Operation: "UpdateSubject", Err: tx.Error}
	}

	allSubjects, err := r.getExistingSubjects(tx, subject.TestTypeID)
	if err != nil {
		tx.Rollback()
		return &errors.ErrDatabaseOperation{Operation: "UpdateSubject", Err: err}
	}

	allSubjects = r.updateSubjectInList(allSubjects, subject)

	if err := r.updateSubjectScores(tx, allSubjects); err != nil {
		tx.Rollback()
		return &errors.ErrDatabaseOperation{Operation: "UpdateSubject", Err: err}
	}

	if err := tx.Commit().Error; err != nil {
		return &errors.ErrDatabaseOperation{Operation: "UpdateSubject", Err: err}
	}

	r.clearSubjectsCache(subject.TestTypeID)
	r.clearAllRelatedCache(0)
	return nil
}

// DeleteSubject は科目を削除します
func (r *universityRepository) DeleteSubject(id uint) error {
	if err := r.db.Delete(&models.Subject{}, id).Error; err != nil {
		return &errors.ErrDatabaseOperation{Operation: "DeleteSubject", Err: err}
	}
	return nil
}

func (r *universityRepository) clearSubjectsCache(testTypeID uint) {
	var subjects []models.Subject
	if err := r.db.Where("test_type_id = ?", testTypeID).Find(&subjects).Error; err == nil {
		for _, subj := range subjects {
			r.cache.Delete(fmt.Sprintf("subjects:%d:%d", testTypeID, subj.ID))
		}
	}
}

func (r *universityRepository) clearDepartmentCache(universityID uint, department models.Department) {
	r.cache.Delete(fmt.Sprintf("departments:%d:%d", universityID, department.ID))
}

func (r *universityRepository) clearUniversityCache(universityID uint) {
	r.cache.Delete(fmt.Sprintf(cacheKeyUniversityFormat, universityID))
	r.cache.Set(fmt.Sprintf(cacheKeyUniversityFormat, universityID), nil, 0)
}

func (r *universityRepository) clearAllRelatedCache(universityID uint) {
	r.cache.Delete(cacheKeyAllUniversities)
	r.clearUniversityCache(universityID)

	var departments []models.Department
	if err := r.db.Where("university_id = ?", universityID).Find(&departments).Error; err == nil {
		for _, dept := range departments {
			r.clearDepartmentCache(universityID, dept)
		}
	}

	r.cache.Set(cacheKeyAllUniversities, nil, 0)
	logger.Info("Cleared all related cache for university ID: %d", universityID)
}

// WithTx wraps the repository with a transaction
func (r *universityRepository) WithTx(tx *gorm.DB) IUniversityRepository {
	return &universityRepository{
		db:    tx,
		cache: r.cache,
	}
}

// Transaction executes operations in a transaction
func (r *universityRepository) Transaction(fn func(repo IUniversityRepository) error) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		return fn(r.WithTx(tx))
	})
}
