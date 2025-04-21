/**
 * メタデータ生成機能のテスト
 *
 * @module metadata.test
 * @description
 * - タイトル生成のテスト
 * - メタデータ生成のテスト
 * - オプショナルパラメータのテスト
 */

import { describe, it, expect } from 'vitest';
import { generateTitle, generateMetadata } from './metadata';

describe('メタデータ生成機能', () => {
  describe('タイトル生成', () => {
    it('ページタイトルが正しく生成される', () => {
      const title = 'テストページ';
      const expected = 'テストページ | 大学入試科目ナビ';
      expect(generateTitle(title)).toBe(expected);
    });

    it('空のタイトルでも正しく生成される', () => {
      const title = '';
      const expected = ' | 大学入試科目ナビ';
      expect(generateTitle(title)).toBe(expected);
    });
  });

  describe('メタデータ生成', () => {
    it('基本的なメタデータが正しく生成される', () => {
      const title = 'テストページ';
      const description = 'テスト用の説明文';
      const metadata = generateMetadata(title, description);

      expect(metadata.title).toBe('テストページ | 大学入試科目ナビ');
      expect(metadata.description).toBe(description);
    });

    it('追加オプションが正しく反映される', () => {
      const title = 'テストページ';
      const description = 'テスト用の説明文';
      const options = {
        keywords: ['テスト', 'メタデータ'],
        authors: [{ name: 'テストユーザー' }],
      };

      const metadata = generateMetadata(title, description, options);

      expect(metadata.title).toBe('テストページ | 大学入試科目ナビ');
      expect(metadata.description).toBe(description);
      expect(metadata.keywords).toEqual(options.keywords);
      expect(metadata.authors).toEqual(options.authors);
    });

    it('空の説明文でも正しく生成される', () => {
      const title = 'テストページ';
      const description = '';
      const metadata = generateMetadata(title, description);

      expect(metadata.title).toBe('テストページ | 大学入試科目ナビ');
      expect(metadata.description).toBe('');
    });
  });
});
