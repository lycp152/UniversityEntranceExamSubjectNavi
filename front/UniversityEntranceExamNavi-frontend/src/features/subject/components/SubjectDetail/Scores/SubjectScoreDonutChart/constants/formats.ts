import { TestType } from '@/lib/types';

type FormatFunction = {
  TEST_TYPE: (name: string, type: TestType) => string;
};

export const FORMAT_PATTERNS: FormatFunction = {
  TEST_TYPE: (name, type) => `${name}(${type})`,
} as const;
