/**
 * 大学の状態を表す定数
 * 大学のアクティブ状態、非アクティブ状態、保留状態、削除状態を定義
 */
export const UNIVERSITY_STATUS = {
  /** アクティブな状態：通常の運用中 */
  ACTIVE: "active",
  /** 非アクティブな状態：一時的に利用不可 */
  INACTIVE: "inactive",
  /** 保留状態：審査中や確認待ち */
  PENDING: "pending",
  /** 削除状態：論理削除された状態 */
  DELETED: "deleted",
} as const;

/** 大学の状態を表す型 */
export type UniversityStatus =
  (typeof UNIVERSITY_STATUS)[keyof typeof UNIVERSITY_STATUS];

/**
 * データの取得状態を表す定数
 * データ取得の待機中、取得中、成功、エラーなどの状態を定義
 */
export const FETCH_STATUS = {
  /** 待機中：初期状態や操作待ち */
  IDLE: "idle",
  /** 取得中：データを取得している最中 */
  LOADING: "loading",
  /** 成功：データの取得が完了 */
  SUCCESS: "success",
  /** エラー：データの取得に失敗 */
  ERROR: "error",
} as const;

/** データの取得状態を表す型 */
export type FetchStatus = (typeof FETCH_STATUS)[keyof typeof FETCH_STATUS];
