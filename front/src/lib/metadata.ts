import { Metadata } from 'next';

const SITE_NAME = '大学入試科目ナビ';

/**
 * ページのタイトルを生成
 * @param title ページ固有のタイトル
 * @returns 完全なタイトル
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
