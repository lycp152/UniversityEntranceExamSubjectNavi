/**
 * 科目別配点と割合を表示するテーブルコンポーネント
 * 共通テストと二次試験の配点、割合を科目ごとに表示
 *
 * @param {Object} props - コンポーネントのプロパティ
 * @param {UISubject} props.subjectData - 表示する科目の情報
 * @returns {JSX.Element} 科目別配点テーブルコンポーネント
 */
import { FC } from 'react';
import { UISubject } from '@/types/university-subjects';
import { tableStyles, tableLabels } from '@/features/universities/constants/table-constants';
import { calculateTotalScores } from '@/features/universities/utils/calculate-scores';
import TableRow from '@/features/universities/components/table-row';

interface SubjectScoreTableProps {
  subjectData: UISubject;
}

const SubjectScoreTable: FC<SubjectScoreTableProps> = ({ subjectData }) => {
  // 科目ごとの配点情報を取得
  const subjects = subjectData.subjects;
  // 合計点を計算
  const totals = calculateTotalScores(subjects);

  return (
    <div className="mt-4">
      {/* テーブルのタイトル */}
      <h2 className="text-lg font-semibold mb-2">{tableLabels.title}</h2>
      <div className="overflow-x-auto w-full">
        <table className="w-full border-collapse py-4 border border-gray-300">
          <thead>
            <tr>
              {/* ヘッダー行: 項目名と科目名を表示 */}
              <th className={`${tableStyles.headerCell} border-b border-gray-300`}>
                {tableLabels.header.item}
              </th>
              {Object.keys(subjects).map(subject => (
                <th key={subject} className={`${tableStyles.headerCell} border-b border-gray-300`}>
                  {subject}
                </th>
              ))}
              <th className={`${tableStyles.headerCell} border-b border-gray-300`}>
                {tableLabels.header.total}
              </th>
            </tr>
          </thead>
          <tbody>
            {/* 共通テストの配点と割合を表示 */}
            <TableRow subjects={subjects} totals={totals} type="commonTest" showRatio />
            {/* 二次試験の配点と割合を表示 */}
            <TableRow subjects={subjects} totals={totals} type="secondTest" showRatio />
            {/* 総合の配点と割合を表示 */}
            <TableRow subjects={subjects} totals={totals} type="total" showRatio />
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubjectScoreTable;
