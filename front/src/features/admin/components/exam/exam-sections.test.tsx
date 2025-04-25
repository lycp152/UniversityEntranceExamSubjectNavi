import { vi, describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExamSections } from './exam-sections';
import type { ExamSectionsProps } from '@/features/admin/types/exam-sections';
import { EXAM_TYPES } from '@/constants/constraint/exam-types';

/**
 * ExamSectionsコンポーネントのテスト
 *
 * @module exam-sections.test
 * @description
 * ExamSectionsコンポーネントの動作を検証するテストです。
 * 表示モードと編集モードの両方の動作を確認します。
 */

describe('ExamSections', () => {
  const defaultProps: ExamSectionsProps = {
    admissionInfo: {
      testTypes: [
        {
          id: 1,
          name: EXAM_TYPES.COMMON.name,
          subjects: [
            {
              id: 1,
              name: '数学',
              test_type_id: 1,
              score: 80,
              percentage: 80,
            },
          ],
        },
        {
          id: 2,
          name: EXAM_TYPES.SECONDARY.name,
          subjects: [
            {
              id: 2,
              name: '英語',
              test_type_id: 2,
              score: 90,
              percentage: 90,
            },
          ],
        },
      ],
    },
    isEditing: false,
    onAddSubject: vi.fn(),
    onSubjectNameChange: vi.fn(),
    onScoreChange: vi.fn(),
  };

  describe('初期表示', () => {
    it('共通試験と二次試験のセクションが表示されること', () => {
      render(<ExamSections {...defaultProps} />);
      expect(screen.getByText(EXAM_TYPES.COMMON.formalName)).toBeInTheDocument();
      expect(screen.getByText(EXAM_TYPES.SECONDARY.formalName)).toBeInTheDocument();
    });

    it('各試験の科目が表示されること', () => {
      render(<ExamSections {...defaultProps} />);
      expect(screen.getByText('数学')).toBeInTheDocument();
      expect(screen.getByText('英語')).toBeInTheDocument();
    });

    it('科目追加ボタンが表示されないこと', () => {
      render(<ExamSections {...defaultProps} />);
      expect(screen.queryByRole('button', { name: '科目を追加' })).not.toBeInTheDocument();
    });
  });

  describe('エラーハンドリング', () => {
    it('試験種別が見つからない場合にエラーメッセージが表示されること', () => {
      const propsWithoutTestTypes: ExamSectionsProps = {
        ...defaultProps,
        admissionInfo: {
          testTypes: [],
        },
      };
      render(<ExamSections {...propsWithoutTestTypes} />);
      expect(
        screen.getByText(`${EXAM_TYPES.COMMON.formalName}の情報が見つかりません`)
      ).toBeInTheDocument();
      expect(
        screen.getByText(`${EXAM_TYPES.SECONDARY.formalName}の情報が見つかりません`)
      ).toBeInTheDocument();
    });
  });

  describe('編集モード', () => {
    it('科目の追加ボタンが表示されること', () => {
      render(<ExamSections {...defaultProps} isEditing={true} />);
      expect(screen.getAllByRole('button', { name: '科目を追加' })).toHaveLength(2);
    });

    it('科目の追加ボタンをクリックするとonAddSubjectが呼ばれること', () => {
      render(<ExamSections {...defaultProps} isEditing={true} />);
      const addButtons = screen.getAllByRole('button', { name: '科目を追加' });
      fireEvent.click(addButtons[0]);
      expect(defaultProps.onAddSubject).toHaveBeenCalled();
    });

    it('スコアの変更時にonScoreChangeが呼ばれること', () => {
      render(<ExamSections {...defaultProps} isEditing={true} />);
      const scoreInputs = screen.getAllByLabelText('スコア');
      fireEvent.change(scoreInputs[0], { target: { value: '85' } });
      expect(defaultProps.onScoreChange).toHaveBeenCalled();
    });

    it('科目名の変更時にonSubjectNameChangeが呼ばれること', () => {
      render(<ExamSections {...defaultProps} isEditing={true} />);
      const nameInputs = screen.getAllByLabelText('科目名');
      fireEvent.change(nameInputs[0], { target: { value: '数学I' } });
      expect(defaultProps.onSubjectNameChange).toHaveBeenCalled();
    });
  });

  describe('アクセシビリティ', () => {
    it('各入力フィールドに適切なARIAラベルが設定されていること', () => {
      render(<ExamSections {...defaultProps} isEditing={true} />);
      expect(screen.getAllByLabelText('科目名')).toHaveLength(2);
      expect(screen.getAllByLabelText('スコア')).toHaveLength(2);
    });

    it('科目追加ボタンに適切なARIAラベルが設定されていること', () => {
      render(<ExamSections {...defaultProps} isEditing={true} />);
      expect(screen.getAllByRole('button', { name: '科目を追加' })).toHaveLength(2);
    });
  });
});
