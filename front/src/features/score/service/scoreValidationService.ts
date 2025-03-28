import { BaseValidator } from "@/utils/validation/base-validator";
import {
  ValidationErrorCode,
  ValidationSeverity,
  ValidationCategory,
} from "@/constants/validation";
import type {
  ValidationRule,
  ValidationResult,
  ValidationContext,
  ValidationMetadata,
} from "@/types/validation-rules";
import type { BaseSubjectScore } from "@/types/score";
import {
  createCacheKey,
  isBaseSubjectScore,
  validateTestScore,
} from "@/features/score/validation/score-validator3";

export class ScoreValidator extends BaseValidator<BaseSubjectScore> {
  private readonly rules: ValidationRule<BaseSubjectScore>[] = [
    {
      code: ValidationErrorCode.INVALID_DATA_FORMAT,
      field: "score",
      condition: (score: BaseSubjectScore) => isBaseSubjectScore(score),
      message: "Invalid score format",
      severity: ValidationSeverity.ERROR,
      category: ValidationCategory.FORMAT,
    },
    {
      code: ValidationErrorCode.INVALID_DATA_FORMAT,
      field: "commonTest",
      condition: (score: BaseSubjectScore) =>
        validateTestScore({ value: score.commonTest, maxValue: 100 }),
      message: "Invalid common test score",
      severity: ValidationSeverity.ERROR,
      category: ValidationCategory.FORMAT,
    },
    {
      code: ValidationErrorCode.INVALID_DATA_FORMAT,
      field: "secondTest",
      condition: (score: BaseSubjectScore) =>
        validateTestScore({ value: score.secondTest, maxValue: 100 }),
      message: "Invalid secondary test score",
      severity: ValidationSeverity.ERROR,
      category: ValidationCategory.FORMAT,
    },
  ];

  private readonly cache = new Map<string, number>();
  private readonly errorLogger?: (error: Error) => void;

  constructor(
    context: ValidationContext = {
      fieldName: "",
      value: undefined,
      timestamp: Date.now(),
    },
    errorLogger?: (error: Error) => void
  ) {
    super(context);
    this.errorLogger = errorLogger;
  }

  /**
   * テストスコアの有効性チェック
   */
  private isValidTestScore(score: number): boolean {
    return score >= 0 && score <= 100;
  }

  /**
   * エラーのログ記録
   */
  private logError(error: unknown): void {
    if (this.errorLogger && error instanceof Error) {
      this.errorLogger(error);
    } else {
      console.error("Validation error:", error);
    }
  }

  /**
   * スコアのバリデーション
   */
  async validate(
    score: BaseSubjectScore,
    context?: ValidationContext
  ): Promise<ValidationResult<BaseSubjectScore>> {
    const result = await this.validateRules(score, this.rules);

    return {
      ...result,
      metadata: {
        validatedAt: Date.now(),
        rules: this.rules.map((rule) => rule.code),
        failureDetails: context,
      } as ValidationMetadata,
    };
  }

  /**
   * バリデーションルールの検証
   */
  private async validateRules(
    score: BaseSubjectScore,
    rules: ValidationRule<BaseSubjectScore>[]
  ): Promise<ValidationResult<BaseSubjectScore>> {
    const errors = [];

    for (const rule of rules) {
      try {
        if (!rule.condition(score)) {
          errors.push({
            code: rule.code,
            message: rule.message,
            field: rule.field,
            severity: ValidationSeverity.ERROR,
          });
        }
      } catch (error) {
        errors.push({
          code: ValidationErrorCode.TRANSFORM_ERROR,
          message: error instanceof Error ? error.message : "Unknown error",
          field: "validation",
          severity: ValidationSeverity.ERROR,
        });
      }
    }

    return {
      isValid: errors.length === 0,
      data: score,
      errors: errors.length > 0 ? errors : [],
    };
  }

  /**
   * スコアのバリデーション（テスト用インターフェース）
   */
  async validateScore(
    score: unknown
  ): Promise<ValidationResult<BaseSubjectScore>> {
    if (!isBaseSubjectScore(score)) {
      return {
        isValid: false,
        errors: [
          {
            code: ValidationErrorCode.INVALID_DATA_FORMAT,
            message: "Invalid score format",
            field: "score",
            severity: ValidationSeverity.ERROR,
          },
        ],
        metadata: {
          validatedAt: Date.now(),
        },
      };
    }
    return this.validate(score);
  }

  /**
   * スコアの有効性チェック
   */
  isValidScore(score: BaseSubjectScore): boolean {
    try {
      return (
        this.isValidTestScore(score.commonTest) &&
        this.isValidTestScore(score.secondTest)
      );
    } catch (error) {
      this.logError(error);
      return false;
    }
  }

  /**
   * 合計スコアの計算
   */
  calculateTotal(score: BaseSubjectScore): number {
    if (!this.isValidScore(score)) return 0;

    const cacheKey = createCacheKey(score);
    const cachedTotal = this.cache.get(cacheKey);
    if (cachedTotal !== undefined) return cachedTotal;

    const total = score.commonTest + score.secondTest;
    this.cache.set(cacheKey, total);
    return total;
  }

  /**
   * キャッシュのクリア
   */
  clearCache(score?: BaseSubjectScore): void {
    try {
      if (score) {
        const cacheKey = createCacheKey(score);
        this.cache.delete(cacheKey);
      } else {
        this.cache.clear();
      }
    } catch (error) {
      this.logError(error);
    }
  }
}
