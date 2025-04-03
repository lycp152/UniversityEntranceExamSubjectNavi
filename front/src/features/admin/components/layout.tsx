/**
 * 管理ページのレイアウトコンポーネント
 *
 * このコンポーネントは管理ページの基本レイアウトを提供し、以下の状態を処理します：
 * - ローディング状態
 * - エラー状態
 * - 空の状態
 * - 成功メッセージの表示
 *
 * @param children - レイアウト内に表示する子コンポーネント
 * @param isLoading - ローディング状態を示すフラグ
 * @param error - エラーメッセージ
 * @param isEmpty - データが空かどうかを示すフラグ
 * @param successMessage - 成功メッセージ
 */
import { ReactNode } from 'react';
import { ErrorMessage } from '@/components/errors/error-message';
import { LoadingSpinner } from '@/components/ui/feedback/loading-spinner';
import { EmptyState } from '@/components/ui/feedback/empty-state';

interface AdminLayoutProps {
  readonly children: ReactNode;
  readonly isLoading?: boolean;
  readonly error?: string | null;
  readonly isEmpty?: boolean;
  readonly successMessage?: string | null;
}

export function AdminLayout({
  children,
  isLoading,
  error,
  isEmpty,
  successMessage,
}: AdminLayoutProps) {
  // ローディング状態の場合はローディングスピナーを表示
  if (isLoading) return <LoadingSpinner />;
  // エラー状態の場合はエラーメッセージを表示
  if (error) return <ErrorMessage message={error} />;
  // 空の状態の場合は空の状態メッセージを表示
  if (isEmpty) return <EmptyState />;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">大学入試科目ナビ - 管理ページ</h1>
        </div>
      </header>
      {successMessage && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
          role="alert"
          aria-live="polite"
        >
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
