import { FC, memo } from "react";
import type { SubjectScores, SubjectScoreDetail } from "@/lib/types/score";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary/index";
import { useScoreTable } from "@/hooks/subject/score/useScoreTable";
import { useTableKeyboardNavigation } from "@/lib/hooks/subject/table/useTableKeyboardNavigation";
import ScoreTableHeader from "./ScoreTableHeader";
import ScoreTableBody from "./ScoreTableBody";

interface ScoreTableProps {
  scores: SubjectScores;
}

interface ScoreTableContentProps extends ScoreTableProps {
  calculatedScores: Record<string, SubjectScoreDetail> | null;
  sortedSubjects: string[];
  totals: {
    commonTest: number;
    individualTest: number;
    total: number;
  } | null;
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
  const { calculatedScores, sortedSubjects, totals } = useScoreTable(scores);

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
