/**
 * フォーマットパターンの定義
 * 表示用の文字列フォーマットを定義
 */
export const FORMAT_PATTERNS = {
  /** テストタイプに基づくフォーマット */
  TEST_TYPE: (name: string, testType: string) => {
    return testType === 'common' ? `${name}(共通)` : `${name}(二次)`;
  },
} as const;
