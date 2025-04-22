import { FC } from 'react';
import { UISubject } from '@/types/university-subject';
import { calculatePercentage } from '@/utils/math/percentage';
import { tableStyles, tableLabels } from '@/features/universities/constants/table-constants';

interface TableRowProps {
  subjects: UISubject['subjects'];
  totals: {
    commonTest: number;
    secondTest: number;
    total: number;
  };
  type: 'commonTest' | 'secondTest' | 'total';
  showRatio?: boolean;
}

/**
 * 科目別配点テーブルの行コンポーネント
 * 共通テスト、二次試験、総合の配点と割合を表示
 *
 * @param {Object} props - コンポーネントのプロパティ
 * @param {UISubject['subjects']} props.subjects - 科目ごとの配点情報
 * @param {Object} props.totals - 合計点情報
 * @param {'commonTest' | 'secondTest' | 'total'} props.type - 表示する配点の種類
 * @param {boolean} [props.showRatio=false] - 割合を表示するかどうか
 * @returns {JSX.Element} 配点テーブルの行コンポーネント
 */
const TableRow: FC<TableRowProps> = ({ subjects, totals, type, showRatio = false }) => {
  /**
   * 指定された種類の配点を取得
   * @param {UISubject['subjects'][string]} scores - 科目の配点情報
   * @param {TableRowProps['type']} type - 取得する配点の種類
   * @returns {number} 配点
   */
  const getScore = (scores: UISubject['subjects'][string], type: TableRowProps['type']) => {
    switch (type) {
      case 'commonTest':
        return scores.commonTest;
      case 'secondTest':
        return scores.secondTest;
      case 'total':
        return scores.commonTest + scores.secondTest;
    }
  };

  /**
   * 合計点を取得
   * @param {TableRowProps['type']} type - 取得する合計点の種類
   * @returns {number} 合計点
   */
  const getTotal = (type: TableRowProps['type']) => {
    switch (type) {
      case 'commonTest':
        return totals.commonTest;
      case 'secondTest':
        return totals.secondTest;
      case 'total':
        return totals.total;
    }
  };

  /**
   * 行のラベルを取得
   * @param {TableRowProps['type']} type - 取得するラベルの種類
   * @returns {string} ラベル
   */
  const getLabel = (type: TableRowProps['type']) => {
    switch (type) {
      case 'commonTest':
        return tableLabels.rows.commonTest.score;
      case 'secondTest':
        return tableLabels.rows.secondTest.score;
      case 'total':
        return tableLabels.rows.total.score;
    }
  };

  return (
    <>
      <tr className={tableStyles.row}>
        <td className={tableStyles.leftCell}>{getLabel(type)}</td>
        {Object.entries(subjects).map(([subject, scores]) => (
          <td key={subject} className={tableStyles.centerCell}>
            {getScore(scores, type)}
          </td>
        ))}
        <td className={tableStyles.totalCell}>{getTotal(type)}</td>
      </tr>
      {showRatio && (
        <tr className={tableStyles.row}>
          <td className={tableStyles.leftCell}>{tableLabels.rows.ratio}</td>
          {Object.entries(subjects).map(([subject, scores]) => (
            <td key={subject} className={tableStyles.centerCell}>
              {calculatePercentage(getScore(scores, type), totals.total).toFixed(1)}%
            </td>
          ))}
          <td className={tableStyles.totalCell}>
            {calculatePercentage(getTotal(type), totals.total).toFixed(1)}%
          </td>
        </tr>
      )}
    </>
  );
};

export default TableRow;
