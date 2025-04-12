package testutils

import (
	"testing"
)

// AssertEqual は2つの値が等しいことを確認するヘルパー関数です
func AssertEqual(t *testing.T, got, want interface{}, msg string) {
	t.Helper()

	if got != want {
		t.Errorf("%s: got %v, want %v", msg, got, want)
	}
}

// AssertNotEqual は2つの値が等しくないことを確認するヘルパー関数です
func AssertNotEqual(t *testing.T, got, want interface{}, msg string) {
	t.Helper()

	if got == want {
		t.Errorf("%s: got %v, want not %v", msg, got, want)
	}
}

// AssertNil は値がnilであることを確認するヘルパー関数です
func AssertNil(t *testing.T, got interface{}, msg string) {
	t.Helper()

	if got != nil {
		t.Errorf("%s: got %v, want nil", msg, got)
	}
}

// AssertNotNil は値がnilでないことを確認するヘルパー関数です
func AssertNotNil(t *testing.T, got interface{}, msg string) {
	t.Helper()

	if got == nil {
		t.Errorf("%s: got nil, want not nil", msg)
	}
}
