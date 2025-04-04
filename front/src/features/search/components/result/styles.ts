/**
 * 検索結果テーブルのスタイル定義
 *
 * @property container - テーブル全体のコンテナスタイル
 * @property title - テーブルタイトルのスタイル
 * @property tableWrapper - テーブルのスクロール用ラッパースタイル
 * @property table - テーブル要素のベーススタイル
 * @property th - テーブルヘッダーセルのスタイル
 * @property td - テーブルデータセルのスタイル
 * @property row - テーブル行のスタイル（ホバー効果含む）
 */
export const tableStyles = {
  container: 'bg-white shadow p-4',
  title: 'text-xl font-bold mb-4',
  tableWrapper: 'overflow-x-auto',
  table: 'min-w-full bg-white border border-gray-300',
  th: 'py-2 px-4 border-b text-left whitespace-nowrap',
  td: 'py-2 px-4 border-b whitespace-nowrap',
  row: 'cursor-pointer hover:bg-gray-100',
} as const;
