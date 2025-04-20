// Package errors は、アプリケーション全体で使用するエラー定義を提供します。
// このパッケージには以下の機能が含まれます：
// 1. エラーコードの定義と管理
// 2. データベースエラーの詳細な情報保持
// 3. エラーチェッカー関数
// 4. エラー詳細情報の取得
package errors

import (
	"errors"
	"fmt"
	"runtime"
	"strings"
	"time"
)

// Code はエラーコードを表す型です。
// アプリケーション全体で一貫したエラーコードを使用するために定義されています。
type Code string

// エラーコードの定義
// 各エラーコードは特定のエラー状況を表し、エラーハンドリングに使用されます。
const (
	// CodeNotFound はレコードが見つからない場合のエラーコードです。
	CodeNotFound Code = "NOT_FOUND"
	// CodeDuplicateKey は一意制約違反が発生した場合のエラーコードです。
	CodeDuplicateKey Code = "DUPLICATE_KEY"
	// CodeValidationError はバリデーションに失敗した場合のエラーコードです。
	CodeValidationError Code = "VALIDATION_ERROR"
	// CodeDatabaseError はその他のデータベースエラーのエラーコードです。
	CodeDatabaseError Code = "DATABASE_ERROR"
	// CodeInvalidYear は学年度が不正な場合のエラーコードです。
	CodeInvalidYear Code = "INVALID_YEAR"
	// CodeTimeout は操作がタイムアウトした場合のエラーコードです。
	CodeTimeout Code = "TIMEOUT"
	// CodeDeadlock はデッドロックが発生した場合のエラーコードです。
	CodeDeadlock Code = "DEADLOCK"
	// CodeCustom はカスタムエラーのエラーコードです。
	CodeCustom Code = "CUSTOM_ERROR"
)

// データベース操作で発生する一般的なエラー
var (
	// ErrRecordNotFound はレコードが存在しない場合のエラーです。
	ErrRecordNotFound = errors.New("レコードが見つかりません")
	// ErrDuplicateKey は一意制約違反が発生した場合のエラーです。
	ErrDuplicateKey = errors.New("重複するキーが存在します")
	// ErrValidationFailed はバリデーションに失敗した場合のエラーです。
	ErrValidationFailed = errors.New("バリデーションに失敗しました")
	// ErrDatabaseError はその他のデータベースエラーです。
	ErrDatabaseError = errors.New("データベースエラーが発生しました")
	// ErrInvalidAcademicYear は学年度が不正な場合のエラーです。
	ErrInvalidAcademicYear = errors.New("学年度は2000年から2100年の間である必要があります")
	// ErrTimeout は操作がタイムアウトした場合のエラーです。
	ErrTimeout = errors.New("操作がタイムアウトしました")
	// ErrDeadlock はデッドロックが発生した場合のエラーです。
	ErrDeadlock = errors.New("デッドロックが発生しました")
)

// Detail はエラーの詳細情報を保持する構造体です。
// エラーの発生状況をより詳細に把握するために使用されます。
type Detail struct {
	Message    string            // エラーメッセージ
	StackTrace string            // スタックトレース
	Context    map[string]string // コンテキスト情報
}

// DatabaseError はデータベース操作の詳細なエラー情報を保持する構造体です。
// エラーの発生状況を包括的に記録し、デバッグやログ記録に使用されます。
type DatabaseError struct {
	Err       error      // 元のエラー
	Code      Code       // エラーコード
	Operation string     // 実行された操作
	Table     string     // 操作対象のテーブル
	Timestamp time.Time  // エラー発生時刻
	Details   Detail     // 追加の詳細情報
}

// Error はDatabaseErrorの文字列表現を返します。
// エラーの詳細情報を人間が読みやすい形式で表示します。
func (e *DatabaseError) Error() string {
	var contextStr string

	if len(e.Details.Context) > 0 {
		var contextParts []string
		for k, v := range e.Details.Context {
			contextParts = append(contextParts, fmt.Sprintf("%s=%s", k, v))
		}

		contextStr = fmt.Sprintf(", コンテキスト: {%s}", strings.Join(contextParts, ", "))
	}

	return fmt.Sprintf("%s テーブルでの %s 操作中にエラーが発生しました: %v (エラーコード: %s, 時刻: %s, 詳細: %s%s)",
		e.Table, e.Operation, e.Err, e.Code, e.Timestamp.Format(time.RFC3339), e.Details.Message, contextStr)
}

// Unwrap は元のエラーを返します。
// errors.Unwrap関数と互換性があります。
func (e *DatabaseError) Unwrap() error {
	return e.Err
}

// NewDatabaseError は新しいDatabaseErrorインスタンスを作成します。
// 引数：
//   - err: 元のエラー
//   - code: エラーコード
//   - operation: 実行された操作
//   - table: 操作対象のテーブル
//   - details: 追加の詳細情報（オプション）
// 戻り値：
//   - *DatabaseError: 作成されたDatabaseErrorインスタンス
func NewDatabaseError(err error, code Code, operation, table string, details ...string) *DatabaseError {
	var detail string
	if len(details) > 0 {
		detail = details[0]
	}

	// スタックトレースの取得
	var stackTrace string

	pc := make([]uintptr, 10)
	n := runtime.Callers(2, pc)

	if n > 0 {
		frames := runtime.CallersFrames(pc[:n])

		var stack []string

		for {
			frame, more := frames.Next()
			stack = append(stack, fmt.Sprintf("%s:%d %s", frame.File, frame.Line, frame.Function))

			if !more {
				break
			}
		}

		stackTrace = strings.Join(stack, "\n")
	}

	return &DatabaseError{
		Err:       err,
		Code:      code,
		Operation: operation,
		Table:     table,
		Timestamp: time.Now(),
		Details: Detail{
			Message:    detail,
			StackTrace: stackTrace,
			Context:    make(map[string]string),
		},
	}
}

// WithContext はエラーにコンテキスト情報を追加します。
// 引数：
//   - key: コンテキストのキー
//   - value: コンテキストの値
// 戻り値：
//   - *DatabaseError: コンテキストが追加されたDatabaseErrorインスタンス
func (e *DatabaseError) WithContext(key, value string) *DatabaseError {
	e.Details.Context[key] = value
	return e
}

// IsNotFound はエラーがレコード未検出エラーかどうかを判定します。
// 引数：
//   - err: 判定対象のエラー
// 戻り値：
//   - bool: レコード未検出エラーの場合はtrue、それ以外はfalse
func IsNotFound(err error) bool {
	var dbErr *DatabaseError
	if errors.As(err, &dbErr) {
		return dbErr.Code == CodeNotFound
	}

	return errors.Is(err, ErrRecordNotFound)
}

// IsDuplicateKey はエラーが一意制約違反エラーかどうかを判定します。
// 引数：
//   - err: 判定対象のエラー
// 戻り値：
//   - bool: 一意制約違反エラーの場合はtrue、それ以外はfalse
func IsDuplicateKey(err error) bool {
	var dbErr *DatabaseError
	if errors.As(err, &dbErr) {
		return dbErr.Code == CodeDuplicateKey
	}

	return errors.Is(err, ErrDuplicateKey)
}

// IsValidationError はエラーがバリデーションエラーかどうかを判定します。
// 引数：
//   - err: 判定対象のエラー
// 戻り値：
//   - bool: バリデーションエラーの場合はtrue、それ以外はfalse
func IsValidationError(err error) bool {
	var dbErr *DatabaseError
	if errors.As(err, &dbErr) {
		return dbErr.Code == CodeValidationError
	}

	return errors.Is(err, ErrValidationFailed)
}

// IsTimeout はエラーがタイムアウトエラーかどうかを判定します。
// 引数：
//   - err: 判定対象のエラー
// 戻り値：
//   - bool: タイムアウトエラーの場合はtrue、それ以外はfalse
func IsTimeout(err error) bool {
	var dbErr *DatabaseError
	if errors.As(err, &dbErr) {
		return dbErr.Code == CodeTimeout
	}

	return errors.Is(err, ErrTimeout)
}

// IsDeadlock はエラーがデッドロックエラーかどうかを判定します。
// 引数：
//   - err: 判定対象のエラー
// 戻り値：
//   - bool: デッドロックエラーの場合はtrue、それ以外はfalse
func IsDeadlock(err error) bool {
	var dbErr *DatabaseError
	if errors.As(err, &dbErr) {
		return dbErr.Code == CodeDeadlock
	}

	return errors.Is(err, ErrDeadlock)
}

// GetErrorDetails はエラーの詳細情報を取得します。
// 引数：
//   - err: 詳細情報を取得するエラー
// 戻り値：
//   - Detail: エラーの詳細情報
//   - bool: 詳細情報が取得できた場合はtrue、それ以外はfalse
func GetErrorDetails(err error) (Detail, bool) {
	var dbErr *DatabaseError
	if errors.As(err, &dbErr) {
		return dbErr.Details, true
	}

	return Detail{}, false
}
