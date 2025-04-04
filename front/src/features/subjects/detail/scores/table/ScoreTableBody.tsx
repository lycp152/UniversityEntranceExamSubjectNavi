import { FC, memo } from "react";
import type {
  SubjectScore,
  SubjectScoreDetail,
  ScoreMetrics,
} from "@/types/score";
import { TEST_TYPES } from "@/types/score";

interface ScoreTableBodyProps {
  scores: Record<string, SubjectScore>;
  calculatedScores: Record<string, SubjectScoreDetail>;
  sortedSubjects: string[];
  totals: {
    [TEST_TYPES.COMMON]: number;
    [TEST_TYPES.SECONDARY]: number;
    total: number;
  } | null;
}

const ScoreCell: FC<{ data: ScoreMetrics; label: string }> = memo(
  ({ data, label }) => (
    <td className="whitespace-nowrap px-3 py-4 text-right text-sm text-gray-900">
      <span aria-label={`${label}の点数: ${data.score}点`}>{data.score}</span>
      <span
        className="text-gray-500 text-xs ml-1"
        aria-label={`割合: ${data.percentage}%`}
      >
        ({data.percentage}%)
      </span>
    </td>
  )
);

ScoreCell.displayName = "ScoreCell";

const ScoreTableBody: FC<ScoreTableBodyProps> = memo(
  ({ calculatedScores, sortedSubjects }) => {
    if (!calculatedScores) return null;

    return (
      <tbody className="divide-y divide-gray-200 bg-white">
        {sortedSubjects.map((subject) => {
          const score = calculatedScores[subject];
          return (
            <tr key={subject} className="hover:bg-gray-50">
              <th
                scope="row"
                className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6"
              >
                {subject}
              </th>
              <ScoreCell data={score.commonTest} label="共通テスト" />
              <ScoreCell data={score.secondaryTest} label="個別試験" />
              <ScoreCell data={score.total} label="合計" />
            </tr>
          );
        })}
      </tbody>
    );
  }
);

ScoreTableBody.displayName = "ScoreTableBody";

export default ScoreTableBody;
