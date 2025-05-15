// Package repositories はデータベースのトランザクション機能を提供します。
// このパッケージは以下の機能を提供します：
// - トランザクションの管理
// - リトライポリシーの実装
// - セーブポイントの管理
// - エラーハンドリング
package repositories

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	appErrors "university-exam-api/internal/errors"
	applogger "university-exam-api/internal/logger"

	"github.com/cenkalti/backoff/v4"
	"gorm.io/gorm"
)

const (
	defaultMaxRetries = 3
	defaultTxTimeout = 30 * time.Second
	defaultInitialInterval = 100 * time.Millisecond
	defaultMaxInterval = 2 * time.Second
	defaultMultiplier = 2.0
	defaultRandomizationFactor = 0.1
)

// エラーメッセージの定数化
const (
	errLockTimeout = "ロックタイムアウトの設定に失敗しました: %w"
	errTransactionFailed = "トランザクションが失敗しました: %w"
	errIsolationLevel = "トランザクション分離レベルの設定に失敗しました: %w"
	errContextTimeout = "トランザクションがタイムアウトしました: %w"
	errSavepoint = "セーブポイントの設定に失敗しました: %w"
)

// TransactionOption はトランザクションのオプションを定義します。
// この構造体は以下の設定を管理します：
// - 分離レベル
// - タイムアウト
// - リトライポリシー
// - 読み取り専用フラグ
// - 監視機能
type TransactionOption struct {
	Isolation   sql.IsolationLevel
	Timeout     time.Duration
	RetryPolicy *backoff.ExponentialBackOff
	ReadOnly    bool
	// トランザクションの監視用の追加フィールド
	Monitor     func(startTime time.Time, err error)
}

// getEnvOrDefaultDuration は環境変数を取得し、存在しない場合はデフォルト値を返します。
// この関数は以下の処理を行います：
// - 環境変数の取得
// - デフォルト値の設定
// - 値の返却
func getEnvOrDefaultDuration(key string, defaultValue time.Duration) time.Duration {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}

	if v, err := time.ParseDuration(value); err == nil {
		return v
	}

	return defaultValue
}

// getEnvOrDefaultFloat は環境変数を取得し、存在しない場合はデフォルト値を返します。
// この関数は以下の処理を行います：
// - 環境変数の取得
// - デフォルト値の設定
// - 値の返却
func getEnvOrDefaultFloat(key string, defaultValue float64) float64 {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}

	if v, err := strconv.ParseFloat(value, 64); err == nil {
		return v
	}

	return defaultValue
}

// getEnvOrDefaultBool は環境変数を取得し、存在しない場合はデフォルト値を返します。
// この関数は以下の処理を行います：
// - 環境変数の取得
// - デフォルト値の設定
// - 値の返却
func getEnvOrDefaultBool(key string, defaultValue bool) bool {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}

	if v, err := strconv.ParseBool(value); err == nil {
		return v
	}

	return defaultValue
}

// DefaultTransactionOption はデフォルトのトランザクションオプションを返します。
// この関数は以下の処理を行います：
// - 環境変数の取得
// - デフォルト値の設定
// - オプションの生成
func DefaultTransactionOption() *TransactionOption {
	return &TransactionOption{
		Isolation: sql.LevelReadCommitted,
		Timeout:   getEnvOrDefaultDuration("TX_TIMEOUT", defaultTxTimeout),
		ReadOnly:  getEnvOrDefaultBool("TX_READ_ONLY", false),
		RetryPolicy: &backoff.ExponentialBackOff{
			InitialInterval:     getEnvOrDefaultDuration("TX_INITIAL_INTERVAL", defaultInitialInterval),
			MaxInterval:         getEnvOrDefaultDuration("TX_MAX_INTERVAL", defaultMaxInterval),
			MaxElapsedTime:     getEnvOrDefaultDuration("TX_MAX_ELAPSED_TIME", defaultTxTimeout*2),
			Multiplier:         getEnvOrDefaultFloat("TX_MULTIPLIER", defaultMultiplier),
			RandomizationFactor: getEnvOrDefaultFloat("TX_RANDOMIZATION_FACTOR", defaultRandomizationFactor),
			Clock:              backoff.SystemClock,
		},
		Monitor: func(startTime time.Time, err error) {
			elapsedTime := time.Since(startTime)
			if err != nil {
				applogger.Error(context.Background(), "トランザクション失敗: 実行時間 %v, エラー: %v", elapsedTime, err)
			} else {
				applogger.Info(context.Background(), "トランザクション成功: 実行時間 %v", elapsedTime)
			}
		},
	}
}

// Transaction はトランザクション内でリポジトリの操作を実行します。
// この関数は以下の処理を行います：
// - デフォルトオプションの設定
// - トランザクションの実行
// - エラーハンドリング
func (r *universityRepository) Transaction(fn func(repo IUniversityRepository) error) error {
	return r.TransactionWithOption(fn, DefaultTransactionOption())
}

// TransactionWithOption は指定されたオプションでトランザクションを実行します。
// この関数は以下の処理を行います：
// - コンテキストの設定
// - トランザクションの実行
// - リトライの実行
// - エラーハンドリング
func (r *universityRepository) TransactionWithOption(
	fn func(repo IUniversityRepository) error,
	opt *TransactionOption,
) error {
	operation := func() error {
		return r.db.Transaction(func(tx *gorm.DB) error {
			ctx, cancel := context.WithTimeout(context.Background(), opt.Timeout)
			defer cancel()

			tx = tx.WithContext(ctx)
			txRepo := r.WithTx(tx)
			startTime := time.Now()

			if err := fn(txRepo); err != nil {
				opt.Monitor(startTime, err)
				return r.handleTransactionError(err, startTime)
			}

			opt.Monitor(startTime, nil)

			return nil
		}, &sql.TxOptions{
			Isolation: opt.Isolation,
			ReadOnly:  opt.ReadOnly,
		})
	}

	return backoff.RetryNotify(operation, opt.RetryPolicy, func(err error, duration time.Duration) {
		applogger.Error(context.Background(), "トランザクションの再試行: %v後 エラー: %v", duration, err)
	})
}

// handleTransactionError はトランザクションエラーの処理を行います。
// この関数は以下の処理を行います：
// - 実行時間の計測
// - エラーの種類の判定
// - エラーの処理
func (r *universityRepository) handleTransactionError(err error, startTime time.Time) error {
	elapsedTime := time.Since(startTime)
	applogger.Error(context.Background(), "トランザクション実行時間: %v, エラー: %v", elapsedTime, err)

	if r.isRetryableError(err) {
		return err
	}

	var dbErr *appErrors.Error
	if errors.As(err, &dbErr) {
		return backoff.Permanent(err)
	}

	return backoff.Permanent(fmt.Errorf("トランザクションが失敗しました: %w", err))
}

// isRetryableError はリトライ可能なエラーかどうかを判定します。
// この関数は以下の処理を行います：
// - エラーメッセージの解析
// - リトライ可能なエラーの判定
// - 結果の返却
func (r *universityRepository) isRetryableError(err error) bool {
	if err == nil {
		return false
	}

	// context.DeadlineExceeded もリトライ対象
	if errors.Is(err, context.DeadlineExceeded) {
		return true
	}

	// リトライ可能なエラーの種類
	retryableErrors := []string{
		"deadlock",
		"timeout",
		"connection",
		"serialization",
		"lock",
	}

	errStr := err.Error()
	for _, retryableErr := range retryableErrors {
		if strings.Contains(strings.ToLower(errStr), retryableErr) {
			return true
		}
	}

	return false
}

// Savepoint はトランザクション内でセーブポイントを作成します。
// この関数は以下の処理を行います：
// - セーブポイントの作成
// - エラーハンドリング
func (r *universityRepository) Savepoint(tx *gorm.DB, name string) error {
	if err := tx.Exec(fmt.Sprintf("SAVEPOINT %s", name)).Error; err != nil {
		return fmt.Errorf(errSavepoint, err)
	}

	return nil
}

// RollbackTo は指定されたセーブポイントまでロールバックします。
// この関数は以下の処理を行います：
// - セーブポイントへのロールバック
// - エラーハンドリング
func (r *universityRepository) RollbackTo(tx *gorm.DB, name string) error {
	if err := tx.Exec(fmt.Sprintf("ROLLBACK TO SAVEPOINT %s", name)).Error; err != nil {
		return fmt.Errorf("セーブポイントへのロールバックに失敗しました: %w", err)
	}

	return nil
}

// WithTx はトランザクション用のリポジトリインスタンスを返します。
// この関数は以下の処理を行います：
// - トランザクションの設定
// - リポジトリの生成
func (r *universityRepository) WithTx(tx *gorm.DB) IUniversityRepository {
	return &universityRepository{
		db:    tx,
		cache: r.cache,
	}
}
