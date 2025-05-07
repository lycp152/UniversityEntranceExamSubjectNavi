/**
 * BasePatternコンポーネントのテスト
 *
 * @remarks
 * - パターンの基本構造の生成をテスト
 * - 科目カテゴリーに基づく背景色の設定をテスト
 * - アクセシビリティ属性の設定をテスト
 */
import { render, screen, cleanup } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import BasePattern from './base-pattern';

// モックの設定
vi.mock('@/constants/constraint/subjects/subject-categories', () => ({
  SUBJECT_CATEGORIES: {
    math: {
      color: '#ff0000',
    },
    'test-pattern': {
      color: '#00ff00',
    },
  },
}));

vi.mock('@/features/charts/utils/extractors/subject-name-extractor', () => ({
  getCategoryFromSubject: (id: string) => id,
}));

describe('BasePattern', () => {
  // テストケースの共通設定
  const renderPattern = (props = {}) => {
    const defaultProps = {
      id: 'test-pattern',
      children: <circle cx="5" cy="5" r="2" data-testid="pattern-test-pattern-circle" />,
      ...props,
    };

    return render(
      <svg>
        <BasePattern {...defaultProps} />
      </svg>
    );
  };

  // 各テストの前後に実行する処理
  beforeEach(() => {
    vi.clearAllMocks();
    // テスト実行時は警告を抑制
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    // 警告の抑制を解除
    vi.restoreAllMocks();
  });

  describe('パターンの基本属性', () => {
    it('正しいパターンIDと属性を設定する', () => {
      renderPattern();

      const pattern = screen.getByTestId('pattern-test-pattern');
      expect(pattern).toHaveAttribute('id', 'pattern-test-pattern');
      expect(pattern).toHaveAttribute('patternUnits', 'userSpaceOnUse');
      expect(pattern).toHaveAttribute('width', expect.any(String));
      expect(pattern).toHaveAttribute('height', expect.any(String));
    });

    it('パターン変換属性が正しく設定される', () => {
      const transform = 'rotate(45)';
      renderPattern({ patternTransform: transform });

      const pattern = screen.getByTestId('pattern-test-pattern');
      expect(pattern).toHaveAttribute('patternTransform', transform);
    });
  });

  describe('科目カテゴリーの処理', () => {
    it('数学カテゴリーの場合、正しい背景色を設定する', () => {
      renderPattern({ id: 'math' });

      const rect = screen.getByTestId('pattern-math-rect');
      expect(rect).toHaveAttribute('fill', '#ff0000');
      expect(rect).toHaveAttribute('width', expect.any(String));
      expect(rect).toHaveAttribute('height', expect.any(String));
    });

    it('存在しない科目カテゴリーの場合、デフォルトの背景色を使用し警告を表示する', () => {
      const consoleSpy = vi.spyOn(console, 'warn');
      renderPattern({ id: 'invalid-category' });

      const rect = screen.getByTestId('pattern-invalid-category-rect');
      expect(rect).toHaveAttribute('fill', '#ffffff');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('科目カテゴリー'));

      consoleSpy.mockRestore();
    });
  });

  describe('アクセシビリティ', () => {
    it('適切なARIA属性を設定する', () => {
      renderPattern({ id: 'math' });

      const pattern = screen.getByTestId('pattern-math');
      expect(pattern).toHaveAttribute('aria-label', expect.stringContaining('科目カテゴリー'));
      expect(pattern).toHaveAttribute('aria-describedby', expect.stringContaining('description'));

      const rect = screen.getByTestId('pattern-math-rect');
      expect(rect).toHaveAttribute('aria-hidden', 'true');
    });

    it('スクリーンリーダー用の説明を提供する', () => {
      renderPattern({ id: 'math' });

      const pattern = screen.getByTestId('pattern-math');
      expect(pattern).toHaveAttribute('aria-label', expect.stringContaining('科目カテゴリー'));

      const description = document.getElementById('pattern-math-description');
      expect(description).toBeInTheDocument();
      expect(description?.textContent).toContain('科目カテゴリー');
      expect(description?.textContent).toContain('パターン要素');
    });
  });

  describe('子要素のレンダリング', () => {
    it('子要素が正しくレンダリングされる', () => {
      renderPattern();

      const pattern = screen.getByTestId('pattern-test-pattern');
      expect(pattern).toContainElement(screen.getByTestId('pattern-test-pattern-rect'));
      expect(pattern).toContainElement(screen.getByTestId('pattern-test-pattern-circle'));
    });

    it('複数の子要素が正しくレンダリングされる', () => {
      const multipleChildren = (
        <>
          <circle cx="5" cy="5" r="2" data-testid="circle-1" />
          <circle cx="10" cy="10" r="2" data-testid="circle-2" />
        </>
      );

      renderPattern({ children: multipleChildren });

      const pattern = screen.getByTestId('pattern-test-pattern');
      expect(pattern).toContainElement(screen.getByTestId('circle-1'));
      expect(pattern).toContainElement(screen.getByTestId('circle-2'));
    });
  });
});
