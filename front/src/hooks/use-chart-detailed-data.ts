import { useMemo } from "react";
import type { UISubject } from "@/types/universities/subjects";
import { SUBJECT_DISPLAY_ORDER } from "@/constants/subjects";
import { ERROR_CODES, ERROR_MESSAGES } from "@/constants/error-codes";
import { DetailedPieData, ChartResult } from "@/types/charts/pie-chart";
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
    const result = SUBJECT_DISPLAY_ORDER.reduce<ChartResult<DetailedPieData>>(
      (acc, subjectName) => {
        const scores = subjectData.subjects[subjectName];
        const extractedScores = extractScores(scores, subjectName);

        extractedScores.forEach((score) => {
          if (score.type === "error") {
            acc.errors.push(
              createChartError(
                ERROR_CODES.INVALID_SCORE,
                ERROR_MESSAGES[ERROR_CODES.INVALID_SCORE],
                score.subjectName,
                {
                  severity: "error",
                  details: { originalMessage: score.message },
                }
              )
            );
          } else {
            acc.data.push(
              createDetailedPieData(
                score.subjectName,
                score.value,
                totalScore,
                score.type === "共通"
                  ? TEST_TYPES.COMMON
                  : TEST_TYPES.INDIVIDUAL
              )
            );
          }
        });

        return acc;
      },
      { data: [], errors: [], hasErrors: false, status: "success" }
    );

    result.hasErrors = result.errors.length > 0;
    result.metadata = {
      processedAt: startTime,
      totalItems: SUBJECT_DISPLAY_ORDER.length,
      successCount: result.data.length,
      errorCount: result.errors.length,
    };

    return result;
  }, [subjectData.subjects, totalScore]);
};
