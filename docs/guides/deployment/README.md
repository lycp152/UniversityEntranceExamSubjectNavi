# デプロイメントガイド

## 概要

本プロジェクトは以下の 3 つの環境にデプロイ可能です：

- 開発環境（Development）
- ステージング環境（Staging）
- 本番環境（Production）

## 必要条件

- Docker
- Docker Compose
- AWS CLI（本番環境用）
- kubectl（Kubernetes 用）
- Terraform（インフラ構築用）

## 環境別デプロイ手順

### 開発環境

1. 環境変数の設定

   ```bash
   cp .env.development.example .env.development
   ```

2. コンテナのビルドと起動

   ```bash
   docker compose -f docker-compose.dev.yml up -d
   ```

3. マイグレーションの実行
   ```bash
   docker compose -f docker-compose.dev.yml exec api make migrate
   ```

### ステージング環境

1. 環境変数の設定

   ```bash
   cp .env.staging.example .env.staging
   ```

2. イメージのビルド

   ```bash
   docker compose -f docker-compose.staging.yml build
   ```

3. Kubernetes へのデプロイ
   ```bash
   kubectl apply -f k8s/staging/
   ```

### 本番環境

1. 環境変数の設定

   ```bash
   cp .env.production.example .env.production
   ```

2. インフラのプロビジョニング

   ```bash
   cd terraform/production
   terraform init
   terraform plan
   terraform apply
   ```

3. EKS クラスターの設定

   ```bash
   aws eks update-kubeconfig --name prod-cluster
   ```

4. 本番環境へのデプロイ
   ```bash
   kubectl apply -f k8s/production/
   ```

## デプロイメント設定

### Docker Compose 設定

各環境用の Docker Compose 設定ファイルが用意されています：

- `compose.dev.yml`：開発環境用
- `compose.staging.yml`：ステージング環境用
- `compose.prod.yml`：本番環境用

### Kubernetes 設定

Kubernetes 用のマニフェストファイルは`k8s`ディレクトリに環境別に配置されています：

```
k8s/
├── development/
│   ├── api-deployment.yaml
│   ├── frontend-deployment.yaml
│   └── ingress.yaml
├── staging/
│   ├── api-deployment.yaml
│   ├── frontend-deployment.yaml
│   └── ingress.yaml
└── production/
    ├── api-deployment.yaml
    ├── frontend-deployment.yaml
    └── ingress.yaml
```

### Terraform 設定

インフラストラクチャのコードは`terraform`ディレクトリに環境別に配置されています：

```
terraform/
├── development/
│   ├── main.tf
│   └── variables.tf
├── staging/
│   ├── main.tf
│   └── variables.tf
└── production/
    ├── main.tf
    └── variables.tf
```

## CI/CD パイプライン

GitHub Actions を使用して自動デプロイを行います：

1. プルリクエスト作成時

   - コードの静的解析
   - ユニットテスト
   - インテグレーションテスト

2. メインブランチへのマージ時

   - ステージング環境へのデプロイ
   - E2E テスト

3. リリースタグ作成時
   - 本番環境へのデプロイ
   - スモークテスト

## ロールバック手順

### Kubernetes デプロイメントのロールバック

```bash
# 過去のリビジョンの確認
kubectl rollout history deployment/api-deployment

# 特定のリビジョンへのロールバック
kubectl rollout undo deployment/api-deployment --to-revision=<revision_number>
```

### データベースのロールバック

```bash
# マイグレーションのロールバック
make migrate-rollback

# 特定のバージョンへのロールバック
make migrate-rollback-to VERSION=<version_number>
```

## モニタリングとログ

### メトリクス監視

- Prometheus によるメトリクス収集
- Grafana による可視化
- AlertManager によるアラート通知

### ログ管理

- Fluentd によるログ収集
- Elasticsearch によるログ保存
- Kibana によるログ分析

## セキュリティ対策

1. SSL/TLS 証明書の管理

   - Let's Encrypt の自動更新
   - 証明書の有効期限監視

2. シークレット管理

   - AWS Secrets Manager の使用
   - Kubernetes Secrets の暗号化

3. ネットワークセキュリティ
   - WAF の設定
   - VPC の適切な設定
   - セキュリティグループの管理

## トラブルシューティング

デプロイメント関連の問題については[トラブルシューティングガイド](../../troubleshooting/deployment.md)を参照してください。
