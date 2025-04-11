/**
 * スタイルユーティリティ
 * Tailwind CSSとclsxを組み合わせたスタイル管理
 *
 * @module style-utils
 * @description
 * - Tailwind CSSのクラス名の結合
 * - 条件付きクラス名の適用
 * - スタイルの重複排除
 *
 * @see {@link ./globals.css} グローバルスタイル
 * @see {@link ./error.ts} エラー関連スタイル
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 複数のクラス名を結合し、重複を排除
 * @param inputs - 結合するクラス名の配列
 * @returns 最適化されたクラス名の文字列
 * @example
 * cn('text-red-500', 'text-blue-500') -> 'text-blue-500'
 * cn('p-4', 'm-4', 'bg-white') -> 'p-4 m-4 bg-white'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
