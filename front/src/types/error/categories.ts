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
