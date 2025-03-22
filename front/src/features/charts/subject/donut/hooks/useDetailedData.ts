import { useMemo } from "react";
import type { UISubject } from "@/types/ui/subjects";
import { SUBJECT_DISPLAY_ORDER } from "@/constants/subjects";
import {
  ERROR_CODES,
  ERROR_MESSAGES,
} from "@/features/charts/subject/donut/constants/errorCodes";
import { DetailedPieData } from "@/features/charts/types";
import type { ChartResult } from "@/features/charts/types";
import { createDetailedPieData } from "@/features/charts/subject/donut/utils/pieChartTransformers";
import { createChartError } from "@/features/charts/subject/donut/utils/errorHandlers";
import { extractScores } from "@/features/charts/subject/donut/utils/scoreExtractors";
import { TEST_TYPES } from "@/types/score/score";

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
