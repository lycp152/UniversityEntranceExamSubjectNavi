import { render, screen, fireEvent } from '@testing-library/react';
import { InsertUniversityButton } from './insert-button';
import { describe, it, expect, vi } from 'vitest';

/**
 * InsertUniversityButtonコンポーネントのテスト
 *
 * このテストスイートは、大学情報の挿入ボタンコンポーネントの
 * 表示、インタラクション、アクセシビリティを検証します。
 */
describe('InsertUniversityButton', () => {
  /**
   * テスト用の共通セットアップ
   */
  const setup = (props = {}) => {
    const defaultProps = {
      onInsert: vi.fn(),
      index: 0,
      isOnly: false,
    };
    return render(<InsertUniversityButton {...defaultProps} {...props} />);
  };

  /**
   * 表示テスト
   * コンポーネントの表示状態を検証します。
   */
  describe('表示', () => {
    it('通常モードで表示された場合、区切り線とボタンが表示される', () => {
      setup();

      // 区切り線が表示されていることを確認
      expect(screen.getByTestId('divider')).toBeInTheDocument();

      // ボタンが表示されていることを確認
      const button = screen.getByRole('button', { name: /ここに追加/i });
      expect(button).toBeInTheDocument();
    });

    it('単独表示モードで表示された場合、区切り線が表示されない', () => {
      setup({ isOnly: true });

      // 区切り線が表示されていないことを確認
      expect(screen.queryByTestId('divider')).not.toBeInTheDocument();

      // ボタンが表示されていることを確認
      const button = screen.getByRole('button', { name: /ここに追加/i });
      expect(button).toBeInTheDocument();
    });
  });

  /**
   * インタラクションテスト
   * コンポーネントのユーザーインタラクションを検証します。
   */
  describe('インタラクション', () => {
    it('ボタンをクリックすると、正しいインデックスでonInsertが呼ばれる', () => {
      const onInsert = vi.fn();
      const testIndex = 2;
      setup({ onInsert, index: testIndex });

      const button = screen.getByRole('button', { name: /ここに追加/i });
      fireEvent.click(button);

      expect(onInsert).toHaveBeenCalledTimes(1);
      expect(onInsert).toHaveBeenCalledWith(testIndex);
    });

    it('負のインデックスでも正しく動作する', () => {
      const onInsert = vi.fn();
      const negativeIndex = -1;
      setup({ onInsert, index: negativeIndex });

      const button = screen.getByRole('button', { name: /ここに追加/i });
      fireEvent.click(button);

      expect(onInsert).toHaveBeenCalledTimes(1);
      expect(onInsert).toHaveBeenCalledWith(negativeIndex);
    });
  });

  /**
   * アクセシビリティテスト
   * コンポーネントのアクセシビリティ要件を検証します。
   */
  describe('アクセシビリティ', () => {
    it('ボタンが適切なaria-labelを持つ', () => {
      setup();

      const button = screen.getByRole('button', { name: /ここに追加/i });
      expect(button).toHaveAttribute('aria-label', 'ここに追加');
    });

    it('ボタンがキーボードで操作可能', () => {
      setup();

      const button = screen.getByRole('button', { name: /ここに追加/i });
      expect(button).toHaveAttribute('tabindex', '0');
    });

    it('ボタンがEnterキーで操作可能', () => {
      const onInsert = vi.fn();
      setup({ onInsert });

      const button = screen.getByRole('button', { name: /ここに追加/i });
      fireEvent.keyDown(button, { key: 'Enter' });

      expect(onInsert).toHaveBeenCalledTimes(1);
    });
  });
});
