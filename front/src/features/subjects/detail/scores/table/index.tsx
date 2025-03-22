import { FC, memo } from "react";
import type {
  SubjectScores,
  SubjectScoreDetail,
  BaseScore,
} from "@/features/charts/subject/donut/types/score";
import { ErrorBoundary } from "@/components/errors/error-boundary";
import { useScoreTable } from "@/features/subjects/hooks/table/useScoreTable";
import { useTableKeyboardNavigation } from "@/features/subjects/hooks/table/useTableKeyboardNavigation";
import { TEST_TYPES } from "@/types/score/score";
import type {
  SubjectScore as LibSubjectScore,
  BaseScore as LibBaseScore,
} from "@/types/score/score";
import ScoreTableHeader from "./ScoreTableHeader";
import ScoreTableBody from "./ScoreTableBody";

interface ScoreTableProps {
  scores: Record<string, LibSubjectScore>;
}

type ScoreTableTotals = {
  [TEST_TYPES.COMMON]: number;
  [TEST_TYPES.INDIVIDUAL]: number;
  total: number;
};

const convertToBaseScore = (score?: LibBaseScore): BaseScore => {
  if (!score) {
    return { value: 0, maxValue: 0 };
  }
  return {
    value: score.score,
    maxValue: 100, // デフォルト値として100を使用
  };
};

const convertToSubjectScores = (
  scores: Record<string, LibSubjectScore>
): SubjectScores => {
  const result: SubjectScores = {};
  for (const [subject, score] of Object.entries(scores)) {
    result[subject] = {
      [TEST_TYPES.COMMON]: convertToBaseScore(score[TEST_TYPES.COMMON]),
      [TEST_TYPES.INDIVIDUAL]: convertToBaseScore(score[TEST_TYPES.INDIVIDUAL]),
    };
  }
  return result;
};

interface ScoreTableContentProps extends ScoreTableProps {
  calculatedScores: Record<string, SubjectScoreDetail> | null;
  sortedSubjects: string[];
  totals: ScoreTableTotals | null;
}

const ScoreTableContent: FC<ScoreTableContentProps> = memo(
  ({ scores, calculatedScores, sortedSubjects, totals }) => {
    const tableRef = useTableKeyboardNavigation();

    if (!calculatedScores || !totals) {
      return (
        <div role="alert" className="text-red-600 p-4" aria-live="polite">
          スコアの計算中にエラーが発生しました。
        </div>
      );
    }

    return (
      <section aria-labelledby="score-table-heading" className="mt-4">
        <h2 id="score-table-heading" className="text-lg font-semibold mb-2">
          科目別配点と割合
        </h2>
        <div className="overflow-x-auto -mx-4 sm:mx-0 md:overflow-visible">
          <div className="min-w-full inline-block align-middle">
            <div className="shadow-sm ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table
                ref={tableRef}
                className="min-w-full divide-y divide-gray-300"
                aria-describedby="score-table-heading"
              >
                <ScoreTableHeader />
                <ScoreTableBody
                  scores={scores}
                  calculatedScores={calculatedScores}
                  sortedSubjects={sortedSubjects}
                  totals={totals}
                />
              </table>
            </div>
          </div>
        </div>
      </section>
    );
  }
);

ScoreTableContent.displayName = "ScoreTableContent";

const ScoreTable: FC<ScoreTableProps> = memo(({ scores }) => {
  const { calculatedScores, sortedSubjects, totals } = useScoreTable(
    convertToSubjectScores(scores)
  );

  return (
    <ErrorBoundary
      fallback={
        <div role="alert" className="text-red-600 p-4" aria-live="polite">
          スコアの表示中にエラーが発生しました。
        </div>
      }
    >
      <ScoreTableContent
        scores={scores}
        calculatedScores={calculatedScores}
        sortedSubjects={sortedSubjects}
        totals={totals}
      />
    </ErrorBoundary>
  );
});

ScoreTable.displayName = "ScoreTable";

export default ScoreTable;
