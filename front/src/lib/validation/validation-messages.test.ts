/**
 * バリデーションメッセージのテスト
 *
 * @module validation-messages.test
 * @description
 * - 共通メッセージのテスト
 * - 文字列バリデーションのテスト
 * - 数値バリデーションのテスト
 * - 日付バリデーションのテスト
 * - 配列バリデーションのテスト
 * - 検索フォームのテスト
 */

import { describe, it, expect } from 'vitest';
import { validationMessages } from './validation-messages';

describe('バリデーションメッセージ', () => {
  describe('共通メッセージ', () => {
    it('必須項目のメッセージが正しい', () => {
      expect(validationMessages.required).toBe('必須項目です');
    });

    it('型エラーのメッセージが正しい', () => {
      expect(validationMessages.invalid_type).toBe('入力形式が正しくありません');
    });
  });

  describe('文字列バリデーション', () => {
    it('最小文字数のメッセージが正しい', () => {
      expect(validationMessages.string.min(5)).toBe('5文字以上で入力してください');
    });

    it('最大文字数のメッセージが正しい', () => {
      expect(validationMessages.string.max(10)).toBe('10文字以下で入力してください');
    });

    it('メールアドレスのメッセージが正しい', () => {
      expect(validationMessages.string.email).toBe('メールアドレスの形式が正しくありません');
    });
  });

  describe('数値バリデーション', () => {
    it('最小値のメッセージが正しい', () => {
      expect(validationMessages.number.min(0)).toBe('0以上の数値を入力してください');
    });

    it('最大値のメッセージが正しい', () => {
      expect(validationMessages.number.max(100)).toBe('100以下の数値を入力してください');
    });

    it('整数のメッセージが正しい', () => {
      expect(validationMessages.number.integer).toBe('整数を入力してください');
    });
  });

  describe('日付バリデーション', () => {
    it('最小日付のメッセージが正しい', () => {
      expect(validationMessages.date.min('2024-01-01')).toBe(
        '2024-01-01以降の日付を入力してください'
      );
    });

    it('最大日付のメッセージが正しい', () => {
      expect(validationMessages.date.max('2024-12-31')).toBe(
        '2024-12-31以前の日付を入力してください'
      );
    });
  });

  describe('配列バリデーション', () => {
    it('最小要素数のメッセージが正しい', () => {
      expect(validationMessages.array.min(1)).toBe('1個以上選択してください');
    });

    it('最大要素数のメッセージが正しい', () => {
      expect(validationMessages.array.max(5)).toBe('5個以下で選択してください');
    });
  });

  describe('検索フォーム', () => {
    it('キーワードの最小文字数のメッセージが正しい', () => {
      expect(validationMessages.search.keyword.min).toBe('検索キーワードを入力してください');
    });

    it('キーワードの最大文字数のメッセージが正しい', () => {
      expect(validationMessages.search.keyword.max).toBe(
        '検索キーワードは100文字以下で入力してください'
      );
    });

    it('ページ番号のメッセージが正しい', () => {
      expect(validationMessages.search.page).toBe('ページ番号は1以上で入力してください');
    });

    it('表示件数のメッセージが正しい', () => {
      expect(validationMessages.search.perPage).toBe(
        '1ページあたりの表示件数は1から100の間で入力してください'
      );
    });
  });
});
