import ScoreTableRow from './ScoreTableRow';
import type { Subject } from '@/features/data/types';
import { SUBJECT_DISPLAY_ORDER } from '@/features/data/constants/subjects';
import { FC } from 'react';

const ScoreTable: FC<{ scores: Subject['subjects'] }> = ({ scores }) => (
  <div className="mt-4">
    <h2 className="text-lg font-semibold mb-2">科目別配点と割合</h2>
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2 whitespace-nowrap">項目</th>
            {SUBJECT_DISPLAY_ORDER.map((subjectName) => (
              <th key={subjectName} className="border border-gray-300 p-2 whitespace-nowrap">
                {subjectName}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <ScoreTableRow label="共通テスト 配点" keyName="commonTest" scores={scores} />
          <ScoreTableRow label="二次試験 配点" keyName="secondTest" scores={scores} />
        </tbody>
      </table>
    </div>
  </div>
);

export default ScoreTable;
