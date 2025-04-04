import { FC, memo } from "react";
import type {
  SubjectScore,
  SubjectScores,
  SubjectScoreDetail,
} from "@/types/score";
import { ErrorBoundary } from "@/components/errors/error-boundary";
import { useScoreTable } from "@/features/subjects/hooks/table/useScoreTable";
import { useTableKeyboardNavigation } from "@/features/subjects/hooks/table/useTableKeyboardNavigation";
import { TEST_TYPES } from "@/types/score";
import ScoreTableHeader from "./ScoreTableHeader";
import ScoreTableBody from "./ScoreTableBody";

interface ScoreTableProps {
  scores: Record<string, SubjectScore>;
}

type ScoreTableTotals = {
  [TEST_TYPES.COMMON]: number;
  [TEST_TYPES.SECONDARY]: number;
  total: number;
};

const convertToSubjectScores = (
  scores: Record<string, SubjectScore>
): SubjectScores => {
  const result: SubjectScores = {};
  for (const [subject, score] of Object.entries(scores)) {
    result[subject] = {
      commonTest: score.value,
      secondTest: 0, // デフォルト値として0を使用
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
