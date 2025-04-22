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
   * 表示テスト
   * コンポーネントの表示状態を検証します。
   */
  describe('表示', () => {
    /**
     * 通常モードでの表示テスト
     * - 区切り線が表示されること
     * - ボタンが表示されること
     */
    it('通常モードで表示された場合、区切り線とボタンが表示される', () => {
      const onInsert = vi.fn();
      render(<InsertUniversityButton onInsert={onInsert} index={0} />);

      // 区切り線が表示されていることを確認
      expect(screen.getByTestId('divider')).toBeInTheDocument();

      // ボタンが表示されていることを確認
      const button = screen.getByRole('button', { name: /ここに追加/i });
      expect(button).toBeInTheDocument();
    });

    /**
     * 単独表示モードでの表示テスト
     * - 区切り線が表示されないこと
     * - ボタンが表示されること
     */
    it('単独表示モードで表示された場合、区切り線が表示されない', () => {
      const onInsert = vi.fn();
      render(<InsertUniversityButton onInsert={onInsert} index={0} isOnly={true} />);

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
    /**
     * クリックイベントのテスト
     * - ボタンクリック時に正しいインデックスでonInsertが呼ばれること
     */
    it('ボタンをクリックすると、正しいインデックスでonInsertが呼ばれる', () => {
      const onInsert = vi.fn();
      const testIndex = 2;
      render(<InsertUniversityButton onInsert={onInsert} index={testIndex} />);

      const button = screen.getByRole('button', { name: /ここに追加/i });
      fireEvent.click(button);

      expect(onInsert).toHaveBeenCalledTimes(1);
      expect(onInsert).toHaveBeenCalledWith(testIndex);
    });

    /**
     * エッジケースのテスト
     * - 負のインデックスでも正しく動作すること
     */
    it('負のインデックスでも正しく動作する', () => {
      const onInsert = vi.fn();
      const negativeIndex = -1;
      render(<InsertUniversityButton onInsert={onInsert} index={negativeIndex} />);

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
    /**
     * アクセシビリティのテスト
     * - ボタンが適切なaria-labelを持つこと
     */
    it('ボタンがアクセシブルである', () => {
      const onInsert = vi.fn();
      render(<InsertUniversityButton onInsert={onInsert} index={0} />);

      const button = screen.getByRole('button', { name: /ここに追加/i });
      expect(button).toHaveAttribute('aria-label', 'ここに追加');
    });
  });
});
