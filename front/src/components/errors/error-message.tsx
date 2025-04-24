import type { ErrorMessageProps } from '@/types/error';

/**
 * エラーメッセージを表示するコンポーネント
 *
 * @description
 * エラーメッセージを視覚的に目立たせるためのコンポーネントです。
 * FlowbiteのAlerts with iconデザインを採用しています。
 *
 * @example
 * ```tsx
 * <ErrorMessage message="データの読み込みに失敗しました" />
 * ```
 *
 * @param {ErrorMessageProps} props - コンポーネントのprops
 * @param {string} props.message - 表示するエラーメッセージ
 * @returns {JSX.Element} エラーメッセージコンポーネント
 */
export const ErrorMessage = ({ message }: ErrorMessageProps) => (
  <div
    className="flex items-center p-4 mt-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
    role="alert"
  >
    <svg
      className="flex-shrink-0 inline w-4 h-4 me-3"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
    </svg>
    <span className="sr-only">エラー</span>
    <div>
      <span className="font-medium"></span> {message}
    </div>
  </div>
);
