// Package database はデータベース接続の管理を提供します。
// データベース接続の確立、コネクションプールの設定、マイグレーションの実行などの機能を提供します。
package database

import (
	"context"
	"fmt"
	"time"
	"university-exam-api/internal/config"
	"university-exam-api/internal/infrastructure/database"

	"gorm.io/gorm"
)

// Setup はデータベース接続を確立し、必要な初期化を行います。
// ctx: コンテキスト
// cfg: アプリケーション設定
// 戻り値:
//   - *gorm.DB: データベース接続
//   - func(): クリーンアップ関数
//   - error: エラー情報
func Setup(ctx context.Context, cfg *config.Config) (*gorm.DB, func(), error) {
	// データベース接続の確立
	db := database.NewDB()
	sqlDB, err := db.DB()
	if err != nil {
		return nil, nil, fmt.Errorf("データベース接続の確立に失敗しました: %w", err)
	}

	// コネクションプールの設定
	// アイドル接続の最大数を設定
	sqlDB.SetMaxIdleConns(10)
	// 同時接続の最大数を設定
	sqlDB.SetMaxOpenConns(100)
	// 接続の最大生存時間を設定
	sqlDB.SetConnMaxLifetime(time.Hour)

	// 接続のテスト
	if err := sqlDB.PingContext(ctx); err != nil {
		return nil, nil, fmt.Errorf("データベースへの接続テストに失敗しました: %w", err)
	}

	// クリーンアップ関数の定義
	cleanup := func() {
		if err := sqlDB.Close(); err != nil {
			fmt.Printf("データベース接続のクローズに失敗しました: %v\n", err)
		}
	}

	// マイグレーションの実行
	if err := database.AutoMigrate(db); err != nil {
		return nil, cleanup, fmt.Errorf("データベースのマイグレーションに失敗しました: %w", err)
	}

	return db, cleanup, nil
}
