export const FORMAT_PATTERNS = {
  // 共通テスト用のフォーマット
  COMMON: {
    ENGLISH: (subject: string) => `${subject}(共通)`,
    DEFAULT: (subject: string) => `${subject}(共通)`,
  },
  // 二次試験用のフォーマット
  SECONDARY: {
    ENGLISH: (subject: string) => `${subject}(二次)`,
    DEFAULT: (subject: string) => `${subject}(二次)`,
  },
  // テストタイプに基づくフォーマット
  TEST_TYPE: (name: string, testType: string) => {
    return `${name}(${testType})`;
  },
} as const;
