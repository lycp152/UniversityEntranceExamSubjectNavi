'use client';

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
interface EmptyStateProps {
  /**
   * 表示するタイトル
   * @default "データがありません"
   */
  title?: string;
  /**
   * 表示する説明文
   * @default "表示するデータが存在しません"
   */
  description?: string;
  /**
   * アイコンの色
   * @default "gray-400"
   */
  iconColor?: string;
}

/**
 * 空の状態を表示するコンポーネント
 *
 * @param title - 表示するタイトル
 * @param description - 表示する説明文
 * @param iconColor - アイコンの色
 * @returns 空の状態を表示するJSX
 */
export const EmptyState = ({
  title = 'データがありません',
  description = '表示するデータが存在しません',
  iconColor = 'gray-400',
}: EmptyStateProps) => (
  <output
    className="flex flex-col items-center justify-center py-12"
    aria-label="データが存在しません"
  >
    <svg
      className={`w-12 h-12 text-${iconColor} mb-4`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-500">{description}</p>
  </output>
);
