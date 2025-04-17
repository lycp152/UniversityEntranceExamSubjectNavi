// Package middleware はアプリケーションのミドルウェアを提供します。
// このパッケージは以下の機能を提供します：
// - JWTトークンによる認証
// - ロールベースのアクセス制御
// - 公開パスの管理
package middleware

import (
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
)

const (
	// BearerTokenPrefix はBearerトークンのプレフィックスです
	BearerTokenPrefix = "Bearer "
	// TokenExpiration はトークンの有効期限です
	TokenExpiration = 24 * time.Hour
	// RefreshTokenExpiration はリフレッシュトークンの有効期限です
	RefreshTokenExpiration = 7 * 24 * time.Hour
	// MinSecretLength はJWTシークレットの最小長です
	MinSecretLength = 32
)

// AuthError は認証関連のエラーを表します。
// この構造体は以下の情報を保持します：
// - エラーコード
// - エラーメッセージ
type AuthError struct {
	Code    int
	Message string
}

func (e *AuthError) Error() string {
	return e.Message
}

// validateAuthHeader はAuthorizationヘッダーを検証します。
// この関数は以下の処理を行います：
// - ヘッダーの存在確認
// - Bearerトークンの形式確認
// - トークンの抽出
func validateAuthHeader(auth string) (string, error) {
	if auth == "" {
		return "", &AuthError{
			Code:    http.StatusUnauthorized,
			Message: "認証が必要です",
		}
	}

	if !strings.HasPrefix(auth, BearerTokenPrefix) {
		return "", &AuthError{
			Code:    http.StatusUnauthorized,
			Message: "不正な認証トークンです",
		}
	}

	return strings.TrimPrefix(auth, BearerTokenPrefix), nil
}

// handleAuthError は認証エラーを処理します。
// この関数は以下の処理を行います：
// - エラータイプの判定
// - 適切なレスポンスの生成
// - エラーメッセージの設定
func handleAuthError(c echo.Context, err error) error {
	if authErr, ok := err.(*AuthError); ok {
		return c.JSON(authErr.Code, map[string]string{"error": authErr.Message})
	}

	return c.JSON(http.StatusUnauthorized, map[string]string{"error": err.Error()})
}

// AuthMiddleware は認証を行うミドルウェアです。
// このミドルウェアは以下の処理を行います：
// - 公開パスの確認
// - トークンの検証
// - ユーザー情報の取得
func AuthMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			if isPublicPath(c.Path()) {
				return next(c)
			}

			token, err := validateAuthHeader(c.Request().Header.Get("Authorization"))
			if err != nil {
				return handleAuthError(c, err)
			}

			user, err := validateAndGetUser(token)
			if err != nil {
				return handleAuthError(c, err)
			}

			c.Set("user", user)

			return next(c)
		}
	}
}

// validateToken はトークンの署名と有効性を検証します。
// この関数は以下の処理を行います：
// - シークレットの検証
// - トークンの署名確認
// - 有効期限の確認
func validateToken(token string) (*jwt.Token, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return nil, &AuthError{
			Code:    http.StatusInternalServerError,
			Message: "JWTシークレットが設定されていません",
		}
	}

	if len(secret) < MinSecretLength {
		return nil, &AuthError{
			Code:    http.StatusInternalServerError,
			Message: "JWTシークレットが短すぎます",
		}
	}

	parsedToken, err := jwt.Parse(token, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, &AuthError{
				Code:    http.StatusUnauthorized,
				Message: fmt.Sprintf("予期しない署名方式: %v", t.Header["alg"]),
			}
		}

		return []byte(secret), nil
	}, jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Name}))
	if err != nil {
		return nil, &AuthError{
			Code:    http.StatusUnauthorized,
			Message: fmt.Sprintf("トークンの検証に失敗しました: %v", err),
		}
	}

	if !parsedToken.Valid {
		return nil, &AuthError{
			Code:    http.StatusUnauthorized,
			Message: "無効なトークンです",
		}
	}

	return parsedToken, nil
}

// validateClaims はトークンのクレームを検証します。
// この関数は以下の処理を行います：
// - 有効期限の確認
// - 必須クレームの確認
// - ユーザー情報の抽出
func validateClaims(claims jwt.MapClaims) (map[string]string, error) {
	// 有効期限のチェック
	exp, ok := claims["exp"].(float64)
	if !ok {
		return nil, &AuthError{
			Code:    http.StatusUnauthorized,
			Message: "トークンの有効期限が設定されていません",
		}
	}

	if time.Unix(int64(exp), 0).Before(time.Now()) {
		return nil, &AuthError{
			Code:    http.StatusUnauthorized,
			Message: "トークンの有効期限が切れています",
		}
	}

	// 必須クレームのチェック
	sub, ok := claims["sub"].(string)
	if !ok {
		return nil, &AuthError{
			Code:    http.StatusUnauthorized,
			Message: "ユーザーIDが設定されていません",
		}
	}

	role, ok := claims["role"].(string)

	if !ok {
		return nil, &AuthError{
			Code:    http.StatusUnauthorized,
			Message: "ユーザーロールが設定されていません",
		}
	}

	return map[string]string{
		"id":   sub,
		"role": role,
	}, nil
}

// validateAndGetUser はトークンを検証し、ユーザー情報を取得します。
// この関数は以下の処理を行います：
// - トークンの検証
// - クレームの検証
// - ユーザー情報の返却
func validateAndGetUser(token string) (map[string]string, error) {
	parsedToken, err := validateToken(token)
	if err != nil {
		return nil, err
	}

	claims, ok := parsedToken.Claims.(jwt.MapClaims)
	if !ok {
		return nil, &AuthError{
			Code:    http.StatusUnauthorized,
			Message: "トークンの形式が不正です",
		}
	}

	return validateClaims(claims)
}

// AuthorizeRole は指定されたロールを持つユーザーのみアクセスを許可します。
// このミドルウェアは以下の処理を行います：
// - ユーザー情報の確認
// - ロールの確認
// - アクセス権限の判定
func AuthorizeRole(roles ...string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			user := c.Get("user")
			if user == nil {
				return &echo.HTTPError{
					Code:    http.StatusForbidden,
					Message: "この操作を実行する権限がありません",
				}
			}

			userRole := getUserRole(user)
			if !hasRole(userRole, roles) {
				return &echo.HTTPError{
					Code:    http.StatusForbidden,
					Message: "この操作を実行する権限がありません",
				}
			}

			return next(c)
		}
	}
}

// isPublicPath は認証が不要なパスかどうかを判定します。
// この関数は以下の処理を行います：
// - パスの比較
// - 公開パスの判定
// - サブパスの確認
func isPublicPath(path string) bool {
	publicPaths := []string{
		"/api/universities",
		"/csrf",
	}
	for _, p := range publicPaths {
		if strings.HasPrefix(path, p) && (path == p || strings.HasPrefix(path[len(p):], "/")) {
			return true
		}
	}

	return false
}

// getUserRole はユーザー情報からロールを取得します。
// この関数は以下の処理を行います：
// - ユーザー情報の型確認
// - ロールの抽出
// - デフォルト値の返却
func getUserRole(user interface{}) string {
	userMap, ok := user.(map[string]string)
	if !ok {
		return ""
	}

	role, exists := userMap["role"]
	if !exists {
		return ""
	}

	return role
}

// hasRole は指定されたロールを持っているかどうかを確認します。
// この関数は以下の処理を行います：
// - ロールの比較
// - 権限の確認
// - 結果の返却
func hasRole(userRole string, allowedRoles []string) bool {
	for _, role := range allowedRoles {
		if userRole == role {
			return true
		}
	}

	return false
}
