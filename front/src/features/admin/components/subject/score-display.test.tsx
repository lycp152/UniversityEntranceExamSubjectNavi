import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScoreDisplay } from './score-display';
import { SUBJECT_SCORE_CONSTRAINTS } from '@/constants/constraint/subjects/subject-score';

/**
 * スコア表示コンポーネントのテスト
 * @module score-display.test
 * @description
 * スコア表示コンポーネントの表示モードと編集モードのテストを行います。
 * アクセシビリティとバリデーションのテストも含みます。
 */

describe('ScoreDisplay', () => {
  const mockOnScoreChange = vi.fn();

  beforeEach(() => {
    mockOnScoreChange.mockClear();
  });

  describe('表示モード', () => {
    it('スコアとパーセンテージが正しく表示されること（スコア: 80点、パーセンテージ: 80.00%）', () => {
      render(
        <ScoreDisplay
          isEditing={false}
          score={80}
          percentage={80}
          onScoreChange={mockOnScoreChange}
        />
      );

      expect(screen.getByText('80点')).toBeInTheDocument();
      expect(screen.getByText('(80.00%)')).toBeInTheDocument();
    });

    it('アクセシビリティ属性が正しく設定されていること（スコアとパーセンテージのラベル）', () => {
      render(
        <ScoreDisplay
          isEditing={false}
          score={80}
          percentage={80}
          onScoreChange={mockOnScoreChange}
        />
      );

      const scoreElement = screen.getByText('80点');
      const percentageElement = screen.getByText('(80.00%)');

      expect(scoreElement).toHaveAttribute('aria-label', 'スコア');
      expect(percentageElement).toHaveAttribute('aria-label', 'パーセンテージ');
    });
  });

  describe('編集モード', () => {
    it('有効な入力値（90）が正しく処理されること', () => {
      render(
        <ScoreDisplay
          isEditing={true}
          score={80}
          percentage={80}
          onScoreChange={mockOnScoreChange}
        />
      );

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '90' } });

      expect(mockOnScoreChange).toHaveBeenCalledWith(90);
    });

    it('負の値（-1）が入力された場合、1に変換されること', () => {
      render(
        <ScoreDisplay
          isEditing={true}
          score={80}
          percentage={80}
          onScoreChange={mockOnScoreChange}
        />
      );

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '-1' } });

      expect(mockOnScoreChange).toHaveBeenCalledWith(1);
    });

    it('最大値（1000）を超える値（1001）が入力された場合、値が更新されないこと', () => {
      render(
        <ScoreDisplay
          isEditing={true}
          score={80}
          percentage={80}
          onScoreChange={mockOnScoreChange}
        />
      );

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '1001' } });

      expect(mockOnScoreChange).not.toHaveBeenCalled();
    });

    it('空の入力が最小値（0）として処理されること', () => {
      render(
        <ScoreDisplay
          isEditing={true}
          score={80}
          percentage={80}
          onScoreChange={mockOnScoreChange}
        />
      );

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '' } });

      expect(mockOnScoreChange).toHaveBeenCalledWith(SUBJECT_SCORE_CONSTRAINTS.MIN_SCORE);
    });

    it('数値以外の入力（abc）が無視されること', () => {
      render(
        <ScoreDisplay
          isEditing={true}
          score={80}
          percentage={80}
          onScoreChange={mockOnScoreChange}
        />
      );

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'abc' } });

      expect(mockOnScoreChange).not.toHaveBeenCalled();
    });

    it('アクセシビリティ属性が正しく設定されていること（入力フィールドのラベルと必須属性）', () => {
      render(
        <ScoreDisplay
          isEditing={true}
          score={80}
          percentage={80}
          onScoreChange={mockOnScoreChange}
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-label', 'スコア');
      expect(input).toHaveAttribute('aria-required', 'true');
    });
  });

  describe('パフォーマンス', () => {
    it('同じ値での再レンダリング時にonScoreChangeが呼び出されないこと', () => {
      const { rerender } = render(
        <ScoreDisplay
          isEditing={true}
          score={80}
          percentage={80}
          onScoreChange={mockOnScoreChange}
        />
      );

      const initialRenderCount = mockOnScoreChange.mock.calls.length;

      rerender(
        <ScoreDisplay
          isEditing={true}
          score={80}
          percentage={80}
          onScoreChange={mockOnScoreChange}
        />
      );

      expect(mockOnScoreChange).toHaveBeenCalledTimes(initialRenderCount);
    });
  });
});
