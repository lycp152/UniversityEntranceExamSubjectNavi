import type { SubjectScore, SubjectMetrics } from "../types/domain";
import type { ISubjectScoreCache } from "./ISubjectScoreCache";

export class SubjectScoreCache implements ISubjectScoreCache {
  private static instance: SubjectScoreCache;
  private readonly cache: Map<
    string,
    { scores: SubjectScore[]; metrics: SubjectMetrics[] }
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

  set(key: string, scores: SubjectScore[], metrics: SubjectMetrics[]) {
    this.cache.set(key, { scores, metrics });
  }

  clear() {
    this.cache.clear();
  }
}
