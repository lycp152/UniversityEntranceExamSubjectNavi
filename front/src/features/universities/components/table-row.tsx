import { FC, useMemo } from 'react';
import { UISubject } from '@/types/university-subject';
import { calculatePercentage } from '@/utils/percentage';
import { EXAM_TYPES } from '@/constants/constraint/exam-types';
import { TableRow as UITableRow, TableCell } from '@/components/ui/table';

/**
 * テーブルのラベル定義
 * タイトル、ヘッダー、行のラベルを定義
 * 共通テスト、二次試験、総合の配点と割合を表示
 */
const tableLabels = {
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

/**
 * テーブルのスタイル定義
 * セル、ヘッダー、行のスタイルを定義
 * Tailwind CSSのクラスを使用
 */
const tableStyles = {
  leftCell:
    'border-b-2 text-base text-left font-semibold pl-3 hover:bg-muted/100 dark:hover:bg-muted/50',
  centerCell: 'border-b-2 text-base text-center hover:bg-muted/100 dark:hover:bg-muted/50',
  totalCell: 'border-b-2 text-base text-center bg-muted/100 dark:bg-muted/50',
  scoreRow: 'border-t-2',
  scoreCell: 'pt-2 pb-2',
  ratioCell: 'pt-0 pb-2',
} as const;

type ScoreType = 'commonTest' | 'secondTest' | 'total';

interface TableRowProps {
  subjects: UISubject['subjects'];
  totals: {
    commonTest: number;
    secondTest: number;
    total: number;
  };
  type: ScoreType;
  showRatio?: boolean;
}

/**
 * 科目別配点テーブルの行コンポーネント
 * 共通テスト、二次試験、総合の配点と割合を表示
 *
 * @param {Object} props - コンポーネントのプロパティ
 * @param {UISubject['subjects']} props.subjects - 科目ごとの配点情報
 * @param {Object} props.totals - 合計点情報
 * @param {ScoreType} props.type - 表示する配点の種類
 * @param {boolean} [props.showRatio=false] - 割合を表示するかどうか
 * @returns {JSX.Element} 配点テーブルの行コンポーネント
 */
const TableRow: FC<TableRowProps> = ({ subjects, totals, type, showRatio = false }) => {
  /**
   * 指定された種類の配点を取得
   * @param {UISubject['subjects'][string]} scores - 科目の配点情報
   * @param {ScoreType} type - 取得する配点の種類
   * @returns {number} 配点
   */
  const getScore = useMemo(
    () =>
      (scores: UISubject['subjects'][string], type: ScoreType): number => {
        switch (type) {
          case 'commonTest':
            return scores.commonTest;
          case 'secondTest':
            return scores.secondTest;
          case 'total':
            return scores.commonTest + scores.secondTest;
        }
      },
    []
  );

  /**
   * 合計点を取得
   * @param {ScoreType} type - 取得する合計点の種類
   * @returns {number} 合計点
   */
  const getTotal = useMemo(
    () =>
      (type: ScoreType): number => {
        switch (type) {
          case 'commonTest':
            return totals.commonTest;
          case 'secondTest':
            return totals.secondTest;
          case 'total':
            return totals.total;
        }
      },
    [totals.commonTest, totals.secondTest, totals.total]
  );

  /**
   * 行のラベルを取得
   * @param {ScoreType} type - 取得するラベルの種類
   * @returns {string} ラベル
   */
  const getLabel = useMemo(
    () =>
      (type: ScoreType): string => {
        switch (type) {
          case 'commonTest':
            return tableLabels.rows.commonTest.score;
          case 'secondTest':
            return tableLabels.rows.secondTest.score;
          case 'total':
            return tableLabels.rows.total.score;
        }
      },
    []
  );

  const subjectEntries = useMemo(() => Object.entries(subjects), [subjects]);

  return (
    <UITableRow className={tableStyles.scoreRow}>
      <TableCell className={`${tableStyles.leftCell} ${tableStyles.scoreCell}`}>
        <span className="text-xl">{getLabel(type)}</span>
      </TableCell>
        {subjectEntries.map(([subject, scores]) => (
          <TableCell
            key={subject}
          className={`${tableStyles.centerCell} ${tableStyles.scoreCell}`}
            aria-label={`${subject}の${getLabel(type)}`}
          >
          <div className="flex flex-col items-center">
            <span className="text-[1.375rem] font-semibold">{getScore(scores, type)}</span>
            {showRatio && (
              <span className="text-base font-normal">
                {calculatePercentage(getScore(scores, type), totals.total).toFixed(1)}%
              </span>
            )}
          </div>
        </TableCell>
      ))}
            <TableCell
        className={`${tableStyles.totalCell} ${tableStyles.scoreCell}`}
        aria-label={`合計${getLabel(type)}`}
            >
        <div className="flex flex-col items-center">
          <span className="text-[1.375rem] font-semibold">{getTotal(type)}</span>
          {showRatio && (
            <span className="text-base font-normal">
            {calculatePercentage(getTotal(type), totals.total).toFixed(1)}%
            </span>
          )}
        </div>
          </TableCell>
        </UITableRow>
  );
};

export default TableRow;
