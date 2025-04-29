import { describe, it, expect } from 'vitest';
import { FORMAT_PATTERNS } from './chart-format';

/**
 * テストデータの型定義
 */
type TestData = {
  name: string | null | undefined;
  testType: string;
  expected: string;
};

/**
 * テストデータ
 * 各テストケースで使用するデータを定義
 */
const TEST_DATA: Record<string, TestData> = {
  common: {
    name: '数学',
    testType: 'common',
    expected: '数学(共通)',
  },
  secondary: {
    name: '英語',
    testType: 'secondary',
    expected: '英語(二次)',
  },
  emptyName: {
    name: '',
    testType: 'common',
    expected: '(共通)',
  },
  emptyTestType: {
    name: '数学',
    testType: '',
    expected: '数学(二次)',
  },
  nullName: {
    name: null,
    testType: 'common',
    expected: '(共通)',
  },
  undefinedName: {
    name: undefined,
    testType: 'common',
    expected: '(共通)',
  },
} as const;

/**
 * フォーマットパターンのテスト
 * 表示用の文字列フォーマットの正確性を検証
 */
describe('フォーマットパターン', () => {
  describe('TEST_TYPE', () => {
    it('共通テストのフォーマットが正しいこと - 科目名とテストタイプが正しく結合される', () => {
      const { name, testType, expected } = TEST_DATA.common;
      const result = FORMAT_PATTERNS.TEST_TYPE(name, testType);
      expect(result).toBe(expected);
    });

    it('二次試験のフォーマットが正しいこと - 科目名とテストタイプが正しく結合される', () => {
      const { name, testType, expected } = TEST_DATA.secondary;
      const result = FORMAT_PATTERNS.TEST_TYPE(name, testType);
      expect(result).toBe(expected);
    });

    it('空の科目名でフォーマットできること - 空文字列が適切に処理される', () => {
      const { name, testType, expected } = TEST_DATA.emptyName;
      const result = FORMAT_PATTERNS.TEST_TYPE(name, testType);
      expect(result).toBe(expected);
    });

    it('空のテストタイプの場合、デフォルトで二次試験としてフォーマットされること - デフォルト値が正しく適用される', () => {
      const { name, testType, expected } = TEST_DATA.emptyTestType;
      const result = FORMAT_PATTERNS.TEST_TYPE(name, testType);
      expect(result).toBe(expected);
    });

    it('nullの科目名でフォーマットできること - null値が適切に処理される', () => {
      const { name, testType, expected } = TEST_DATA.nullName;
      const result = FORMAT_PATTERNS.TEST_TYPE(name, testType);
      expect(result).toBe(expected);
    });

    it('undefinedの科目名でフォーマットできること - undefined値が適切に処理される', () => {
      const { name, testType, expected } = TEST_DATA.undefinedName;
      const result = FORMAT_PATTERNS.TEST_TYPE(name, testType);
      expect(result).toBe(expected);
    });
  });
});
