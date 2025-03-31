/**
 * アプリケーションの状態定義モジュール
 * 大学の状態やデータ取得状態などの定数を定義
 *
 * @module status
 * @description
 * - 大学のアクティブ状態、非アクティブ状態などの定義
 * - データ取得の待機中、取得中などの状態定義
 * - 型安全な状態管理のための型定義
 */

/**
 * 大学の状態を表す定数
 *
 * @constant {Object} UNIVERSITY_STATUS
 * @property {string} ACTIVE - アクティブな状態：通常の運用中
 * @property {string} INACTIVE - 非アクティブな状態：一時的に利用不可
 * @property {string} PENDING - 保留状態：審査中や確認待ち
 * @property {string} DELETED - 削除状態：論理削除された状態
 */
export const UNIVERSITY_STATUS = {
  /** アクティブな状態：通常の運用中 */
  ACTIVE: 'active',
  /** 非アクティブな状態：一時的に利用不可 */
  INACTIVE: 'inactive',
  /** 保留状態：審査中や確認待ち */
  PENDING: 'pending',
  /** 削除状態：論理削除された状態 */
  DELETED: 'deleted',
} as const;

/**
 * 大学の状態を表す型
 * UNIVERSITY_STATUSの値の型を定義
 */
export type UniversityStatus = (typeof UNIVERSITY_STATUS)[keyof typeof UNIVERSITY_STATUS];

/**
 * データの取得状態を表す定数
 *
 * @constant {Object} FETCH_STATUS
 * @property {string} IDLE - 待機中：初期状態や操作待ち
 * @property {string} LOADING - 取得中：データを取得している最中
 * @property {string} SUCCESS - 成功：データの取得が完了
 * @property {string} ERROR - エラー：データの取得に失敗
 */
export const FETCH_STATUS = {
  /** 待機中：初期状態や操作待ち */
  IDLE: 'idle',
  /** 取得中：データを取得している最中 */
  LOADING: 'loading',
  /** 成功：データの取得が完了 */
  SUCCESS: 'success',
  /** エラー：データの取得に失敗 */
  ERROR: 'error',
} as const;

/**
 * データの取得状態を表す型
 * FETCH_STATUSの値の型を定義
 */
export type FetchStatus = (typeof FETCH_STATUS)[keyof typeof FETCH_STATUS];
