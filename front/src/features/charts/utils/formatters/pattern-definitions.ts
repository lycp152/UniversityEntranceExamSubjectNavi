/**
 * チャートのパターン定義ユーティリティ
 *
 * @remarks
 * - 科目別と試験タイプ別のパターン定義を提供
 * - パターンの生成と設定を一元管理
 * - SVGパターンの属性設定を制御
 */

import { SUBJECT_CATEGORIES } from '@/constants/constraint/subjects/subject-categories';
import { EXAM_TYPES } from '@/constants/constraint/exam-types';
import { PATTERN_CONFIG } from '../../constants/pattern-config';
import { PatternConfig } from '../../types/patterns';

/**
 * パターンの属性を生成する関数
 * @param options - オプション設定
 * @param options.fill - 塗りつぶしの有無
 * @returns パターンの属性文字列
 */
export const generatePathAttributes = (options: { fill?: boolean }) => {
  if (options.fill) {
    return `fill="${PATTERN_CONFIG.strokeColor}" fillOpacity="${PATTERN_CONFIG.opacity}"`;
  }
  return `stroke="${PATTERN_CONFIG.strokeColor}" strokeWidth="${PATTERN_CONFIG.strokeWidth}" strokeOpacity="${PATTERN_CONFIG.opacity}" ${options.fill === false ? 'fill="none"' : ''}`;
};

/**
 * パターン定義を生成する関数
 * @param color - パターンの色
 * @param path - SVGパス
 * @param options - オプション設定
 * @param options.transform - パターンの変形設定
 * @param options.fill - 塗りつぶしの有無
 * @returns パターン設定
 */
export const createPatternDefinition = (
  color: string,
  path: string,
  options: {
    transform?: string;
    fill?: boolean;
  } = {}
): PatternConfig => ({
  color,
  pattern: {
    size: PATTERN_CONFIG.size,
    ...(options.transform && { transform: options.transform }),
    content: (color: string) =>
      createPattern(color, `<path d="${path}" ${generatePathAttributes(options)} />`),
  },
});

/**
 * 科目別のパターン定義
 * @property [SUBJECT_CATEGORIES.ENGLISH.category] - 英語のパターン
 * @property [SUBJECT_CATEGORIES.MATH.category] - 数学のパターン
 * @property [SUBJECT_CATEGORIES.JAPANESE.category] - 国語のパターン
 * @property [SUBJECT_CATEGORIES.SCIENCE.category] - 理科のパターン
 * @property [SUBJECT_CATEGORIES.SOCIAL.category] - 社会のパターン
 */
export const SUBJECT_PATTERNS: Record<string, PatternConfig> = {
  [SUBJECT_CATEGORIES.ENGLISH.category]: createPatternDefinition(
    SUBJECT_CATEGORIES.ENGLISH.color,
    PATTERN_CONFIG.paths.english,
    PATTERN_CONFIG.options.english
  ),
  [SUBJECT_CATEGORIES.MATH.category]: createPatternDefinition(
    SUBJECT_CATEGORIES.MATH.color,
    PATTERN_CONFIG.paths.math,
    PATTERN_CONFIG.options.math
  ),
  [SUBJECT_CATEGORIES.JAPANESE.category]: createPatternDefinition(
    SUBJECT_CATEGORIES.JAPANESE.color,
    PATTERN_CONFIG.paths.japanese,
    PATTERN_CONFIG.options.japanese
  ),
  [SUBJECT_CATEGORIES.SCIENCE.category]: createPatternDefinition(
    SUBJECT_CATEGORIES.SCIENCE.color,
    PATTERN_CONFIG.paths.science,
    PATTERN_CONFIG.options.science
  ),
  [SUBJECT_CATEGORIES.SOCIAL.category]: createPatternDefinition(
    SUBJECT_CATEGORIES.SOCIAL.color,
    PATTERN_CONFIG.paths.social,
    PATTERN_CONFIG.options.social
  ),
};

/**
 * 試験タイプ別のパターン定義
 * @property [EXAM_TYPES.COMMON.name] - 共通試験のパターン
 * @property [EXAM_TYPES.SECONDARY.name] - 二次試験のパターン
 */
export const TEST_TYPE_PATTERNS: Record<string, PatternConfig> = {
  [EXAM_TYPES.COMMON.name]: createPatternDefinition(
    EXAM_TYPES.COMMON.color,
    PATTERN_CONFIG.paths.common
  ),
  [EXAM_TYPES.SECONDARY.name]: createPatternDefinition(
    EXAM_TYPES.SECONDARY.color,
    PATTERN_CONFIG.paths.secondary
  ),
};

/**
 * パターンを生成する関数
 *
 * @param color - パターンの背景色
 * @param element - パターンのSVG要素
 * @returns パターンのSVG文字列
 *
 * @example
 * ```ts
 * createPattern("#000000", "<path d='M0,0 L10,10' />")
 * // 結果: `<rect width="10" height="10" fill="#000000" /><g opacity="0.5"><path d='M0,0 L10,10' /></g>`
 * ```
 */
export const createPattern = (color: string, element: string) => `
  <rect width="${PATTERN_CONFIG.size}" height="${PATTERN_CONFIG.size}" fill="${color}" />
  <g opacity="${PATTERN_CONFIG.opacity}">
    ${element}
  </g>
`;
