/**
 * PatternRendererコンポーネントのテスト
 *
 * @remarks
 * - パターンの生成とレンダリングをテスト
 * - エラーハンドリングをテスト
 * - アクセシビリティ属性をテスト
 */
import { render, screen, cleanup } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import PatternRenderer from './pattern-renderer';
import { SUBJECT_PATTERNS } from '../utils/formatters/pattern-definitions';

// モックの設定
vi.mock('../utils/pattern-definitions', () => ({
  SUBJECT_PATTERNS: {
    math: {
      pattern: {
        content: (color: string) => `<rect x="0" y="0" width="10" height="10" fill="${color}" />`,
        size: 10,
      },
      color: '#ff0000',
    },
  },
  TEST_TYPE_PATTERNS: {
    center: {
      pattern: {
        content: (color: string) => `<circle cx="5" cy="5" r="5" fill="${color}" />`,
        size: 10,
      },
      color: '#0000ff',
    },
  },
}));

describe('PatternRenderer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('パターンのレンダリング', () => {
    it('科目パターンが正しくレンダリングされること', () => {
      render(
        <svg>
          <PatternRenderer />
        </svg>
      );
      const mathPattern = screen.getByTestId('pattern-math');
      expect(mathPattern).toBeInTheDocument();
      expect(mathPattern).toHaveAttribute('id', 'pattern-math');
      expect(mathPattern).toHaveAttribute('aria-label', 'math科目のパターン');
      expect(mathPattern).toHaveAttribute('patternUnits', 'userSpaceOnUse');
    });

    it('試験タイプパターンが正しくレンダリングされること', () => {
      render(
        <svg>
          <PatternRenderer />
        </svg>
      );
      const centerPattern = screen.getByTestId('pattern-center');
      expect(centerPattern).toBeInTheDocument();
      expect(centerPattern).toHaveAttribute('id', 'pattern-center');
      expect(centerPattern).toHaveAttribute('aria-label', 'center試験タイプのパターン');
      expect(centerPattern).toHaveAttribute('patternUnits', 'userSpaceOnUse');
    });
  });

  describe('エラーハンドリング', () => {
    it('無効なパターン設定の場合、エラーがログに記録されること', () => {
      const consoleSpy = vi.spyOn(console, 'error');
      // 型を維持しながらパターンを無効化
      vi.mocked(SUBJECT_PATTERNS).math.pattern = {
        content: () => '',
        size: 0,
      };

      render(
        <svg>
          <PatternRenderer />
        </svg>
      );

      expect(consoleSpy).toHaveBeenCalledWith('パターン設定が無効です: math');
    });
  });

  describe('アクセシビリティ', () => {
    it('パターン要素が適切なARIA属性を持つこと', () => {
      // モックをリセットして有効なパターンを復元
      vi.mocked(SUBJECT_PATTERNS).math.pattern = {
        content: (color: string) => `<rect x="0" y="0" width="10" height="10" fill="${color}" />`,
        size: 10,
      };

      render(
        <svg>
          <PatternRenderer />
        </svg>
      );

      // data-testidを使用してパターン要素を取得
      const patterns = [screen.getByTestId('pattern-math'), screen.getByTestId('pattern-center')];

      patterns.forEach(pattern => {
        expect(pattern).toHaveAttribute('aria-label');
        expect(pattern).toHaveAttribute('aria-hidden', 'true');
        expect(pattern).toHaveAttribute('patternUnits', 'userSpaceOnUse');
      });
    });
  });
});
