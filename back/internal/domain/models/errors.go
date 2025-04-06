package models

import (
	"errors"
	"fmt"
)

// データベース操作で発生する一般的なエラー
var (
	// ErrRecordNotFound はレコードが存在しない場合のエラー
	ErrRecordNotFound = errors.New("レコードが見つかりません")
	// ErrDuplicateKey は一意制約違反が発生した場合のエラー
	ErrDuplicateKey = errors.New("重複するキーが存在します")
	// ErrValidationFailed はバリデーションに失敗した場合のエラー
	ErrValidationFailed = errors.New("バリデーションに失敗しました")
	// ErrDatabaseError はその他のデータベースエラー
	ErrDatabaseError = errors.New("データベースエラーが発生しました")
	// ErrInvalidAcademicYear は学年度が不正な場合のエラー
	ErrInvalidAcademicYear = errors.New("学年度は2000年から2100年の間である必要があります")
)

// DBError はデータベース操作の詳細なエラー情報を保持する構造体
type DBError struct {
	Err       error  // 元のエラー
	Code      string // エラーコード
	Operation string // 実行された操作
	Table     string // 操作対象のテーブル
}

// Error はDBErrorの文字列表現を返す
func (e *DBError) Error() string {
	return fmt.Sprintf("%s テーブルでの %s 操作中にエラーが発生しました: %v (エラーコード: %s)",
		e.Table, e.Operation, e.Err, e.Code)
}

// NewDBError は新しいDBErrorインスタンスを作成する
func NewDBError(err error, code, operation, table string) *DBError {
	return &DBError{
		Err:       err,
		Code:      code,
		Operation: operation,
		Table:     table,
	}
}

// IsNotFound はエラーがレコード未検出エラーかどうかを判定する
func IsNotFound(err error) bool {
	return errors.Is(err, ErrRecordNotFound)
}

// IsDuplicateKey はエラーが一意制約違反エラーかどうかを判定する
func IsDuplicateKey(err error) bool {
	return errors.Is(err, ErrDuplicateKey)
}

// IsValidationError はエラーがバリデーションエラーかどうかを判定する
func IsValidationError(err error) bool {
	return errors.Is(err, ErrValidationFailed)
}
