'use client';

/**
 * ローディングスピナーコンポーネント
 *
 * @module loading-spinner
 * @description
 * データの読み込み中に表示するフィードバックコンポーネントです。
 * アニメーション付きのスピナーとメッセージを表示します。
 *
 * @features
 * - アクセシビリティ対応
 * - カスタマイズ可能なテキスト
 * - スムーズなアニメーション
 * - スケルトンローディングオプション
 */
interface LoadingSpinnerProps {
  /**
   * 表示するメッセージ
   * @default "データを読み込んでいます..."
   */
  message?: string;
  /**
   * スピナーのサイズ（ピクセル）
   * @default 4
   */
  size?: number;
  /**
   * スケルトンローディングを使用するかどうか
   * @default false
   */
  useSkeleton?: boolean;
}

/**
 * ローディングスピナーコンポーネント
 *
 * @param message - 表示するメッセージ
 * @param size - スピナーのサイズ
 * @param useSkeleton - スケルトンローディングを使用するかどうか
 * @returns ローディングスピナーを表示するJSX
 */
export const LoadingSpinner = ({
  message = 'データを読み込んでいます...',
  size = 4,
  useSkeleton = false,
}: LoadingSpinnerProps) => {
  if (useSkeleton) {
    return (
      <div
        className="flex flex-col items-center justify-center py-12"
        role="status"
        aria-label="データを読み込み中"
      >
        <div
          className="animate-pulse bg-gray-200 rounded-full mb-4"
          style={{ width: `${size}rem`, height: `${size}rem` }}
          aria-hidden="true"
        />
        <div className="animate-pulse bg-gray-200 h-4 w-48 rounded" />
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-center py-12"
      role="status"
      aria-label="データを読み込み中"
    >
      <div
        className="animate-spin rounded-full border-b-2 border-blue-600 mb-4 motion-reduce:animate-none"
        style={{ width: `${size}rem`, height: `${size}rem` }}
        aria-hidden="true"
      />
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  );
};
