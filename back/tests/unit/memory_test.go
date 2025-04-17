package unit

import (
	"runtime"
	"testing"
	"time"

	"university-exam-api/tests/testutils"
	"university-exam-api/tests/unit/repositories"
)

// TestMemory はメモリ使用量のテストケースです
func TestMemory(t *testing.T) {
	db := testutils.NewMockDB()
	defer func() {
		if err := db.Close(); err != nil {
			t.Errorf("データベースのクローズに失敗しました: %v", err)
		}
	}()

	repo := repositories.NewUserRepository(db)
	users := testutils.CreateTestUsers(t, 1000)

	// メモリ使用量の初期値を取得
	var m1, m2 runtime.MemStats

	runtime.GC()
	runtime.ReadMemStats(&m1)

	// ユーザーを作成
	for _, user := range users {
		err := repo.Create(user)
		if err != nil {
			t.Errorf("ユーザーの作成に失敗しました: %v", err)
		}
	}

	// GCを実行してメモリを解放
	runtime.GC()
	time.Sleep(100 * time.Millisecond) // GCの完了を待機

	runtime.ReadMemStats(&m2)

	// メモリ使用量の増加を計算（ヒープメモリのみ）
	allocated := m2.HeapAlloc - m1.HeapAlloc

	t.Logf("ヒープメモリ使用量の増加: %v bytes", allocated)

	// 1ユーザーあたり約1KBとして、1000ユーザーで約1MB + バッファ
	expectedMax := uint64(2 * 1024 * 1024) // 2MB
	if allocated > expectedMax {
		t.Errorf("メモリ使用量が期待値を超えています: got = %v bytes, want <= %v bytes", allocated, expectedMax)
	}
}

// TestMemoryLeak はメモリリークのテストケースです
func TestMemoryLeak(t *testing.T) {
	db := testutils.NewMockDB()
	defer func() {
		if err := db.Close(); err != nil {
			t.Errorf("データベースのクローズに失敗しました: %v", err)
		}
	}()

	repo := repositories.NewUserRepository(db)
	users := testutils.CreateTestUsers(t, 100)

	// メモリ使用量の初期値を取得
	var m1, m2 runtime.MemStats

	runtime.GC()
	runtime.ReadMemStats(&m1)

	// ユーザーを作成して削除を繰り返す
	for i := 0; i < 5; i++ {
		for _, user := range users {
			err := repo.Create(user)
			if err != nil {
				t.Errorf("ユーザーの作成に失敗しました: %v", err)
			}
		}

		err := db.ClearUsers()
		if err != nil {
			t.Errorf("ユーザーデータのクリアに失敗しました: %v", err)
		}

		runtime.GC()
		time.Sleep(10 * time.Millisecond)
	}

	// GCを実行してメモリを解放
	runtime.GC()
	time.Sleep(100 * time.Millisecond)

	runtime.ReadMemStats(&m2)

	// メモリ使用量の増加を計算（ヒープメモリのみ）
	// uint64の差分を計算し、オーバーフローを防ぐ
	var allocated uint64
	if m2.HeapAlloc > m1.HeapAlloc {
		allocated = m2.HeapAlloc - m1.HeapAlloc
	} else {
		allocated = 0
	}

	t.Logf("ヒープメモリ使用量の増加: %v bytes", allocated)

	// メモリリークのチェック（1MBを超える場合はリークと判断）
	maxAllowed := uint64(1 * 1024 * 1024) // 1MB
	if allocated > maxAllowed {
		t.Errorf("メモリリークの可能性があります: got = %v bytes, want <= %v bytes", allocated, maxAllowed)
	}
}
