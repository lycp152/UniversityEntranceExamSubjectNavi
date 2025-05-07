import { EXAM_TYPES, ExamType } from '@/constants/constraint/exam-types';

/**
 * フォーマットパターンの定義
 * 表示用の文字列フォーマットを定義
 */
export const FORMAT_PATTERNS = {
  /** テストタイプに基づくフォーマット */
  TEST_TYPE: (name: string | null | undefined, testType: ExamType): string => {
    const displayName = name ?? '';

    if (testType !== EXAM_TYPES.COMMON.name && testType !== EXAM_TYPES.SECONDARY.name) {
      return `${displayName}(${EXAM_TYPES.SECONDARY.name})`;
    }

    return testType === EXAM_TYPES.COMMON.name
      ? `${displayName}(${EXAM_TYPES.COMMON.name})`
      : `${displayName}(${EXAM_TYPES.SECONDARY.name})`;
  },
} as const;
