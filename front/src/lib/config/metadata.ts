/**
 * メタデータ生成機能
 * ページのタイトルやメタデータを生成するユーティリティ
 *
 * @module metadata
 * @description
 * - ページタイトルの生成
 * - メタデータの生成
 * - SEO対策のための基本設定
 * @see {@link ./env.ts} 環境変数の設定と検証
 */

import { Metadata } from 'next';

const SITE_NAME = '大学入試科目ナビ';

/**
 * ページのタイトルを生成
 * @param title ページ固有のタイトル
 * @returns 完全なタイトル
 * @see {@link ./env.ts} 環境変数の設定と検証
 */
export function generateTitle(title: string): string {
  return `${title} | ${SITE_NAME}`;
}

/**
 * ページのメタデータを生成
 * @param title ページ固有のタイトル
 * @param description ページの説明
 * @param options 追加のオプション
 * @returns メタデータ
 * @see {@link ./env.ts} 環境変数の設定と検証
 */
export function generateMetadata(
  title: string,
  description: string,
  options: Partial<Metadata> = {}
): Metadata {
  return {
    title: generateTitle(title),
    description,
    ...options,
  };
}
