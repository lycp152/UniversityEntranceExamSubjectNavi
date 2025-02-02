/**
 * バリデーションエラーコードの定義
 */
export const ValidationErrorCodes = {
  /** 無効な数値 */
  INVALID_NUMBER: "INVALID_NUMBER",
  /** 無効なメタデータ */
  INVALID_METADATA: "INVALID_METADATA",
  /** 無効な検証結果 */
  INVALID_RESULT: "INVALID_RESULT",
  /** キャッシュ操作エラー */
  CACHE_ERROR: "CACHE_ERROR",
  /** パラメータエラー */
  INVALID_PARAMS: "INVALID_PARAMS",
} as const;

export type ValidationErrorCode =
  (typeof ValidationErrorCodes)[keyof typeof ValidationErrorCodes];

/**
 * バリデーション結果のメタデータを表す型
 */
export interface ValidationMetadata {
  /** バリデーション実行時のタイムスタンプ（ミリ秒） */
  validatedAt: number;
  /** 適用されたバリデーションルール */
  rules: string[];
}

/**
 * キャッシュストレージのオプション
 */
export interface StorageOptions {
  /** キャッシュの有効期限（ミリ秒） */
  ttl?: number;
}

/**
 * キャッシュストレージの操作を定義するインターフェース
 */
export interface StorageProvider {
  /** キャッシュからデータを取得 */
  get(key: string): Promise<string | null>;
  /** キャッシュにデータを保存 */
  set(key: string, value: string, options?: StorageOptions): Promise<void>;
  /** 全てのキャッシュをクリア */
  flushAll(): Promise<void>;
}

/**
 * キャッシュの設定オプション
 */
export interface CacheOptions {
  /** キャッシュの有効期限（ミリ秒） */
  ttl: number;
  /** カスタムストレージプロバイダー */
  storage?: StorageProvider;
  /** キャッシュの最大サイズ */
  maxCacheSize?: number;
}
