/**
 * 基本トレンドアイテムのインターフェース
 */
export interface BaseTrendItem {
  timestamp: number;
  value: number;
}

/**
 * レスポンスタイムのトレンドアイテム
 */
export interface ResponseTimeTrendItem extends BaseTrendItem {
  operation: string;
}

/**
 * エラーレートのトレンドアイテム
 */
export interface ErrorRateTrendItem extends BaseTrendItem {
  errorType: string;
}

/**
 * メモリ使用量のトレンドアイテム
 */
export interface MemoryUsageTrendItem extends BaseTrendItem {
  type: "heap" | "rss";
}

/**
 * キャッシュ効率のトレンドアイテム
 */
export interface CacheEfficiencyTrendItem {
  timestamp: number;
  hitRate: number;
  missRate: number;
}
