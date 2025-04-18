// Package models はテストで使用するモデルを提供します。
// このパッケージは以下の機能を提供します：
// - ユーザー情報の構造体定義
// - ユーザー情報のバリデーション
// - セキュリティチェック機能
package models

import (
	"errors"
	"strings"
)

// errInvalidChars は無効な文字が含まれている場合のエラーメッセージです
const (
	errInvalidChars = "名前に無効な文字が含まれています"
)

// User はユーザー情報を表す構造体です
// この構造体は以下の情報を保持します：
// - ユーザーID
// - ユーザー名
// - メールアドレス
// - パスワード（JSONシリアライズ時は除外）
type User struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"-"`
}

// Validate はユーザー情報のバリデーションを行います
// この関数は以下のチェックを行います：
// - 名前の必須チェック
// - 名前の長さチェック（UTF-8文字列として）
// - メールアドレスの必須チェック
// - メールアドレスの形式チェック
// - パスワードの長さチェック
// - XSS攻撃の可能性チェック
// - SQLインジェクションの可能性チェック
// - 特殊文字のチェック
func (u *User) Validate() error {
	// 基本的なバリデーション
	if u.Name == "" {
		return errors.New("名前は必須です")
	}

	if len([]rune(u.Name)) > 255 { // UTF-8文字列の長さを正しく計算
		return errors.New("名前が長すぎます")
	}

	if u.Email == "" {
		return errors.New("メールアドレスは必須です")
	}

	if !isValidEmail(u.Email) {
		return errors.New("無効なメールアドレスです")
	}

	if len(u.Password) < 8 {
		return errors.New("パスワードは8文字以上必要です")
	}

	// セキュリティチェック
	if containsXSS(u.Name) {
		return errors.New(errInvalidChars)
	}

	if containsSQLInjection(u.Name) {
		return errors.New(errInvalidChars)
	}

	if containsSpecialChars(u.Name) {
		return errors.New(errInvalidChars)
	}

	return nil
}

// isValidEmail はメールアドレスの形式を検証します
// この関数は以下のチェックを行います：
// - @記号の存在チェック
// - ドメイン部分の存在チェック
func isValidEmail(email string) bool {
	// 簡易的なメールアドレス検証
	return strings.Contains(email, "@") && strings.Contains(email, ".")
}

// containsXSS はXSS攻撃の可能性がある文字列を検出します
// この関数は以下のパターンをチェックします：
// - <script>タグ
// - javascript:プロトコル
// - イベントハンドラ属性
func containsXSS(s string) bool {
	dangerousPatterns := []string{
		"<script>", "</script>", "javascript:", "onerror=", "onclick=", "onload=", "onmouseover=",
	}

	for _, pattern := range dangerousPatterns {
		if strings.Contains(strings.ToLower(s), strings.ToLower(pattern)) {
			return true
		}
	}

	return false
}

// containsSQLInjection はSQLインジェクションの可能性がある文字列を検出します
// この関数は以下のパターンをチェックします：
// - シングルクォート
// - ダブルクォート
// - SQLコメント
// - SQLキーワード
func containsSQLInjection(s string) bool {
	dangerousPatterns := []string{
		"'", "\"", ";", "--", "/*", "*/", "UNION", "SELECT", "INSERT", "UPDATE", "DELETE", "DROP",
	}

	for _, pattern := range dangerousPatterns {
		if strings.Contains(strings.ToUpper(s), strings.ToUpper(pattern)) {
			return true
		}
	}

	return false
}

// containsSpecialChars は制御文字や特殊文字を検出します
// この関数は以下の文字をチェックします：
// - ASCII制御文字（0-31）
// - DEL文字（127）
func containsSpecialChars(s string) bool {
	for _, r := range s {
		if r < 32 || r == 127 { // 制御文字のみをチェック
			return true
		}
	}

	return false
}
