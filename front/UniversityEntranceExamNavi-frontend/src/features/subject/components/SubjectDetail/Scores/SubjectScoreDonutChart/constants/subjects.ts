import { PatternConfig } from './types';
import { PATTERN_CONFIG, createPattern } from './pattern';

export const SUBJECT_PATTERNS: Record<string, PatternConfig> = {
  英語: {
    color: '#DAA520',
    pattern: {
      width: PATTERN_CONFIG.size,
      height: PATTERN_CONFIG.size,
      transform: 'rotate(45)',
      content: (color: string) =>
        createPattern(
          color,
          `<line x1="0" y="0" x2="0" y2="${PATTERN_CONFIG.size}"
          stroke="white"
          strokeWidth="${PATTERN_CONFIG.strokeWidth}"
          strokeOpacity="${PATTERN_CONFIG.opacity}" />`
        ),
    },
  },
  数学: {
    color: '#0047AB',
    pattern: {
      width: PATTERN_CONFIG.size,
      height: PATTERN_CONFIG.size,
      content: (color: string) =>
        createPattern(
          color,
          `<circle cx="4" cy="4" r="1.5"
          fill="white"
          fillOpacity="${PATTERN_CONFIG.opacity}" />`
        ),
    },
  },
  国語: {
    color: '#228B22',
    pattern: {
      width: PATTERN_CONFIG.size,
      height: PATTERN_CONFIG.size,
      content: (color: string) =>
        createPattern(
          color,
          `<path d="M0,0 L${PATTERN_CONFIG.size},${PATTERN_CONFIG.size} M${PATTERN_CONFIG.size},0 L0,${PATTERN_CONFIG.size}"
          stroke="white"
          strokeWidth="${PATTERN_CONFIG.strokeWidth}"
          strokeOpacity="${PATTERN_CONFIG.opacity}" />`
        ),
    },
  },
  理科: {
    color: '#D35400',
    pattern: {
      width: PATTERN_CONFIG.size,
      height: PATTERN_CONFIG.size,
      content: (color: string) =>
        createPattern(
          color,
          `<path d="M0,4 Q2,0 4,4 T${PATTERN_CONFIG.size},4"
          stroke="white"
          strokeWidth="${PATTERN_CONFIG.strokeWidth}"
          strokeOpacity="${PATTERN_CONFIG.opacity}" fill="none" />`
        ),
    },
  },
  地歴公: {
    color: '#C71585',
    pattern: {
      width: PATTERN_CONFIG.size,
      height: PATTERN_CONFIG.size,
      content: (color: string) =>
        createPattern(
          color,
          `<path d="M0,0 M0,${PATTERN_CONFIG.size} L${PATTERN_CONFIG.size},${PATTERN_CONFIG.size} L${PATTERN_CONFIG.size},0 L0,0"
          stroke="white"
          strokeWidth="${PATTERN_CONFIG.strokeWidth}"
          strokeOpacity="${PATTERN_CONFIG.opacity}" fill="none" />`
        ),
    },
  },
} as const;

export const SUBJECT_ORDER = ['英語L', '英語R', '数学', '国語', '理科', '地歴公'] as const;
export const BASE_SUBJECTS = ['英語', '数学', '国語', '理科', '地歴公'] as const;

export const SUBJECT_COLORS = Object.fromEntries(
  Object.entries(SUBJECT_PATTERNS).map(([key, value]) => [key, value.color])
) as Record<keyof typeof SUBJECT_PATTERNS, string>;
