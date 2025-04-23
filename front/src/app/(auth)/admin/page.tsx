/**
 * 管理ページコンポーネント
 *
 * 管理者向けの機能を提供します。
 * - 大学・学部情報の管理
 * - 認証された管理者のみアクセス可能
 * - 非インデックス設定
 */
import { Metadata } from 'next';
import { AdminPage } from '@/features/admin/components/page';
import { generateMetadata } from '@/lib/config/metadata';

// ページのメタデータ設定
export const metadata: Metadata = generateMetadata(
  '管理ページ',
  '大学入試科目ナビの管理ページです。大学・学部の情報を管理できます。',
  {
    robots: {
      index: false,
      follow: false,
    },
  }
);

export default function Page() {
  return <AdminPage />;
}
