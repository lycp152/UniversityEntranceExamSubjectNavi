import type { ValidationRule, ValidationResult, ValidationContext, ValidationError } from './types';

export class BaseValidator<T> {
  protected rules: ValidationRule<T>[];
  protected context?: ValidationContext;

  constructor(rules: ValidationRule<T>[], context?: ValidationContext) {
    this.rules = rules;
    this.context = context;
  }

  /**
   * 値のバリデーションを実行
   */
  async validate(value: T): Promise<ValidationResult<T>> {
    const errors: ValidationError[] = [];
    const startTime = Date.now();

    try {
      for (const rule of this.rules) {
        const isValid = await rule.validate(value);
        if (!isValid) {
          errors.push({
            code: rule.code,
            message: rule.message,
          });
        }
      }

      return {
        isValid: errors.length === 0,
        data: errors.length === 0 ? value : undefined,
        errors,
        metadata: {
          validatedAt: startTime,
          rules: this.rules.map((rule) => rule.code),
        },
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [
          {
            code: 'VALIDATION_ERROR',
            message: error instanceof Error ? error.message : '不明なエラーが発生しました',
          },
        ],
      };
    }
  }

  /**
   * バリデーションルールを追加
   */
  addRule(rule: ValidationRule<T>): void {
    this.rules.push(rule);
  }

  /**
   * バリデーションルールをクリア
   */
  clearRules(): void {
    this.rules = [];
  }

  /**
   * コンテキストを更新
   */
  updateContext(context: ValidationContext): void {
    this.context = {
      ...this.context,
      ...context,
    };
  }
}
