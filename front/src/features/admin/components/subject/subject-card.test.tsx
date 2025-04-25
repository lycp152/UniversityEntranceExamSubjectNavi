import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SubjectCard } from './subject-card';
import { SUBJECT_NAME_CONSTRAINTS } from '@/constants/constraint/subjects/subjects';

/**
 * SubjectCardコンポーネントのテスト
 *
 * @module subject-card.test
 * @description
 * SubjectCardコンポーネントの動作を検証するテストです。
 * 表示モードと編集モードの両方の動作を確認します。
 */

describe('SubjectCard', () => {
  const mockSubject = {
    name: 'テスト科目',
    score: 500,
    percentage: 50.0,
  };

  const mockOnScoreChange = vi.fn();
  const mockOnNameChange = vi.fn();

  beforeEach(() => {
    mockOnScoreChange.mockClear();
    mockOnNameChange.mockClear();
  });

  describe('表示モード', () => {
    it('科目名とスコアが正しく表示されること', () => {
      render(
        <SubjectCard
          subject={mockSubject}
          isEditing={false}
          editValue={mockSubject.score}
          onScoreChange={mockOnScoreChange}
          onNameChange={mockOnNameChange}
        />
      );

      expect(screen.getByText('テスト科目')).toBeInTheDocument();
      expect(screen.getByText('500点')).toBeInTheDocument();
      expect(screen.getByText('(50.00%)')).toBeInTheDocument();
    });

    it('アクセシビリティ属性が正しく設定されていること', () => {
      render(
        <SubjectCard
          subject={mockSubject}
          isEditing={false}
          editValue={mockSubject.score}
          onScoreChange={mockOnScoreChange}
          onNameChange={mockOnNameChange}
        />
      );

      const card = screen.getByRole('group', { name: 'スコア表示' });
      expect(card).toBeInTheDocument();
    });
  });

  describe('編集モード', () => {
    it('入力フィールドが表示されること', () => {
      render(
        <SubjectCard
          subject={mockSubject}
          isEditing={true}
          editValue={mockSubject.score}
          onScoreChange={mockOnScoreChange}
          onNameChange={mockOnNameChange}
        />
      );

      expect(screen.getByRole('textbox', { name: '科目名' })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: 'スコア' })).toBeInTheDocument();
    });

    it('スコアの入力値が正しく制限されること', () => {
      render(
        <SubjectCard
          subject={mockSubject}
          isEditing={true}
          editValue={mockSubject.score}
          onScoreChange={mockOnScoreChange}
          onNameChange={mockOnNameChange}
        />
      );

      const scoreInput = screen.getByRole('textbox', { name: 'スコア' });
      fireEvent.change(scoreInput, { target: { value: '1001' } });

      // 最大値を超えた入力値は無視されるため、onScoreChangeは呼び出されない
      expect(mockOnScoreChange).not.toHaveBeenCalled();
    });

    it('科目名の入力値が正しく制限されること', () => {
      render(
        <SubjectCard
          subject={mockSubject}
          isEditing={true}
          editValue={mockSubject.score}
          onScoreChange={mockOnScoreChange}
          onNameChange={mockOnNameChange}
        />
      );

      const nameInput = screen.getByRole('textbox', { name: '科目名' });
      const longName = 'a'.repeat(SUBJECT_NAME_CONSTRAINTS.MAX_LENGTH + 1);
      fireEvent.change(nameInput, { target: { value: longName } });

      expect(mockOnNameChange).toHaveBeenCalledWith(
        'a'.repeat(SUBJECT_NAME_CONSTRAINTS.MAX_LENGTH)
      );
    });
  });
});
