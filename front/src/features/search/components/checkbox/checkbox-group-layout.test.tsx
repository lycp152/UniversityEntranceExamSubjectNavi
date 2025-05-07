/**
 * チェックボックスグループレイアウトのテスト
 *
 * このテストでは、以下の項目を検証します：
 * - レイアウトの基本構造
 * - ラベルの表示
 * - 子要素の配置
 * - アクセシビリティ
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CheckboxGroupLayout from './checkbox-group-layout';

describe('CheckboxGroupLayout', () => {
  const setup = (props = {}) => {
    const defaultProps = {
      label: 'テストラベル',
      allChecked: false,
      isIndeterminate: false,
      onAllChange: () => {},
      children: <div>テストコンテンツ</div>,
      className: '',
      containerClassName: '',
    };
    return render(<CheckboxGroupLayout {...defaultProps} {...props} />);
  };

  describe('レイアウトの基本構造', () => {
    it('ラベルが正しく表示されること', () => {
      setup({ label: 'テストラベル' });
      expect(screen.getByText('テストラベル')).toBeInTheDocument();
    });

    it('子要素が正しく表示されること', () => {
      setup({ children: <div>テストコンテンツ</div> });
      expect(screen.getByText('テストコンテンツ')).toBeInTheDocument();
    });

    it('「すべて」チェックボックスが表示されること', () => {
      setup();
      expect(screen.getByText('すべて')).toBeInTheDocument();
    });
  });

  describe('スタイリング', () => {
    it('カスタムクラスが正しく適用されること', () => {
      setup({ className: 'custom-class', containerClassName: 'container-custom-class' });
      const container = screen.getByText('テストラベル').parentElement;
      expect(container).toHaveClass('container-custom-class');
      const content = screen.getByText('テストコンテンツ').parentElement;
      expect(content).toHaveClass('custom-class');
    });
  });

  describe('アクセシビリティ', () => {
    it('ラベルが適切な要素に紐付けられていること', () => {
      setup();
      const label = screen.getByText('テストラベル');
      const checkbox = screen.getByRole('checkbox', { name: 'すべて' });
      expect(label).toHaveAttribute('for', checkbox.id);
    });

    it('チェックボックスに適切なARIA属性が設定されていること', () => {
      setup();
      const checkbox = screen.getByRole('checkbox', { name: 'すべて' });
      expect(checkbox).toHaveAttribute('aria-checked', 'false');
      expect(checkbox).toHaveAttribute('aria-disabled', 'false');
      expect(checkbox).toHaveAttribute('aria-required', 'false');
    });

    it('チェックボックスがキーボードで操作可能であること', () => {
      setup();
      const checkbox = screen.getByRole('checkbox', { name: 'すべて' });
      expect(checkbox).toHaveAttribute('tabindex', '0');
    });
  });

  describe('状態の表示', () => {
    it('すべて選択状態が正しく表示されること', () => {
      setup({ allChecked: true });
      const checkbox = screen.getByRole('checkbox', { name: 'すべて' });
      expect(checkbox).toHaveAttribute('aria-checked', 'true');
    });

    it('中間状態が正しく表示されること', () => {
      setup({ isIndeterminate: true });
      const checkbox = screen.getByRole('checkbox', { name: 'すべて' });
      expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
    });
  });

  describe('イベントハンドリング', () => {
    it('チェックボックスの状態変更が正しく処理されること', () => {
      const onAllChange = vi.fn();
      setup({ onAllChange });
      const checkbox = screen.getByRole('checkbox', { name: 'すべて' });
      checkbox.click();
      expect(onAllChange).toHaveBeenCalled();
    });
  });
});
