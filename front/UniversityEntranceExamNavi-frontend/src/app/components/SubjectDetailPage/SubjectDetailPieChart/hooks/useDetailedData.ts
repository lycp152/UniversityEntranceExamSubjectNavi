import { subjects } from "../../../SearchResultTable/SubjectData";
import { SUBJECT_ORDER } from "../constants";
import { ERROR_CODES, ERROR_MESSAGES } from "../constants/errorCodes";
import { DetailedPieData } from "../types/chart";
import { ChartResult } from "../types/errors";
import { createDetailedPieData } from "../utils/dataTransformers";
import { createChartError } from "../utils/errorHandlers";
import { extractScores } from "../utils/scoreExtractors";
import { useMemo } from "react";

export const useDetailedData = (
  subjectData: (typeof subjects)[0],
  totalScore: number
): ChartResult<DetailedPieData> => {
  return useMemo(() => {
    const startTime = Date.now();
    const result = SUBJECT_ORDER.reduce<ChartResult<DetailedPieData>>(
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
                score.type
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
      totalItems: SUBJECT_ORDER.length,
      successCount: result.data.length,
      errorCount: result.errors.length,
    };

    return result;
  }, [subjectData.subjects, totalScore]);
};
