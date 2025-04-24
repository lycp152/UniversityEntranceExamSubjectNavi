# 環境変数
ENV ?= development
DOCKER_COMPOSE_DIR = deployments/docker/$(ENV)
DOCKER_COMPOSE = docker compose -f $(DOCKER_COMPOSE_DIR)/docker-compose.yml
CURRENT_TIME := $(shell date "+%Y%m%d_%H%M%S")

# 環境変数ファイルのパス
ENV_FILE = $(DOCKER_COMPOSE_DIR)/.env.$(ENV)
ENV_EXAMPLE_FILE = $(DOCKER_COMPOSE_DIR)/.env.$(ENV).example
TEST_ENV_FILE = back/tests/testdata/.env
TEST_ENV_EXAMPLE_FILE = back/tests/testdata/.env.example
FRONT_TEST_ENV_FILE = front/.env.test
FRONT_TEST_ENV_EXAMPLE_FILE = front/.env.test.example

# 基本コマンド
.PHONY: help
help: ## ヘルプを表示
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

# 開発環境セットアップ
.PHONY: setup
setup: check-deps init front-install back-install build start-db ## 開発環境の完全セットアップ
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
	@test -d front/node_modules || (echo "❌ フロントエンドの依存関係がインストールされていません" && exit 1)
	@echo "✅ 検証が完了しました"

# 開発環境の起動
.PHONY: dev
dev: verify ## 開発環境を起動
	@echo "🚀 開発環境を起動しています..."
	$(DOCKER_COMPOSE) up -d --build
	@echo "⏳ コンテナの起動を待機しています..."
	sleep 10
	@echo "🐘 マイグレーションを実行しています..."
	$(DOCKER_COMPOSE) exec backend go run migrations/scripts/main.go up
	@echo "🌱 シードデータを投入しています..."
	$(DOCKER_COMPOSE) exec backend go run migrations/seeds/main.go
	@echo "✅ 開発環境の準備が完了しました"
	@echo "👉 ログを確認するには 'make logs' を実行してください"

.PHONY: dev-reset
dev-reset: ## 開発環境を完全にリセット
	@echo "🔄 開発環境をリセットしています..."
	make down
	make clean
	make clean-volumes
	make init
	make setup

.PHONY: dev-update
dev-update: ## 依存関係を更新
	@echo "🔄 依存関係を更新しています..."
	make front-install
	make back-install
	make back-migrate

.PHONY: down
down: ## 環境を停止
	$(DOCKER_COMPOSE) down --remove-orphans

.PHONY: logs
logs: ## コンテナのログを表示
	$(DOCKER_COMPOSE) logs -f

# フロントエンド関連
.PHONY: front-install
front-install: ## フロントエンドの依存関係をインストール
	cd front && pnpm install

.PHONY: front-build
front-build: ## フロントエンドをビルド
	cd front && pnpm build

.PHONY: front-test
front-test: ## フロントエンドのテストを実行
	cd front && pnpm test

.PHONY: front-lint
front-lint: ## フロントエンドのリントを実行
	cd front && pnpm lint

# バックエンド関連
.PHONY: back-install
back-install: check-deps ## バックエンドの依存関係をインストール
	cd back && go mod download && go mod tidy

.PHONY: back-build
back-build: check-deps ## バックエンドをビルド
	cd back && go build -o dist/app ./cmd/api

.PHONY: back-test
back-test: check-deps ## バックエンドのテストを実行
	cd back && go test ./... -v

.PHONY: back-lint
back-lint: check-deps ## バックエンドのリントを実行
	cd back && golangci-lint run

.PHONY: back-test-unit
back-test-unit: check-deps ## バックエンドのユニットテストを実行
	cd back && go test -v ./tests/unit/...

.PHONY: back-test-integration
back-test-integration: check-deps ## バックエンドの統合テストを実行
	cd back && go test -v ./tests/integration/...

.PHONY: back-test-e2e
back-test-e2e: check-deps ## バックエンドのE2Eテストを実行
	cd back && go test -v ./tests/e2e/...

.PHONY: back-test-coverage
back-test-coverage: check-deps ## バックエンドのテストカバレッジを生成
	cd back && go test -coverprofile=coverage/coverage.out ./...
	cd back && go tool cover -html=coverage/coverage.out -o coverage/coverage.html

.PHONY: back-test-mock
back-test-mock: check-deps ## バックエンドのモックを生成
	cd back && go generate ./...

# データベース関連
.PHONY: back-migrate
back-migrate: check-deps ## マイグレーションを実行
	@echo "🐘 マイグレーションを実行しています..."
	$(DOCKER_COMPOSE) exec backend go run migrations/scripts/main.go up

.PHONY: back-migrate-down
back-migrate-down: check-deps ## マイグレーションをロールバック
	@echo "🐘 マイグレーションをロールバックしています..."
	$(DOCKER_COMPOSE) exec backend go run migrations/scripts/main.go down

.PHONY: back-migrate-create
back-migrate-create: check-deps ## 新しいマイグレーションファイルを作成
	cd back && go run migrations/scripts/main.go create $(name)

.PHONY: back-seed
back-seed: check-deps ## シードデータを投入
	@echo "🌱 シードデータを投入しています..."
	$(DOCKER_COMPOSE) exec backend go run migrations/seeds/main.go

.PHONY: back-db-backup
back-db-backup: ## データベースのバックアップを作成
	@echo "💾 データベースをバックアップしています..."
	@mkdir -p ./backups
	$(DOCKER_COMPOSE) exec db pg_dump -U postgres university_exam_db > ./backups/backup_$(CURRENT_TIME).sql
	@echo "✅ バックアップが完了しました: ./backups/backup_$(CURRENT_TIME).sql"

.PHONY: back-db-restore
back-db-restore: ## データベースのバックアップを復元
	@if [ -z "$(file)" ]; then \
		echo "❌ 復元するファイルを指定してください: make back-db-restore file=<path>"; \
		exit 1; \
	fi
	@echo "🔄 データベースを復元しています..."
	$(DOCKER_COMPOSE) exec -T db psql -U postgres university_exam_db < $(file)
	@echo "✅ 復元が完了しました"

.PHONY: back-db-clean
back-db-clean: ## データベースのデータを削除
	@echo "🗑️  データベースのデータを削除しています..."
	$(DOCKER_COMPOSE) exec postgres psql -U postgres -d university_exam_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
	@echo "✅ データベースのデータが削除されました"
	@echo "👉 マイグレーションを再実行するには 'make back-migrate' を実行してください"

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
	rm -rf back/dist back/tmp back/coverage
	docker system prune -f

.PHONY: clean-volumes
clean-volumes: ## Dockerボリュームを削除
	docker volume rm $(ENV)_postgres_data $(ENV)_backend_cache $(ENV)_frontend_node_modules 2>/dev/null || true

# その他
.PHONY: init
init: ## 環境変数ファイルを初期化
	@if [ ! -f $(ENV_FILE) ]; then \
		cp $(ENV_EXAMPLE_FILE) $(ENV_FILE); \
		echo "✅ 環境変数ファイルを作成しました: $(ENV_FILE)"; \
	else \
		echo "✅ 環境変数ファイルは既に存在します: $(ENV_FILE)"; \
	fi
	@if [ ! -f $(TEST_ENV_FILE) ]; then \
		cp $(TEST_ENV_EXAMPLE_FILE) $(TEST_ENV_FILE); \
		echo "✅ テスト用環境変数ファイルを作成しました: $(TEST_ENV_FILE)"; \
	else \
		echo "✅ テスト用環境変数ファイルは既に存在します: $(TEST_ENV_FILE)"; \
	fi
	@if [ ! -f $(FRONT_TEST_ENV_FILE) ]; then \
		cp $(FRONT_TEST_ENV_EXAMPLE_FILE) $(FRONT_TEST_ENV_FILE); \
		echo "✅ フロントエンドのテスト用環境変数ファイルを作成しました: $(FRONT_TEST_ENV_FILE)"; \
	else \
		echo "✅ フロントエンドのテスト用環境変数ファイルは既に存在します: $(FRONT_TEST_ENV_FILE)"; \
	fi

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

.PHONY: start-db
start-db: ## データベースコンテナを起動
	@echo "🐘 PostgreSQLを起動しています..."
	$(DOCKER_COMPOSE) up -d postgres
	@echo "⏳ データベースの初期化を待機しています..."
	sleep 10
