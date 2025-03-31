/**
 * エラーカテゴリの型定義
 * エラーの重要度とカテゴリに関する型定義を管理
 *
 * @module error-categories
 * @description
 * - エラーの重要度の型定義
 * - エラーのカテゴリの型定義
 */

/**
 * エラーの重要度を表す型
 * - critical: システム全体に影響する致命的なエラー
 * - error: 機能に影響する重大なエラー
 * - warning: 注意が必要だが機能は継続可能な警告
 * - info: 参考情報として表示する軽微な通知
 */
export type ErrorSeverity = 'critical' | 'error' | 'warning' | 'info';

/**
 * エラーのカテゴリを表す型
 * - validation: 入力値の検証エラー
 * - business: ビジネスロジックの違反エラー
 * - system: システム内部のエラー
 * - network: 通信関連のエラー
 * - security: セキュリティ関連のエラー
 * - performance: パフォーマンス関連の警告
 */
export type ErrorCategory =
  | 'validation'
  | 'business'
  | 'system'
  | 'network'
  | 'security'
  | 'performance';
