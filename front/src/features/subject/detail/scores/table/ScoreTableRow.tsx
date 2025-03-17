import { FC, memo } from 'react';

interface ScoreData {
  score: number;
  percentage: number;
}

interface CalculatedScore {
  commonTest: ScoreData;
  secondTest: ScoreData;
  total: ScoreData;
}

interface ScoreTableRowProps {
  subject: string;
  score: CalculatedScore;
}

const ScoreCell: FC<{ data: ScoreData; label: string }> = memo(({ data, label }) => (
  <td
    className="whitespace-nowrap px-3 py-4 text-right text-sm text-gray-900"
    role="gridcell"
    tabIndex={0}
  >
    <span aria-label={`${label}の点数: ${data.score}点`}>{data.score}</span>
    <span className="text-gray-500 text-xs ml-1" aria-label={`割合: ${data.percentage}%`}>
      ({data.percentage}%)
    </span>
  </td>
));

ScoreCell.displayName = 'ScoreCell';

const ScoreTableRow: FC<ScoreTableRowProps> = memo(({ subject, score }) => (
  <tr className="hover:bg-gray-50" role="row">
    <th
      scope="row"
      className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6"
      tabIndex={0}
    >
      {subject}
    </th>
    <ScoreCell data={score.commonTest} label="共通テスト" />
    <ScoreCell data={score.secondTest} label="二次試験" />
    <ScoreCell data={score.total} label="合計" />
  </tr>
));

ScoreTableRow.displayName = 'ScoreTableRow';

export default ScoreTableRow;
