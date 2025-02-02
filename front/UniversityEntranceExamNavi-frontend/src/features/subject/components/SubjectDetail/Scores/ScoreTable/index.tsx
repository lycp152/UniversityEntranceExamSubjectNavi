import { FC } from 'react';
import { Subject } from '@/types';
import ScoreTableHeader from './ScoreTableHeader';
import ScoreTableBody from './ScoreTableBody';

const ScoreTable: FC<{ scores: Subject['subjects'] }> = ({ scores }) => (
  <div className="mt-4">
    <h2 className="text-lg font-semibold mb-2">科目別配点と割合</h2>
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300">
        <ScoreTableHeader scores={scores} />
        <ScoreTableBody scores={scores} />
      </table>
    </div>
  </div>
);

export default ScoreTable;
