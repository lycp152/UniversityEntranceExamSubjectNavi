package database

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"time"
	"university-exam-api/internal/domain/models"

	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

const (
	// タイムアウトと再試行の設定
	migrationRetryAttempts = 3
	migrationRetryDelay    = time.Second * 2
	defaultBatchSize       = 100
	slowQueryThreshold     = time.Second
	savePointInterval      = 5 // 5テーブルごとにセーブポイントを作成

	// エラーメッセージ
	errMsgSchemaSetup     = "スキーマの設定に失敗: %w"
	errMsgMigration       = "マイグレーション実行中にエラーが発生: %w"
	errMsgTimeout         = "マイグレーションがタイムアウトしました: %w"
	errMsgRetryFailed     = "マイグレーションの再試行が失敗しました: %w"
	errMsgRollback        = "トランザクションのロールバックに失敗: %w"
	errMsgSavePoint       = "セーブポイントの作成に失敗: %w"

	// エラーフォーマット
	errFmt = "%s: %w"

	// メトリクス関連の定数
	insertMigrationMetricsSQL = "INSERT INTO migration_metrics (table_name, status, duration) VALUES (?, ?, ?)"
)

// MigrationConfig はマイグレーションの設定を保持する構造体です。
// この構造体は以下の設定を保持します：
// - タイムアウト設定
// - リトライ設定
// - スキーマ設定
// - バッチサイズ
type MigrationConfig struct {
	Timeout       time.Duration
	RetryAttempts int
	RetryDelay    time.Duration
	Schema        string
	BatchSize     int
}

// MigrationMetrics はマイグレーションのメトリクスを保持する構造体です。
// この構造体は以下の情報を保持します：
// - 開始時間と終了時間
// - 所要時間
// - テーブル数と進捗
// - エラー数とリトライ数
type MigrationMetrics struct {
	StartTime        time.Time
	EndTime          time.Time
	Duration         time.Duration
	TotalTables      int
	CompletedTables  int
	FailedTables     int
	RetryCount       int
	SlowQueries      int
	RolledBackTables int
	SavePoints       int
	RollbackPoints   int
}

// DefaultMigrationConfig はデフォルトのマイグレーション設定を返します。
// この関数は以下の処理を行います：
// - デフォルト値の設定
// - 設定の初期化
func DefaultMigrationConfig() *MigrationConfig {
	return &MigrationConfig{
		Timeout:       defaultMigrationTimeout,
		RetryAttempts: migrationRetryAttempts,
		RetryDelay:    migrationRetryDelay,
		Schema:        "test_schema",
		BatchSize:     defaultBatchSize,
	}
}

// MigrationProgress はマイグレーションの進捗を追跡する構造体です。
// この構造体は以下の情報を保持します：
// - 総テーブル数
// - 完了テーブル数
// - 現在のテーブル
// - エラー情報
type MigrationProgress struct {
	TotalTables     int
	CompletedTables int
	CurrentTable    string
	StartTime       time.Time
	Errors          []error
	Metrics         *MigrationMetrics
}

// RunMigrations はデータベースのマイグレーションを実行します。
// この関数は以下の処理を行います：
// - マイグレーションセッションの作成
// - メトリクス収集の設定
// - マイグレーションの実行
func RunMigrations(ctx context.Context, db *gorm.DB, config *MigrationConfig) (*MigrationMetrics, error) {
	if config == nil {
		config = DefaultMigrationConfig()
	}

	metrics := &MigrationMetrics{
		StartTime: time.Now(),
	}

	progress := &MigrationProgress{
		StartTime: metrics.StartTime,
		Errors:    make([]error, 0),
		Metrics:   metrics,
	}

	// マイグレーション用のセッションを作成
	migrationDB := db.Session(&gorm.Session{
		Logger: logger.New(
			log.New(log.Writer(), fmt.Sprintf("[Migration:%s] ", config.Schema), log.LstdFlags),
			logger.Config{
				SlowThreshold:             slowQueryThreshold,
				LogLevel:                  logger.Info,
				IgnoreRecordNotFoundError: true,
				Colorful:                  true,
			},
		),
		PrepareStmt:         true,
		FullSaveAssociations: true,
		CreateBatchSize:      config.BatchSize,
		AllowGlobalUpdate:    false,
		QueryFields:          true,
		Context:             ctx,
	})

	// メトリクス収集用のセッションを作成
	metricsDB := migrationDB.Session(&gorm.Session{
		Logger: logger.New(
			log.New(log.Writer(), "[Metrics] ", log.LstdFlags),
			logger.Config{
				SlowThreshold:             slowQueryThreshold,
				LogLevel:                  logger.Info,
				IgnoreRecordNotFoundError: true,
				Colorful:                  true,
			},
		),
		PrepareStmt: true,
		Context:    ctx,
	})

	err := runMigrationsWithRetry(ctx, migrationDB, metricsDB, progress, config)
	metrics.EndTime = time.Now()
	metrics.Duration = metrics.EndTime.Sub(metrics.StartTime)
	metrics.TotalTables = progress.TotalTables
	metrics.CompletedTables = progress.CompletedTables
	metrics.FailedTables = len(progress.Errors)

	return metrics, err
}

// runMigrationsWithRetry はリトライ機能付きでマイグレーションを実行します。
// この関数は以下の処理を行います：
// - タイムアウトの設定
// - リトライ処理
// - エラーハンドリング
func runMigrationsWithRetry(
	ctx context.Context,
	db *gorm.DB,
	metricsDB *gorm.DB,
	progress *MigrationProgress,
	config *MigrationConfig,
) error {
	var lastErr error

	for attempt := 1; attempt <= config.RetryAttempts; attempt++ {
		progress.Metrics.RetryCount = attempt - 1

		// タイムアウト付きのコンテキストを作成
		migrationCtx, cancel := context.WithTimeout(ctx, config.Timeout)
		log.Printf("マイグレーション試行 %d/%d を開始します", attempt, config.RetryAttempts)

		err := func() error {
			defer cancel()
			return executeMigration(migrationCtx, db, metricsDB, progress, config)
		}()

		if err == nil {
			log.Printf("マイグレーションが正常に完了しました（所要時間: %v）", time.Since(progress.StartTime))
			return nil
		}

		lastErr = err
		log.Printf("マイグレーション試行 %d/%d が失敗: %v", attempt, config.RetryAttempts, err)

		select {
		case <-ctx.Done():
			return fmt.Errorf(errFmt, errMsgTimeout, ctx.Err())
		default:
			if attempt < config.RetryAttempts {
				log.Printf("次の試行まで %v 待機します", config.RetryDelay)
				time.Sleep(config.RetryDelay)
			}
		}
	}

	return fmt.Errorf(errFmt, errMsgRetryFailed, lastErr)
}

// migrateTable は単一のテーブルのマイグレーションを実行します。
// この関数は以下の処理を行います：
// - テーブルのマイグレーション
// - スロークエリの検出
// - 進捗の更新
func migrateTable(
	ctx context.Context,
	tx *gorm.DB,
	m struct{ Model interface{}; Name string },
	progress *MigrationProgress,
) error {
	start := time.Now()

	if err := tx.WithContext(ctx).AutoMigrate(m.Model); err != nil {
		progress.Errors = append(progress.Errors, fmt.Errorf(errFmt, m.Name, err))
		log.Printf("テーブル %s のマイグレーションに失敗: %v", m.Name, err)

		return err
	}

	duration := time.Since(start)
	if duration > slowQueryThreshold {
		progress.Metrics.SlowQueries++

		log.Printf("スロークエリ検出: テーブル %s のマイグレーションに %v かかりました", m.Name, duration)
	}

	progress.CompletedTables++

	log.Printf("テーブル %s のマイグレーションが完了（所要時間: %v）", m.Name, duration)

	return nil
}

// executeMigration は実際のマイグレーション処理を実行します。
// この関数は以下の処理を行います：
// - モデルの定義
// - トランザクションの開始
// - スキーマの設定
func executeMigration(
	ctx context.Context,
	db *gorm.DB,
	metricsDB *gorm.DB,
	progress *MigrationProgress,
	config *MigrationConfig,
) error {
	models := []struct {
		Model interface{}
		Name  string
	}{
		{&models.University{}, "universities"},
		{&models.Department{}, "departments"},
		{&models.Major{}, "majors"},
		{&models.AdmissionSchedule{}, "admission_schedules"},
		{&models.AdmissionInfo{}, "admission_infos"},
		{&models.TestType{}, "test_types"},
		{&models.Subject{}, "subjects"},
		{&models.Region{}, "regions"},
		{&models.Prefecture{}, "prefectures"},
		{&models.Classification{}, "classifications"},
		{&models.SubClassification{}, "sub_classifications"},
		{&models.AcademicField{}, "academic_fields"},
	}

	progress.TotalTables = len(models)

	return db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := setupSchema(tx, config.Schema); err != nil {
			return err
		}

		return processModels(ctx, tx, metricsDB, models, progress)
	}, &sql.TxOptions{
		Isolation: sql.LevelSerializable,
		ReadOnly:  false,
	})
}

// setupSchema はスキーマを設定します。
// この関数は以下の処理を行います：
// - スキーマの設定
// - エラーハンドリング
func setupSchema(tx *gorm.DB, schema string) error {
	// SQLiteの場合はスキップ
	if tx.Name() == "sqlite" {
		return nil
	}

	return tx.Exec(fmt.Sprintf("SET search_path TO %s", schema)).Error
}

// processModels はモデルのマイグレーションを処理します。
// この関数は以下の処理を行います：
// - モデルの順次処理
// - エラーハンドリング
func processModels(
	ctx context.Context,
	tx *gorm.DB,
	metricsDB *gorm.DB,
	models []struct{ Model interface{}; Name string },
	progress *MigrationProgress,
) error {
	for i, m := range models {
		if err := processModel(ctx, tx, metricsDB, m, i, progress); err != nil {
			return err
		}
	}

	return nil
}

// processModel は単一のモデルのマイグレーションを処理します。
// この関数は以下の処理を行います：
// - セーブポイントの作成
// - マイグレーションの実行
// - メトリクスの収集
func processModel(
	ctx context.Context,
	tx *gorm.DB,
	metricsDB *gorm.DB,
	m struct{ Model interface{}; Name string },
	index int,
	progress *MigrationProgress,
) error {
	select {
	case <-ctx.Done():
		progress.Metrics.RolledBackTables++
		return ctx.Err()
	default:
		progress.CurrentTable = m.Name
		log.Printf("テーブル %s のマイグレーションを開始（%d/%d）",
			m.Name, progress.CompletedTables+1, progress.TotalTables)

		// メトリクス収集
		startTime := time.Now()
		if err := createSavePoint(tx, index, progress); err != nil {
			metricsDB.Exec(insertMigrationMetricsSQL, m.Name, "error", time.Since(startTime))
			return err
		}

		if err := migrateTable(ctx, tx, m, progress); err != nil {
			metricsDB.Exec(insertMigrationMetricsSQL, m.Name, "error", time.Since(startTime))
			return handleMigrationError(tx, index, m, progress, err)
		}

		// セーブポイントを解放
		if index > 0 && index%savePointInterval == 0 {
			savePoint := fmt.Sprintf("sp_%d", index)
			if err := releaseSavePoint(tx, savePoint); err != nil {
				metricsDB.Exec(insertMigrationMetricsSQL, m.Name, "error", time.Since(startTime))
				return err
			}
		}

		metricsDB.Exec(insertMigrationMetricsSQL, m.Name, "success", time.Since(startTime))
	}

	return nil
}

// createSavePoint はセーブポイントを作成します。
// この関数は以下の処理を行います：
// - セーブポイントの作成
// - エラーハンドリング
func createSavePoint(tx *gorm.DB, index int, progress *MigrationProgress) error {
	if index > 0 && index%savePointInterval == 0 {
		savePoint := fmt.Sprintf("sp_%d", index)
		if err := tx.SavePoint(savePoint).Error; err != nil {
			log.Printf("セーブポイント %s の作成に失敗: %v", savePoint, err)
			return fmt.Errorf(errMsgSavePoint, err)
		}

		progress.Metrics.SavePoints++

		log.Printf("セーブポイント %s を作成しました", savePoint)
	}

	return nil
}

// releaseSavePoint はセーブポイントを解放します。
// この関数は以下の処理を行います：
// - セーブポイントの解放
// - エラーハンドリング
func releaseSavePoint(tx *gorm.DB, savePoint string) error {
	if err := tx.Exec(fmt.Sprintf("RELEASE SAVEPOINT %s", savePoint)).Error; err != nil {
		log.Printf("セーブポイント %s の解放に失敗: %v", savePoint, err)
		return fmt.Errorf("セーブポイントの解放に失敗: %w", err)
	}

	log.Printf("セーブポイント %s を解放しました", savePoint)

	return nil
}

// handleMigrationError はマイグレーションエラーを処理します。
// この関数は以下の処理を行います：
// - セーブポイントへのロールバック
// - エラーログの記録
// - メトリクスの更新
func handleMigrationError(
	tx *gorm.DB,
	index int,
	m struct{ Model interface{}; Name string },
	progress *MigrationProgress,
	err error,
) error {
	if index > 0 && index%savePointInterval == 0 {
		savePoint := fmt.Sprintf("sp_%d", index-savePointInterval)
		if err := tx.RollbackTo(savePoint).Error; err != nil {
			log.Printf("セーブポイント %s へのロールバックに失敗: %v", savePoint, err)
			return fmt.Errorf("セーブポイントへのロールバックに失敗: %w", err)
		}

		progress.Metrics.RollbackPoints++

		log.Printf("セーブポイント %s までロールバックしました", savePoint)
	}

	progress.Metrics.RolledBackTables++

	return fmt.Errorf("テーブル %s のマイグレーション失敗: %w", m.Name, err)
}
