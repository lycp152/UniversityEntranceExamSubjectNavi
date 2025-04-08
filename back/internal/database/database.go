// Package database はデータベース接続の管理を提供します。
// データベース接続の確立、コネクションプールの設定、マイグレーションの実行などの機能を提供します。
// このパッケージは複数のゴルーチンから安全に使用できます。
package database

import (
	"context"
	"database/sql"
	"fmt"
	"time"
	"university-exam-api/internal/config"
	"university-exam-api/internal/infrastructure/database"

	"gorm.io/gorm"
)

// デフォルトのデータベース設定
const (
	defaultMaxIdleConns     = 10            // アイドル接続の最大数
	defaultMaxOpenConns     = 100           // 同時接続の最大数
	defaultConnMaxLifetime  = time.Hour     // 接続の最大生存時間
	defaultConnMaxIdleTime  = time.Minute * 30 // アイドル接続の最大時間
	defaultMigrationTimeout = 30 * time.Second // マイグレーションのタイムアウト時間
	defaultRetryAttempts    = 3            // 接続試行の最大回数
	defaultRetryDelay       = 5 * time.Second // 接続リトライの待機時間
)

// DBStats はデータベース接続の統計情報を保持します。
// この構造体は複数のゴルーチンから同時にアクセスしても安全です。
type DBStats struct {
	MaxOpenConnections int           // 設定された最大オープン接続数
	OpenConnections    int           // 現在のオープン接続数
	InUse             int           // 使用中の接続数
	Idle              int           // アイドル状態の接続数
	WaitCount         int64         // 接続待ちの累積数
	WaitDuration      time.Duration // 接続待ちの累積時間
	MaxIdleClosed     int64         // アイドル最大数超過で閉じられた接続数
	MaxLifetimeClosed int64         // 生存期間超過で閉じられた接続数
}

// setupConnectionPool はコネクションプールの設定を行います
func setupConnectionPool(sqlDB *sql.DB, cfg *config.Config) error {
	maxIdleConns := defaultMaxIdleConns
	if cfg.DBMaxIdleConns > 0 {
		maxIdleConns = cfg.DBMaxIdleConns
	}
	maxOpenConns := defaultMaxOpenConns
	if cfg.DBMaxOpenConns > 0 {
		maxOpenConns = cfg.DBMaxOpenConns
	}
	connMaxLifetime := defaultConnMaxLifetime
	if cfg.DBConnMaxLifetime > 0 {
		connMaxLifetime = cfg.DBConnMaxLifetime
	}
	connMaxIdleTime := defaultConnMaxIdleTime
	if cfg.DBConnMaxIdleTime > 0 {
		connMaxIdleTime = cfg.DBConnMaxIdleTime
	}

	sqlDB.SetMaxIdleConns(maxIdleConns)
	sqlDB.SetMaxOpenConns(maxOpenConns)
	sqlDB.SetConnMaxLifetime(connMaxLifetime)
	sqlDB.SetConnMaxIdleTime(connMaxIdleTime)

	// 設定の検証
	if sqlDB.Stats().MaxOpenConnections != maxOpenConns {
		return fmt.Errorf("コネクションプールの設定に失敗しました: MaxOpenConnsの設定が反映されていません")
	}

	return nil
}

// runMigrations はデータベースのマイグレーションを実行します
func runMigrations(ctx context.Context, db *gorm.DB) error {
	migrationCtx, cancel := context.WithTimeout(ctx, defaultMigrationTimeout)
	defer cancel()
	return database.AutoMigrate(db.WithContext(migrationCtx))
}

// establishConnection はデータベース接続を確立します
func establishConnection(ctx context.Context, cfg *config.Config) (*gorm.DB, *sql.DB, error) {
	for attempt := 1; attempt <= defaultRetryAttempts; attempt++ {
		db := database.NewDB()
		sqlDB, err := db.DB()
		if err != nil {
			continue
		}

		if err = setupConnectionPool(sqlDB, cfg); err != nil {
			return nil, nil, fmt.Errorf("コネクションプールの設定に失敗しました: %w", err)
		}

		if err = sqlDB.PingContext(ctx); err == nil {
			return db, sqlDB, nil
		}

		if attempt < defaultRetryAttempts {
			time.Sleep(defaultRetryDelay)
		}
	}
	return nil, nil, fmt.Errorf("データベース接続の確立に失敗しました（試行回数: %d）", defaultRetryAttempts)
}

// Setup はデータベース接続を確立し、必要な初期化を行います。
// この関数は複数のゴルーチンから同時に呼び出しても安全です。
//
// パラメータ:
//   - ctx: コンテキスト（キャンセルまたはタイムアウト用）
//   - cfg: アプリケーション設定（データベース接続パラメータを含む）
//
// 戻り値:
//   - *gorm.DB: 初期化されたデータベース接続
//   - func(): リソース解放用のクリーンアップ関数
//   - error: エラーが発生した場合のエラー情報
func Setup(ctx context.Context, cfg *config.Config) (*gorm.DB, func(), error) {
	db, sqlDB, err := establishConnection(ctx, cfg)
	if err != nil {
		return nil, nil, err
	}

	cleanup := func() {
		if err := sqlDB.Close(); err != nil {
			fmt.Printf("データベース接続のクローズに失敗しました: %v\n", err)
		}
	}

	if err = runMigrations(ctx, db); err != nil {
		return nil, cleanup, fmt.Errorf("データベースのマイグレーションに失敗しました: %w", err)
	}

	return db, cleanup, nil
}

// GetDBStats はデータベース接続の統計情報を取得します。
// この関数は複数のゴルーチンから同時に呼び出しても安全です。
//
// パラメータ:
//   - db: 統計情報を取得するデータベース接続
//
// 戻り値:
//   - *DBStats: データベース接続の統計情報
//   - error: エラーが発生した場合のエラー情報
func GetDBStats(db *gorm.DB) (*DBStats, error) {
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("データベース統計情報の取得に失敗しました: %w", err)
	}

	stats := sqlDB.Stats()
	return &DBStats{
		MaxOpenConnections: stats.MaxOpenConnections,
		OpenConnections:    stats.OpenConnections,
		InUse:             stats.InUse,
		Idle:              stats.Idle,
		WaitCount:         stats.WaitCount,
		WaitDuration:      stats.WaitDuration,
		MaxIdleClosed:     stats.MaxIdleClosed,
		MaxLifetimeClosed: stats.MaxLifetimeClosed,
	}, nil
}
