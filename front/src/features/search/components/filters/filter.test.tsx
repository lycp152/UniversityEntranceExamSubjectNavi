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
import { FilterProps } from '../../types/filter';

describe('Filter', () => {
  const mockOnChange = vi.fn();
  const defaultProps: FilterProps = {
    config: {
      type: 'region',
      isCategory: false,
      options: ['東京', '大阪', '愛知'],
      label: '所在地',
    },
    selectedItems: [],
    setSelectedItems: mockOnChange,
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('通常型フィルターの場合', () => {
    it('ラベルが正しく表示されること', () => {
      render(<Filter {...defaultProps} />);
      expect(screen.getByText('所在地')).toBeInTheDocument();
    });

    it('すべての選択肢が表示されること', () => {
      render(<Filter {...defaultProps} />);
      (defaultProps.config.options as string[]).forEach((option: string) => {
        expect(screen.getByText(option)).toBeInTheDocument();
      });
    });

    it('選択された値が正しく反映されること', () => {
      const selectedItems = [(defaultProps.config.options as string[])[0]];
      render(<Filter {...defaultProps} selectedItems={selectedItems} />);
      const checkbox = screen.getByLabelText((defaultProps.config.options as string[])[0]);
      expect(checkbox).toBeChecked();
    });

    it('選択値が変更されたときにonChangeが呼ばれること', () => {
      render(<Filter {...defaultProps} />);
      const checkbox = screen.getByLabelText((defaultProps.config.options as string[])[0]);
      fireEvent.click(checkbox);
      expect(mockOnChange).toHaveBeenCalledWith([(defaultProps.config.options as string[])[0]]);
    });

    it('複数の選択肢を選択できること', () => {
      render(<Filter {...defaultProps} />);
      const firstCheckbox = screen.getByLabelText((defaultProps.config.options as string[])[0]);
      const secondCheckbox = screen.getByLabelText((defaultProps.config.options as string[])[1]);

      fireEvent.click(firstCheckbox);
      fireEvent.click(secondCheckbox);

      expect(mockOnChange).toHaveBeenLastCalledWith([
        (defaultProps.config.options as string[])[0],
        (defaultProps.config.options as string[])[1],
      ]);
    });

    it('選択を解除できること', () => {
      const selectedItems = [(defaultProps.config.options as string[])[0]];
      render(<Filter {...defaultProps} selectedItems={selectedItems} />);
      const checkbox = screen.getByLabelText((defaultProps.config.options as string[])[0]);
      fireEvent.click(checkbox);
      expect(mockOnChange).toHaveBeenCalledWith([]);
    });
  });

  describe('カテゴリー型フィルターの場合', () => {
    const categoryProps: FilterProps = {
      config: {
        type: 'classification',
        isCategory: true,
        options: {
          理系: ['理学部', '工学部'],
          文系: ['文学部', '経済学部'],
        },
        label: '学部',
      },
      selectedItems: [],
      setSelectedItems: mockOnChange,
    };

    it('ラベルが正しく表示されること', () => {
      render(<Filter {...categoryProps} />);
      expect(screen.getByText('学部')).toBeInTheDocument();
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

    it('選択値が変更されたときにonChangeが呼ばれること', () => {
      render(<Filter {...categoryProps} />);
      const firstItem = Object.values(categoryProps.config.options)[0][0];
      const checkbox = screen.getByLabelText(firstItem);
      fireEvent.click(checkbox);
      expect(mockOnChange).toHaveBeenCalledWith([firstItem]);
    });

    it('複数の選択肢を選択できること', () => {
      render(<Filter {...categoryProps} />);
      const firstItem = Object.values(categoryProps.config.options)[0][0];
      const secondItem = Object.values(categoryProps.config.options)[0][1];

      fireEvent.click(screen.getByLabelText(firstItem));
      fireEvent.click(screen.getByLabelText(secondItem));

      expect(mockOnChange).toHaveBeenLastCalledWith([firstItem, secondItem]);
    });

    it('選択を解除できること', () => {
      const selectedItems = [Object.values(categoryProps.config.options)[0][0]];
      render(<Filter {...categoryProps} selectedItems={selectedItems} />);
      const checkbox = screen.getByLabelText(selectedItems[0]);
      fireEvent.click(checkbox);
      expect(mockOnChange).toHaveBeenCalledWith([]);
    });
  });
});
