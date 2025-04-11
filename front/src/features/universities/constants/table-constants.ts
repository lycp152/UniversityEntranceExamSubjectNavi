import { EXAM_TYPES } from '@/constants/constraint/exam-types';

/**
 * テーブルのスタイル定義
 * セル、ヘッダー、行のスタイルを定義
 * Tailwind CSSのクラスを使用
 */
export const tableStyles = {
  cell: 'border-b p-3',
  headerCell: 'whitespace-nowrap border-b p-3 text-center bg-gray-50 font-semibold',
  leftCell: 'border-b p-3 text-left font-semibold pl-4',
  centerCell: 'border-b p-3 text-center',
  totalCell: 'border-b p-3 text-center bg-gray-50 font-semibold',
  row: 'hover:bg-gray-50',
} as const;

/**
 * テーブルのラベル定義
 * タイトル、ヘッダー、行のラベルを定義
 * 共通テスト、二次試験、総合の配点と割合を表示
 */
export const tableLabels = {
  title: '科目別配点と割合',
  header: {
    item: '項目',
    total: '合計',
  },
  rows: {
    commonTest: {
      score: `${EXAM_TYPES.COMMON.formalName}配点`,
    },
    secondTest: {
      score: `${EXAM_TYPES.SECONDARY.formalName}配点`,
    },
    total: {
      score: '総配点',
    },
    ratio: '配点割合',
  },
} as const;
