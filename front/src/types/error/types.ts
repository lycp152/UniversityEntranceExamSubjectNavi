/**
 * @fileoverview エラーハンドリング関連の型定義
 *
 * @description
 * TypeScriptの型定義ファイルで、エラーハンドリング関連のコンポーネントで使用する
 * インターフェースと型を定義します。
 *
 * @example
 * ```tsx
 * interface ErrorBoundaryProps {
 *   children: ReactNode;
 *   fallback?: ReactNode;
 *   onError?: (error: Error, errorInfo: ErrorInfo) => void;
 * }
 * ```
 */

/**
 * ErrorBoundaryコンポーネントのProps型定義
 * @property {ReactNode} children - エラーバウンダリーで保護する子コンポーネント
 * @property {ReactNode} [fallback] - エラー発生時に表示するフォールバックUI
 * @property {(error: Error, errorInfo: ErrorInfo) => void} [onError] - エラー発生時のコールバック関数
 * @property {() => void} [onReset] - エラー状態リセット時のコールバック関数
 */

import { ReactNode, ErrorInfo } from 'react';
import { errorVariants } from '../../styles/error';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

/**
 * ErrorBoundaryコンポーネントのState型定義
 * @property {Error | null} error - 発生したエラーオブジェクト
 * @property {ErrorInfo | null} errorInfo - エラーに関する追加情報
 */
export interface ErrorBoundaryState {
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * DefaultErrorFallbackコンポーネントのProps型定義
 * @property {Error | null} error - 表示するエラーオブジェクト
 * @property {ErrorInfo | null} errorInfo - エラーに関する追加情報
 * @property {() => void} onRetry - 再試行時のコールバック関数
 */
export interface DefaultErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onRetry: () => void;
}

/**
 * ErrorMessageコンポーネントのProps型定義
 * @property {string} message - 表示するエラーメッセージ
 * @property {keyof typeof errorVariants} [variant='default'] - エラーメッセージのスタイルバリアント
 */
export interface ErrorMessageProps {
  message: string;
  variant?: keyof typeof errorVariants;
}
