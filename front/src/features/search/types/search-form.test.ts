import { describe, it, expect } from 'vitest';
import { SearchFormState } from './search-form';

/**
 * 検索フォームの型定義のテスト
 *
 * このテストは、SearchFormState型の構造と動作を検証します。
 * 型の安全性、エラーハンドリング、ドキュメントの整合性を確認します。
 */
describe('SearchFormState', () => {
  /**
   * 基本的な型構造のテスト
   */
  describe('基本的な型構造', () => {
    it('messageプロパティが正しく定義されていること', () => {
      const state: SearchFormState = {
        message: 'テストメッセージ',
      };
      expect(state.message).toBe('テストメッセージ');
    });

    it('messageプロパティが省略可能であること', () => {
      const state: SearchFormState = {};
      expect(state.message).toBeUndefined();
    });

    it('errorsプロパティが正しく定義されていること', () => {
      const state: SearchFormState = {
        errors: {
          keyword: ['キーワードは必須です'],
          region: ['地域を選択してください'],
        },
      };
      expect(state.errors?.keyword).toEqual(['キーワードは必須です']);
      expect(state.errors?.region).toEqual(['地域を選択してください']);
    });

    it('errorsプロパティが省略可能であること', () => {
      const state: SearchFormState = {};
      expect(state.errors).toBeUndefined();
    });
  });

  /**
   * エラーハンドリングのテスト
   */
  describe('エラーハンドリング', () => {
    it('複数のエラーメッセージを保持できること', () => {
      const state: SearchFormState = {
        errors: {
          keyword: ['キーワードは必須です', 'キーワードは100文字以内で入力してください'],
          region: ['地域を選択してください'],
        },
      };
      expect(state.errors?.keyword).toHaveLength(2);
      expect(state.errors?.region).toHaveLength(1);
    });

    it('すべてのエラーフィールドが省略可能であること', () => {
      const state: SearchFormState = {
        errors: {},
      };
      expect(state.errors).toBeDefined();
      expect(state.errors?.keyword).toBeUndefined();
      expect(state.errors?.region).toBeUndefined();
    });
  });

  /**
   * 型の整合性テスト
   */
  describe('型の整合性', () => {
    it('定義されたエラーフィールドのみ使用可能であること', () => {
      const state: SearchFormState = {
        errors: {
          keyword: ['キーワードは必須です'],
          region: ['地域を選択してください'],
          academicField: ['学問分野を選択してください'],
          schedule: ['スケジュールを選択してください'],
          classification: ['分類を選択してください'],
          sortOrder: ['ソート順を選択してください'],
          page: ['ページ番号を入力してください'],
          perPage: ['表示件数を入力してください'],
        },
      };
      expect(state.errors).toBeDefined();
      expect(Object.keys(state.errors || {})).toEqual([
        'keyword',
        'region',
        'academicField',
        'schedule',
        'classification',
        'sortOrder',
        'page',
        'perPage',
      ]);
    });
  });
});
