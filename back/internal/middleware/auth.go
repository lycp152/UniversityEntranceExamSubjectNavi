package middleware

import (
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
)

// validateAuthHeader はAuthorizationヘッダーを検証します
func validateAuthHeader(auth string) (string, error) {
	if auth == "" {
		return "", fmt.Errorf("認証が必要です")
	}

	parts := strings.Split(auth, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		return "", fmt.Errorf("不正な認証トークンです")
	}

	return parts[1], nil
}

// AuthMiddleware は認証を行うミドルウェアです
func AuthMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// 認証が不要なパスをスキップ
			if isPublicPath(c.Path()) {
				return next(c)
			}

			token, err := validateAuthHeader(c.Request().Header.Get("Authorization"))
			if err != nil {
				return c.JSON(http.StatusUnauthorized, map[string]string{"error": err.Error()})
			}

			if !isValidToken(token) {
				return c.JSON(http.StatusUnauthorized, map[string]string{
					"error": "認証トークンの有効期限が切れています",
				})
			}

			// ユーザー情報をコンテキストに設定
			c.Set("user", getUserFromToken(token))

			return next(c)
		}
	}
}

// AuthorizeRole は指定されたロールを持つユーザーのみアクセスを許可します
func AuthorizeRole(roles ...string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			user := c.Get("user")
			if user == nil {
				return c.JSON(http.StatusForbidden, map[string]string{
					"error": "この操作を実行する権限がありません",
				})
			}

			userRole := getUserRole(user)
			if !hasRole(userRole, roles) {
				return c.JSON(http.StatusForbidden, map[string]string{
					"error": "この操作を実行する権限がありません",
				})
			}

			return next(c)
		}
	}
}

// isPublicPath は認証が不要なパスかどうかを判定します
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

// isValidToken はトークンが有効かどうかを検証します
func isValidToken(token string) bool {
	if token == "" {
		return false
	}

	// JWTトークンの検証
	_, err := jwt.Parse(token, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("予期しない署名方式: %v", t.Header["alg"])
		}

		return []byte(os.Getenv("JWT_SECRET")), nil
	})

	return err == nil
}

// getUserFromToken はトークンからユーザー情報を取得します
func getUserFromToken(token string) interface{} {
	parsedToken, err := jwt.Parse(token, func(t *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("JWT_SECRET")), nil
	})
	if err != nil {
		return nil
	}

	if !parsedToken.Valid {
		return nil
	}

	claims, ok := parsedToken.Claims.(jwt.MapClaims)
	if !ok {
		return nil
	}

	return map[string]string{
		"id":   claims["sub"].(string),
		"role": claims["role"].(string),
	}
}

// getUserRole はユーザー情報からロールを取得します
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

// hasRole は指定されたロールを持っているかどうかを確認します
func hasRole(userRole string, allowedRoles []string) bool {
	for _, role := range allowedRoles {
		if userRole == role {
			return true
		}
	}

	return false
}
