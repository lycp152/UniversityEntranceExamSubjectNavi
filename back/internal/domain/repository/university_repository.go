package repository

import (
	"context"
	"errors"
	"fmt"
	"time"
	"university-exam-api/internal/domain/models"

	"gorm.io/gorm"
)

const (
	orderByDepartmentName    = "departments.name"
	orderByMajorName        = "majors.name"
	orderByDisplayOrder     = "admission_schedules.display_order"
	preloadDeptMajors       = "Departments.Majors"
	preloadAdmSchedules     = "Departments.Majors.AdmissionSchedules"
	preloadAdmInfos         = "Departments.Majors.AdmissionSchedules.AdmissionInfos"
	preloadTestTypes        = "Departments.Majors.AdmissionSchedules.TestTypes"
	preloadSubjects         = "Departments.Majors.AdmissionSchedules.TestTypes.Subjects"
)

// エラーメッセージの定数
const (
	errMsgIDZero = "id cannot be zero"
	errMsgNameEmpty = "name cannot be empty"
	errMsgUniversityNotFound = "university with id %d not found"
)

// RepositoryError はリポジトリ層のエラーを表現します
type RepositoryError struct {
	Op   string // 操作名
	Err  error  // 元のエラー
	Code string // エラーコード
}

func (e *RepositoryError) Error() string {
	return fmt.Sprintf("operation=%s, code=%s: %v", e.Op, e.Code, e.Err)
}

func (e *RepositoryError) Unwrap() error {
	return e.Err
}

// エラーコードの定数
const (
	ErrCodeNotFound      = "NOT_FOUND"
	ErrCodeInvalidInput  = "INVALID_INPUT"
	ErrCodeDBError       = "DATABASE_ERROR"
)

type UniversityRepository struct {
	db *gorm.DB
	batchSize int
	maxRetries int
	defaultTimeout time.Duration
}

func NewUniversityRepository(db *gorm.DB) *UniversityRepository {
	// コネクションプールの設定
	sqlDB, err := db.DB()
	if err == nil {
		sqlDB.SetMaxIdleConns(10)
		sqlDB.SetMaxOpenConns(100)
		sqlDB.SetConnMaxLifetime(time.Hour)
	}

	// プリペアドステートメントを有効化
	db = db.Session(&gorm.Session{
		PrepareStmt: true,
	})

	return &UniversityRepository{
		db: db,
		batchSize: 100,
		maxRetries: 3,
		defaultTimeout: 30 * time.Second,
	}
}

// プリロードの共通化のためのヘルパーメソッド
func (r *UniversityRepository) preloadBasicAssociations(query *gorm.DB) *gorm.DB {
	return query.
		Preload("Departments", func(db *gorm.DB) *gorm.DB {
			return db.Order(orderByDepartmentName)
		}).
		Preload(preloadDeptMajors, func(db *gorm.DB) *gorm.DB {
			return db.Order(orderByMajorName)
		})
}

func (r *UniversityRepository) preloadFullDetails(query *gorm.DB) *gorm.DB {
	return r.preloadBasicAssociations(query).
		Preload(preloadAdmSchedules, func(db *gorm.DB) *gorm.DB {
			return db.Order(orderByDisplayOrder)
		}).
		Preload(preloadAdmInfos).
		Preload(preloadTestTypes).
		Preload(preloadSubjects)
}

// FindByID は指定されたIDの大学を取得します
func (r *UniversityRepository) FindByID(ctx context.Context, id uint) (*models.University, error) {
	if id == 0 {
		return nil, &RepositoryError{
			Op:   "FindByID",
			Err:  errors.New(errMsgIDZero),
			Code: ErrCodeInvalidInput,
		}
	}

	var university models.University
	err := r.preloadBasicAssociations(r.db.WithContext(ctx)).
		First(&university, id).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, &RepositoryError{
				Op:   "FindByID",
				Err:  err,
				Code: ErrCodeNotFound,
			}
		}
		return nil, &RepositoryError{
			Op:   "FindByID",
			Err:  err,
			Code: ErrCodeDBError,
		}
	}
	return &university, nil
}

// FindAll は全ての大学を取得します
func (r *UniversityRepository) FindAll(ctx context.Context) ([]models.University, error) {
	var universities []models.University
	err := r.preloadBasicAssociations(r.db.WithContext(ctx)).
		Find(&universities).Error

	if err != nil {
		return nil, &RepositoryError{
			Op:   "FindAll",
			Err:  err,
			Code: ErrCodeDBError,
		}
	}
	return universities, nil
}

// FindByName は指定された名前の大学を検索します
func (r *UniversityRepository) FindByName(ctx context.Context, name string) (*models.University, error) {
	if name == "" {
		return nil, &RepositoryError{
			Op:   "FindByName",
			Err:  errors.New(errMsgNameEmpty),
			Code: ErrCodeInvalidInput,
		}
	}

	var university models.University
	err := r.db.WithContext(ctx).
		Where("name = ?", name).
		First(&university).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, &RepositoryError{
				Op:   "FindByName",
				Err:  err,
				Code: ErrCodeNotFound,
			}
		}
		return nil, &RepositoryError{
			Op:   "FindByName",
			Err:  err,
			Code: ErrCodeDBError,
		}
	}
	return &university, nil
}

// FindWithFilters は指定された条件で大学を検索します
func (r *UniversityRepository) FindWithFilters(ctx context.Context, filters map[string]interface{}) ([]models.University, error) {
	var universities []models.University
	query := r.db.WithContext(ctx).
		Preload("Departments", func(db *gorm.DB) *gorm.DB {
			return db.Order(orderByDepartmentName)
		})

	for key, value := range filters {
		query = query.Where(key+" = ?", value)
	}

	err := query.Find(&universities).Error
	if err != nil {
		return nil, err
	}
	return universities, nil
}

// withTransaction はトランザクション処理を共通化するヘルパー関数です
func (r *UniversityRepository) withTransaction(ctx context.Context, fn func(*gorm.DB) error) error {
	ctx, cancel := context.WithTimeout(ctx, r.defaultTimeout)
	defer cancel()

	// プリペアドステートメントを有効化したセッションを作成
	session := r.db.WithContext(ctx).Session(&gorm.Session{
		PrepareStmt: true,
		SkipDefaultTransaction: false,
	})

	return session.Transaction(fn)
}

// Create は新しい大学を作成します
func (r *UniversityRepository) Create(ctx context.Context, university *models.University) error {
	return r.withTransaction(ctx, func(tx *gorm.DB) error {
		if err := tx.Create(university).Error; err != nil {
			return &RepositoryError{
				Op:   "Create",
				Err:  err,
				Code: ErrCodeDBError,
			}
		}
		return nil
	})
}

// Update は大学情報を更新します
func (r *UniversityRepository) Update(ctx context.Context, university *models.University) error {
	if university.ID == 0 {
		return &RepositoryError{
			Op:   "Update",
			Err:  errors.New(errMsgIDZero),
			Code: ErrCodeInvalidInput,
		}
	}

	return r.withTransaction(ctx, func(tx *gorm.DB) error {
		// 更新対象が存在するか確認
		var exists bool
		if err := tx.Model(&models.University{}).
			Select("1").
			Where("id = ?", university.ID).
			Scan(&exists).Error; err != nil {
			return &RepositoryError{
				Op:   "Update",
				Err:  err,
				Code: ErrCodeDBError,
			}
		}

		if !exists {
			return &RepositoryError{
				Op:   "Update",
				Err:  fmt.Errorf(errMsgUniversityNotFound, university.ID),
				Code: ErrCodeNotFound,
			}
		}

		if err := tx.Save(university).Error; err != nil {
			return &RepositoryError{
				Op:   "Update",
				Err:  err,
				Code: ErrCodeDBError,
			}
		}
		return nil
	})
}

// Delete は大学を削除します
func (r *UniversityRepository) Delete(ctx context.Context, id uint) error {
	if id == 0 {
		return &RepositoryError{
			Op:   "Delete",
			Err:  errors.New(errMsgIDZero),
			Code: ErrCodeInvalidInput,
		}
	}

	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// 削除対象が存在するか確認
		var exists bool
		if err := tx.Model(&models.University{}).
			Select("1").
			Where("id = ?", id).
			Scan(&exists).Error; err != nil {
			return &RepositoryError{
				Op:   "Delete",
				Err:  err,
				Code: ErrCodeDBError,
			}
		}

		if !exists {
			return &RepositoryError{
				Op:   "Delete",
				Err:  fmt.Errorf("university with id %d not found", id),
				Code: ErrCodeNotFound,
			}
		}

		if err := tx.Delete(&models.University{}, id).Error; err != nil {
			return &RepositoryError{
				Op:   "Delete",
				Err:  err,
				Code: ErrCodeDBError,
			}
		}
		return nil
	})
}

// FindWithDepartmentsAndMajors は大学、学部、学科の情報を一括で取得します
func (r *UniversityRepository) FindWithDepartmentsAndMajors(ctx context.Context, id uint) (*models.University, error) {
	var university models.University
	err := r.db.WithContext(ctx).
		Preload("Departments", func(db *gorm.DB) *gorm.DB {
			return db.Order(orderByDepartmentName)
		}).
		Preload(preloadDeptMajors, func(db *gorm.DB) *gorm.DB {
			return db.Order(orderByMajorName)
		}).
		First(&university, id).Error

	if err != nil {
		return nil, err
	}
	return &university, nil
}

// FindWithFullDetails は大学の全詳細情報を取得します
func (r *UniversityRepository) FindWithFullDetails(ctx context.Context, id uint) (*models.University, error) {
	if id == 0 {
		return nil, &RepositoryError{
			Op:   "FindWithFullDetails",
			Err:  errors.New(errMsgIDZero),
			Code: ErrCodeInvalidInput,
		}
	}

	var university models.University
	err := r.preloadFullDetails(r.db.WithContext(ctx)).
		First(&university, id).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, &RepositoryError{
				Op:   "FindWithFullDetails",
				Err:  err,
				Code: ErrCodeNotFound,
			}
		}
		return nil, &RepositoryError{
			Op:   "FindWithFullDetails",
			Err:  err,
			Code: ErrCodeDBError,
		}
	}
	return &university, nil
}

// CreateInBatches は複数の大学をバッチで作成します
func (r *UniversityRepository) CreateInBatches(ctx context.Context, universities []models.University) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.CreateInBatches(universities, r.batchSize).Error; err != nil {
			return &RepositoryError{
				Op:   "CreateInBatches",
				Err:  err,
				Code: ErrCodeDBError,
			}
		}
		return nil
	})
}

// ProcessInBatches は大学データをバッチで処理します
func (r *UniversityRepository) ProcessInBatches(ctx context.Context, batchFunc func(*gorm.DB, []models.University) error) error {
	var universities []models.University

	result := r.db.WithContext(ctx).FindInBatches(&universities, r.batchSize, func(tx *gorm.DB, batch int) error {
		return batchFunc(tx, universities)
	})

	if result.Error != nil {
		return &RepositoryError{
			Op:   "ProcessInBatches",
			Err:  result.Error,
			Code: ErrCodeDBError,
		}
	}
	return nil
}

// UpdateInBatches は複数の大学をバッチで更新します
func (r *UniversityRepository) UpdateInBatches(ctx context.Context, universities []models.University) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		for i := 0; i < len(universities); i += r.batchSize {
			end := i + r.batchSize
			if end > len(universities) {
				end = len(universities)
			}
			batch := universities[i:end]

			for _, univ := range batch {
				if err := tx.Save(&univ).Error; err != nil {
					return &RepositoryError{
						Op:   "UpdateInBatches",
						Err:  err,
						Code: ErrCodeDBError,
					}
				}
			}
		}
		return nil
	})
}

// SetBatchSize はバッチサイズを設定します
func (r *UniversityRepository) SetBatchSize(size int) {
	if size > 0 {
		r.batchSize = size
	}
}
