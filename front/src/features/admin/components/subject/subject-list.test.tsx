import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SubjectList } from './subject-list';

/**
 * SubjectListコンポーネントのテスト
 *
 * @module subject-list.test
 * @description
 * SubjectListコンポーネントの動作を検証するテストです。
 * 表示モードと編集モードの両方の動作を確認します。
 */

describe('SubjectList', () => {
  const mockSubjects = [
    { id: 1, name: '数学', score: 100, display_order: 1, total_score: 1000, percentage: 10 },
    { id: 2, name: '英語', score: 200, display_order: 2, total_score: 1000, percentage: 20 },
  ];

  const mockEditValues = {
    1: 100,
    2: 200,
  };

  const mockOnScoreChange = vi.fn();
  const mockOnAddSubject = vi.fn();
  const mockOnSubjectNameChange = vi.fn();

  beforeEach(() => {
    mockOnScoreChange.mockClear();
    mockOnAddSubject.mockClear();
    mockOnSubjectNameChange.mockClear();
  });

  describe('表示モード', () => {
    it('科目が表示順序で正しくソートされること', () => {
      const unsortedSubjects = [
        { id: 2, name: '英語', score: 200, display_order: 2, total_score: 1000, percentage: 20 },
        { id: 1, name: '数学', score: 100, display_order: 1, total_score: 1000, percentage: 10 },
      ];

      render(
        <SubjectList
          subjects={unsortedSubjects}
          type="test"
          isEditing={false}
          editValues={mockEditValues}
          onScoreChange={mockOnScoreChange}
          onAddSubject={mockOnAddSubject}
          onSubjectNameChange={mockOnSubjectNameChange}
        />
      );

      const subjectNames = screen.getAllByLabelText('科目名');
      expect(subjectNames[0]).toHaveTextContent('数学');
      expect(subjectNames[1]).toHaveTextContent('英語');
    });

    it('科目が空の場合でも正しく表示されること', () => {
      render(
        <SubjectList
          subjects={[]}
          type="test"
          isEditing={false}
          editValues={{}}
          onScoreChange={mockOnScoreChange}
          onAddSubject={mockOnAddSubject}
          onSubjectNameChange={mockOnSubjectNameChange}
        />
      );

      expect(screen.queryByLabelText('科目名')).not.toBeInTheDocument();
    });

    it('科目追加ボタンが表示されないこと', () => {
      render(
        <SubjectList
          subjects={mockSubjects}
          type="test"
          isEditing={false}
          editValues={mockEditValues}
          onScoreChange={mockOnScoreChange}
          onAddSubject={mockOnAddSubject}
          onSubjectNameChange={mockOnSubjectNameChange}
        />
      );

      expect(screen.queryByRole('button', { name: '科目を追加' })).not.toBeInTheDocument();
    });
  });

  describe('編集モード', () => {
    it('科目追加ボタンが表示されること', () => {
      render(
        <SubjectList
          subjects={mockSubjects}
          type="test"
          isEditing={true}
          editValues={mockEditValues}
          onScoreChange={mockOnScoreChange}
          onAddSubject={mockOnAddSubject}
          onSubjectNameChange={mockOnSubjectNameChange}
        />
      );

      expect(screen.getByRole('button', { name: '科目を追加' })).toBeInTheDocument();
    });

    it('科目追加ボタンをクリックするとonAddSubjectが呼ばれること', () => {
      render(
        <SubjectList
          subjects={mockSubjects}
          type="test"
          isEditing={true}
          editValues={mockEditValues}
          onScoreChange={mockOnScoreChange}
          onAddSubject={mockOnAddSubject}
          onSubjectNameChange={mockOnSubjectNameChange}
        />
      );

      const addButton = screen.getByRole('button', { name: '科目を追加' });
      addButton.click();

      expect(mockOnAddSubject).toHaveBeenCalledWith('test');
    });

    it('onAddSubjectが未定義の場合、科目追加ボタンが表示されないこと', () => {
      render(
        <SubjectList
          subjects={mockSubjects}
          type="test"
          isEditing={true}
          editValues={mockEditValues}
          onScoreChange={mockOnScoreChange}
          onAddSubject={undefined}
          onSubjectNameChange={mockOnSubjectNameChange}
        />
      );

      expect(screen.queryByRole('button', { name: '科目を追加' })).not.toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    it('科目追加ボタンに適切なARIAラベルが設定されていること', () => {
      render(
        <SubjectList
          subjects={mockSubjects}
          type="test"
          isEditing={true}
          editValues={mockEditValues}
          onScoreChange={mockOnScoreChange}
          onAddSubject={mockOnAddSubject}
          onSubjectNameChange={mockOnSubjectNameChange}
        />
      );

      const addButton = screen.getByRole('button', { name: '科目を追加' });
      expect(addButton).toHaveAttribute('aria-label', '科目を追加');
    });

    it('各科目カードに適切なARIAラベルが設定されていること', () => {
      render(
        <SubjectList
          subjects={mockSubjects}
          type="test"
          isEditing={false}
          editValues={mockEditValues}
          onScoreChange={mockOnScoreChange}
          onAddSubject={mockOnAddSubject}
          onSubjectNameChange={mockOnSubjectNameChange}
        />
      );

      const subjectCards = screen.getAllByLabelText('科目名');
      expect(subjectCards).toHaveLength(2);
      expect(subjectCards[0]).toHaveTextContent('数学');
      expect(subjectCards[1]).toHaveTextContent('英語');
    });
  });
});
