# 環境変数
ENV ?= development
DOCKER_COMPOSE_DIR = deployments/docker/$(ENV)
DOCKER_COMPOSE = docker compose -f $(DOCKER_COMPOSE_DIR)/docker-compose.yml

# 基本コマンド
.PHONY: help
help: ## ヘルプを表示
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.PHONY: dev
dev: ## 開発環境を起動
	$(DOCKER_COMPOSE) up --build

.PHONY: down
down: ## 環境を停止
	$(DOCKER_COMPOSE) down

.PHONY: logs
logs: ## コンテナのログを表示
	$(DOCKER_COMPOSE) logs -f

# フロントエンド関連
.PHONY: front-install
front-install: ## フロントエンドの依存関係をインストール
	cd front && npm install

.PHONY: front-build
front-build: ## フロントエンドをビルド
	cd front && npm run build

.PHONY: front-test
front-test: ## フロントエンドのテストを実行
	cd front && npm test

.PHONY: front-lint
front-lint: ## フロントエンドのリントを実行
	cd front && npm run lint

# バックエンド関連
.PHONY: back-install
back-install: ## バックエンドの依存関係をインストール
	cd back && go mod download

.PHONY: back-build
back-build: ## バックエンドをビルド
	cd back && go build -o dist/app

.PHONY: back-test
back-test: ## バックエンドのテストを実行
	cd back && go test ./...

.PHONY: back-lint
back-lint: ## バックエンドのリントを実行
	cd back && golangci-lint run

# データベース関連
.PHONY: migrate
migrate: ## マイグレーションを実行
	cd back && go run cmd/migrate/main.go up

.PHONY: migrate-down
migrate-down: ## マイグレーションをロールバック
	cd back && go run cmd/migrate/main.go down

.PHONY: migrate-create
migrate-create: ## 新しいマイグレーションファイルを作成
	cd back && go run cmd/migrate/main.go create $(name)

.PHONY: seed
seed: ## データベースにシードデータを投入
	$(DOCKER_COMPOSE) exec backend go run scripts/seed/main.go

# デプロイ関連
.PHONY: deploy-prod
deploy-prod: ## 本番環境にデプロイ
	ENV=production $(DOCKER_COMPOSE) up -d --build

.PHONY: deploy-staging
deploy-staging: ## ステージング環境にデプロイ
	ENV=staging $(DOCKER_COMPOSE) up -d --build

# テストとビルド
.PHONY: test
test: front-test back-test ## すべてのテストを実行

.PHONY: lint
lint: front-lint back-lint ## すべてのリントを実行

.PHONY: build
build: front-build back-build ## すべてのビルドを実行

# クリーンアップ
.PHONY: clean
clean: ## ビルドファイルとキャッシュを削除
	rm -rf front/dist front/.next front/node_modules
	rm -rf back/dist back/tmp
	docker system prune -f

.PHONY: clean-volumes
clean-volumes: ## Dockerボリュームを削除
	docker volume rm development_postgres_data development_backend_cache development_frontend_node_modules

# その他
.PHONY: init
init: ## プロジェクトの初期化
	cp front/.env.example front/.env.local
	cp back/.env.example back/.env
	make front-install
	make back-install
