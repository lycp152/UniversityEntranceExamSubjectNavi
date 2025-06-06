// Package repository はデータベース操作を担当するリポジトリ層の実装を提供します。
// このパッケージは大学情報の永続化と取得に関する操作を定義します。
package repository

import (
	"context"
	"errors"
	"fmt"
	"time"
	"university-exam-api/internal/domain/models"

	"gorm.io/gorm"
)

// 定数の定義
const (
	// プリロード関連の定数
	// 学部名でソートするための定数
	orderByDepartmentName = "departments.name"
	// 学科名でソートするための定数
	orderByMajorName = "majors.name"
	// 表示順でソートするための定数
	orderByDisplayOrder = "admission_schedules.display_order"
	// 学部と学科の関連をプリロードするための定数
	preloadDeptMajors = "Departments.Majors"
	// 学部、学科、入試スケジュールの関連をプリロードするための定数
	preloadAdmSchedules = "Departments.Majors.AdmissionSchedules"
	// 学部、学科、入試スケジュール、入試情報の関連をプリロードするための定数
	preloadAdmInfos = "Departments.Majors.AdmissionSchedules.AdmissionInfos"
	// 学部、学科、入試スケジュール、試験種別の関連をプリロードするための定数
	preloadTestTypes = "Departments.Majors.AdmissionSchedules.TestTypes"
	// 学部、学科、入試スケジュール、試験種別、科目の関連をプリロードするための定数
	preloadSubjects = "Departments.Majors.AdmissionSchedules.TestTypes.Subjects"

	// エラーメッセージ
	// IDが0の場合のエラーメッセージ
	errMsgIDZero = "IDは0にすることはできません"
	// 名前が空の場合のエラーメッセージ
	errMsgNameEmpty = "名前は空にすることはできません"
	// 大学が見つからない場合のエラーメッセージ
	errMsgUniversityNotFound = "ID %d の大学が見つかりません"

	// データベース設定
	// アイドル状態のコネクションの最大数
	defaultMaxIdleConns = 10
	// 同時に開くことができるコネクションの最大数
	defaultMaxOpenConns = 100
	// コネクションの最大生存時間
	defaultConnMaxLifetime = time.Hour
	// バッチ処理のデフォルトサイズ
	defaultBatchSize = 100
	// リトライの最大回数
	defaultMaxRetries = 3
	// デフォルトのタイムアウト時間
	defaultTimeout = 30 * time.Second
	// リトライ間隔
	defaultRetryInterval = 100 * time.Millisecond
)

// Error はリポジトリ層のエラーを表現します。
// 操作名、元のエラー、エラーコードを含みます。
type Error struct {
	Op   string // 操作名
	Err  error  // 元のエラー
	Code string // エラーコード
}

// Error はエラーメッセージを返します。
func (e *Error) Error() string {
	return fmt.Sprintf("operation=%s, code=%s: %v", e.Op, e.Code, e.Err)
}

// Unwrap は元のエラーを返します。
func (e *Error) Unwrap() error {
	return e.Err
}

// エラーコードの定数
const (
	// リソースが見つからない場合のエラーコード
	ErrCodeNotFound = "NOT_FOUND"
	// 入力が無効な場合のエラーコード
	ErrCodeInvalidInput = "INVALID_INPUT"
	// データベースエラーが発生した場合のエラーコード
	ErrCodeDBError = "DATABASE_ERROR"
)

// UniversityRepository は大学リポジトリの実装を提供します。
// データベース操作をカプセル化し、大学情報の永続化と取得を行います。
type UniversityRepository struct {
	db            *gorm.DB
	batchSize     int
	maxRetries    int
	defaultTimeout time.Duration
	retryInterval time.Duration
}

// NewUniversityRepository は新しい大学リポジトリを作成します。
// データベース接続の設定とリポジトリの初期化を行います。
func NewUniversityRepository(db *gorm.DB) *UniversityRepository {
	// コネクションプールの設定
	sqlDB, err := db.DB()
	if err == nil {
		sqlDB.SetMaxIdleConns(defaultMaxIdleConns)
		sqlDB.SetMaxOpenConns(defaultMaxOpenConns)
		sqlDB.SetConnMaxLifetime(defaultConnMaxLifetime)
	}

	// プリペアドステートメントを有効化
	db = db.Session(&gorm.Session{
		PrepareStmt: true,
	})

	return &UniversityRepository{
		db:            db,
		batchSize:     defaultBatchSize,
		maxRetries:    defaultMaxRetries,
		defaultTimeout: defaultTimeout,
		retryInterval: defaultRetryInterval,
	}
}

// preloadBasicAssociations は基本的な関連データをプリロードします。
// 学部と学科の情報を取得します。
func (r *UniversityRepository) preloadBasicAssociations(query *gorm.DB) *gorm.DB {
	return query.
		Preload("Departments", func(db *gorm.DB) *gorm.DB {
			return db.Order(orderByDepartmentName)
		}).
		Preload(preloadDeptMajors, func(db *gorm.DB) *gorm.DB {
			return db.Order(orderByMajorName)
		})
}

// preloadFullDetails は全ての関連データをプリロードします。
// 学部、学科、入試スケジュール、入試情報、試験種別、科目の情報を取得します。
func (r *UniversityRepository) preloadFullDetails(query *gorm.DB) *gorm.DB {
	return r.preloadBasicAssociations(query).
		Preload(preloadAdmSchedules, func(db *gorm.DB) *gorm.DB {
			return db.Order(orderByDisplayOrder)
		}).
		Preload(preloadAdmInfos).
		Preload(preloadTestTypes).
		Preload(preloadSubjects)
}

// withTransaction はトランザクション処理を共通化するヘルパー関数です。
// タイムアウトとリトライをサポートします。
func (r *UniversityRepository) withTransaction(ctx context.Context, fn func(*gorm.DB) error) error {
	ctx, cancel := context.WithTimeout(ctx, r.defaultTimeout)
	defer cancel()

	// プリペアドステートメントを有効化したセッションを作成
	session := r.db.WithContext(ctx).Session(&gorm.Session{
		PrepareStmt: true,
		SkipDefaultTransaction: false,
	})

	var lastErr error

	for i := 0; i < r.maxRetries; i++ {
		if i > 0 {
			time.Sleep(r.retryInterval)
		}

		err := session.Transaction(fn)
		if err == nil {
			return nil
		}

		lastErr = err

		if !isRetryableError(err) {
			break
		}
	}

	return &Error{
		Op:   "withTransaction",
		Err:  lastErr,
		Code: ErrCodeDBError,
	}
}

// isRetryableError はリトライ可能なエラーかどうかを判定します。
// デッドロックやタイムアウトなどのリトライ可能なエラーを判定します。
func isRetryableError(err error) bool {
	return errors.Is(err, gorm.ErrInvalidTransaction) ||
		errors.Is(err, gorm.ErrInvalidDB) ||
		errors.Is(err, gorm.ErrRecordNotFound)
}

// FindByID は指定されたIDの大学を取得します。
// 学部と学科の情報も同時に取得します。
func (r *UniversityRepository) FindByID(ctx context.Context, id uint) (*models.University, error) {
	if id == 0 {
		return nil, &Error{
			Op:   "FindByID",
			Err:  errors.New(errMsgIDZero),
			Code: ErrCodeInvalidInput,
		}
	}

	var university models.University
	err := r.preloadBasicAssociations(r.db.WithContext(ctx)).
		First(&university, id).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, &Error{
				Op:   "FindByID",
				Err:  err,
				Code: ErrCodeNotFound,
			}
		}

		return nil, &Error{
			Op:   "FindByID",
			Err:  err,
			Code: ErrCodeDBError,
		}
	}

	return &university, nil
}

// FindAll は全ての大学を取得します。
// 学部と学科の情報も同時に取得します。
func (r *UniversityRepository) FindAll(ctx context.Context) ([]models.University, error) {
	var universities []models.University
	err := r.preloadBasicAssociations(r.db.WithContext(ctx)).
		Find(&universities).Error

	if err != nil {
		return nil, &Error{
			Op:   "FindAll",
			Err:  err,
			Code: ErrCodeDBError,
		}
	}

	return universities, nil
}

// FindByName は指定された名前の大学を検索します。
// 完全一致で検索を行います。
func (r *UniversityRepository) FindByName(ctx context.Context, name string) (*models.University, error) {
	if name == "" {
		return nil, &Error{
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
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, &Error{
				Op:   "FindByName",
				Err:  err,
				Code: ErrCodeNotFound,
			}
		}

		return nil, &Error{
			Op:   "FindByName",
			Err:  err,
			Code: ErrCodeDBError,
		}
	}

	return &university, nil
}

// FindWithFilters は指定された条件で大学を検索します。
// フィルター条件に一致する大学を取得します。
func (r *UniversityRepository) FindWithFilters(
	ctx context.Context,
	filters map[string]interface{},
) ([]models.University, error) {
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
		return nil, &Error{
			Op:   "FindWithFilters",
			Err:  err,
			Code: ErrCodeDBError,
		}
	}

	return universities, nil
}

// Create は新しい大学を作成します。
// トランザクション内で実行されます。
func (r *UniversityRepository) Create(ctx context.Context, university *models.University) error {
	return r.withTransaction(ctx, func(tx *gorm.DB) error {
		if err := tx.Create(university).Error; err != nil {
			return &Error{
				Op:   "Create",
				Err:  err,
				Code: ErrCodeDBError,
			}
		}

		return nil
	})
}

// Update は大学情報を更新します。
// トランザクション内で実行され、更新対象の存在確認を行います。
func (r *UniversityRepository) Update(ctx context.Context, university *models.University) error {
	if university.ID == 0 {
		return &Error{
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
			return &Error{
				Op:   "Update",
				Err:  err,
				Code: ErrCodeDBError,
			}
		}

		if !exists {
			return &Error{
				Op:   "Update",
				Err:  fmt.Errorf(errMsgUniversityNotFound, university.ID),
				Code: ErrCodeNotFound,
			}
		}

		if err := tx.Save(university).Error; err != nil {
			return &Error{
				Op:   "Update",
				Err:  err,
				Code: ErrCodeDBError,
			}
		}

		return nil
	})
}

// Delete は大学を削除します。
// トランザクション内で実行され、削除対象の存在確認を行います。
func (r *UniversityRepository) Delete(ctx context.Context, id uint) error {
	if id == 0 {
		return &Error{
			Op:   "Delete",
			Err:  errors.New(errMsgIDZero),
			Code: ErrCodeInvalidInput,
		}
	}

	return r.withTransaction(ctx, func(tx *gorm.DB) error {
		// 削除対象が存在するか確認
		var exists bool
		if err := tx.Model(&models.University{}).
			Select("1").
			Where("id = ?", id).
			Scan(&exists).Error; err != nil {
			return &Error{
				Op:   "Delete",
				Err:  err,
				Code: ErrCodeDBError,
			}
		}

		if !exists {
			return &Error{
				Op:   "Delete",
				Err:  fmt.Errorf(errMsgUniversityNotFound, id),
				Code: ErrCodeNotFound,
			}
		}

		if err := tx.Delete(&models.University{}, id).Error; err != nil {
			return &Error{
				Op:   "Delete",
				Err:  err,
				Code: ErrCodeDBError,
			}
		}

		return nil
	})
}

// FindWithDepartmentsAndMajors は大学、学部、学科の情報を一括で取得します。
// 学部名と学科名でソートされた情報を取得します。
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
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, &Error{
				Op:   "FindWithDepartmentsAndMajors",
				Err:  err,
				Code: ErrCodeNotFound,
			}
		}

		return nil, &Error{
			Op:   "FindWithDepartmentsAndMajors",
			Err:  err,
			Code: ErrCodeDBError,
		}
	}

	return &university, nil
}

// FindWithFullDetails は大学の全詳細情報を取得します。
// 学部、学科、入試スケジュール、入試情報、試験種別、科目の情報を取得します。
func (r *UniversityRepository) FindWithFullDetails(ctx context.Context, id uint) (*models.University, error) {
	if id == 0 {
		return nil, &Error{
			Op:   "FindWithFullDetails",
			Err:  errors.New(errMsgIDZero),
			Code: ErrCodeInvalidInput,
		}
	}

	var university models.University
	err := r.preloadFullDetails(r.db.WithContext(ctx)).
		First(&university, id).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, &Error{
				Op:   "FindWithFullDetails",
				Err:  err,
				Code: ErrCodeNotFound,
			}
		}

		return nil, &Error{
			Op:   "FindWithFullDetails",
			Err:  err,
			Code: ErrCodeDBError,
		}
	}

	return &university, nil
}

// CreateInBatches は複数の大学をバッチで作成します。
// トランザクション内で実行されます。
func (r *UniversityRepository) CreateInBatches(ctx context.Context, universities []models.University) error {
	return r.withTransaction(ctx, func(tx *gorm.DB) error {
		if err := tx.CreateInBatches(universities, r.batchSize).Error; err != nil {
			return &Error{
				Op:   "CreateInBatches",
				Err:  err,
				Code: ErrCodeDBError,
			}
		}

		return nil
	})
}

// ProcessInBatches は大学データをバッチで処理します。
// 指定されたバッチ処理関数を実行します。
func (r *UniversityRepository) ProcessInBatches(
	ctx context.Context,
	batchFunc func(*gorm.DB, []models.University) error,
) error {
	var universities []models.University

	result := r.db.WithContext(ctx).FindInBatches(&universities, r.batchSize, func(tx *gorm.DB, _ int) error {
		return batchFunc(tx, universities)
	})

	if result.Error != nil {
		return &Error{
			Op:   "ProcessInBatches",
			Err:  result.Error,
			Code: ErrCodeDBError,
		}
	}

	return nil
}

// UpdateInBatches は複数の大学をバッチで更新します。
// トランザクション内で実行されます。
func (r *UniversityRepository) UpdateInBatches(ctx context.Context, universities []models.University) error {
	return r.withTransaction(ctx, func(tx *gorm.DB) error {
		for i := 0; i < len(universities); i += r.batchSize {
			end := i + r.batchSize
			if end > len(universities) {
				end = len(universities)
			}

			batch := universities[i:end]

			for _, univ := range batch {
				if err := tx.Save(&univ).Error; err != nil {
					return &Error{
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

// SetBatchSize はバッチサイズを設定します。
// 0より大きい値のみ設定可能です。
func (r *UniversityRepository) SetBatchSize(size int) {
	if size > 0 {
		r.batchSize = size
	}
}


// BatchSize はバッチ処理のサイズを定義
const (
	DefaultBatchSize = 100
	MaxBatchSize     = 1000
)

// BatchInsertUniversities は大学データを一括で挿入する
func BatchInsertUniversities(ctx context.Context, db *gorm.DB, universities []models.University, batchSize int) error {
	if len(universities) == 0 {
		return fmt.Errorf("挿入する大学データがありません")
	}

	if batchSize <= 0 {
		batchSize = DefaultBatchSize
	} else if batchSize > MaxBatchSize {
		batchSize = MaxBatchSize
	}

	return db.Session(&gorm.Session{
		CreateBatchSize: batchSize,
		PrepareStmt:     true,
	}).
		WithContext(ctx).
		Transaction(func(tx *gorm.DB) error {
			if err := tx.CreateInBatches(universities, batchSize).Error; err != nil {
				return fmt.Errorf("大学データの一括挿入に失敗しました: %w", err)
			}

			return nil
		})
}

// GetUniversityByID はIDに基づいて大学と関連するデータを取得する
func GetUniversityByID(ctx context.Context, db *gorm.DB, id uint) (*models.University, error) {
	var university models.University
	err := db.Session(&gorm.Session{
		QueryFields: true,
		PrepareStmt: true,
	}).
		WithContext(ctx).
		Select("universities.*, departments.*, majors.*, admission_schedules.*, admission_infos.*, test_types.*, subjects.*").
		Joins("LEFT JOIN departments ON departments.university_id = universities.id").
		Joins("LEFT JOIN majors ON majors.department_id = departments.id").
		Joins("LEFT JOIN admission_schedules ON admission_schedules.major_id = majors.id").
		Joins("LEFT JOIN admission_infos ON admission_infos.admission_schedule_id = admission_schedules.id").
		Joins("LEFT JOIN test_types ON test_types.admission_schedule_id = admission_schedules.id").
		Joins("LEFT JOIN subjects ON subjects.test_type_id = test_types.id").
		First(&university, id).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("ID %d の大学が見つかりません: %w", id, err)
		}

		return nil, fmt.Errorf("大学の取得に失敗しました: %w", err)
	}

	return &university, nil
}

// GetUniversities はすべての大学を取得する
func GetUniversities(ctx context.Context, db *gorm.DB) ([]models.University, error) {
	var universities []models.University
	if err := db.Session(&gorm.Session{
		QueryFields: true,
		PrepareStmt: true,
	}).
		WithContext(ctx).
		Find(&universities).Error; err != nil {
		return nil, fmt.Errorf("大学一覧の取得に失敗しました: %w", err)
	}

	return universities, nil
}

// CreateUniversity は新しい大学を作成する
func CreateUniversity(ctx context.Context, db *gorm.DB, university *models.University) error {
	return db.Session(&gorm.Session{
		FullSaveAssociations: true,
		PrepareStmt:          true,
	}).
		WithContext(ctx).
		Transaction(func(tx *gorm.DB) error {
			tx.SavePoint("sp1")

			if err := tx.Create(university).Error; err != nil {
				tx.RollbackTo("sp1")
				return fmt.Errorf("大学の作成に失敗しました: %w", err)
			}

			return nil
		})
}

// UpdateUniversity は大学情報を更新する
func UpdateUniversity(ctx context.Context, db *gorm.DB, university *models.University) error {
	return db.Session(&gorm.Session{
		FullSaveAssociations: true,
		PrepareStmt:          true,
	}).
		WithContext(ctx).
		Transaction(func(tx *gorm.DB) error {
			tx.SavePoint("sp1")

			if err := tx.Save(university).Error; err != nil {
				tx.RollbackTo("sp1")
				return fmt.Errorf("大学の更新に失敗しました: %w", err)
			}

			return nil
		})
}

// DeleteUniversity は大学を削除する
func DeleteUniversity(ctx context.Context, db *gorm.DB, id uint) error {
	return db.Session(&gorm.Session{
		AllowGlobalUpdate: true,
		PrepareStmt:       true,
	}).
		WithContext(ctx).
		Transaction(func(tx *gorm.DB) error {
			tx.SavePoint("sp1")

			if err := tx.Delete(&models.University{}, id).Error; err != nil {
				tx.RollbackTo("sp1")
				return fmt.Errorf("大学の削除に失敗しました: %w", err)
			}

			return nil
		})
}

// UpdateUniversities は大学の一括更新を行う
func UpdateUniversities(ctx context.Context, db *gorm.DB, universities []*models.University) error {
	return db.Session(&gorm.Session{
		FullSaveAssociations: true,
		PrepareStmt:          true,
	}).
		WithContext(ctx).
		Transaction(func(tx *gorm.DB) error {
			tx.SavePoint("sp1")

			if err := tx.Save(universities).Error; err != nil {
				tx.RollbackTo("sp1")
				return fmt.Errorf("大学の一括更新に失敗しました: %w", err)
			}

			return nil
		})
}

// DeleteUniversities は大学の一括削除を行う
func DeleteUniversities(ctx context.Context, db *gorm.DB, universityIDs []uint) error {
	return db.Session(&gorm.Session{
		AllowGlobalUpdate: true,
		PrepareStmt:       true,
	}).
		WithContext(ctx).
		Transaction(func(tx *gorm.DB) error {
			tx.SavePoint("sp1")

			if err := tx.Delete(&models.University{}, universityIDs).Error; err != nil {
				tx.RollbackTo("sp1")
				return fmt.Errorf("大学の一括削除に失敗しました: %w", err)
			}

			return nil
		})
}

// GetUniversitiesWithRelations はすべての大学と関連するデータを取得する
func GetUniversitiesWithRelations(ctx context.Context, db *gorm.DB) ([]models.University, error) {
	var universities []models.University
	err := db.Session(&gorm.Session{
		QueryFields: true,
		PrepareStmt: true,
	}).
		WithContext(ctx).
		Select("universities.*, departments.*, majors.*, admission_schedules.*, admission_infos.*, test_types.*, subjects.*").
		Joins("LEFT JOIN departments ON departments.university_id = universities.id").
		Joins("LEFT JOIN majors ON majors.department_id = departments.id").
		Joins("LEFT JOIN admission_schedules ON admission_schedules.major_id = majors.id").
		Joins("LEFT JOIN admission_infos ON admission_infos.admission_schedule_id = admission_schedules.id").
		Joins("LEFT JOIN test_types ON test_types.admission_schedule_id = admission_schedules.id").
		Joins("LEFT JOIN subjects ON subjects.test_type_id = test_types.id").
		Find(&universities).Error

	if err != nil {
		return nil, fmt.Errorf("大学一覧の取得に失敗しました: %w", err)
	}

	return universities, nil
}
