import type { SubjectScore } from "@/types/score";
import type { ScoreCalculationResult } from "@/features/subjects/types/calculation";
import type { ISubjectScoreCache } from "./ISubjectScoreCache";

export class SubjectScoreCache implements ISubjectScoreCache {
  private static instance: SubjectScoreCache;
  private readonly cache: Map<
    string,
    { scores: SubjectScore[]; metrics: ScoreCalculationResult[] }
  > = new Map();

  private constructor() {}

  static getInstance(): SubjectScoreCache {
    if (!SubjectScoreCache.instance) {
      SubjectScoreCache.instance = new SubjectScoreCache();
    }
    return SubjectScoreCache.instance;
  }

  get(key: string) {
    return this.cache.get(key) || null;
  }

  set(key: string, scores: SubjectScore[], metrics: ScoreCalculationResult[]) {
    this.cache.set(key, { scores, metrics });
  }

  clear() {
    this.cache.clear();
  }
}
