import type { BaseSubjectScore } from "@/lib/types/score/score";
import type { TestScore } from "../../types/score/score";
import { SCORE_CONSTRAINTS } from "@/lib/types/score/score";

/**
 * スコアの型ガード
 */
export function isValidTestScore(score: unknown): score is TestScore {
  try {
    return (
      typeof score === "object" &&
      score !== null &&
      "value" in score &&
      "maxValue" in score &&
      typeof (score as TestScore).value === "number" &&
      typeof (score as TestScore).maxValue === "number"
    );
  } catch {
    return false;
  }
}

/**
 * スコアの型ガード
 */
export function isBaseSubjectScore(score: unknown): score is BaseSubjectScore {
  try {
    return (
      typeof score === "object" &&
      score !== null &&
      "commonTest" in score &&
      "secondTest" in score &&
      typeof (score as BaseSubjectScore).commonTest === "number" &&
      typeof (score as BaseSubjectScore).secondTest === "number"
    );
  } catch {
    return false;
  }
}

/**
 * テストスコアが有効かどうかを判定
 */
export function validateTestScore(score: TestScore): boolean {
  return (
    score.value >= SCORE_CONSTRAINTS.MIN_VALUE &&
    score.value <= score.maxValue &&
    score.maxValue > 0
  );
}

/**
 * キャッシュキーの生成
 */
export function createCacheKey(score: BaseSubjectScore): string {
  return `${score.commonTest}-${score.secondTest}`;
}
