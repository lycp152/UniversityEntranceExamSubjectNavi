import { TestType } from '@/lib/types';
import { FORMAT_PATTERNS } from '../constants/subjectFormats';

/**
 * 科目名とテストタイプを組み合わせて表示用の文字列を生成する
 */
export const formatWithTestType = (name: string, testType: TestType): string => {
  return FORMAT_PATTERNS.TEST_TYPE(name, testType);
};
