import { useMemo } from "react";
import type { UISubject } from "@/types/universities/subjects";
import { SUBJECTS } from "@/constants/subjects";
import {
  ERROR_MESSAGES,
  SCORE_ERROR_CODES,
} from "@/constants/domain-error-codes";
import type {
  DetailedPieData,
  ChartResult,
  ChartError,
} from "@/types/charts/pie-chart";
import { createDetailedPieData } from "@/utils/builders/pie-chart-data-builder";
import { createChartError } from "@/utils/validation/chart-error-factory";
import { extractScores } from "@/utils/extractors/subject-score-extractor";
import { TEST_TYPES } from "@/types/score";

export const useDetailedData = (
  subjectData: UISubject,
  totalScore: number
): ChartResult<DetailedPieData> => {
  return useMemo(() => {
    const startTime = Date.now();
    const result = Object.values(SUBJECTS).reduce<ChartResult<DetailedPieData>>(
      (acc, subjectName: (typeof SUBJECTS)[keyof typeof SUBJECTS]) => {
        const scores = subjectData.subjects[subjectName];
        const extractedScores = extractScores(scores, subjectName);

        extractedScores.forEach((score) => {
          if (score.type === "error") {
            const error: ChartError = createChartError(
              SCORE_ERROR_CODES.INVALID_SCORE,
              ERROR_MESSAGES[SCORE_ERROR_CODES.INVALID_SCORE],
              score.subjectName,
              {
                severity: "error",
                details: { originalMessage: score.message },
              }
            );
            acc.errors.push(error);
          } else {
            const pieData: DetailedPieData = createDetailedPieData(
              score.subjectName,
              score.value,
              totalScore,
              score.type === "共通" ? TEST_TYPES.COMMON : TEST_TYPES.INDIVIDUAL
            );
            acc.data.push(pieData);
          }
        });

        return acc;
      },
      { data: [], errors: [], hasErrors: false, status: "success" }
    );

    result.hasErrors = result.errors.length > 0;
    result.metadata = {
      processedAt: startTime,
      totalItems: Object.values(SUBJECTS).length,
      successCount: result.data.length,
      errorCount: result.errors.length,
    };

    return result;
  }, [subjectData.subjects, totalScore]);
};
