import { FC } from 'react';
import type { Subject } from '@/lib/types';

interface ScoreTableRowProps {
  label: string;
  keyName: 'commonTest' | 'secondTest';
  scores: Subject['subjects'];
  isPercentage?: boolean;
}

const ScoreTableRow: FC<ScoreTableRowProps> = ({
  label,
  keyName,
  scores,
  isPercentage = false,
}) => (
  <tr>
    <td className={`border border-gray-300 p-2 ${label === '配点合計に占める割合' ? 'pl-8' : ''}`}>
      {label}
    </td>
    {Object.entries(scores).map(([subjectName, score]) => (
      <td key={subjectName} className="border border-gray-300 p-2 text-center">
        {isPercentage ? `${score[keyName].toFixed(2)} %` : score[keyName]}
      </td>
    ))}
  </tr>
);

export default ScoreTableRow;
