import { BaseSubjectScore } from "@/types/score";
import { ErrorLogger } from "@/features/score/validation/score-error-logger";

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  timestamp: number;
}

interface CacheConfig {
  maxSize: number;
  ttl: number;
}

interface ValidationMetrics {
  totalValidations: number;
  cacheHits: number;
  cacheMisses: number;
  errors: number;
  averageValidationTime: number;
  totalValidationTime: number;
}

export class ScoreValidator {
  private readonly cache: Map<string, ValidationResult>;
  private readonly errorLogger: ErrorLogger;
  private readonly cacheConfig: CacheConfig;
  private metrics: ValidationMetrics = {
    totalValidations: 0,
    cacheHits: 0,
    cacheMisses: 0,
    errors: 0,
    averageValidationTime: 0,
    totalValidationTime: 0,
  };

  constructor(config: Partial<CacheConfig> = {}) {
    this.cache = new Map();
    this.errorLogger = new ErrorLogger();
    this.cacheConfig = {
      maxSize: config.maxSize ?? 1000,
      ttl: config.ttl ?? 5 * 60 * 1000,
    };
  }

  validateScore(score: BaseSubjectScore): ValidationResult {
    const startTime = performance.now();
    this.metrics.totalValidations++;

    try {
      const cacheKey = `${score.commonTest}-${score.secondTest}`;
      const cachedResult = this.getCachedResult(cacheKey);
      if (cachedResult) {
        this.metrics.cacheHits++;
        return cachedResult;
      }

      this.metrics.cacheMisses++;
      const errors: string[] = [];

      if (!this.isValidScore(score.commonTest)) {
        errors.push("共通テストのスコアが無効です");
      }

      if (!this.isValidScore(score.secondTest)) {
        errors.push("個別試験のスコアが無効です");
      }

      if (errors.length > 0) {
        this.metrics.errors++;
      }

      const result: ValidationResult = {
        isValid: errors.length === 0,
        errors,
        timestamp: Date.now(),
      };

      this.setCachedResult(cacheKey, result);
      return result;
    } finally {
      const endTime = performance.now();
      const validationTime = endTime - startTime;
      this.updateValidationTime(validationTime);
    }
  }

  private isValidScore(score: number): boolean {
    if (typeof score !== "number") {
      this.errorLogger.error("スコアは数値である必要があります", { score });
      return false;
    }

    if (score < 0) {
      this.errorLogger.error("スコアは0以上である必要があります", { score });
      return false;
    }

    return true;
  }

  calculateTotal(score: BaseSubjectScore): number {
    if (
      !this.isValidScore(score.commonTest) ||
      !this.isValidScore(score.secondTest)
    ) {
      return 0;
    }

    return score.commonTest + score.secondTest;
  }

  clearCache(): void {
    this.cache.clear();
  }

  getMetrics(): ValidationMetrics {
    return {
      ...this.metrics,
      averageValidationTime: this.calculateAverageValidationTime(),
    };
  }

  resetMetrics(): void {
    this.metrics = {
      totalValidations: 0,
      cacheHits: 0,
      cacheMisses: 0,
      errors: 0,
      averageValidationTime: 0,
      totalValidationTime: 0,
    };
  }

  private getCachedResult(key: string): ValidationResult | undefined {
    const result = this.cache.get(key);
    if (!result) {
      return undefined;
    }

    if (Date.now() - result.timestamp > this.cacheConfig.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    return result;
  }

  private setCachedResult(key: string, result: ValidationResult): void {
    if (this.cache.size >= this.cacheConfig.maxSize) {
      const oldestKey = this.findOldestCacheKey();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, result);
  }

  private findOldestCacheKey(): string | undefined {
    let oldestKey: string | undefined;
    let oldestTimestamp = Infinity;

    for (const [key, value] of this.cache.entries()) {
      if (value.timestamp < oldestTimestamp) {
        oldestTimestamp = value.timestamp;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  private updateValidationTime(validationTime: number): void {
    this.metrics.totalValidationTime += validationTime;
  }

  private calculateAverageValidationTime(): number {
    if (this.metrics.totalValidations === 0) {
      return 0;
    }
    return this.metrics.totalValidationTime / this.metrics.totalValidations;
  }
}
