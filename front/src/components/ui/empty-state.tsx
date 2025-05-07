'use client';

import { FileQuestion } from 'lucide-react';

/**
 * 空の状態を表示するコンポーネント
 *
 * @module empty-state
 * @description
 * データが存在しない場合や、エラーが発生した場合に表示するフィードバックコンポーネントです。
 * アイコンとメッセージを表示します。
 *
 * @features
 * - アクセシビリティ対応
 * - カスタマイズ可能なテキスト
 * - テーマカラー対応
 */
export const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <FileQuestion className="w-12 h-12 text-gray-400 mb-4" data-testid="empty-state-icon" />
      <h3 className="text-xl text-gray-500 dark:text-gray-400">データが見つかりませんでした。</h3>
      <p className="mt-2 text-gray-500 dark:text-gray-400">
        現在、データベースに大学情報が登録されていません。
      </p>
    </div>
  );
};
