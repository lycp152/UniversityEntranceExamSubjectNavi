/**
 * パターン生成ユーティリティ
 *
 * @remarks
 * - SVGパターンの生成を担当
 * - パターンの背景色と要素を組み合わせて生成
 * - 再利用可能なパターン生成ロジックを提供
 */

import { PATTERN_CONFIG } from '../constants/pattern-config';

/**
 * パターンの設定型定義
 */
export type PatternConfig = {
  color: string;
  pattern: {
    size: number;
    transform?: string;
    content: (color: string) => string;
  };
};

/**
 * パターンを生成する関数
 *
 * @param color - パターンの背景色
 * @param element - パターンのSVG要素
 * @returns パターンのSVG文字列
 */
export const createPattern = (color: string, element: string) => `
  <rect width="${PATTERN_CONFIG.size}" height="${PATTERN_CONFIG.size}" fill="${color}" />
  <g opacity="${PATTERN_CONFIG.opacity}">
    ${element}
  </g>
`;
