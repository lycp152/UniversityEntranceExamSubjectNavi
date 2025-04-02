/**
 * 管理ページコンポーネント
 *
 * 管理者向けの機能を提供します。
 * - 大学・学部情報の管理
 * - 認証された管理者のみアクセス可能
 * - 非インデックス設定
 */
import { Metadata } from 'next';
import { Suspense } from 'react';
import { AdminPage } from '@/features/admin/components/AdminPage';
import { LoadingSpinner } from '@/components/ui/feedback/loading-spinner';

// ページのメタデータ設定
export const metadata: Metadata = {
  title: '管理ページ',
  description: '大学入試科目ナビの管理ページです。大学・学部の情報を管理できます。',
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page(): JSX.Element {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AdminPage />
    </Suspense>
  );
}
