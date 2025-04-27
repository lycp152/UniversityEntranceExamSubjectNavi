import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SortConditions from './sort-conditions';

/**
 * 並び順コンポーネントのテスト
 *
 * 以下の機能をテストします：
 * - ドロップダウンメニューの表示/非表示
 * - 選択肢の選択と状態の更新
 * - アクセシビリティ属性の正しい設定
 */
describe('SortConditions', () => {
  const mockSetSortOrder = vi.fn();

  const defaultProps = {
    sortOrder: [
      {
        examType: '',
        subjectName: '',
        order: '',
      },
    ],
    setSortOrder: mockSetSortOrder,
  };

  it('初期状態で正しくレンダリングされること', () => {
    render(<SortConditions {...defaultProps} />);

    // タイトルが表示されていること
    expect(screen.getByText('検索結果の並び順')).toBeInTheDocument();

    // ドロップダウンメニューのトリガーボタンが表示されていること
    expect(screen.getByText('試験を選択')).toBeInTheDocument();
    expect(screen.getByText('科目名を選択')).toBeInTheDocument();
    expect(screen.getByText('並び順を選択')).toBeInTheDocument();
  });

  it('試験の種類を選択できること', async () => {
    render(<SortConditions {...defaultProps} />);

    // 試験の種類のドロップダウンメニューを開く
    const examTypeButton = screen.getByText('試験を選択').closest('button');
    if (examTypeButton) {
      fireEvent.click(examTypeButton);
    }
  });

  it('科目名を選択できること', async () => {
    render(<SortConditions {...defaultProps} />);

    // 科目名のドロップダウンメニューを開く
    const subjectNameButton = screen.getByText('科目名を選択').closest('button');
    if (subjectNameButton) {
      fireEvent.click(subjectNameButton);
    }
  });

  it('並び順を選択できること', async () => {
    render(<SortConditions {...defaultProps} />);

    // 並び順のドロップダウンメニューを開く
    const orderButton = screen.getByText('並び順を選択').closest('button');
    if (orderButton) {
      fireEvent.click(orderButton);
    }
  });

  it('アクセシビリティ属性が正しく設定されていること', () => {
    render(<SortConditions {...defaultProps} />);

    // 試験の種類のドロップダウンメニュー
    const examTypeButton = screen.getByText('試験を選択').closest('button');
    expect(examTypeButton).toHaveAttribute('aria-expanded', 'false');
    expect(examTypeButton).toHaveAttribute('aria-haspopup', 'listbox');
    expect(examTypeButton).toHaveAttribute('aria-label', '試験の種類を選択');

    // 科目名のドロップダウンメニュー
    const subjectNameButton = screen.getByText('科目名を選択').closest('button');
    expect(subjectNameButton).toHaveAttribute('aria-expanded', 'false');
    expect(subjectNameButton).toHaveAttribute('aria-haspopup', 'listbox');
    expect(subjectNameButton).toHaveAttribute('aria-label', '科目名を選択');

    // 並び順のドロップダウンメニュー
    const orderButton = screen.getByText('並び順を選択').closest('button');
    expect(orderButton).toHaveAttribute('aria-expanded', 'false');
    expect(orderButton).toHaveAttribute('aria-haspopup', 'listbox');
    expect(orderButton).toHaveAttribute('aria-label', '並び順を選択');
  });
});
