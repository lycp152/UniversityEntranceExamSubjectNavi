/**
 * パターン定義ユーティリティ
 *
 * @remarks
 * - 科目別と試験タイプ別のパターン定義を提供
 * - パターンの生成と設定を一元管理
 */

import { SUBJECT_CATEGORIES, EXAM_TYPES } from '@/constants/subjects';
import { PATTERN_CONFIG } from '../constants/pattern-config';
import { PatternConfig, createPattern } from './pattern-generator';

/**
 * 科目別のパターン定義
 */
export const SUBJECT_PATTERNS: Record<string, PatternConfig> = {
  [SUBJECT_CATEGORIES.ENGLISH.category]: {
    color: SUBJECT_CATEGORIES.ENGLISH.color,
    pattern: {
      size: PATTERN_CONFIG.size,
      transform: 'rotate(45)',
      content: (color: string) =>
        createPattern(
          color,
          `<line x1="0" y="0" x2="0" y2="${PATTERN_CONFIG.size}"
          stroke="${PATTERN_CONFIG.strokeColor}"
          strokeWidth="${PATTERN_CONFIG.strokeWidth}"
          strokeOpacity="${PATTERN_CONFIG.opacity}" />`
        ),
    },
  },
  [SUBJECT_CATEGORIES.MATH.category]: {
    color: SUBJECT_CATEGORIES.MATH.color,
    pattern: {
      size: PATTERN_CONFIG.size,
      content: (color: string) =>
        createPattern(
          color,
          `<circle cx="4" cy="4" r="1.5"
          fill="${PATTERN_CONFIG.strokeColor}"
          fillOpacity="${PATTERN_CONFIG.opacity}" />`
        ),
    },
  },
  [SUBJECT_CATEGORIES.JAPANESE.category]: {
    color: SUBJECT_CATEGORIES.JAPANESE.color,
    pattern: {
      size: PATTERN_CONFIG.size,
      content: (color: string) =>
        createPattern(
          color,
          `<path d="${PATTERN_CONFIG.paths.japanese}"
          stroke="${PATTERN_CONFIG.strokeColor}"
          strokeWidth="${PATTERN_CONFIG.strokeWidth}"
          strokeOpacity="${PATTERN_CONFIG.opacity}" />`
        ),
    },
  },
  [SUBJECT_CATEGORIES.SCIENCE.category]: {
    color: SUBJECT_CATEGORIES.SCIENCE.color,
    pattern: {
      size: PATTERN_CONFIG.size,
      content: (color: string) =>
        createPattern(
          color,
          `<path d="${PATTERN_CONFIG.paths.science}"
          stroke="${PATTERN_CONFIG.strokeColor}"
          strokeWidth="${PATTERN_CONFIG.strokeWidth}"
          strokeOpacity="${PATTERN_CONFIG.opacity}" fill="none" />`
        ),
    },
  },
  [SUBJECT_CATEGORIES.SOCIAL.category]: {
    color: SUBJECT_CATEGORIES.SOCIAL.color,
    pattern: {
      size: PATTERN_CONFIG.size,
      content: (color: string) =>
        createPattern(
          color,
          `<path d="${PATTERN_CONFIG.paths.social}"
          stroke="${PATTERN_CONFIG.strokeColor}"
          strokeWidth="${PATTERN_CONFIG.strokeWidth}"
          strokeOpacity="${PATTERN_CONFIG.opacity}" fill="none" />`
        ),
    },
  },
};

/**
 * 試験タイプ別のパターン定義
 */
export const TEST_TYPE_PATTERNS: Record<string, PatternConfig> = {
  [EXAM_TYPES.COMMON.name]: {
    color: '#4169E1',
    pattern: {
      size: PATTERN_CONFIG.size,
      content: (color: string) =>
        createPattern(
          color,
          `<line x1="0" y1="4" x2="${PATTERN_CONFIG.size}" y2="4"
          stroke="${PATTERN_CONFIG.strokeColor}"
          strokeWidth="${PATTERN_CONFIG.strokeWidth}"
          strokeOpacity="${PATTERN_CONFIG.opacity}" />`
        ),
    },
  },
  [EXAM_TYPES.SECONDARY.name]: {
    color: '#A9A9A9',
    pattern: {
      size: PATTERN_CONFIG.size,
      content: (color: string) => createPattern(color, ''),
    },
  },
};
