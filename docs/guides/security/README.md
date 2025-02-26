# セキュリティガイドライン

## 概要

本プロジェクトのセキュリティ対策について説明します。

## 認証・認可

### JWT 認証

1. トークン設定

   - アクセストークンの有効期限: 1 時間
   - リフレッシュトークンの有効期限: 2 週間
   - トークンの暗号化アルゴリズム: RS256

2. トークン管理

   ```go
   // トークン生成
   token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)

   // トークン検証
   token, err := jwt.Parse(tokenString, keyFunc)
   ```

### RBAC（ロールベースアクセス制御）

1. ユーザーロール

   - 管理者（ADMIN）
   - 一般ユーザー（USER）
   - ゲスト（GUEST）

2. 権限設定
   ```go
   func requireRole(role string) echo.MiddlewareFunc {
       return func(next echo.HandlerFunc) echo.HandlerFunc {
           // ロールチェックの実装
       }
   }
   ```

## データ保護

### 暗号化

1. データベース暗号化

   - 個人情報の AES-256 暗号化
   - パスワードの bcrypt ハッシュ化

2. 通信の暗号化
   - TLS 1.3 の使用
   - 強力な暗号スイートの選択

### データバックアップ

1. 定期バックアップ

   - 日次完全バックアップ
   - 1 時間ごとの差分バックアップ

2. バックアップ暗号化
   - AES-256-GCM による暗号化
   - 暗号化キーの安全な管理

## 入力検証とサニタイズ

### API リクエスト

1. バリデーション

   ```go
   type CreateUserRequest struct {
       Email    string `validate:"required,email"`
       Password string `validate:"required,min=8"`
   }
   ```

2. SQL インジェクション対策
   - プリペアドステートメントの使用
   - ORM の適切な利用

### XSS 対策

1. 出力エスケープ

   ```typescript
   // フロントエンド
   import { escapeHtml } from "../utils/security";
   const safeHtml = escapeHtml(userInput);
   ```

2. CSP の設定
   ```go
   // バックエンド
   c.Response().Header().Set("Content-Security-Policy",
       "default-src 'self'; script-src 'self';")
   ```

## セッション管理

1. セッションの設定

   ```go
   sessions.NewCookieStore([]byte(os.Getenv("SESSION_KEY")))
   ```

2. セキュアな属性
   - Secure 属性の有効化
   - HttpOnly 属性の有効化
   - SameSite=Strict の設定

## CORS 設定

```go
e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
    AllowOrigins: []string{"https://example.com"},
    AllowMethods: []string{http.MethodGet, http.MethodPost},
    AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType},
}))
```

## レート制限

1. API レート制限

   ```go
   e.Use(middleware.RateLimiter(middleware.NewRateLimiterMemoryStore(20)))
   ```

2. IP ベースの制限
   - 同一 IP からのリクエスト数制限
   - 不正アクセスの検知

## 監査ログ

1. セキュリティイベントのログ

   ```go
   type SecurityEvent struct {
       Timestamp time.Time
       UserID    string
       Action    string
       IP        string
       Status    string
   }
   ```

2. ログの保護
   - ログの暗号化
   - アクセス制御の実装

## 脆弱性スキャン

1. 定期スキャン

   - 依存パッケージの脆弱性チェック
   - コードの静的解析

2. CI/CD での自動チェック
   ```yaml
   security-scan:
     runs-on: ubuntu-latest
     steps:
       - uses: actions/checkout@v2
       - name: Run security scan
         run: |
           make security-scan
   ```

## インフラストラクチャセキュリティ

1. ネットワークセキュリティ

   - VPC の適切な設定
   - セキュリティグループの制限

2. コンテナセキュリティ
   - 最小権限の原則
   - イメージの脆弱性スキャン

## セキュリティチェックリスト

- [ ] 強力なパスワードポリシーの実装
- [ ] 多要素認証の有効化
- [ ] セキュリティヘッダーの設定
- [ ] 暗号化キーの定期的なローテーション
- [ ] セキュリティパッチの適用
- [ ] アクセスログの監視
- [ ] インシデントレスポンス計画の策定

## インシデントレスポンス

1. 検知

   - セキュリティ監視
   - アラートの設定

2. 対応

   - インシデント報告
   - 影響範囲の特定
   - 修復計画の実行

3. 復旧
   - システムの復旧
   - 再発防止策の実装

## 参考文献

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Go Security Guidelines](https://golang.org/security)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
