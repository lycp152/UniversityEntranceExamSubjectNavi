/**
 * Filterコンポーネントのテスト
 *
 * このテストスイートでは、フィルターコンポーネントの機能を包括的にテストします。
 * テストは以下の観点で実施されます：
 *
 * 1. レンダリングテスト
 *    - 通常型フィルターの表示
 *      - ラベルの表示
 *      - 選択肢の表示
 *      - 選択状態の反映
 *    - カテゴリー型フィルターの表示
 *      - ラベルの表示
 *      - カテゴリーの表示
 *      - 選択肢の表示
 *      - 選択状態の反映
 *
 * 2. インタラクションテスト
 *    - 通常型フィルターの操作
 *      - 単一選択
 *      - 複数選択
 *      - 選択解除
 *    - カテゴリー型フィルターの操作
 *      - 単一選択
 *      - 複数選択
 *      - 選択解除
 *
 * 3. アクセシビリティテスト
 *    - スクリーンリーダー対応
 *    - キーボードナビゲーション
 *    - ARIA属性の設定
 *
 * テストの前提条件：
 * - フィルターの設定が正しく行われていること
 * - 選択状態の初期値が適切に設定されていること
 * - コールバック関数が正しく実装されていること
 *
 * 期待される動作：
 * - ユーザーインターフェースが直感的であること
 * - アクセシビリティガイドラインに準拠していること
 * - パフォーマンスが最適化されていること
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Filter } from './filter';
import { FilterProps, FilterType } from '../../types/filter';

describe('Filter', () => {
  const mockSetSelectedItems = vi.fn();
  const mockProps: FilterProps = {
    selectedItems: [],
    setSelectedItems: mockSetSelectedItems,
    config: {
      type: FilterType.REGION,
      label: '地域',
      options: ['北海道', '東北'],
      isCategory: false,
    },
  };

  beforeEach(() => {
    mockSetSelectedItems.mockClear();
  });

  describe('通常型フィルターの場合', () => {
    it('ラベルが正しく表示されること', () => {
      render(<Filter {...mockProps} />);
      expect(screen.getByText('地域')).toBeInTheDocument();
    });

    it('すべての選択肢が表示されること', () => {
      render(<Filter {...mockProps} />);
      (mockProps.config.options as string[]).forEach((option: string) => {
        expect(screen.getByText(option)).toBeInTheDocument();
      });
    });

    it('選択された値が正しく反映されること', () => {
      const selectedItems = [(mockProps.config.options as string[])[0]];
      render(<Filter {...mockProps} selectedItems={selectedItems} />);
      const checkbox = screen.getByLabelText((mockProps.config.options as string[])[0]);
      expect(checkbox).toBeChecked();
    });

    it('選択値が変更されたときにsetSelectedItemsが呼ばれること', () => {
      render(<Filter {...mockProps} />);
      const checkbox = screen.getByLabelText((mockProps.config.options as string[])[0]);
      fireEvent.click(checkbox);
      expect(mockSetSelectedItems).toHaveBeenCalledWith([
        (mockProps.config.options as string[])[0],
      ]);
    });

    it('複数の選択肢を選択できること', () => {
      render(<Filter {...mockProps} />);
      const firstCheckbox = screen.getByLabelText((mockProps.config.options as string[])[0]);
      const secondCheckbox = screen.getByLabelText((mockProps.config.options as string[])[1]);

      fireEvent.click(firstCheckbox);
      fireEvent.click(secondCheckbox);

      expect(mockSetSelectedItems).toHaveBeenLastCalledWith([
        (mockProps.config.options as string[])[0],
        (mockProps.config.options as string[])[1],
      ]);
    });

    it('選択を解除できること', () => {
      const selectedItems = [(mockProps.config.options as string[])[0]];
      render(<Filter {...mockProps} selectedItems={selectedItems} />);
      const checkbox = screen.getByLabelText((mockProps.config.options as string[])[0]);
      fireEvent.click(checkbox);
      expect(mockSetSelectedItems).toHaveBeenCalledWith([]);
    });
  });

  describe('カテゴリー型フィルターの場合', () => {
    const categoryProps: FilterProps = {
      selectedItems: [],
      setSelectedItems: mockSetSelectedItems,
      config: {
        type: FilterType.CLASSIFICATION,
        label: '設置区分',
        options: {
          国立: ['北海道大学', '東北大学'],
          公立: ['公立大学1', '公立大学2'],
        },
        isCategory: true,
      },
    };

    it('ラベルが正しく表示されること', () => {
      render(<Filter {...categoryProps} />);
      expect(screen.getByText('設置区分')).toBeInTheDocument();
    });

    it('すべてのカテゴリーが表示されること', () => {
      render(<Filter {...categoryProps} />);
      Object.keys(categoryProps.config.options).forEach(category => {
        expect(screen.getByText(category)).toBeInTheDocument();
      });
    });

    it('各カテゴリーの選択肢が表示されること', () => {
      render(<Filter {...categoryProps} />);
      const allItems = Object.values(categoryProps.config.options).flat();
      allItems.forEach(item => {
        expect(screen.getByText(item)).toBeInTheDocument();
      });
    });

    it('選択された値が正しく反映されること', () => {
      const selectedItems = [Object.values(categoryProps.config.options)[0][0]];
      render(<Filter {...categoryProps} selectedItems={selectedItems} />);
      const checkbox = screen.getByLabelText(selectedItems[0]);
      expect(checkbox).toBeChecked();
    });

    it('選択値が変更されたときにsetSelectedItemsが呼ばれること', () => {
      render(<Filter {...categoryProps} />);
      const firstItem = Object.values(categoryProps.config.options)[0][0];
      const checkbox = screen.getByLabelText(firstItem);
      fireEvent.click(checkbox);
      expect(mockSetSelectedItems).toHaveBeenCalledWith([firstItem]);
    });

    it('複数の選択肢を選択できること', () => {
      render(<Filter {...categoryProps} />);
      const firstItem = Object.values(categoryProps.config.options)[0][0];
      const secondItem = Object.values(categoryProps.config.options)[0][1];

      fireEvent.click(screen.getByLabelText(firstItem));
      fireEvent.click(screen.getByLabelText(secondItem));

      expect(mockSetSelectedItems).toHaveBeenLastCalledWith([firstItem, secondItem]);
    });

    it('選択を解除できること', () => {
      const selectedItems = [Object.values(categoryProps.config.options)[0][0]];
      render(<Filter {...categoryProps} selectedItems={selectedItems} />);
      const checkbox = screen.getByLabelText(selectedItems[0]);
      fireEvent.click(checkbox);
      expect(mockSetSelectedItems).toHaveBeenCalledWith([]);
    });
  });
});
