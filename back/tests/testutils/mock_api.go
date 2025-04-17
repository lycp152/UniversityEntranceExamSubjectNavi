// Package testutils はテスト用のユーティリティ関数を提供します。
// このパッケージは以下の機能を提供します：
// - モックAPIの実装
// - HTTPリクエスト/レスポンスのモック
// - スレッドセーフなAPI操作
// - JSONレスポンスの生成

package testutils

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"sync"
)

// MockAPI は外部APIのモック実装です
// この構造体は以下の機能を提供します：
// - ルートの登録と管理
// - HTTPリクエストの処理
// - スレッドセーフな操作
type MockAPI struct {
	mu     sync.RWMutex
	routes map[string]http.HandlerFunc
}

// NewMockAPI は新しいモックAPIを作成します
// この関数は以下の処理を行います：
// - ルートマップの初期化
// - モックAPIインスタンスの生成
func NewMockAPI() *MockAPI {
	return &MockAPI{
		routes: make(map[string]http.HandlerFunc),
	}
}

// RegisterRoute はモックAPIにルートを登録します
// この関数は以下の処理を行います：
// - ルートパスの登録
// - ハンドラ関数の設定
// - スレッドセーフな操作
func (m *MockAPI) RegisterRoute(path string, handler http.HandlerFunc) {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.routes[path] = handler
}

// ServeHTTP はHTTPリクエストを処理します
// この関数は以下の処理を行います：
// - リクエストパスの検索
// - ハンドラの実行
// - 404エラーの処理
func (m *MockAPI) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	m.mu.RLock()
	handler, found := m.routes[r.URL.Path]
	m.mu.RUnlock()

	if !found {
		http.NotFound(w, r)
		return
	}

	handler(w, r)
}

// StartServer はモックAPIサーバーを起動します
// この関数は以下の処理を行います：
// - テストサーバーの起動
// - モックAPIの設定
func (m *MockAPI) StartServer() *httptest.Server {
	return httptest.NewServer(m)
}

// MockJSONResponse はJSONレスポンスを生成するヘルパー関数です
// この関数は以下の処理を行います：
// - Content-Typeの設定
// - ステータスコードの設定
// - JSONデータのエンコード
func MockJSONResponse(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	err := json.NewEncoder(w).Encode(data)

	if err != nil {
		http.Error(w, "JSONエンコードに失敗しました", http.StatusInternalServerError)
	}
}

// MockErrorResponse はエラーレスポンスを生成するヘルパー関数です
// この関数は以下の処理を行います：
// - エラーメッセージの設定
// - JSONレスポンスの生成
func MockErrorResponse(w http.ResponseWriter, status int, message string) {
	MockJSONResponse(w, status, map[string]string{
		"error": message,
	})
}
