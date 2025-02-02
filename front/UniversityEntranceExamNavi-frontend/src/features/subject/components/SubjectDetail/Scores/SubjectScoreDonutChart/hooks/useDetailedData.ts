import { useMemo } from 'react';
import type { Subject, SubjectName } from '@/features/data/types';
import { SUBJECT_DISPLAY_ORDER } from '../constants';
import { ERROR_CODES, ERROR_MESSAGES } from '../constants/errorCodes';
import type { DetailedPieData } from '../types/chart';
import type { ChartResult, ChartError } from '../types/errors';
import { createDetailedPieData } from '../utils/dataTransformers';
import { createChartError } from '../utils/errorHandlers';
import { extractScores } from '@/features/data/utils/scoreUtils';

// 1. 共通型定義
interface ProcessedResults {
  data: DetailedPieData[];
  errors: ChartError[];
}

interface ChartMetadata {
  processedAt: number;
  totalItems: number;
  successCount: number;
  errorCount: number;
}

// 2. エラー処理層
const createErrorResult = (subjectName: SubjectName, message: string): ChartError =>
  createChartError(
    ERROR_CODES.INVALID_SCORE,
    ERROR_MESSAGES[ERROR_CODES.INVALID_SCORE],
    subjectName,
    {
      severity: 'error',
      details: { originalMessage: message },
    }
  );

// 3. データ処理層
const processScore = (
  score: ReturnType<typeof extractScores>[number],
  totalScore: number
): { data?: DetailedPieData; error?: ChartError } => {
  if (score.type === 'error') {
    return {
      error: createErrorResult(score.subjectName, score.message),
    };
  }

  return {
    data: createDetailedPieData(score.subjectName, score.value, totalScore, score.type),
  };
};

const processSubjectScores = (
  scores: Subject['subjects'][SubjectName],
  subjectName: SubjectName,
  totalScore: number
): ProcessedResults => {
  const extractedScores = extractScores(scores, subjectName);
  return extractedScores.reduce<ProcessedResults>(
    (acc, score) => {
      const processed = processScore(score, totalScore);
      if (processed.error) acc.errors.push(processed.error);
      if (processed.data) acc.data.push(processed.data);
      return acc;
    },
    { data: [], errors: [] }
  );
};

// 4. 状態管理層
const determineChartStatus = (
  errors: ChartError[],
  data: DetailedPieData[]
): ChartResult<DetailedPieData>['status'] => {
  if (errors.length === 0) return 'success';
  return data.length === 0 ? 'failure' : 'partial';
};

const createChartMetadata = (
  startTime: number,
  totalItems: number,
  data: DetailedPieData[],
  errors: ChartError[]
): ChartMetadata => ({
  processedAt: startTime,
  totalItems,
  successCount: data.length,
  errorCount: errors.length,
});

// 5. メインロジック
export const useDetailedData = (
  subjectData: Subject,
  totalScore: number
): ChartResult<DetailedPieData> => {
  return useMemo(() => {
    const startTime = Date.now();
    const result = SUBJECT_DISPLAY_ORDER.reduce<ChartResult<DetailedPieData>>(
      (acc: ChartResult<DetailedPieData>, subjectName: SubjectName) => {
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
