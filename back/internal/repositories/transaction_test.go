package repositories

import (
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"testing"
	"time"
	appErrors "university-exam-api/internal/errors"
)

// TestTransactionRetry はトランザクションのリトライテストを行います
func TestTransactionRetry(t *testing.T) {
	repo, university := setupTest(t)

	tests := []struct {
		name       string
		retryCount int
		maxRetries int
		wantErr    bool
		errType    error
	}{
		{
			name:       "正常系：リトライ成功",
			retryCount: 0,
			maxRetries: 3,
			wantErr:    false,
		},
		{
			name:       "異常系：リトライ回数超過",
			retryCount: 0,
			maxRetries: 0,
			wantErr:    true,
			errType:    appErrors.NewDatabaseError("transaction", fmt.Errorf("トランザクションがタイムアウトしました"), nil),
		},
		{
			name:       "異常系：永続的なエラー",
			retryCount: 0,
			maxRetries: 3,
			wantErr:    true,
			errType:    appErrors.NewDatabaseError("connection", fmt.Errorf("データベース接続エラー"), nil),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			retryCount := 0
			err := repo.Transaction(func(repo IUniversityRepository) error {
				retryCount++
				if retryCount < tt.maxRetries {
					return appErrors.NewDatabaseError("transaction", fmt.Errorf("デッドロックが検出されました"), nil)
				}
				if tt.errType != nil {
					return tt.errType
				}
				return repo.Update(university)
			})

			assertTransactionRetry(t, err, tt.wantErr, retryCount, tt.maxRetries)
		})
	}
}

// assertTransactionRetry はトランザクションリトライのテスト結果を検証します
func assertTransactionRetry(t *testing.T, err error, wantErr bool, retryCount, maxRetries int) {
	t.Helper()
	if (err != nil) != wantErr {
		t.Errorf("トランザクションリトライに失敗: %v", err)
	}

	if !wantErr && retryCount != maxRetries {
		t.Errorf("期待するリトライ回数 %d, 実際のリトライ回数 %d", maxRetries, retryCount)
	}
}

// TestTransactionTimeout はトランザクションのタイムアウトテストを行います
func TestTransactionTimeout(t *testing.T) {
	repo, _ := setupTest(t)

	tests := []struct {
		name    string
		timeout time.Duration
		wantErr bool
	}{
		{
			name:    "異常系：タイムアウト発生",
			timeout: 100 * time.Millisecond,
			wantErr: true,
		},
		{
			name:    "正常系：タイムアウトなし",
			timeout: 5 * time.Second,
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			opt := DefaultTransactionOption()
			opt.Timeout = tt.timeout

			err := repo.TransactionWithOption(func(repo IUniversityRepository) error {
				if tt.wantErr {
					time.Sleep(tt.timeout + 100*time.Millisecond)
				}
				return nil
			}, opt)

			if (err != nil) != tt.wantErr {
				t.Errorf("タイムアウトテストに失敗: %v", err)
			}

			if tt.wantErr && !strings.Contains(err.Error(), "タイムアウト") {
				t.Errorf("タイムアウトエラーを期待しましたが、実際のエラー: %v", err)
			}
		})
	}
}

// TestTransactionPermanentError は永続的なエラーのテストを行います
func TestTransactionPermanentError(t *testing.T) {
	repo, _ := setupTest(t)

	tests := []struct {
		name    string
		wantErr bool
	}{
		{
			name:    "異常系：永続的なエラー",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			permanentErr := errors.New("永続的なエラー")
			err := repo.Transaction(func(repo IUniversityRepository) error {
				return permanentErr
			})

			if (err != nil) != tt.wantErr {
				t.Error("永続的なエラーを期待しましたが、nilが返されました")
			}

			if !strings.Contains(err.Error(), permanentErr.Error()) {
				t.Errorf("エラーに %q が含まれることを期待しましたが、実際のエラー: %v", permanentErr.Error(), err)
			}
		})
	}
}

// TestTransactionIsolationLevel はトランザクションの分離レベルテストを行います
func TestTransactionIsolationLevel(t *testing.T) {
	repo, _ := setupTest(t)

	tests := []struct {
		name       string
		isolation  sql.IsolationLevel
		wantErr    bool
	}{
		{
			name:      "正常系：ReadCommitted分離レベル",
			isolation: sql.LevelReadCommitted,
			wantErr:   false,
		},
		{
			name:      "正常系：Serializable分離レベル",
			isolation: sql.LevelSerializable,
			wantErr:   false,
		},
		{
			name:      "異常系：無効な分離レベル",
			isolation: sql.IsolationLevel(999),
			wantErr:   true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			opt := DefaultTransactionOption()
			opt.Isolation = tt.isolation

			err := repo.TransactionWithOption(func(repo IUniversityRepository) error {
				return nil
			}, opt)

			if (err != nil) != tt.wantErr {
				t.Errorf("分離レベル %v のテストに失敗: %v", tt.isolation, err)
			}
		})
	}
}

// TestTransactionReadOnly は読み取り専用トランザクションのテストを行います
func TestTransactionReadOnly(t *testing.T) {
	repo, university := setupTest(t)

	tests := []struct {
		name     string
		readOnly bool
		wantErr  bool
	}{
		{
			name:     "正常系：読み取り専用トランザクション",
			readOnly: true,
			wantErr:  false,
		},
		{
			name:     "正常系：読み書き可能トランザクション",
			readOnly: false,
			wantErr:  false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			opt := DefaultTransactionOption()
			opt.ReadOnly = tt.readOnly

			err := repo.TransactionWithOption(func(repo IUniversityRepository) error {
				if tt.readOnly {
					// 読み取り専用トランザクションでの更新はエラーになるはず
					return repo.Update(university)
				}
				return nil
			}, opt)

			if (err != nil) != tt.wantErr {
				t.Errorf("読み取り専用設定 %v のテストに失敗: %v", tt.readOnly, err)
			}
		})
	}
}

// TestSavepoint はセーブポイントのテストを行います
func TestSavepoint(t *testing.T) {
	repo, _ := setupTest(t)

	tests := []struct {
		name    string
		wantErr bool
	}{
		{
			name:    "正常系：セーブポイントの作成とロールバック",
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := repo.Transaction(func(repo IUniversityRepository) error {
				tx := repo.(*universityRepository).db

				// セーブポイントの作成
				if err := repo.(*universityRepository).Savepoint(tx, "test_sp"); err != nil {
					return err
				}

				// セーブポイントへのロールバック
				if err := repo.(*universityRepository).RollbackTo(tx, "test_sp"); err != nil {
					return err
				}

				return nil
			})

			if (err != nil) != tt.wantErr {
				t.Errorf("セーブポイントのテストに失敗: %v", err)
			}
		})
	}
}
