package repositories

import (
	"fmt"
	"time"
	"university-exam-api/internal/domain/models"
	"university-exam-api/internal/errors"
	"university-exam-api/internal/infrastructure/cache"
	"university-exam-api/pkg/logger"

	"gorm.io/gorm"
)

const (
	preloadQuery = "Departments.Subjects"
	cacheDuration = 1 * time.Minute
	departmentIDQuery = "department_id = ?"
	cacheKeyAllUniversities = "universities:all"
	displayOrderASC = "display_order ASC"
	cacheKeyUniversityFormat = "universities:%d"
)

type UniversityRepository struct {
	db    *gorm.DB
	cache *cache.Cache
}

func NewUniversityRepository(db *gorm.DB) *UniversityRepository {
	return &UniversityRepository{
		db:    db,
		cache: cache.GetInstance(),
	}
}

func (r *UniversityRepository) FindAll() ([]models.University, error) {
	cacheKey := cacheKeyAllUniversities

	// キャッシュをチェック
	if cached, found := r.cache.Get(cacheKey); found {
		logger.Info("Cache hit for FindAll")
		return cached.([]models.University), nil
	}

	var universities []models.University
	if err := r.db.Preload("Departments").
		Preload("Departments.Majors").
		Preload("Departments.Majors.ExamInfos").
		Preload("Departments.Majors.ExamInfos.Schedule").
		Preload("Departments.Majors.ExamInfos.Subjects", func(db *gorm.DB) *gorm.DB {
			return db.Order(displayOrderASC)
		}).
		Preload("Departments.Majors.ExamInfos.Subjects.TestScores").
		Find(&universities).Error; err != nil {
		return nil, &errors.ErrDatabaseOperation{Operation: "FindAll", Err: err}
	}

	// キャッシュに保存
	r.cache.Set(cacheKey, universities, cacheDuration)
	logger.Info("Cached FindAll results")

	return universities, nil
}

func (r *UniversityRepository) FindByID(id uint) (*models.University, error) {
	cacheKey := fmt.Sprintf(cacheKeyUniversityFormat, id)

	// キャッシュをチェック
	if cached, found := r.cache.Get(cacheKey); found {
		logger.Info("Cache hit for FindByID: %d", id)
		return cached.(*models.University), nil
	}

	var university models.University
	if err := r.db.Preload("Departments").
		Preload("Departments.Majors").
		Preload("Departments.Majors.ExamInfos").
		Preload("Departments.Majors.ExamInfos.Schedule").
		Preload("Departments.Majors.ExamInfos.Subjects", func(db *gorm.DB) *gorm.DB {
			return db.Order(displayOrderASC)
		}).
		Preload("Departments.Majors.ExamInfos.Subjects.TestScores").
		First(&university, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, &errors.ErrNotFound{Resource: "University", ID: id}
		}
		return nil, &errors.ErrDatabaseOperation{Operation: "FindByID", Err: err}
	}

	// キャッシュに保存
	r.cache.Set(cacheKey, &university, cacheDuration)
	logger.Info("Cached university with ID: %d", id)

	return &university, nil
}

func (r *UniversityRepository) Search(query string) ([]models.University, error) {
	if query == "" {
		return nil, &errors.ErrInvalidInput{Field: "query", Message: "search query cannot be empty"}
	}

	cacheKey := fmt.Sprintf("universities:search:%s", query)

	// キャッシュをチェック
	if cached, found := r.cache.Get(cacheKey); found {
		logger.Info("Cache hit for Search: %s", query)
		return cached.([]models.University), nil
	}

	var universities []models.University
	err := r.db.Preload(preloadQuery).
		Where("universities.name LIKE ?", "%"+query+"%").
		Or("departments.name LIKE ?", "%"+query+"%").
		Or("departments.major LIKE ?", "%"+query+"%").
		Joins("LEFT JOIN departments ON departments.university_id = universities.id").
		Group("universities.id").
		Find(&universities).Error

	if err != nil {
		return nil, &errors.ErrDatabaseOperation{Operation: "Search", Err: err}
	}

	// キャッシュに保存
	r.cache.Set(cacheKey, universities, cacheDuration)
	logger.Info("Cached search results for query: %s", query)

	return universities, nil
}

func (r *UniversityRepository) FindDepartment(universityID, departmentID uint) (*models.Department, error) {
	cacheKey := fmt.Sprintf("departments:%d:%d", universityID, departmentID)

	// キャッシュをチェック
	if cached, found := r.cache.Get(cacheKey); found {
		logger.Info("Cache hit for FindDepartment: %d:%d", universityID, departmentID)
		return cached.(*models.Department), nil
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
	r.cache.Set(cacheKey, &department, cacheDuration)
	logger.Info("Cached department: %d:%d", universityID, departmentID)

	return &department, nil
}

func (r *UniversityRepository) FindSubject(departmentID, subjectID uint) (*models.Subject, error) {
	cacheKey := fmt.Sprintf("subjects:%d:%d", departmentID, subjectID)

	// キャッシュをチェック
	if cached, found := r.cache.Get(cacheKey); found {
		logger.Info("Cache hit for FindSubject: %d:%d", departmentID, subjectID)
		return cached.(*models.Subject), nil
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
	r.cache.Set(cacheKey, &subject, cacheDuration)
	logger.Info("Cached subject: %d:%d", departmentID, subjectID)

	return &subject, nil
}

// Create は新しい大学を作成します
func (r *UniversityRepository) Create(university *models.University) error {
	if err := r.db.Create(university).Error; err != nil {
		return &errors.ErrDatabaseOperation{Operation: "Create", Err: err}
	}
	return nil
}

// Update は既存の大学を更新します
func (r *UniversityRepository) Update(university *models.University) error {
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
func (r *UniversityRepository) Delete(id uint) error {
	if err := r.db.Delete(&models.University{}, id).Error; err != nil {
		return &errors.ErrDatabaseOperation{Operation: "Delete", Err: err}
	}
	return nil
}

// CreateDepartment は新しい学部を作成します
func (r *UniversityRepository) CreateDepartment(department *models.Department) error {
	if err := r.db.Create(department).Error; err != nil {
		return &errors.ErrDatabaseOperation{Operation: "CreateDepartment", Err: err}
	}
	return nil
}

// UpdateDepartment は既存の学部を更新します
func (r *UniversityRepository) UpdateDepartment(department *models.Department) error {
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
func (r *UniversityRepository) DeleteDepartment(id uint) error {
	if err := r.db.Delete(&models.Department{}, id).Error; err != nil {
		return &errors.ErrDatabaseOperation{Operation: "DeleteDepartment", Err: err}
	}
	return nil
}

// CreateSubject は新しい科目を作成します
func (r *UniversityRepository) CreateSubject(subject *models.Subject) error {
	if err := r.db.Create(subject).Error; err != nil {
		return &errors.ErrDatabaseOperation{Operation: "CreateSubject", Err: err}
	}
	return nil
}

// calculateTotalScore は総得点を計算します
func (r *UniversityRepository) calculateTotalScore(subjects []models.Subject) float64 {
	var total float64
	for _, s := range subjects {
		for _, ts := range s.TestScores {
			total += float64(ts.Score)
		}
	}
	return total
}

// updatePercentages はパーセンテージを更新します
func (r *UniversityRepository) updatePercentages(subjects []models.Subject, totalScore float64) {
	if totalScore > 0 {
		for i := range subjects {
			for j := range subjects[i].TestScores {
				subjects[i].TestScores[j].Percentage = float64(subjects[i].TestScores[j].Score) / totalScore * 100
			}
		}
	}
}

// saveSubjectWithScores は科目とスコアを保存します
func (r *UniversityRepository) saveSubjectWithScores(tx *gorm.DB, subject models.Subject) error {
	if err := tx.Unscoped().Where("subject_id = ?", subject.ID).Delete(&models.TestScore{}).Error; err != nil {
		return err
	}

	if err := tx.Model(&models.Subject{}).Where("id = ?", subject.ID).Updates(map[string]interface{}{
		"exam_info_id":   subject.ExamInfoID,
		"name":          subject.Name,
		"display_order": subject.DisplayOrder,
	}).Error; err != nil {
		return err
	}

	for _, ts := range subject.TestScores {
		ts.SubjectID = subject.ID
		if err := tx.Create(&ts).Error; err != nil {
			return err
		}
	}
	return nil
}

// updateSubjectScores は科目のスコアを更新します
func (r *UniversityRepository) updateSubjectScores(tx *gorm.DB, subjects []models.Subject) error {
	totalScore := r.calculateTotalScore(subjects)
	r.updatePercentages(subjects, totalScore)

	for _, s := range subjects {
		if err := r.saveSubjectWithScores(tx, s); err != nil {
			return err
		}
	}
	return nil
}

// UpdateSubjectsBatch は複数の科目を一括で更新します
func (r *UniversityRepository) UpdateSubjectsBatch(departmentID uint, subjects []models.Subject) error {
	logger.Info("Starting UpdateSubjectsBatch for departmentID: %d with %d subjects", departmentID, len(subjects))

	tx := r.db.Begin()
	if tx.Error != nil {
		return &errors.ErrDatabaseOperation{Operation: "UpdateSubjectsBatch", Err: tx.Error}
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	examInfo, err := r.getExamInfoForDepartment(tx, departmentID)
	if err != nil {
		tx.Rollback()
		return &errors.ErrDatabaseOperation{Operation: "UpdateSubjectsBatch", Err: err}
	}

	existingSubjects, err := r.getExistingSubjects(tx, examInfo.ID)
	if err != nil {
		tx.Rollback()
		return &errors.ErrDatabaseOperation{Operation: "UpdateSubjectsBatch", Err: err}
	}

	updatedSubjects := make([]models.Subject, len(existingSubjects))
	copy(updatedSubjects, existingSubjects)

	for i, existingSubject := range existingSubjects {
		for _, newSubject := range subjects {
			if existingSubject.ID == newSubject.ID {
				newSubject.ExamInfoID = examInfo.ID
				newSubject.DisplayOrder = existingSubject.DisplayOrder
				updatedSubjects[i] = newSubject
				break
			}
		}
	}

	if err := r.updateSubjectScores(tx, updatedSubjects); err != nil {
		tx.Rollback()
		return &errors.ErrDatabaseOperation{Operation: "UpdateSubjectsBatch", Err: err}
	}

	if err := tx.Commit().Error; err != nil {
		return &errors.ErrDatabaseOperation{Operation: "UpdateSubjectsBatch", Err: err}
	}

	r.clearAllRelatedCache(0)
	logger.Info("Successfully updated subjects batch")
	return nil
}

// clearDepartmentCache は学部のキャッシュをクリアします
func (r *UniversityRepository) clearDepartmentCache(universityID uint, department models.Department) {
	r.cache.Delete(fmt.Sprintf("departments:%d:%d", universityID, department.ID))
	var subjects []models.Subject
	if err := r.db.Where(departmentIDQuery, department.ID).Find(&subjects).Error; err == nil {
		for _, subj := range subjects {
			r.cache.Delete(fmt.Sprintf("subjects:%d:%d", department.ID, subj.ID))
		}
	}
}

// clearAllRelatedCache は関連する全てのキャッシュをクリアします
func (r *UniversityRepository) clearAllRelatedCache(universityID uint) {
	r.cache.Delete(cacheKeyAllUniversities)
	r.cache.Delete(fmt.Sprintf(cacheKeyUniversityFormat, universityID))

	var departments []models.Department
	if err := r.db.Where("university_id = ?", universityID).Find(&departments).Error; err == nil {
		for _, dept := range departments {
			r.clearDepartmentCache(universityID, dept)
		}
	}

	r.cache.Set(fmt.Sprintf(cacheKeyUniversityFormat, universityID), nil, 0)
	r.cache.Set(cacheKeyAllUniversities, nil, 0)

	logger.Info("Cleared all related cache for university ID: %d", universityID)
}

// getExamInfoForDepartment は学部のExamInfoを取得します
func (r *UniversityRepository) getExamInfoForDepartment(tx *gorm.DB, departmentID uint) (*models.ExamInfo, error) {
	var examInfo models.ExamInfo
	if err := tx.Table("exam_infos").
		Joins("JOIN majors ON majors.id = exam_infos.major_id").
		Joins("JOIN departments ON departments.id = majors.department_id").
		Where("departments.id = ?", departmentID).
		Order("exam_infos.id DESC").
		First(&examInfo).Error; err != nil {
		return nil, err
	}
	return &examInfo, nil
}

// getExistingSubjects は既存の科目を取得します
func (r *UniversityRepository) getExistingSubjects(tx *gorm.DB, examInfoID uint) ([]models.Subject, error) {
	var subjects []models.Subject
	if err := tx.Where("exam_info_id = ?", examInfoID).
		Order(displayOrderASC).
		Preload("TestScores").
		Find(&subjects).Error; err != nil {
		return nil, err
	}
	return subjects, nil
}

// UpdateSubject は既存の科目を更新します
func (r *UniversityRepository) UpdateSubject(subject *models.Subject) error {
	tx := r.db.Begin()
	if tx.Error != nil {
		return &errors.ErrDatabaseOperation{Operation: "UpdateSubject", Err: tx.Error}
	}

	var allSubjects []models.Subject
	if err := tx.Where("exam_info_id = ?", subject.ExamInfoID).
		Order(displayOrderASC).
		Find(&allSubjects).Error; err != nil {
		tx.Rollback()
		return &errors.ErrDatabaseOperation{Operation: "UpdateSubject", Err: err}
	}

	for i, s := range allSubjects {
		if s.ID == subject.ID {
			subject.DisplayOrder = s.DisplayOrder
			allSubjects[i] = *subject
			break
		}
	}

	if err := r.updateSubjectScores(tx, allSubjects); err != nil {
		tx.Rollback()
		return &errors.ErrDatabaseOperation{Operation: "UpdateSubject", Err: err}
	}

	if err := tx.Commit().Error; err != nil {
		return &errors.ErrDatabaseOperation{Operation: "UpdateSubject", Err: err}
	}

	r.clearAllRelatedCache(0)
	return nil
}

// DeleteSubject は科目を削除します
func (r *UniversityRepository) DeleteSubject(id uint) error {
	if err := r.db.Delete(&models.Subject{}, id).Error; err != nil {
		return &errors.ErrDatabaseOperation{Operation: "DeleteSubject", Err: err}
	}
	return nil
}
