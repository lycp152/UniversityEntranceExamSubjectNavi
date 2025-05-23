# Docker Buildx Bake設定ファイル
# 参考: https://docs.docker.com/build/bake/file-definition/

# 変数定義
variable "DOCKER_REGISTRY" {
  default = "ghcr.io"
}

variable "IMAGE_NAME" {
  default = "university-entrance-exam-subject-navi"
}

variable "TAG" {
  default = "latest"
}

# ターゲット定義
group "default" {
  targets = ["app"]
}

# アプリケーションのビルドターゲット
target "app" {
  context = "."
  dockerfile = "Dockerfile"
  tags = ["${DOCKER_REGISTRY}/${IMAGE_NAME}:${TAG}"]
  platforms = ["linux/amd64", "linux/arm64"]

  # ビルド時の引数
  args = {
    BUILDKIT_INLINE_CACHE = "1"
    GO_VERSION = "1.24.2"
    CGO_ENABLED = "0"
    GOOS = "linux"
    GOARCH = "amd64"
    BUILDKIT_MULTI_PLATFORM = "1"
    BUILDKIT_BUILDKITD_FLAGS = "--debug"
  }

  # キャッシュ設定
  cache-from = [
    "type=gha,scope=${IMAGE_NAME}-${TAG},ignore-error=true",
    "type=registry,ref=${DOCKER_REGISTRY}/${IMAGE_NAME}:buildcache,ignore-error=true",
    "type=local,src=/tmp/.buildx-cache,ignore-error=true"
  ]
  cache-to = [
    "type=gha,mode=max,scope=${IMAGE_NAME}-${TAG},ignore-error=true",
    "type=registry,ref=${DOCKER_REGISTRY}/${IMAGE_NAME}:buildcache,mode=max,ignore-error=true",
    "type=local,dest=/tmp/.buildx-cache-new,ignore-error=true"
  ]

  # セキュリティ設定とビルド設定
  attrs = {
    "security.insecure": "false"
    "security.privileged": "false"
    "security.sandbox": "true"
    "build-arg.BUILDKIT_INLINE_CACHE": "1"
    "build-arg.BUILDKIT_MULTI_PLATFORM": "1"
    "build-arg.BUILDKIT_BUILDKITD_FLAGS": "--debug"
    "build-arg.BUILDKIT_CACHE_METADATA": "type=gha,scope=${IMAGE_NAME}-${TAG}"
    "build-arg.BUILDKIT_CACHE_COMPRESS": "true"
    "build-arg.BUILDKIT_CACHE_TTL": "168h"
    "build-arg.BUILDKIT_MAX_PARALLELISM": "4"
    "build-arg.BUILDKIT_MEMORY_LIMIT": "4g"
    "build-arg.BUILDKIT_CACHE_COMPRESS_LEVEL": "6"
    "build-arg.BUILDKIT_CACHE_PRIORITY": "high"
    "build-arg.BUILDKIT_TIMEOUT": "30m"
    "build-arg.BUILDKIT_RETRY": "3"
  }

  # マルチステージビルド設定
  contexts = {
    build = "target:build"
  }
}

# ビルドステージのターゲット
target "build" {
  context = "."
  dockerfile = "./Dockerfile.build"
  platforms = ["linux/amd64", "linux/arm64"]
  no-cache = false

  # ビルド時の引数
  args = {
    BUILDKIT_INLINE_CACHE = "1"
    GO_VERSION = "1.24.2"
    CGO_ENABLED = "0"
    BUILDKIT_MULTI_PLATFORM = "1"
    BUILDKIT_BUILDKITD_FLAGS = "--debug"
  }

  # キャッシュ設定
  cache-from = [
    "type=gha,scope=${IMAGE_NAME}-build,ignore-error=true",
    "type=registry,ref=${DOCKER_REGISTRY}/${IMAGE_NAME}:buildcache,ignore-error=true"
  ]
  cache-to = [
    "type=gha,mode=max,scope=${IMAGE_NAME}-build,ignore-error=true",
    "type=registry,ref=${DOCKER_REGISTRY}/${IMAGE_NAME}:buildcache,mode=max,ignore-error=true"
  ]

  # ビルド設定
  attrs = {
    "build-arg.BUILDKIT_INLINE_CACHE": "1"
    "build-arg.BUILDKIT_MULTI_PLATFORM": "1"
    "build-arg.BUILDKIT_BUILDKITD_FLAGS": "--debug"
    "build-arg.BUILDKIT_CACHE_METADATA": "type=gha,scope=${IMAGE_NAME}-build"
    "build-arg.BUILDKIT_CACHE_COMPRESS": "true"
    "build-arg.BUILDKIT_CACHE_TTL": "168h"
    "build-arg.BUILDKIT_MAX_PARALLELISM": "4"
    "build-arg.BUILDKIT_MEMORY_LIMIT": "4g"
    "build-arg.BUILDKIT_CACHE_COMPRESS_LEVEL": "6"
    "build-arg.BUILDKIT_CACHE_PRIORITY": "high"
    "build-arg.BUILDKIT_TIMEOUT": "30m"
    "build-arg.BUILDKIT_RETRY": "3"
  }
}

# テスト用のターゲット
target "test" {
  context = "."
  dockerfile = "./Dockerfile.test"
  tags = ["${DOCKER_REGISTRY}/${IMAGE_NAME}:test"]
  platforms = ["linux/amd64"]

  # テスト用の引数
  args = {
    BUILDKIT_INLINE_CACHE = "1"
    GO_VERSION = "1.24.2"
    CGO_ENABLED = "0"
    BUILDKIT_MULTI_PLATFORM = "1"
    BUILDKIT_BUILDKITD_FLAGS = "--debug"
  }

  # キャッシュ設定
  cache-from = [
    "type=gha,scope=${IMAGE_NAME}-test,ignore-error=true",
    "type=local,src=/tmp/.buildx-cache,ignore-error=true"
  ]
  cache-to = [
    "type=gha,mode=max,scope=${IMAGE_NAME}-test,ignore-error=true",
    "type=local,dest=/tmp/.buildx-cache-new,ignore-error=true"
  ]

  # セキュリティ設定とビルド設定
  attrs = {
    "security.insecure": "false"
    "security.privileged": "false"
    "security.sandbox": "true"
    "build-arg.BUILDKIT_INLINE_CACHE": "1"
    "build-arg.BUILDKIT_MULTI_PLATFORM": "1"
    "build-arg.BUILDKIT_BUILDKITD_FLAGS": "--debug"
    "build-arg.BUILDKIT_CACHE_METADATA": "type=gha,scope=${IMAGE_NAME}-test"
    "build-arg.BUILDKIT_CACHE_COMPRESS": "true"
    "build-arg.BUILDKIT_CACHE_TTL": "168h"
    "build-arg.BUILDKIT_MAX_PARALLELISM": "4"
    "build-arg.BUILDKIT_MEMORY_LIMIT": "4g"
    "build-arg.BUILDKIT_CACHE_COMPRESS_LEVEL": "6"
    "build-arg.BUILDKIT_CACHE_PRIORITY": "high"
    "build-arg.BUILDKIT_TIMEOUT": "30m"
    "build-arg.BUILDKIT_RETRY": "3"
  }
}
