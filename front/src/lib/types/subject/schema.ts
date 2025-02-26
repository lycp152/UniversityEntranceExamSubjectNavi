import { z } from "zod";
import { SUBJECT_CONSTRAINTS } from "../../config/subject/constraints";

/**
 * 科目のスキーマ定義
 */
export const subjectSchema = z.object({
  id: z.number(),
  testTypeId: z.number(),
  name: z.string().min(1),
  code: z.string().min(1),
  maxScore: z.number().min(SUBJECT_CONSTRAINTS.MIN_SCORE),
  minScore: z.number().min(SUBJECT_CONSTRAINTS.MIN_SCORE),
  weight: z
    .number()
    .min(SUBJECT_CONSTRAINTS.MIN_WEIGHT)
    .max(SUBJECT_CONSTRAINTS.MAX_WEIGHT),
  displayOrder: z.number().min(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * 科目スコアのスキーマ定義
 */
export const subjectScoreSchema = z.object({
  value: z.number().min(SUBJECT_CONSTRAINTS.MIN_SCORE),
  maxValue: z.number().min(SUBJECT_CONSTRAINTS.MIN_SCORE),
  weight: z
    .number()
    .min(SUBJECT_CONSTRAINTS.MIN_WEIGHT)
    .max(SUBJECT_CONSTRAINTS.MAX_WEIGHT),
  isValid: z.boolean(),
});

/**
 * 科目グループのスキーマ定義
 */
export const subjectGroupSchema = z.object({
  testType: z.string(),
  subjects: z.array(subjectSchema),
  totalScore: z.number().min(SUBJECT_CONSTRAINTS.MIN_SCORE),
  maxTotalScore: z.number().min(SUBJECT_CONSTRAINTS.MIN_SCORE),
  isValid: z.boolean(),
});

// 型の導出
export type Subject = z.infer<typeof subjectSchema>;
export type SubjectScore = z.infer<typeof subjectScoreSchema>;
export type SubjectGroup = z.infer<typeof subjectGroupSchema>;
