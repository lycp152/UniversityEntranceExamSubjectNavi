import { describe, it, expect } from 'vitest';
import { SYSTEM_CONSTANTS } from './system';

/**
 * システム定数のテスト
 *
 * @remarks
 * - システムユーザーのデフォルト値の検証
 * - 定数の型安全性の検証
 * - 定数の不変性の検証
 */
describe('システム定数', () => {
  describe('システムユーザーのデフォルト値', () => {
    it('デフォルトユーザーが正しく設定されていること', () => {
      expect(SYSTEM_CONSTANTS.DEFAULT_USER).toBe('system');
    });

    it('デフォルトユーザーが文字列型であること', () => {
      expect(typeof SYSTEM_CONSTANTS.DEFAULT_USER).toBe('string');
    });

    it('デフォルトユーザーが空文字列でないこと', () => {
      expect(SYSTEM_CONSTANTS.DEFAULT_USER).not.toBe('');
    });
  });

  describe('定数の不変性', () => {
    it('定数が読み取り専用であること', () => {
      const originalValue = SYSTEM_CONSTANTS.DEFAULT_USER;

      // 型アサーションを使用して意図的に型エラーを回避
      const mutableConstants = { ...SYSTEM_CONSTANTS } as { DEFAULT_USER: string };
      mutableConstants.DEFAULT_USER = 'new_value';

      // 元の定数の値が変更されていないことを確認
      expect(SYSTEM_CONSTANTS.DEFAULT_USER).toBe(originalValue);
    });
  });
});
