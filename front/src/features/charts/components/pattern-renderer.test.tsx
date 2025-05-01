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
vi.mock('../utils/formatters/pattern-definitions', () => ({
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
    common: {
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
      const commonPattern = screen.getByTestId('pattern-common');
      expect(commonPattern).toBeInTheDocument();
      expect(commonPattern).toHaveAttribute('id', 'pattern-common');
      expect(commonPattern).toHaveAttribute('aria-label', 'common試験タイプのパターン');
      expect(commonPattern).toHaveAttribute('patternUnits', 'userSpaceOnUse');
    });
  });

  describe('エラーハンドリング', () => {
    it('無効なパターン設定の場合、エラーがログに記録されること', () => {
      const consoleSpy = vi.spyOn(console, 'error');
      const originalPattern = SUBJECT_PATTERNS.math.pattern;

      // パターンを無効化
      SUBJECT_PATTERNS.math.pattern = {
        content: () => '',
        size: 0,
      };

      render(
        <svg>
          <PatternRenderer />
        </svg>
      );

      expect(consoleSpy).toHaveBeenCalledWith('パターン設定が無効です: math');

      // 元のパターンを復元
      SUBJECT_PATTERNS.math.pattern = originalPattern;
    });
  });

  describe('アクセシビリティ', () => {
    it('パターン要素が適切なARIA属性を持つこと', () => {
      render(
        <svg>
          <PatternRenderer />
        </svg>
      );

      const mathPattern = screen.getByTestId('pattern-math');
      expect(mathPattern).toHaveAttribute('aria-hidden', 'true');
      expect(mathPattern).toHaveAttribute('aria-label', 'math科目のパターン');
    });
  });
});
