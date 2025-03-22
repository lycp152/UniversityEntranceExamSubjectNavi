/**
 * 関数の実行制御に関するユーティリティ
 *
 * このモジュールは、関数の実行を制御するためのユーティリティ関数を提供します。
 * - debounce: 連続して呼び出される関数の実行を制御し、最後の呼び出しから指定時間待ってから実行
 * - throttle: 関数の実行頻度を制限し、指定時間内の連続呼び出しを1回に制限
 *
 * 使用例：
 *
 * // 検索入力のデバウンス
 * const debouncedSearch = debounce((query: string) => {
 *   // 検索処理
 *   console.log('検索クエリ:', query);
 * }, 300);
 *
 * // スクロールイベントのスロットル
 * const throttledScroll = throttle(() => {
 *   // スクロール処理
 *   console.log('スクロール位置:', window.scrollY);
 * }, 100);
 *
 * // ウィンドウリサイズのデバウンス
 * const debouncedResize = debounce(() => {
 *   // リサイズ処理
 *   console.log('ウィンドウサイズ:', window.innerWidth);
 * }, 250);
 *
 * // マウス移動のスロットル
 * const throttledMouseMove = throttle((event: MouseEvent) => {
 *   // マウス移動処理
 *   console.log('マウス位置:', event.clientX, event.clientY);
 * }, 50);
 */

/**
 * デバウンス関数
 * 連続して呼び出される関数の実行を制御し、最後の呼び出しから指定時間待ってから実行します。
 *
 * @param func - 対象の関数
 * @param wait - 待機時間（ミリ秒）
 * @returns デバウンスされた関数
 *
 * @example
 * const debouncedSearch = debounce((query: string) => {
 *   // 検索処理
 * }, 300);
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
 * 関数の実行頻度を制限し、指定時間内の連続呼び出しを1回に制限します。
 *
 * @param func - 対象の関数
 * @param limit - 制限時間（ミリ秒）
 * @returns スロットルされた関数
 *
 * @example
 * const throttledScroll = throttle(() => {
 *   // スクロール処理
 * }, 100);
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
