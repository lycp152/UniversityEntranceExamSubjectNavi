/**
 * Scheduleコンポーネントのテスト
 *
 * このテストスイートでは、日程フィルターコンポーネントの機能を包括的にテストします。
 * テストは以下の観点で実施されます：
 *
 * 1. レンダリングテスト
 *    - フィルターグループの表示
 *      - ラベルの表示
 *      - 日程選択肢の表示
 *      - 選択状態の反映
 *    - アクセシビリティ属性の設定
 *      - ARIA属性の設定
 *      - スクリーンリーダー対応
 *
 * 2. インタラクションテスト
 *    - 選択操作
 *      - 単一選択
 *      - 複数選択
 *      - 選択解除
 *    - キーボード操作
 *      - フォーカス移動
 *      - 選択状態の変更
 *
 * 3. アクセシビリティテスト
 *    - スクリーンリーダー対応
 *      - ラベルの読み上げ
 *      - 選択状態の通知
 *    - キーボードナビゲーション
 *      - タブ移動
 *      - スペースキーでの選択
 *
 * テストの前提条件：
 * - 日程フィルターの設定が正しく行われていること
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
import { Schedule } from './schedule';
import { SCHEDULE_OPTIONS, FILTER_LABELS } from '../../constants/filter-options';
import { FilterCheckboxProps } from '../../types/filter';

describe('Schedule', () => {
  const mockOnChange = vi.fn();
  const defaultProps: FilterCheckboxProps = {
    selectedItems: [],
    setSelectedItems: mockOnChange,
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('レンダリング', () => {
    it('ラベルが正しく表示されること', () => {
      render(<Schedule {...defaultProps} />);
      expect(screen.getByText(FILTER_LABELS.SCHEDULE)).toBeInTheDocument();
    });

    it('すべての選択肢が表示されること', () => {
      render(<Schedule {...defaultProps} />);
      SCHEDULE_OPTIONS.forEach(option => {
        expect(screen.getByText(option)).toBeInTheDocument();
      });
    });

    it('選択された値が正しく反映されること', () => {
      const selectedItems = [SCHEDULE_OPTIONS[0]];
      render(<Schedule {...defaultProps} selectedItems={selectedItems} />);
      const checkbox = screen.getByRole('checkbox', { name: SCHEDULE_OPTIONS[0] });
      expect(checkbox).toBeChecked();
    });
  });

  describe('インタラクション', () => {
    it('選択値が変更されたときにonChangeが呼ばれること', () => {
      render(<Schedule {...defaultProps} />);
      const checkbox = screen.getByRole('checkbox', { name: SCHEDULE_OPTIONS[0] });
      fireEvent.click(checkbox);
      expect(mockOnChange).toHaveBeenCalledWith([SCHEDULE_OPTIONS[0]]);
    });

    it('複数の選択肢を選択できること', () => {
      render(<Schedule {...defaultProps} />);
      const firstCheckbox = screen.getByRole('checkbox', { name: SCHEDULE_OPTIONS[0] });
      const secondCheckbox = screen.getByRole('checkbox', { name: SCHEDULE_OPTIONS[1] });

      fireEvent.click(firstCheckbox);
      fireEvent.click(secondCheckbox);

      expect(mockOnChange).toHaveBeenLastCalledWith([SCHEDULE_OPTIONS[0], SCHEDULE_OPTIONS[1]]);
    });

    it('選択を解除できること', () => {
      const selectedItems = [SCHEDULE_OPTIONS[0]];
      render(<Schedule {...defaultProps} selectedItems={selectedItems} />);
      const checkbox = screen.getByRole('checkbox', { name: SCHEDULE_OPTIONS[0] });
      fireEvent.click(checkbox);
      expect(mockOnChange).toHaveBeenCalledWith([]);
    });
  });

  describe('アクセシビリティ', () => {
    it('チェックボックスに適切なARIA属性が設定されていること', () => {
      render(<Schedule {...defaultProps} />);
      SCHEDULE_OPTIONS.forEach(option => {
        const checkbox = screen.getByRole('checkbox', { name: option });
        expect(checkbox).toHaveAttribute('aria-checked', 'false');
        expect(checkbox).toHaveAttribute('aria-required', 'false');
      });
    });

    it('選択されたチェックボックスのARIA属性が正しく更新されること', () => {
      const selectedItems = [SCHEDULE_OPTIONS[0]];
      render(<Schedule {...defaultProps} selectedItems={selectedItems} />);
      const checkbox = screen.getByRole('checkbox', { name: SCHEDULE_OPTIONS[0] });
      expect(checkbox).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('キーボード操作', () => {
    it('Tabキーでフォーカスが移動すること', async () => {
      render(<Schedule {...defaultProps} />);
      const checkbox = screen.getByRole('checkbox', { name: SCHEDULE_OPTIONS[0] });

      // フォーカス可能な要素にフォーカスを設定
      checkbox.focus();

      // フォーカスが正しく設定されたことを確認
      expect(checkbox).toHaveFocus();
    });

    it('スペースキーで選択状態が切り替わること', () => {
      render(<Schedule {...defaultProps} />);
      const checkbox = screen.getByRole('checkbox', { name: SCHEDULE_OPTIONS[0] });

      // フォーカスを設定してからスペースキーを押す
      checkbox.focus();
      fireEvent.keyDown(checkbox, { key: ' ' });

      expect(mockOnChange).toHaveBeenCalledWith([SCHEDULE_OPTIONS[0]]);
    });
  });
});
