# 開発時のトラブルシューティング

## データベース関連

### 接続エラー

**症状**: `connection refused`エラーが発生する

**解決策**:

1. Docker コンテナの状態確認
   ```bash
   docker ps
   ```
2. 環境変数の確認
   ```bash
   cat back/.env
   ```
3. ポートの競合確認
   ```bash
   lsof -i :5432
   ```

### マイグレーションエラー

**症状**: `migration failed`エラーが発生する

**解決策**:

1. マイグレーションのリセット
   ```bash
   make migrate-reset
   ```
2. DB のクリーンアップ
   ```bash
   make db-clean
   ```

## フロントエンド開発

### ビルドエラー

**症状**: `npm build`が失敗する

**解決策**:

1. 依存関係のクリーンアップ
   ```bash
   rm -rf node_modules
   rm package-lock.json
   npm install
   ```
2. キャッシュのクリア
   ```bash
   npm run clean
   ```

### TypeScript エラー

**症状**: 型エラーが発生する

**解決策**:

1. 型定義の更新
   ```bash
   npm run generate-types
   ```
2. `tsconfig.json`の確認
3. 必要な型定義パッケージのインストール
   ```bash
   npm install --save-dev @types/必要なパッケージ
   ```

## バックエンド開発

### 依存関係エラー

**症状**: `go mod`関連のエラーが発生する

**解決策**:

1. モジュールのクリーンアップ
   ```bash
   go clean -modcache
   go mod tidy
   ```
2. 依存関係の更新
   ```bash
   go get -u ./...
   ```

### テスト失敗

**症状**: テストが失敗する

**解決策**:

1. テストキャッシュのクリア
   ```bash
   go clean -testcache
   ```
2. 詳細なテストログの確認
   ```bash
   go test -v ./...
   ```

## Docker 関連

### コンテナ起動エラー

**症状**: コンテナが起動しない

**解決策**:

1. ログの確認
   ```bash
   docker compose logs
   ```
2. コンテナの再構築
   ```bash
   docker compose down
   docker compose build --no-cache
   docker compose up -d
   ```

### ボリュームエラー

**症状**: ボリュームのマウントに問題がある

**解決策**:

1. ボリュームの削除と再作成
   ```bash
   docker compose down -v
   docker compose up -d
   ```
2. パーミッションの修正
   ```bash
   sudo chown -R $USER:$USER .
   ```

## ネットワーク関連

### CORS エラー

**症状**: `Access-Control-Allow-Origin`エラーが発生する

**解決策**:

1. CORS 設定の確認
2. 開発環境の場合は`proxy`設定の確認
3. 本番環境の場合はセキュリティヘッダーの確認

### SSL/TLS エラー

**症状**: 証明書関連のエラーが発生する

**解決策**:

1. 開発環境の場合は自己署名証明書の設定
2. 本番環境の場合は証明書の更新確認
3. 信頼できる証明書の使用確認

## CI/CD 関連

### GitHub Actions エラー

**症状**: CI パイプラインが失敗する

**解決策**:

1. ワークフローファイルの確認
2. シークレットとトークンの設定確認
3. 依存関係のキャッシュ確認
4. ランナー環境の確認

### デプロイメントエラー

**症状**: 自動デプロイが失敗する

**解決策**:

1. デプロイメントログの確認
2. 環境変数の設定確認
3. アクセス権限の確認
4. インフラストラクチャの状態確認

## その他の問題

詳細なトラブルシューティングについては、以下を参照してください：

- [データベーストラブルシューティング](../database.md)
- [デプロイメントトラブルシューティング](../deployment.md)
- [パフォーマンストラブルシューティング](../performance.md)
