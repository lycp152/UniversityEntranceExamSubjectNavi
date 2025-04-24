/**
 * 管理ページのレイアウトコンポーネント
 *
 * このコンポーネントは管理ページの基本レイアウトを提供し、以下の状態を処理します：
 * - ローディング状態
 * - エラー状態
 * - 空の状態
 * - 成功メッセージの表示
 */
import type { AdminLayoutProps } from '../types/admin-layout';
import { ErrorMessage } from '@/components/errors/error-message';
import { Spinner } from '@/components/ui/feedback/spinner';
import { EmptyState } from '@/components/ui/empty-state';

export function AdminLayout({
  children,
  isLoading,
  error,
  isEmpty,
  successMessage,
}: Readonly<AdminLayoutProps>) {
  // ローディング状態の場合はローディングスピナーを表示
  if (isLoading) return <Spinner />;
  // エラー状態の場合はエラーメッセージを表示
  if (error) return <ErrorMessage message={error} />;
  // 空の状態の場合は空の状態メッセージを表示
  if (isEmpty) return <EmptyState />;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-background">
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
