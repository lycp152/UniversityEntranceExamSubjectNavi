# 環境変数
ENV ?= development
DOCKER_COMPOSE_DIR = deployments/docker/$(ENV)
DOCKER_COMPOSE = docker compose -f $(DOCKER_COMPOSE_DIR)/docker-compose.yml
CURRENT_TIME := $(shell date "+%Y%m%d_%H%M%S")

# メッセージ出力の共通処理
MSG_START = @echo "🚀 $(1)を開始しています..."
MSG_SUCCESS = @echo "✅ $(1)が完了しました"
MSG_ERROR = @echo "❌ $(1)"
MSG_INFO = @echo "👉 $(1)"

# 環境変数ファイル関連の共通処理
ENV_FILES = \
	$(DOCKER_COMPOSE_DIR)/.env.$(ENV) \
	$(DOCKER_COMPOSE_DIR)/.env.$(ENV).example \
	back/tests/testdata/.env \
	back/tests/testdata/.env.example \
	front/.env.test \
	front/.env.test.example

# 共通の処理を定義
INSTALL_DEPS = make front-install && make back-install
RUN_MIGRATIONS = $(DOCKER_COMPOSE) exec backend go run migrations/scripts/main.go up
RUN_SEEDS = $(DOCKER_COMPOSE) exec backend go run migrations/seeds/main.go
CLEAN_DB = $(DOCKER_COMPOSE) exec postgres psql -U postgres -d university_exam_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# バックエンド関連の共通処理
BACK_DEPS = check-deps
BACK_TEST = cd back && go test -v
BACK_BUILD = cd back && go build -o dist/app ./cmd/api
BACK_TEST_COVERAGE = cd back && go test -coverprofile=coverage/coverage.out
BACK_TEST_HTML = cd back && go tool cover -html=coverage/coverage.out -o coverage/coverage.html
BACK_TEST_MOCK = cd back && go generate

# テスト関連の共通処理
TEST_DEPS = $(BACK_DEPS)
TEST_RUN = $(BACK_TEST)

# フロントエンド関連の共通処理
FRONT_CMD = cd front && pnpm
FRONT_INSTALL = $(FRONT_CMD) install
FRONT_BUILD = $(FRONT_CMD) build
FRONT_TEST = $(FRONT_CMD) test
FRONT_LINT = $(FRONT_CMD) lint

# デプロイ関連の共通処理
DEPLOY = ENV=$(1) $(DOCKER_COMPOSE) up -d --build

# クリーンアップ関連の共通処理
CLEAN_FRONT = rm -rf front/dist front/.next front/node_modules
CLEAN_BACK = rm -rf back/dist back/tmp back/coverage
CLEAN_DOCKER = docker system prune -f
CLEAN_VOLUMES = docker volume ls -q | grep $(ENV) | xargs -r docker volume rm

# データベース関連の共通処理
DB_BACKUP = @mkdir -p ./backups && $(DOCKER_COMPOSE) exec db pg_dump -U postgres university_exam_db > ./backups/backup_$(CURRENT_TIME).sql
DB_RESTORE = $(DOCKER_COMPOSE) exec -T db psql -U postgres university_exam_db < $(1)

# 環境変数ファイル関連の共通処理
CREATE_ENV_FILE = @if [ ! -f $(1) ]; then \
	cp $(2) $(1); \
	echo "✅ 環境変数ファイルを作成しました: $(1)"; \
else \
	echo "👉 環境変数ファイルは既に存在します: $(1)"; \
fi

# 基本コマンド
.PHONY: help
help: ## ヘルプを表示
	$(call MSG_INFO,利用可能なコマンド:)
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

# 開発環境セットアップ
.PHONY: setup
setup: check-deps init front-install back-install build start-db ## 開発環境の完全セットアップ
	$(call MSG_START,開発環境のセットアップ)
	$(call MSG_SUCCESS,セットアップ)
	$(call MSG_INFO,開発を開始するには 'make dev' を実行してください)

.PHONY: check-deps
check-deps: ## 必要な依存関係をチェック
	$(call MSG_START,依存関係のチェック)
	@which go >/dev/null 2>&1 || ($(call MSG_ERROR,Goがインストールされていません) && exit 1)
	@which node >/dev/null 2>&1 || ($(call MSG_ERROR,Node.jsがインストールされていません) && exit 1)
	@which docker >/dev/null 2>&1 || ($(call MSG_ERROR,Dockerがインストールされていません) && exit 1)
	$(call MSG_SUCCESS,依存関係のチェック)

.PHONY: verify
verify: ## 開発環境の状態を検証
	$(call MSG_START,開発環境の検証)
	@test -d front/node_modules || ($(call MSG_ERROR,フロントエンドの依存関係がインストールされていません) && exit 1)
	$(call MSG_SUCCESS,検証)

# 開発環境の起動
.PHONY: dev
dev: verify ## 開発環境を起動
	$(call MSG_START,開発環境の起動)
	$(DOCKER_COMPOSE) up -d --build
	$(call MSG_INFO,コンテナの起動を待機しています...)
	sleep 15
	$(call MSG_INFO,マイグレーションを実行しています...)
	$(RUN_MIGRATIONS)
	$(call MSG_INFO,シードデータを投入しています...)
	$(RUN_SEEDS)
	$(call MSG_SUCCESS,開発環境の準備)
	$(call MSG_INFO,ログを確認するには 'make logs' を実行してください)

.PHONY: dev-reset
dev-reset: ## 開発環境を完全にリセット
	$(call MSG_START,開発環境のリセット)
	$(call MSG_INFO,1. コンテナを停止しています...)
	$(DOCKER_COMPOSE) down --remove-orphans
	$(call MSG_INFO,2. ボリュームを削除しています...)
	make clean-volumes
	$(call MSG_INFO,3. キャッシュをクリーンアップしています...)
	make clean
	$(call MSG_INFO,4. 環境変数を初期化しています...)
	make init
	$(call MSG_INFO,5. 依存関係を再インストールしています...)
	$(INSTALL_DEPS)
	$(call MSG_INFO,6. データベースを起動しています...)
	make start-db
	$(call MSG_INFO,7. 開発環境を起動しています...)
	make dev
	$(call MSG_SUCCESS,開発環境のリセット)

.PHONY: dev-update
dev-update: ## 依存関係を更新
	$(call MSG_START,依存関係の更新)
	$(INSTALL_DEPS)
	make back-migrate
	$(call MSG_SUCCESS,依存関係の更新)

.PHONY: down
down: ## 環境を停止
	$(call MSG_START,環境の停止)
	$(DOCKER_COMPOSE) down --remove-orphans
	$(call MSG_SUCCESS,環境の停止)

.PHONY: logs
logs: ## コンテナのログを表示
	$(call MSG_START,ログの表示)
	$(DOCKER_COMPOSE) logs -f

# フロントエンド関連
.PHONY: front-install
front-install: ## フロントエンドの依存関係をインストール
	$(call MSG_START,フロントエンドの依存関係インストール)
	$(FRONT_INSTALL)
	$(call MSG_SUCCESS,フロントエンドの依存関係インストール)

.PHONY: front-build
front-build: ## フロントエンドをビルド
	$(call MSG_START,フロントエンドのビルド)
	$(FRONT_BUILD)
	$(call MSG_SUCCESS,フロントエンドのビルド)

.PHONY: front-test
front-test: ## フロントエンドのテストを実行
	$(call MSG_START,フロントエンドのテスト)
	$(FRONT_TEST)
	$(call MSG_SUCCESS,フロントエンドのテスト)

.PHONY: front-lint
front-lint: ## フロントエンドのリントを実行
	$(call MSG_START,フロントエンドのリント)
	$(FRONT_LINT)
	$(call MSG_SUCCESS,フロントエンドのリント)

# バックエンド関連
.PHONY: back-install
back-install: $(BACK_DEPS) ## バックエンドの依存関係をインストール
	$(call MSG_START,バックエンドの依存関係インストール)
	cd back && go mod download && go mod tidy
	$(call MSG_SUCCESS,バックエンドの依存関係インストール)

.PHONY: back-build
back-build: $(BACK_DEPS) ## バックエンドをビルド
	$(call MSG_START,バックエンドのビルド)
	$(BACK_BUILD)
	$(call MSG_SUCCESS,バックエンドのビルド)

.PHONY: back-test
back-test: $(TEST_DEPS) ## バックエンドのテストを実行
	$(call MSG_START,バックエンドのテスト)
	$(TEST_RUN) ./...
	$(call MSG_SUCCESS,バックエンドのテスト)

.PHONY: back-test-unit
back-test-unit: $(TEST_DEPS) ## バックエンドのユニットテストを実行
	$(call MSG_START,バックエンドのユニットテスト)
	$(TEST_RUN) ./tests/unit/...
	$(call MSG_SUCCESS,バックエンドのユニットテスト)

.PHONY: back-test-integration
back-test-integration: $(TEST_DEPS) ## バックエンドの統合テストを実行
	$(call MSG_START,バックエンドの統合テスト)
	$(TEST_RUN) ./tests/integration/...
	$(call MSG_SUCCESS,バックエンドの統合テスト)

.PHONY: back-test-e2e
back-test-e2e: $(TEST_DEPS) ## バックエンドのE2Eテストを実行
	$(call MSG_START,バックエンドのE2Eテスト)
	$(TEST_RUN) ./tests/e2e/...
	$(call MSG_SUCCESS,バックエンドのE2Eテスト)

.PHONY: back-test-coverage
back-test-coverage: $(TEST_DEPS) ## バックエンドのテストカバレッジを生成
	$(call MSG_START,バックエンドのテストカバレッジ生成)
	$(BACK_TEST_COVERAGE) ./...
	$(BACK_TEST_HTML)
	$(call MSG_SUCCESS,バックエンドのテストカバレッジ生成)

.PHONY: back-test-mock
back-test-mock: $(TEST_DEPS) ## バックエンドのモックを生成
	$(call MSG_START,バックエンドのモック生成)
	$(BACK_TEST_MOCK) ./...
	$(call MSG_SUCCESS,バックエンドのモック生成)

# データベース関連
.PHONY: back-migrate
back-migrate: $(BACK_DEPS) ## マイグレーションを実行
	$(call MSG_START,マイグレーション)
	$(RUN_MIGRATIONS)
	$(call MSG_SUCCESS,マイグレーション)

.PHONY: back-migrate-down
back-migrate-down: $(BACK_DEPS) ## マイグレーションをロールバック
	$(call MSG_START,マイグレーションのロールバック)
	$(DOCKER_COMPOSE) exec backend go run migrations/scripts/main.go down
	$(call MSG_SUCCESS,マイグレーションのロールバック)

.PHONY: back-migrate-create
back-migrate-create: $(BACK_DEPS) ## 新しいマイグレーションファイルを作成
	@if [ -z "$(name)" ]; then \
		$(call MSG_ERROR,マイグレーション名を指定してください: make back-migrate-create name=<name>); \
		exit 1; \
	fi
	$(call MSG_START,マイグレーションファイルの作成)
	cd back && go run migrations/scripts/main.go create $(name)
	$(call MSG_SUCCESS,マイグレーションファイルの作成)

.PHONY: back-seed
back-seed: $(BACK_DEPS) ## シードデータを投入
	$(call MSG_START,シードデータの投入)
	$(RUN_SEEDS)
	$(call MSG_SUCCESS,シードデータの投入)

.PHONY: back-db-backup
back-db-backup: ## データベースのバックアップを作成
	$(call MSG_START,データベースのバックアップ)
	@mkdir -p ./backups
	$(DB_BACKUP)
	$(call MSG_SUCCESS,データベースのバックアップ: ./backups/backup_$(CURRENT_TIME).sql)

.PHONY: back-db-restore
back-db-restore: ## データベースのバックアップを復元
	@if [ -z "$(file)" ]; then \
		$(call MSG_ERROR,復元するファイルを指定してください: make back-db-restore file=<path>); \
		exit 1; \
	fi
	$(call MSG_START,データベースの復元)
	$(call DB_RESTORE,$(file))
	$(call MSG_SUCCESS,データベースの復元)

.PHONY: back-db-clean
back-db-clean: ## データベースのデータを削除
	$(call MSG_START,データベースのデータ削除)
	$(CLEAN_DB)
	$(call MSG_SUCCESS,データベースのデータ削除)
	$(call MSG_INFO,マイグレーションを再実行するには 'make back-migrate' を実行してください)

# デプロイ関連
.PHONY: deploy-prod
deploy-prod: ci ## 本番環境にデプロイ
	$(call MSG_START,本番環境へのデプロイ)
	$(call DEPLOY,production)
	$(call MSG_SUCCESS,本番環境へのデプロイ)

.PHONY: deploy-staging
deploy-staging: ci ## ステージング環境にデプロイ
	$(call MSG_START,ステージング環境へのデプロイ)
	$(call DEPLOY,staging)
	$(call MSG_SUCCESS,ステージング環境へのデプロイ)

# CI/CD
.PHONY: ci
ci: lint test build ## CI環境でのテスト実行
	$(call MSG_START,CI環境でのテスト実行)
	$(call MSG_SUCCESS,CI環境でのテスト実行)

.PHONY: cd
cd: ## CD環境でのデプロイ
	@if [ "$(ENV)" = "production" ]; then \
		$(call MSG_START,本番環境へのデプロイ); \
		make deploy-prod; \
	elif [ "$(ENV)" = "staging" ]; then \
		$(call MSG_START,ステージング環境へのデプロイ); \
		make deploy-staging; \
	else \
		$(call MSG_ERROR,環境が指定されていません); \
		exit 1; \
	fi

# テストとビルド
.PHONY: test
test: front-test back-test ## すべてのテストを実行
	$(call MSG_START,すべてのテスト)
	$(call MSG_SUCCESS,すべてのテスト)

.PHONY: lint
lint: front-lint back-lint ## すべてのリントを実行
	$(call MSG_START,すべてのリント)
	$(call MSG_SUCCESS,すべてのリント)

.PHONY: build
build: front-build back-build ## すべてのビルドを実行
	$(call MSG_START,すべてのビルド)
	$(call MSG_SUCCESS,すべてのビルド)

# クリーンアップ
.PHONY: clean
clean: ## ビルドファイルとキャッシュを削除
	$(call MSG_START,ビルドファイルとキャッシュの削除)
	$(CLEAN_FRONT)
	$(CLEAN_BACK)
	$(CLEAN_DOCKER)
	$(call MSG_SUCCESS,ビルドファイルとキャッシュの削除)

.PHONY: clean-volumes
clean-volumes: ## Dockerボリュームを削除
	$(call MSG_START,Dockerボリュームの削除)
	$(CLEAN_VOLUMES)
	$(call MSG_SUCCESS,Dockerボリュームの削除)

# その他
.PHONY: init
init: ## 環境変数ファイルを初期化
	$(call MSG_START,環境変数ファイルの初期化)
	@for file in $(ENV_FILES); do \
		if [ ! -f "$$file" ]; then \
			cp "$$file.example" "$$file"; \
			echo "✅ 環境変数ファイルを作成しました: $$file"; \
		else \
			echo "👉 環境変数ファイルは既に存在します: $$file"; \
		fi \
	done
	$(call MSG_SUCCESS,環境変数ファイルの初期化)

.PHONY: release
release: ## 新しいバージョンをリリース
	@if [ -z "$(version)" ]; then \
		$(call MSG_ERROR,バージョンを指定してください: make release version=<version>); \
		exit 1; \
	fi
	$(call MSG_START,バージョン v$(version) のリリース)
	@git tag -a v$(version) -m "Release v$(version)"
	@git push origin v$(version)
	$(call MSG_SUCCESS,バージョン v$(version) のリリース)

.PHONY: start-db
start-db: ## データベースコンテナを起動
	$(call MSG_START,PostgreSQLの起動)
	$(DOCKER_COMPOSE) up -d postgres
	$(call MSG_INFO,データベースの初期化を待機しています...)
	sleep 10
	$(call MSG_SUCCESS,PostgreSQLの起動)

.PHONY: back-lint
back-lint: $(BACK_DEPS) ## バックエンドのリントを実行
	$(call MSG_START,バックエンドのリント)
	cd back && go vet ./...
	$(call MSG_SUCCESS,バックエンドのリント)
