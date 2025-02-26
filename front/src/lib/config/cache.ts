/**
 * キャッシュの設定定数
 */
export const CACHE_CONFIG = {
  /** キャッシュの有効期限（5分） */
  TTL: 5 * 60 * 1000,
  /** デバウンス時間（100ms） */
  DEBOUNCE_TIME: 100,
  /** 最大同時実行数 */
  MAX_CONCURRENT: 5,
  /** クリーンアップ間隔（1時間） */
  CLEANUP_INTERVAL: 60 * 60 * 1000,
} as const;

/**
 * リトライ設定定数
 */
export const RETRY_CONFIG = {
  /** 最大試行回数 */
  MAX_ATTEMPTS: 3,
  /** 試行間隔（ミリ秒） */
  DELAY_MS: 100,
  /** 指数バックオフの基数 */
  BACKOFF_BASE: 2,
} as const;
