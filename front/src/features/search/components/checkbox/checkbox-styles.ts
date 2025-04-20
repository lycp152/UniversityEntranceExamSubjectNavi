/**
 * チェックボックスコンポーネントのスタイル定義
 *
 * このファイルは、チェックボックス関連のコンポーネントで使用される
 * 共通のスタイル定義を提供します。
 */
export const checkboxStyles = {
  /** チェックボックスコンテナのスタイル */
  checkboxContainer: 'flex items-center space-x-2 mb-1 mr-4',

  /** グループ関連のスタイル */
  groupContainer: 'mt-2 mb-4',
  groupLabel: 'block mb-2 text-gray-700 dark:text-gray-300',
  itemsContainer: 'flex flex-wrap ml-2',

  /** アイテム関連のスタイル */
  itemContainer: 'flex-1 min-w-[150px]',
  categoryItemsContainer: 'ml-4',
} as const;
