# 環境変数
ENV ?= development
DOCKER_COMPOSE_DIR = deployments/docker/$(ENV)
DOCKER_COMPOSE = docker compose -f $(DOCKER_COMPOSE_DIR)/docker-compose.yml
CURRENT_TIME := $(shell date "+%Y%m%d_%H%M%S")

# 基本コマンド
.PHONY: help
help: ## ヘルプを表示
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

# 開発環境セットアップ
.PHONY: setup
setup: check-deps init build migrate seed ## 開発環境の完全セットアップ
	@echo "🎉 セットアップが完了しました！"
	@echo "👉 開発を開始するには 'make dev' を実行してください"

.PHONY: check-deps
check-deps: ## 必要な依存関係をチェック
	@echo "🔍 依存関係をチェックしています..."
	@which go >/dev/null 2>&1 || (echo "❌ Goがインストールされていません" && exit 1)
	@which node >/dev/null 2>&1 || (echo "❌ Node.jsがインストールされていません" && exit 1)
	@which docker >/dev/null 2>&1 || (echo "❌ Dockerがインストールされていません" && exit 1)
	@echo "✅ 全ての依存関係が満たされています"

.PHONY: verify
verify: ## 開発環境の状態を検証
	@echo "🔍 開発環境を検証しています..."
	@$(DOCKER_COMPOSE) ps | grep -q "postgres" || (echo "❌ データベースが実行されていません" && exit 1)
	@test -d front/node_modules || (echo "❌ フロントエンドの依存関係がインストールされていません" && exit 1)
	@echo "✅ 検証が完了しました"

.PHONY: dev
dev: verify ## 開発環境を起動
	$(DOCKER_COMPOSE) up --build

.PHONY: dev-reset
dev-reset: ## 開発環境を完全にリセット
	@echo "🔄 開発環境をリセットしています..."
	make down
	make clean
	make clean-volumes
	make setup

.PHONY: dev-update
dev-update: ## 依存関係を更新
	@echo "🔄 依存関係を更新しています..."
	make front-install
	make back-install
	make migrate

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
	cd back && go mod download && go mod tidy

.PHONY: back-build
back-build: ## バックエンドをビルド
	cd back && go build -o dist/app

.PHONY: back-test
back-test: ## バックエンドのテストを実行
	cd back && go test ./... -v

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
	$(DOCKER_COMPOSE) exec backend go run migrations/seeds/main.go

.PHONY: db-backup
db-backup: ## データベースのバックアップを作成
	@echo "💾 データベースをバックアップしています..."
	@mkdir -p ./backups
	$(DOCKER_COMPOSE) exec db pg_dump -U postgres university_exam_db > ./backups/backup_$(CURRENT_TIME).sql
	@echo "✅ バックアップが完了しました: ./backups/backup_$(CURRENT_TIME).sql"

.PHONY: db-restore
db-restore: ## データベースのバックアップを復元
	@if [ -z "$(file)" ]; then \
		echo "❌ 復元するファイルを指定してください: make db-restore file=<path>"; \
		exit 1; \
	fi
	@echo "🔄 データベースを復元しています..."
	$(DOCKER_COMPOSE) exec -T db psql -U postgres university_exam_db < $(file)
	@echo "✅ 復元が完了しました"

# デプロイ関連
.PHONY: deploy-prod
deploy-prod: ci ## 本番環境にデプロイ
	ENV=production $(DOCKER_COMPOSE) up -d --build

.PHONY: deploy-staging
deploy-staging: ci ## ステージング環境にデプロイ
	ENV=staging $(DOCKER_COMPOSE) up -d --build

# CI/CD
.PHONY: ci
ci: lint test build ## CI環境でのテスト実行

.PHONY: cd
cd: ## CD環境でのデプロイ
	@if [ "$(ENV)" = "production" ]; then \
		echo "🚀 本番環境へのデプロイを実行します"; \
		make deploy-prod; \
	elif [ "$(ENV)" = "staging" ]; then \
		echo "🚀 ステージング環境へのデプロイを実行します"; \
		make deploy-staging; \
	else \
		echo "❌ 環境が指定されていません"; \
		exit 1; \
	fi

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
	docker volume rm $(ENV)_postgres_data $(ENV)_backend_cache $(ENV)_frontend_node_modules 2>/dev/null || true

# その他
.PHONY: init
init: ## プロジェクトの初期化
	cp front/.env.example front/.env.local
	cp back/.env.example back/.env
	make front-install
	make back-install

.PHONY: release
release: ## 新しいバージョンをリリース
	@if [ -z "$(version)" ]; then \
		echo "❌ バージョンを指定してください: make release version=<version>"; \
		exit 1; \
	fi
	@echo "🏷️  バージョン v$(version) をリリースします..."
	@git tag -a v$(version) -m "Release v$(version)"
	@git push origin v$(version)
	@echo "✅ リリースが完了しました"
