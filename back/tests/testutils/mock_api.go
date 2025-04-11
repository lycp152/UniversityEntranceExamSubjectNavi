package testutils

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"sync"
)

// MockAPI は外部APIのモック実装です
type MockAPI struct {
	mu     sync.RWMutex
	routes map[string]http.HandlerFunc
}

// NewMockAPI は新しいモックAPIを作成します
func NewMockAPI() *MockAPI {
	return &MockAPI{
		routes: make(map[string]http.HandlerFunc),
	}
}

// RegisterRoute はモックAPIにルートを登録します
func (m *MockAPI) RegisterRoute(path string, handler http.HandlerFunc) {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.routes[path] = handler
}

// ServeHTTP はHTTPリクエストを処理します
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
func (m *MockAPI) StartServer() *httptest.Server {
	return httptest.NewServer(m)
}

// MockJSONResponse はJSONレスポンスを生成するヘルパー関数です
func MockJSONResponse(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(data); err != nil {
		http.Error(w, "JSONエンコードに失敗しました", http.StatusInternalServerError)
	}
}

// MockErrorResponse はエラーレスポンスを生成するヘルパー関数です
func MockErrorResponse(w http.ResponseWriter, status int, message string) {
	MockJSONResponse(w, status, map[string]string{
		"error": message,
	})
}
