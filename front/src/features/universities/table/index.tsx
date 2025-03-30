import { FC } from 'react';
import styles from './SubjectScoreTable.module.css';
import { UISubject } from '@/types/universities/university-subjects';
import { calculatePercentage } from '@/utils/math/percentage';

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
      <h2 className="text-lg font-semibold mb-2">科目別配点と割合</h2>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className="whitespace-nowrap border-b">項目</th>
              {Object.keys(subjects).map(subject => (
                <th key={subject} className="whitespace-nowrap border-b">
                  {subject}
                </th>
              ))}
              <th className="whitespace-nowrap border-b">合計</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-gray-50">
              <td className="border-b">共通テスト配点</td>
              {Object.entries(subjects).map(([subject, scores]) => (
                <td key={subject} className="border-b">
                  {scores.commonTest}
                </td>
              ))}
              <td className="border-b">{totals.commonTest}</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="border-b">配点割合</td>
              {Object.entries(subjects).map(([subject, scores]) => (
                <td key={subject} className="border-b">
                  {calculatePercentage(scores.commonTest, totals.total).toFixed(1)}%
                </td>
              ))}
              <td className="border-b">
                {calculatePercentage(totals.commonTest, totals.total).toFixed(1)}%
              </td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="border-b">二次試験配点</td>
              {Object.entries(subjects).map(([subject, scores]) => (
                <td key={subject} className="border-b">
                  {scores.secondTest}
                </td>
              ))}
              <td className="border-b">{totals.secondTest}</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="border-b">配点割合</td>
              {Object.entries(subjects).map(([subject, scores]) => (
                <td key={subject} className="border-b">
                  {calculatePercentage(scores.secondTest, totals.total).toFixed(1)}%
                </td>
              ))}
              <td className="border-b">
                {calculatePercentage(totals.secondTest, totals.total).toFixed(1)}%
              </td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="border-b">総配点</td>
              {Object.entries(subjects).map(([subject, scores]) => (
                <td key={subject} className="border-b">
                  {scores.commonTest + scores.secondTest}
                </td>
              ))}
              <td className="border-b">{totals.total}</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="border-b">配点割合</td>
              {Object.entries(subjects).map(([subject, scores]) => (
                <td key={subject} className="border-b">
                  {calculatePercentage(scores.commonTest + scores.secondTest, totals.total).toFixed(
                    1
                  )}
                  %
                </td>
              ))}
              <td className="border-b">100.0%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubjectScoreTable;
