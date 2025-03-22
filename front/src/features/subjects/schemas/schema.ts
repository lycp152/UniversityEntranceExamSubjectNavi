import { z } from 'zod';

// スコア計算のルール定義
export const scoreRuleSchema = z.object({
  id: z.number(),
  subjectId: z.number(),
  minScore: z.number(),
  maxScore: z.number(),
  weight: z.number(),
  isRequired: z.boolean(),
  validationRules: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// スコア計算結果の定義
export const scoreResultSchema = z.object({
  subjectId: z.number(),
  rawScore: z.number(),
  weightedScore: z.number(),
  isValid: z.boolean(),
  validationErrors: z.array(z.string()).optional(),
  calculatedAt: z.date(),
});

// スコア計算セッションの定義
export const scoreCalculationSessionSchema = z.object({
  id: z.string(),
  universityId: z.number(),
  departmentId: z.number(),
  testTypeId: z.number(),
  scores: z.array(z.lazy(() => scoreResultSchema)),
  totalScore: z.number(),
  isValid: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// 型の導出
export type ScoreRule = z.infer<typeof scoreRuleSchema>;
export type ScoreResult = z.infer<typeof scoreResultSchema>;
export type ScoreCalculationSession = z.infer<typeof scoreCalculationSessionSchema>;
