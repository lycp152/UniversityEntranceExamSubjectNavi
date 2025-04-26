/**
 * AllCheckboxコンポーネントのテスト
 *
 * このテストでは、以下の項目を検証します：
 * - チェックボックスの状態表示
 * - ユーザーインタラクション
 * - アクセシビリティ
 * - エラーケース
 * - パフォーマンス
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import AllCheckbox from './all-checkbox';

describe('AllCheckbox', () => {
  const setup = (props = {}) => {
    const defaultProps = {
      allChecked: false,
      indeterminate: false,
      onChange: vi.fn(),
      label: 'すべて選択',
    };
    return render(<AllCheckbox {...defaultProps} {...props} />);
  };

  describe('表示', () => {
    it('ラベルが正しく表示されること', () => {
      setup({ label: 'テストラベル' });
      expect(screen.getByText('テストラベル')).toBeInTheDocument();
    });

    it('チェックボックスが未選択状態で表示されること', () => {
      setup({ allChecked: false });
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
    });

    it('チェックボックスが選択状態で表示されること', () => {
      setup({ allChecked: true });
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('中間状態が正しく表示されること', () => {
      setup({ indeterminate: true });
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('data-indeterminate', 'true');
    });
  });

  describe('インタラクション', () => {
    it('チェックボックスをクリックするとonChangeが呼ばれること', () => {
      const onChange = vi.fn();
      setup({ onChange });
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('キーボード操作でチェックボックスを操作できること', () => {
      const onChange = vi.fn();
      setup({ onChange });
      const checkbox = screen.getByRole('checkbox');
      fireEvent.keyDown(checkbox, { key: ' ' });
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('Enterキーでチェックボックスを操作できること', () => {
      const onChange = vi.fn();
      setup({ onChange });
      const checkbox = screen.getByRole('checkbox');
      fireEvent.keyDown(checkbox, { key: 'Enter' });
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('連続したクリックで正しく状態が切り替わること', () => {
      const onChange = vi.fn();
      const { getByRole } = render(
        <AllCheckbox allChecked={false} indeterminate={false} onChange={onChange} label="すべて" />
      );

      const checkbox = getByRole('checkbox');

      // 1回目のクリック
      fireEvent.click(checkbox);
      expect(onChange).toHaveBeenNthCalledWith(1, {
        target: { checked: true, value: undefined },
      });

      // 2回目のクリック
      fireEvent.click(checkbox);
      expect(onChange).toHaveBeenNthCalledWith(2, {
        target: { checked: true, value: undefined },
      });
    });
  });

  describe('アクセシビリティ', () => {
    it('アクセシビリティ属性が正しく設定されていること', () => {
      setup();
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'false');
    });

    it('中間状態のアクセシビリティ属性が正しく設定されていること', () => {
      setup({ indeterminate: true });
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
    });

    it('ラベルが適切に紐付けられていること', () => {
      setup();
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAccessibleName('すべて選択');
    });
  });

  describe('エラーケース', () => {
    it('onChangeが未定義の場合でもエラーが発生しないこと', () => {
      expect(() => {
        setup({ onChange: undefined });
      }).not.toThrow();
    });

    it('無効なpropsが渡された場合でも適切に処理されること', () => {
      expect(() => {
        setup({ invalidProp: 'test' });
      }).not.toThrow();
    });
  });

  describe('パフォーマンス', () => {
    it('高速な連続クリックでも正しく動作すること', () => {
      const onChange = vi.fn();
      setup({ onChange });
      const checkbox = screen.getByRole('checkbox');

      act(() => {
        for (let i = 0; i < 10; i++) {
          fireEvent.click(checkbox);
        }
      });

      expect(onChange).toHaveBeenCalledTimes(10);
    });
  });
});
