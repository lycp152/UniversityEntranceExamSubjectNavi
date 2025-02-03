import { PatternConfig } from './types';
import { PATTERN_CONFIG, createPattern } from './pattern';

export const TEST_TYPE_PATTERNS: Record<string, PatternConfig> = {
  共通: {
    color: '#4169E1',
    pattern: {
      width: PATTERN_CONFIG.size,
      height: PATTERN_CONFIG.size,
      content: (color: string) =>
        createPattern(
          color,
          `<line x1="0" y1="4" x2="${PATTERN_CONFIG.size}" y2="4"
          stroke="white"
          strokeWidth="${PATTERN_CONFIG.strokeWidth}"
          strokeOpacity="${PATTERN_CONFIG.opacity}" />`
        ),
    },
  },
  二次: {
    color: '#A9A9A9',
    pattern: {
      width: PATTERN_CONFIG.size,
      height: PATTERN_CONFIG.size,
      content: (color: string) =>
        createPattern(
          color,
          '' // 模様なし（背景色のみ）
        ),
    },
  },
} as const;

export const TEST_TYPE_COLORS = Object.fromEntries(
  Object.entries(TEST_TYPE_PATTERNS).map(([key, value]) => [key, value.color])
) as Record<keyof typeof TEST_TYPE_PATTERNS, string>;
