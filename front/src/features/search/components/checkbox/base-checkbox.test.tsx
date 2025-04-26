/**
 * BaseCheckboxコンポーネントのテスト
 *
 * このテストでは、以下の項目を検証します：
 * - チェックボックスの表示
 * - 選択状態の変更
 * - 中間状態の表示
 * - アクセシビリティ
 * - キーボード操作
 * - 無効状態
 * - スタイリング
 * - エラーケース
 * - ダークモード
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BaseCheckbox from './base-checkbox';

describe('BaseCheckbox', () => {
  const setup = (props = {}) => {
    const defaultProps = {
      checked: false,
      onChange: vi.fn(),
      label: 'テストラベル',
    };
    return render(<BaseCheckbox {...defaultProps} {...props} />);
  };

  describe('表示', () => {
    it('ラベルが正しく表示されること', () => {
      setup({ label: 'テストラベル' });
      expect(screen.getByText('テストラベル')).toBeInTheDocument();
    });

    it('チェックボックスが正しく表示されること', () => {
      setup();
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('カスタムクラスが正しく適用されること', () => {
      setup({ className: 'custom-class' });
      const container = screen.getByRole('checkbox').closest('label');
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('選択状態', () => {
    it('チェックボックスをクリックするとonChangeが呼ばれること', () => {
      const onChange = vi.fn();
      setup({ onChange });
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
      expect(onChange).toHaveBeenCalled();
    });

    it('初期状態が正しく設定されること', () => {
      setup({ checked: true });
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('値が正しく渡されること', () => {
      const onChange = vi.fn();
      setup({ onChange, value: 'test-value' });
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            value: 'test-value',
          }),
        })
      );
    });

    it('選択状態のスタイリングが正しく適用されること', () => {
      setup({ checked: true });
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('data-state', 'checked');
      expect(checkbox).toHaveClass('data-[state=checked]:bg-primary');
      expect(checkbox).toHaveClass('data-[state=checked]:text-primary-foreground');
      expect(checkbox).toHaveClass('data-[state=checked]:border-primary');
    });
  });

  describe('中間状態', () => {
    it('中間状態が正しく表示されること', () => {
      setup({ indeterminate: true });
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
    });

    it('中間状態のスタイリングが正しく適用されること', () => {
      setup({ indeterminate: true });
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveClass('bg-primary', 'text-primary-foreground', 'border-primary');
    });
  });

  describe('中間状態のテスト', () => {
    it('中間状態でクリックするとチェック状態になること', () => {
      const onChange = vi.fn();
      render(
        <BaseCheckbox
          checked={false}
          indeterminate={true}
          onChange={onChange}
          label="テストラベル"
        />
      );

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            checked: true,
          }),
        })
      );
    });
  });

  describe('アクセシビリティ', () => {
    it('適切なARIA属性が設定されていること', () => {
      setup();
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-label', 'テストラベル');
    });

    it('無効状態のARIA属性が正しく設定されること', () => {
      setup({ disabled: true });
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-disabled', 'true');
    });

    it('必須状態のARIA属性が正しく設定されること', () => {
      setup({ required: true });
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-required', 'true');
    });

    it('フォーカス時のスタイリングが正しく適用されること', () => {
      setup();
      const checkbox = screen.getByRole('checkbox');
      fireEvent.focus(checkbox);
      expect(checkbox).toHaveClass('focus-visible:ring-[3px]');
    });

    it('フォーカス時のARIA属性が正しく設定されること', () => {
      setup();
      const checkbox = screen.getByRole('checkbox');
      fireEvent.focus(checkbox);
      expect(checkbox).toHaveAttribute('aria-checked', 'false');
    });
  });

  describe('キーボード操作', () => {
    it('Spaceキーで選択状態が切り替わること', () => {
      const onChange = vi.fn();
      setup({ onChange });
      const checkbox = screen.getByRole('checkbox');
      fireEvent.keyDown(checkbox, { key: ' ' });
      expect(onChange).toHaveBeenCalled();
    });

    it('Enterキーで選択状態が切り替わること', () => {
      const onChange = vi.fn();
      setup({ onChange });
      const checkbox = screen.getByRole('checkbox');
      fireEvent.keyDown(checkbox, { key: 'Enter' });
      expect(onChange).toHaveBeenCalled();
    });

    it('その他のキーでは選択状態が切り替わらないこと', () => {
      const onChange = vi.fn();
      setup({ onChange });
      const checkbox = screen.getByRole('checkbox');
      fireEvent.keyDown(checkbox, { key: 'Tab' });
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('無効状態', () => {
    it('無効状態のチェックボックスがクリックできないこと', () => {
      const onChange = vi.fn();
      setup({ disabled: true, onChange });
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
      expect(onChange).not.toHaveBeenCalled();
    });

    it('無効状態のラベルが薄く表示されること', () => {
      setup({ disabled: true });
      const label = screen.getByText('テストラベル');
      expect(label).toHaveClass('opacity-50');
    });

    it('無効状態のスタイリングが正しく適用されること', () => {
      setup({ disabled: true });
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveClass('cursor-not-allowed', 'opacity-50');
    });
  });

  describe('ダークモード', () => {
    it('ダークモード時のスタイリングが正しく適用されること', () => {
      setup();
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveClass('dark:bg-input/30');
    });

    it('ダークモード時の選択状態のスタイリングが正しく適用されること', () => {
      setup({ checked: true });
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveClass('dark:data-[state=checked]:bg-primary');
    });

    it('ダークモード時の無効状態のスタイリングが正しく適用されること', () => {
      setup({ disabled: true });
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveClass('dark:aria-invalid:ring-destructive/40');
    });
  });

  describe('エラーケース', () => {
    it('必須プロパティが欠落している場合でもエラーが発生しないこと', () => {
      expect(() => {
        setup({ label: undefined });
      }).not.toThrow();
    });

    it('無効なプロパティが渡された場合でもエラーが発生しないこと', () => {
      expect(() => {
        setup({ invalidProp: true } as any);
      }).not.toThrow();
    });

    it('無効な値が渡された場合でもエラーが発生しないこと', () => {
      expect(() => {
        setup({ checked: 'invalid' as any });
      }).not.toThrow();
    });
  });
});
