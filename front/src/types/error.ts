/**
 * @fileoverview
 * エラーカテゴリの型定義
 * エラーの重要度とカテゴリに関する型定義を管理*
 * エラーハンドリング関連の型定義
 *
 * @description
 * - エラーの重要度の型定義
 * - エラーのカテゴリの型定義
 * - TypeScriptの型定義ファイル、エラーハンドリング関連のコンポーネントで使用
 * - インターフェースと型を定義
 *
 * @example
 * ```tsx
 * interface ErrorBoundaryProps {
 *   children: ReactNode;
 *   fallback?: ReactNode;
 *   onError?: (error: Error, errorInfo: ErrorInfo) => void;
 * }
 * ```
 *
 * バックエンドのAPIエンドポイントと同期を保つ必要があります
 * @see back/internal/domain/models/models.go
 */

import { ReactNode, ErrorInfo } from 'react';
import { errorVariants } from '../styles/error';

/**
 * エラーの重要度を表す型
 * - error: 機能に影響する重大なエラー
 * - warning: 注意が必要だが機能は継続可能な警告
 */
export type ErrorSeverity = 'error' | 'warning';

/**
 * エラーのカテゴリを表す型
 * - validation: 入力値の検証エラー
 * - calculation: 計算関連のエラー
 * - render: 表示関連のエラー
 */
export type ErrorCategory = 'validation' | 'calculation' | 'render';

/**
 * ErrorBoundaryコンポーネントのProps型定義
 * @property {ReactNode} children - エラーバウンダリーで保護する子コンポーネント
 * @property {ReactNode} [fallback] - エラー発生時に表示するフォールバックUI
 * @property {(error: Error, errorInfo: ErrorInfo) => void} [onError] - エラー発生時のコールバック関数
 * @property {() => void} [onReset] - エラー状態リセット時のコールバック関数
 */
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
