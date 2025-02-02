'use client';

import { Subject } from '@/features/data/types';
import { subjects, titleData } from '@/features/data/SubjectData';
import { tableStyles } from './SearchResultTable/styles';

const SearchResultTable = () => {
  // タイトルの生成
  const title = `${titleData.testType} の ${titleData.subject} の配点比率が${titleData.attribute}大学(${titleData.schedule}期)`;

  // 行クリック時のハンドラ
  const handleRowClick = (universityId: number, departmentId: number, subjectId: number) => {
    const url = `/universities/${universityId}/departments/${departmentId}/subjects/${subjectId}`;
    window.open(url, '_blank');
  };

  return (
    <div className={tableStyles.container}>
      <h2 className={tableStyles.title}>{title}</h2>
      <div className={tableStyles.tableWrapper}>
        <table className={tableStyles.table}>
          <thead>
            <tr>
              <th className={tableStyles.th}>順位</th>
              <th className={tableStyles.th}>比率（%）</th>
              <th className={tableStyles.th}>大学名</th>
              <th className={tableStyles.th}>学部・募集枠</th>
              <th className={tableStyles.th}>学科・専攻・募集枠</th>
              <th className={tableStyles.th}>日程</th>
              <th className={tableStyles.th}>募集人員</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject: Subject) => (
              <tr
                key={subject.subjectId}
                className={tableStyles.row}
                onClick={() =>
                  handleRowClick(subject.universityId, subject.departmentId, subject.subjectId)
                }
              >
                <td className={tableStyles.td}>{subject.rank}</td>
                <td className={tableStyles.td}>{subject.subjectRatio} %</td>
                <td className={tableStyles.td}>{subject.universityName}</td>
                <td className={tableStyles.td}>{subject.department}</td>
                <td className={tableStyles.td}>{subject.major}</td>
                <td className={tableStyles.td}>{subject.schedule}</td>
                <td className={tableStyles.td}>{subject.enrollment} 名</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SearchResultTable;
