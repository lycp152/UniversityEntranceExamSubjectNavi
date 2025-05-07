import { render, screen, fireEvent } from '@testing-library/react';
import DetailSearch from './detail-search';
import { describe, it, expect, vi } from 'vitest';

/**
 * 詳細検索コンポーネントのテスト
 *
 * 以下の機能をテストします：
 * 1. 初期表示時の状態
 * 2. 詳細検索の展開/折りたたみ
 * 3. フィルターコンポーネントの表示
 */
describe('DetailSearch', () => {
  const defaultProps = {
    selectedItems: [],
    setSelectedItems: vi.fn(),
    academicField: [],
    setAcademicField: vi.fn(),
    schedule: [],
    setSchedule: vi.fn(),
    classification: [],
    setClassification: vi.fn(),
    isExpanded: false,
    onToggleExpanded: vi.fn(),
  };

  it('初期表示時に詳細条件が折りたたまれていること', () => {
    render(<DetailSearch {...defaultProps} />);

    // 詳細条件ボタンが表示されていること
    const detailButton = screen.getByRole('button', { name: /詳細条件/ });
    expect(detailButton).toBeInTheDocument();

    // 詳細検索の内容が表示されていないこと
    expect(screen.queryByText(/地域・都道府県/)).not.toBeInTheDocument();
    expect(screen.queryByText(/学問系統/)).not.toBeInTheDocument();
    expect(screen.queryByText(/日程/)).not.toBeInTheDocument();
    expect(screen.queryByText(/設置区分/)).not.toBeInTheDocument();
  });

  it('詳細条件ボタンをクリックするとonToggleExpandedが呼ばれること', () => {
    render(<DetailSearch {...defaultProps} />);

    const button = screen.getByRole('button', { name: /詳細条件/ });
    fireEvent.click(button);

    expect(defaultProps.onToggleExpanded).toHaveBeenCalledTimes(1);
  });

  it('isExpandedがtrueの場合、詳細検索の内容が表示されること', () => {
    render(<DetailSearch {...defaultProps} isExpanded={true} />);

    // 詳細検索の内容が表示されていること
    expect(screen.getByText(/地域・都道府県/)).toBeInTheDocument();
    expect(screen.getByText(/学問系統/)).toBeInTheDocument();
    expect(screen.getByText(/日程/)).toBeInTheDocument();
    expect(screen.getByText(/設置区分/)).toBeInTheDocument();
  });

  it('詳細条件を閉じるボタンをクリックするとonToggleExpandedが呼ばれること', () => {
    render(<DetailSearch {...defaultProps} isExpanded={true} />);

    const closeButton = screen.getByRole('button', { name: /詳細条件を閉じる/ });
    fireEvent.click(closeButton);

    expect(defaultProps.onToggleExpanded).toHaveBeenCalledTimes(1);
  });
});
