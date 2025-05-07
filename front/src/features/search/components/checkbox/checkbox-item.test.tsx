/**
 * チェックボックスアイテムコンポーネントのテスト
 *
 * このテストでは、以下の項目を検証します：
 * - チェックボックスアイテムの表示
 * - 選択状態の管理
 * - アクセシビリティ
 * - エラーケース
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CheckboxItem from './checkbox-item';

describe('CheckboxItem', () => {
  const setup = (props = {}) => {
    const defaultProps = {
      item: 'テストアイテム',
      checked: false,
      onChange: vi.fn(),
      label: 'テストラベル',
    };
    return render(<CheckboxItem {...defaultProps} {...props} />);
  };

  describe('表示', () => {
    it('ラベルが正しく表示されること', () => {
      setup({ label: 'テストラベル' });
      expect(screen.getByText('テストラベル')).toBeInTheDocument();
    });

    it('チェックボックスが正しく表示されること', () => {
      setup();
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
    });
  });

  describe('選択状態の管理', () => {
    it('チェックボックスをクリックするとonChangeが呼ばれること', () => {
      const onChange = vi.fn();
      setup({ onChange });
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it('チェックボックスの状態が正しく反映されること', () => {
      setup({ checked: true });
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('アクセシビリティ', () => {
    it('チェックボックスに適切なARIA属性が設定されていること', () => {
      setup();
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'false');
      expect(checkbox).toHaveAttribute('aria-disabled', 'false');
      expect(checkbox).toHaveAttribute('aria-required', 'false');
      expect(checkbox).toHaveAttribute('aria-label', 'テストラベル');
    });

    it('ラベルがチェックボックスと適切に紐付けられていること', () => {
      setup();
      const checkbox = screen.getByRole('checkbox');
      const label = screen.getByText('テストラベル');
      expect(checkbox).toHaveAttribute('aria-label', 'テストラベル');
      expect(label).toBeInTheDocument();
    });
  });

  describe('エラーケース', () => {
    it('itemが未定義の場合でもエラーが発生しないこと', () => {
      expect(() => {
        setup({ item: undefined });
      }).not.toThrow();
    });

    it('onChangeが未定義の場合でもエラーが発生しないこと', () => {
      expect(() => {
        setup({ onChange: undefined });
      }).not.toThrow();
    });

    it('labelが未定義の場合でもエラーが発生しないこと', () => {
      expect(() => {
        setup({ label: undefined });
      }).not.toThrow();
    });
  });
});
