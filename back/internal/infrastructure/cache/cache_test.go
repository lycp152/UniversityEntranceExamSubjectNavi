package cache

import (
	"testing"
	"time"
)

// TestSetAndGet はキャッシュへの保存と取得をテストします
func TestSetAndGet(t *testing.T) {
	t.Parallel() // テストの並列実行を有効化

	c := GetInstance()

	tests := []struct {
		name     string
		key      string
		value    interface{}
		duration time.Duration
		want     interface{}
		wantErr  bool
	}{
		{
			name:     "正常系: 文字列の保存と取得",
			key:      "test_key",
			value:    "test_value",
			duration: 1 * time.Minute,
			want:     "test_value",
			wantErr:  false,
		},
		{
			name:     "正常系: 数値の保存と取得",
			key:      "test_key_int",
			value:    123,
			duration: 1 * time.Minute,
			want:     123,
			wantErr:  false,
		},
		{
			name:     "異常系: 空のキー",
			key:      "",
			value:    "test_value",
			duration: 1 * time.Minute,
			want:     nil,
			wantErr:  true,
		},
		{
			name:     "異常系: nilの値",
			key:      "test_key_nil",
			value:    nil,
			duration: 1 * time.Minute,
			want:     nil,
			wantErr:  true,
		},
	}

	for _, tt := range tests {
		tt := tt // ループ変数をキャプチャ
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel() // サブテストの並列実行を有効化
			c.Set(tt.key, tt.value, tt.duration)
			got, found := c.Get(tt.key)
			if tt.wantErr {
				if found {
					t.Errorf("取得結果 = %v, 期待値 = 見つからない", found)
				}
				return
			}
			if !found {
				t.Errorf("取得結果 = %v, 期待値 = %v", found, true)
			}
			if got != tt.want {
				t.Errorf("取得結果 = %v, 期待値 = %v", got, tt.want)
			}
		})
	}
}

// TestDelete はキャッシュからの削除をテストします
func TestDelete(t *testing.T) {
	t.Parallel() // テストの並列実行を有効化

	c := GetInstance()

	tests := []struct {
		name  string
		key   string
		value interface{}
	}{
		{
			name:  "正常系: 存在するキーの削除",
			key:   "test_key",
			value: "test_value",
		},
		{
			name:  "正常系: 存在しないキーの削除",
			key:   "non_existent_key",
			value: nil,
		},
	}

	for _, tt := range tests {
		tt := tt // ループ変数をキャプチャ
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel() // サブテストの並列実行を有効化
			if tt.value != nil {
				c.Set(tt.key, tt.value, 1*time.Minute)
			}
			c.Delete(tt.key)
			_, found := c.Get(tt.key)
			if found {
				t.Errorf("削除結果 = %v, 期待値 = %v", found, false)
			}
		})
	}
}

// TestExpiration はキャッシュの有効期限をテストします
func TestExpiration(t *testing.T) {
	t.Parallel() // テストの並列実行を有効化

	c := GetInstance()

	tests := []struct {
		name     string
		key      string
		value    interface{}
		duration time.Duration
		sleep    time.Duration
	}{
		{
			name:     "正常系: 有効期限切れ",
			key:      "test_key",
			value:    "test_value",
			duration: 1 * time.Second,
			sleep:    2 * time.Second,
		},
		{
			name:     "正常系: 有効期限内",
			key:      "test_key_valid",
			value:    "test_value",
			duration: 2 * time.Second,
			sleep:    1 * time.Second,
		},
	}

	for _, tt := range tests {
		tt := tt // ループ変数をキャプチャ
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel() // サブテストの並列実行を有効化
			c.Set(tt.key, tt.value, tt.duration)
			time.Sleep(tt.sleep)
			_, found := c.Get(tt.key)
			if tt.sleep > tt.duration {
				if found {
					t.Errorf("有効期限切れ後の取得結果 = %v, 期待値 = %v", found, false)
				}
			} else {
				if !found {
					t.Errorf("有効期限内の取得結果 = %v, 期待値 = %v", found, true)
				}
			}
		})
	}
}
