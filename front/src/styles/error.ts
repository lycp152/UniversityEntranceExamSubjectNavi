/**
 * @fileoverview エラーハンドリング関連の共通スタイル定義
 *
 * @description
 * Tailwind CSSのユーティリティクラスを組み合わせて、
 * エラーハンドリング関連のコンポーネントで使用する共通のスタイルを定義します。
 *
 * @see {@link ../lib/api/errors/base.ts} APIエラーの基底クラス
 * @see {@link ../lib/validation/validation-messages.ts} バリデーションエラーメッセージの定義
 * @see {@link ./tailwind-utils.ts} Tailwind CSSユーティリティ
 *
 * @example
 * ```tsx
 * <div className={errorStyles.container}>
 *   <p className={errorStyles.message}>エラーメッセージ</p>
 * </div>
 * ```
 */

export const errorStyles = {
  container: 'mb-6 p-4 rounded-lg',
  message: 'text-sm',
  icon: 'h-5 w-5 mr-2',
  flex: 'flex items-center',
} as const;

export const errorVariants = {
  default: {
    container: 'bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800',
    message: 'text-red-600 dark:text-red-400',
    icon: 'text-red-400 dark:text-red-500',
  },
  warning: {
    container: 'bg-yellow-50 dark:bg-yellow-950/50 border border-yellow-200 dark:border-yellow-800',
    message: 'text-yellow-600 dark:text-yellow-400',
    icon: 'text-yellow-400 dark:text-yellow-500',
  },
} as const;

export const fallbackStyles = {
  container: 'min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900',
  card: 'w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg',
  title: 'text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2',
  message: 'text-gray-600 dark:text-gray-300 mb-2',
  errorDetails:
    'text-sm font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded text-gray-800 dark:text-gray-200',
  errorStack:
    'text-xs font-mono bg-gray-100 dark:bg-gray-700 p-2 mt-2 rounded overflow-auto text-gray-800 dark:text-gray-200',
  buttonContainer: 'flex justify-end',
} as const;
