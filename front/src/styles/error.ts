/**
 * @fileoverview エラーハンドリング関連の共通スタイル定義
 *
 * @description
 * Tailwind CSSのユーティリティクラスを組み合わせて、
 * エラーハンドリング関連のコンポーネントで使用する共通のスタイルを定義します。
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
    container: 'bg-red-50 border border-red-200',
    message: 'text-red-600',
    icon: 'text-red-400',
  },
  warning: {
    container: 'bg-yellow-50 border border-yellow-200',
    message: 'text-yellow-600',
    icon: 'text-yellow-400',
  },
} as const;

export const fallbackStyles = {
  container: 'min-h-screen flex items-center justify-center bg-gray-100',
  card: 'max-w-md w-full p-6 bg-white rounded-lg shadow-lg',
  title: 'text-2xl font-bold mb-4',
  message: 'text-gray-600 mb-4',
  errorDetails: 'text-sm font-mono bg-gray-100 p-2 rounded',
  errorStack: 'text-xs font-mono bg-gray-100 p-2 mt-2 rounded overflow-auto',
  buttonContainer: 'flex justify-end',
} as const;
