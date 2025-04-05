import { FC } from 'react';
import { UISubject } from '@/types/universities/university-subjects';
import { calculatePercentage } from '@/utils/math/percentage';
import { EXAM_TYPES } from '@/constants/subjects';

// 共通のスタイル定義
const tableStyles = {
  cell: 'border-b p-3',
  headerCell: 'whitespace-nowrap border-b p-3 text-center bg-gray-50 font-semibold',
  leftCell: 'border-b p-3 text-left font-semibold pl-4',
  centerCell: 'border-b p-3 text-center',
  totalCell: 'border-b p-3 text-center bg-gray-50 font-semibold',
  row: 'hover:bg-gray-50',
} as const;

// 共通の文字列定義
const tableLabels = {
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

interface SubjectScoreTableProps {
  subjectData: UISubject;
}

const SubjectScoreTable: FC<SubjectScoreTableProps> = ({ subjectData }) => {
  const subjects = subjectData.subjects;

  // 合計点の計算
  const calculateTotalScores = () => {
    const commonTestTotal = Object.values(subjects).reduce(
      (sum, subject) => sum + subject.commonTest,
      0
    );
    const secondTestTotal = Object.values(subjects).reduce(
      (sum, subject) => sum + subject.secondTest,
      0
    );
    const total = commonTestTotal + secondTestTotal;
    return { commonTest: commonTestTotal, secondTest: secondTestTotal, total };
  };

  const totals = calculateTotalScores();

  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold mb-2">{tableLabels.title}</h2>
      <div className="overflow-x-auto w-full">
        <table className="w-full border-collapse py-4 border">
          <thead>
            <tr>
              <th className={tableStyles.headerCell}>{tableLabels.header.item}</th>
              {Object.keys(subjects).map(subject => (
                <th key={subject} className={tableStyles.headerCell}>
                  {subject}
                </th>
              ))}
              <th className={tableStyles.headerCell}>{tableLabels.header.total}</th>
            </tr>
          </thead>
          <tbody>
            <tr className={tableStyles.row}>
              <td className={tableStyles.leftCell}>{tableLabels.rows.commonTest.score}</td>
              {Object.entries(subjects).map(([subject, scores]) => (
                <td key={subject} className={tableStyles.centerCell}>
                  {scores.commonTest}
                </td>
              ))}
              <td className={tableStyles.totalCell}>{totals.commonTest}</td>
            </tr>
            <tr className={tableStyles.row}>
              <td className={tableStyles.leftCell}>{tableLabels.rows.ratio}</td>
              {Object.entries(subjects).map(([subject, scores]) => (
                <td key={subject} className={tableStyles.centerCell}>
                  {calculatePercentage(scores.commonTest, totals.total).toFixed(1)}%
                </td>
              ))}
              <td className={tableStyles.totalCell}>
                {calculatePercentage(totals.commonTest, totals.total).toFixed(1)}%
              </td>
            </tr>
            <tr className={tableStyles.row}>
              <td className={tableStyles.leftCell}>{tableLabels.rows.secondTest.score}</td>
              {Object.entries(subjects).map(([subject, scores]) => (
                <td key={subject} className={tableStyles.centerCell}>
                  {scores.secondTest}
                </td>
              ))}
              <td className={tableStyles.totalCell}>{totals.secondTest}</td>
            </tr>
            <tr className={tableStyles.row}>
              <td className={tableStyles.leftCell}>{tableLabels.rows.ratio}</td>
              {Object.entries(subjects).map(([subject, scores]) => (
                <td key={subject} className={tableStyles.centerCell}>
                  {calculatePercentage(scores.secondTest, totals.total).toFixed(1)}%
                </td>
              ))}
              <td className={tableStyles.totalCell}>
                {calculatePercentage(totals.secondTest, totals.total).toFixed(1)}%
              </td>
            </tr>
            <tr className={tableStyles.row}>
              <td className={tableStyles.leftCell}>{tableLabels.rows.total.score}</td>
              {Object.entries(subjects).map(([subject, scores]) => (
                <td key={subject} className={tableStyles.centerCell}>
                  {scores.commonTest + scores.secondTest}
                </td>
              ))}
              <td className={tableStyles.totalCell}>{totals.total}</td>
            </tr>
            <tr className={tableStyles.row}>
              <td className={tableStyles.leftCell}>{tableLabels.rows.ratio}</td>
              {Object.entries(subjects).map(([subject, scores]) => (
                <td key={subject} className={tableStyles.centerCell}>
                  {calculatePercentage(scores.commonTest + scores.secondTest, totals.total).toFixed(
                    1
                  )}
                  %
                </td>
              ))}
              <td className={tableStyles.totalCell}>100.0%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubjectScoreTable;
