import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwindのクラス名を結合するユーティリティ関数
 * @param inputs - クラス名の配列
 * @returns 結合されたクラス名
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 日付をフォーマットするユーティリティ関数
 * @param date - 日付
 * @param format - フォーマット
 * @returns フォーマットされた日付文字列
 */
export function formatDate(date: Date, format: string = "YYYY-MM-DD"): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return format
    .replace("YYYY", String(year))
    .replace("MM", month)
    .replace("DD", day);
}

/**
 * 数値を通貨形式にフォーマットするユーティリティ関数
 * @param value - 数値
 * @param locale - ロケール
 * @returns フォーマットされた通貨文字列
 */
export function formatCurrency(
  value: number,
  locale: string = "ja-JP"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "JPY",
  }).format(value);
}

/**
 * オブジェクトの深いクローンを作成するユーティリティ関数
 * @param obj - クローン対象のオブジェクト
 * @returns クローンされたオブジェクト
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 文字列を省略するユーティリティ関数
 * @param text - 対象の文字列
 * @param maxLength - 最大長
 * @returns 省略された文字列
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * 配列をチャンクに分割するユーティリティ関数
 * @param array - 対象の配列
 * @param size - チャンクサイズ
 * @returns チャンクの配列
 */
export function chunk<T>(array: T[], size: number): T[][] {
  return array.reduce((chunks, item, index) => {
    const chunkIndex = Math.floor(index / size);
    if (!chunks[chunkIndex]) {
      chunks[chunkIndex] = [];
    }
    chunks[chunkIndex].push(item);
    return chunks;
  }, [] as T[][]);
}

/**
 * デバウンス関数
 * @param func - 対象の関数
 * @param wait - 待機時間（ミリ秒）
 * @returns デバウンスされた関数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), wait);
  };
}

/**
 * スロットル関数
 * @param func - 対象の関数
 * @param limit - 制限時間（ミリ秒）
 * @returns スロットルされた関数
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
