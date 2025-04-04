import { ReactNode } from "react";
import { ErrorMessage } from "@/components/errors/error-message";
import { LoadingSpinner } from "@/components/ui/feedback/loading-spinner";
import { EmptyState } from "@/components/ui/feedback/empty-state";

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
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (isEmpty) return <EmptyState />;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">
            大学入試科目ナビ - 管理ページ
          </h1>
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
      <main className="container mx-auto px-4 py-8" role="main">
        {children}
      </main>
    </div>
  );
}
