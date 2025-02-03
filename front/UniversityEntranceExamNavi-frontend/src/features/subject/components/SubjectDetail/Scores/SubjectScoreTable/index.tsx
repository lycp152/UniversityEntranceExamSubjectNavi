import { FC } from 'react';
import { MOCK_TABLE_DATA, TOTAL_SCORES } from '@/features/subject/constants/mockData';
import styles from './SubjectScoreTable.module.css';

const SubjectScoreTable: FC = () => {
  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold mb-2">科目別配点と割合</h2>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className="whitespace-nowrap border-b">項目</th>
              {MOCK_TABLE_DATA.map((subject) => (
                <th key={subject.subject} className="whitespace-nowrap border-b">
                  {subject.subject}
                </th>
              ))}
              <th className="whitespace-nowrap border-b">合計</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-gray-50">
              <td className="border-b">共通テスト配点</td>
              {MOCK_TABLE_DATA.map((subject) => (
                <td key={subject.subject} className="border-b">
                  {subject.commonTest.score}
                </td>
              ))}
              <td className="border-b">{TOTAL_SCORES.commonTest}</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="border-b">配点割合</td>
              {MOCK_TABLE_DATA.map((subject) => (
                <td key={subject.subject} className="border-b">
                  {subject.commonTest.percentage.toFixed(1)}%
                </td>
              ))}
              <td className="border-b">100.0%</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="border-b">二次試験配点</td>
              {MOCK_TABLE_DATA.map((subject) => (
                <td key={subject.subject} className="border-b">
                  {subject.secondaryTest.score}
                </td>
              ))}
              <td className="border-b">{TOTAL_SCORES.secondaryTest}</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="border-b">配点割合</td>
              {MOCK_TABLE_DATA.map((subject) => (
                <td key={subject.subject} className="border-b">
                  {subject.secondaryTest.percentage.toFixed(1)}%
                </td>
              ))}
              <td className="border-b">100.0%</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="border-b">総配点</td>
              {MOCK_TABLE_DATA.map((subject) => (
                <td key={subject.subject} className="border-b">
                  {subject.total.score}
                </td>
              ))}
              <td className="border-b">{TOTAL_SCORES.total}</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="border-b">配点割合</td>
              {MOCK_TABLE_DATA.map((subject) => (
                <td key={subject.subject} className="border-b">
                  {subject.total.percentage.toFixed(1)}%
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
