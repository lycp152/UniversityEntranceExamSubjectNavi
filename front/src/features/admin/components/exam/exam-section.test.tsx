import { vi, describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExamSection } from './exam-section';
import type { ExamSectionProps } from '../../types/types';
import { EXAM_TYPES } from '@/constants/constraint/exam-types';

/**
 * ExamSectionコンポーネントのテスト
 *
 * @module exam-section.test
 * @description
 * ExamSectionコンポーネントの動作を検証するテストです。
 * 表示モードと編集モードの両方の動作を確認します。
 */

describe('ExamSection', () => {
  const defaultProps: ExamSectionProps = {
    subjects: [
      {
        id: 1,
        name: '数学',
        test_type_id: 1,
        score: 80,
        percentage: 80,
      },
    ],
    type: {
      id: 1,
      name: EXAM_TYPES.COMMON.name,
    },
    isEditing: false,
    onScoreChange: vi.fn(),
    onAddSubject: vi.fn(),
    onSubjectNameChange: vi.fn(),
  };

  it('試験種別の名前が表示されること', () => {
    render(<ExamSection {...defaultProps} />);
    expect(screen.getByText(EXAM_TYPES.COMMON.formalName)).toBeInTheDocument();
  });

  it('科目リストが表示されること', () => {
    render(<ExamSection {...defaultProps} />);
    expect(screen.getByText('数学')).toBeInTheDocument();
  });

  it('編集モード時にスコアが編集可能であること', () => {
    render(<ExamSection {...defaultProps} isEditing={true} />);
    const scoreInput = screen.getByLabelText('スコア');
    fireEvent.change(scoreInput, { target: { value: '90' } });
    expect(defaultProps.onScoreChange).toHaveBeenCalledWith(1, 90);
  });

  it('編集モード時に科目名が編集可能であること', () => {
    render(<ExamSection {...defaultProps} isEditing={true} />);
    const nameInput = screen.getByLabelText('科目名');
    fireEvent.change(nameInput, { target: { value: '数学I' } });
    expect(defaultProps.onSubjectNameChange).toHaveBeenCalledWith(1, '数学I');
  });

  it('編集モード時に科目を追加できること', () => {
    render(<ExamSection {...defaultProps} isEditing={true} />);
    const addButton = screen.getByRole('button', { name: '科目を追加' });
    fireEvent.click(addButton);
    expect(defaultProps.onAddSubject).toHaveBeenCalled();
  });
});
