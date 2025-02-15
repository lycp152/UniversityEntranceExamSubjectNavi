import { useMemo } from 'react';
import type { Subject } from '@/lib/types';
import { SUBJECT_DISPLAY_ORDER } from '@/lib/constants/subjects';
import { ERROR_CODES, ERROR_MESSAGES } from '../constants/errorCodes';
import { DetailedPieData } from '../types/pieChart';
import { ChartResult } from '@/features/subject/types';
import { createDetailedPieData } from '../utils/pieChartTransformers';
import { createChartError } from '../utils/errorHandlers';
import { extractScores } from '../utils/scoreExtractors';

export const useDetailedData = (
  subjectData: Subject,
  totalScore: number
): ChartResult<DetailedPieData> => {
  return useMemo(() => {
    const startTime = Date.now();
    const result = SUBJECT_DISPLAY_ORDER.reduce<ChartResult<DetailedPieData>>(
      (acc, subjectName) => {
        const scores = subjectData.subjects[subjectName];
        const extractedScores = extractScores(scores, subjectName);

        extractedScores.forEach((score) => {
          if (score.type === 'error') {
            acc.errors.push(
              createChartError(
                ERROR_CODES.INVALID_SCORE,
                ERROR_MESSAGES[ERROR_CODES.INVALID_SCORE],
                score.subjectName,
                {
                  severity: 'error',
                  details: { originalMessage: score.message },
                }
              )
            );
          } else {
            acc.data.push(
              createDetailedPieData(score.subjectName, score.value, totalScore, score.type)
            );
          }
        });

        return acc;
      },
      { data: [], errors: [], hasErrors: false, status: 'success' }
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
