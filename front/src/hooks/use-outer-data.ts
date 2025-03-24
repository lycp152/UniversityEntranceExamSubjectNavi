import { useMemo } from "react";
import type { UISubject } from "@/types/universities/subjects";
import { SUBJECTS } from "@/constants/subjects";
import type { PieData, ChartResult } from "@/types/charts/pie-chart";
import { createOuterPieData } from "@/utils/builders/pie-chart-data-builder";
import { extractSubjectMainCategory } from "@/utils/formatters/subject-name";
import { createChartError } from "@/utils/validation/chart-error-factory";
import {
  ERROR_MESSAGES,
  SCORE_ERROR_CODES,
} from "@/constants/domain-error-codes";

export const useOuterData = (
  subjectData: UISubject,
  totalScore: number,
  calculateCategoryTotal: (
    subjects: UISubject["subjects"],
    category: string
  ) => number
): ChartResult<PieData> => {
  return useMemo(() => {
    const startTime = Date.now();
    const result: ChartResult<PieData> = {
      data: [],
      errors: [],
      hasErrors: false,
      status: "success",
    };

    try {
      result.data = Object.values(SUBJECTS).reduce<PieData[]>(
        (acc, subject) => {
          const category = extractSubjectMainCategory(subject);
          if (!acc.some((item) => item.name === category)) {
            const total = calculateCategoryTotal(
              subjectData.subjects,
              category
            );
            acc.push(createOuterPieData(category, total, totalScore));
          }
          return acc;
        },
        []
      );

      result.metadata = {
        processedAt: startTime,
        totalItems: Object.values(SUBJECTS).length,
        successCount: result.data.length,
        errorCount: result.errors.length,
      };
    } catch (error) {
      result.errors.push(
        createChartError(
          SCORE_ERROR_CODES.INVALID_SCORE,
          ERROR_MESSAGES[SCORE_ERROR_CODES.INVALID_SCORE],
          "outer-data",
          {
            severity: "error",
            details: {
              originalMessage:
                error instanceof Error ? error.message : "Unknown error",
            },
          }
        )
      );
      result.hasErrors = true;
      result.status = "error";
    }

    return result;
  }, [subjectData.subjects, totalScore, calculateCategoryTotal]);
};
