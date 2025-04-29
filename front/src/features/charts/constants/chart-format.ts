import { EXAM_TYPES } from '@/constants/constraint/exam-types';

/**
 * テストタイプの定義
 */
type TestType = 'common' | 'secondary';

/**
 * フォーマットパターンの定義
 * 表示用の文字列フォーマットを定義
 */
export const FORMAT_PATTERNS = {
  /** テストタイプに基づくフォーマット */
  TEST_TYPE: (name: string | null | undefined, testType: string): string => {
    const displayName = name ?? '';
    const normalizedTestType = testType.toLowerCase() as TestType;

    if (normalizedTestType !== 'common' && normalizedTestType !== 'secondary') {
      return `${displayName}(${EXAM_TYPES.SECONDARY.name})`;
    }

    return normalizedTestType === 'common'
      ? `${displayName}(${EXAM_TYPES.COMMON.name})`
      : `${displayName}(${EXAM_TYPES.SECONDARY.name})`;
  },
} as const;
