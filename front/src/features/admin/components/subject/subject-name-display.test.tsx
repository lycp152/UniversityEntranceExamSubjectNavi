import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SubjectNameDisplay } from './subject-name-display';
import { SUBJECT_NAME_CONSTRAINTS } from '@/constants/constraint/subjects/subjects';

/**
 * SubjectNameDisplayコンポーネントのテスト
 *
 * @module subject-name-display.test
 * @description
 * SubjectNameDisplayコンポーネントの動作を検証するテストです。
 * 表示モードと編集モードの両方の動作を確認します。
 */

describe('SubjectNameDisplay', () => {
  const mockOnNameChange = vi.fn();

  beforeEach(() => {
    mockOnNameChange.mockClear();
  });

  describe('表示モード', () => {
    it('科目名が正しく表示されること', () => {
      const testName = 'テスト科目';
      render(
        <SubjectNameDisplay name={testName} isEditing={false} onNameChange={mockOnNameChange} />
      );

      expect(screen.getByText(testName)).toBeInTheDocument();
    });

    it('アクセシビリティ属性が正しく設定されていること', () => {
      render(
        <SubjectNameDisplay name="テスト科目" isEditing={false} onNameChange={mockOnNameChange} />
      );

      const element = screen.getByText('テスト科目');
      expect(element).toHaveAttribute('aria-label', '科目名');
    });
  });

  describe('編集モード', () => {
    it('入力フィールドが表示されること', () => {
      render(
        <SubjectNameDisplay name="テスト科目" isEditing={true} onNameChange={mockOnNameChange} />
      );

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('入力値が正しく制限されること', () => {
      render(
        <SubjectNameDisplay name="テスト科目" isEditing={true} onNameChange={mockOnNameChange} />
      );

      const input = screen.getByRole('textbox');
      const longText = 'a'.repeat(SUBJECT_NAME_CONSTRAINTS.MAX_LENGTH + 1);
      fireEvent.change(input, { target: { value: longText } });

      expect(mockOnNameChange).toHaveBeenCalledWith(
        'a'.repeat(SUBJECT_NAME_CONSTRAINTS.MAX_LENGTH)
      );
    });

    it('特殊文字が除去されること', () => {
      render(
        <SubjectNameDisplay name="テスト科目" isEditing={true} onNameChange={mockOnNameChange} />
      );

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'テスト@科目#' } });

      expect(mockOnNameChange).toHaveBeenCalledWith('テスト科目');
    });

    it('アクセシビリティ属性が正しく設定されていること', () => {
      render(
        <SubjectNameDisplay name="テスト科目" isEditing={true} onNameChange={mockOnNameChange} />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-label', '科目名');
      expect(input).toHaveAttribute('aria-required', 'true');
      expect(input).toHaveAttribute('maxLength', SUBJECT_NAME_CONSTRAINTS.MAX_LENGTH.toString());
    });
  });
});
