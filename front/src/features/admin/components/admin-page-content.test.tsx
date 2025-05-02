import { render, screen, fireEvent } from '@testing-library/react';
import { AdminPageContent } from './admin-page-content';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { University } from '@/features/admin/types/university';

/**
 * 管理ページコンテンツコンポーネントのテスト
 *
 * 以下の項目をテストします：
 * - 大学リストの表示
 * - 編集モードの制御
 * - エラー状態の表示
 * - ローディング状態の表示
 * - 成功メッセージの表示
 */
describe('AdminPageContent', () => {
  const mockUniversities: University[] = [
    {
      id: 1,
      name: 'テスト大学1',
      departments: [],
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin',
      updatedBy: 'admin',
    },
    {
      id: 2,
      name: 'テスト大学2',
      departments: [],
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin',
      updatedBy: 'admin',
    },
  ];

  const defaultProps = {
    universities: mockUniversities,
    error: null,
    isLoading: false,
    successMessage: null,
    editMode: null,
    onEdit: vi.fn(),
    onInfoChange: vi.fn(),
    onScoreChange: vi.fn(),
    onSave: vi.fn(),
    onCancel: vi.fn(),
    onInsert: vi.fn(),
    onAddSubject: vi.fn(),
    onSubjectNameChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('大学リストの表示', () => {
    it('大学リストが正しく表示されること', () => {
      render(<AdminPageContent {...defaultProps} />);

      const articles = screen.getAllByRole('article');
      expect(articles).toHaveLength(2);
      expect(articles[0]).toHaveAttribute('aria-label', 'テスト大学1の情報');
      expect(articles[1]).toHaveAttribute('aria-label', 'テスト大学2の情報');
    });

    it('大学リストが空の時に適切なメッセージが表示されること', () => {
      render(<AdminPageContent {...defaultProps} universities={[]} />);

      expect(screen.getByText('データが見つかりませんでした。')).toBeInTheDocument();
      expect(
        screen.getByText('現在、データベースに大学情報が登録されていません。')
      ).toBeInTheDocument();
    });
  });

  describe('状態の表示', () => {
    it('エラー状態の時にエラーメッセージが表示されること', () => {
      const errorMessage = 'エラーが発生しました';
      render(<AdminPageContent {...defaultProps} error={errorMessage} />);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('ローディング状態の時にローディングインジケータが表示されること', () => {
      render(<AdminPageContent {...defaultProps} isLoading={true} />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('成功メッセージが表示されること', () => {
      const successMessage = '保存に成功しました';
      render(<AdminPageContent {...defaultProps} successMessage={successMessage} />);

      expect(screen.getByText(successMessage)).toBeInTheDocument();
    });
  });

  describe('編集モードの制御', () => {
    it('編集モードの切り替えが正しく動作すること', () => {
      const onInsert = vi.fn();
      render(<AdminPageContent {...defaultProps} onInsert={onInsert} />);

      // 最初の「ここに追加」ボタンを取得してクリック
      const editButtons = screen.getAllByRole('button', { name: 'ここに追加' });
      fireEvent.click(editButtons[0]);

      // onInsertが呼び出されたことを確認
      expect(onInsert).toHaveBeenCalledWith(0);
    });
  });

  describe('アクセシビリティ', () => {
    it('アクセシビリティ属性が正しく設定されていること', () => {
      render(<AdminPageContent {...defaultProps} />);

      const articles = screen.getAllByRole('article');
      expect(articles[0]).toHaveAttribute('aria-label', 'テスト大学1の情報');
      expect(articles[1]).toHaveAttribute('aria-label', 'テスト大学2の情報');

      const buttons = screen.getAllByRole('button');
      expect(buttons[0]).toHaveAttribute('aria-label', 'ここに追加');
    });
  });
});
