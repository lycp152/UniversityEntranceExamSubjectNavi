import { ErrorCategory, ErrorSeverity } from "@/types/error-categories";

export interface ValidationContext {
  fieldName: string;
  value: unknown;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface ValidationRuleConfig<T> {
  name: string;
  code: string;
  message: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  metadata?: Record<string, unknown>;
  validate: (value: T, context?: ValidationContext) => boolean;
}

export class ValidationRule<T> {
  private readonly config: ValidationRuleConfig<T>;

  constructor(config: ValidationRuleConfig<T>) {
    this.config = config;
  }

  get name(): string {
    return this.config.name;
  }

  get code(): string {
    return this.config.code;
  }

  get message(): string {
    return this.config.message;
  }

  get severity(): ErrorSeverity {
    return this.config.severity;
  }

  get category(): ErrorCategory {
    return this.config.category;
  }

  get metadata(): Record<string, unknown> | undefined {
    return this.config.metadata;
  }

  validate(value: T, context?: ValidationContext): boolean {
    return this.config.validate(value, context);
  }

  withMetadata(metadata: Record<string, unknown>): ValidationRule<T> {
    return new ValidationRule({
      ...this.config,
      metadata: {
        ...this.config.metadata,
        ...metadata,
      },
    });
  }

  withSeverity(severity: ErrorSeverity): ValidationRule<T> {
    return new ValidationRule({
      ...this.config,
      severity,
    });
  }

  withMessage(message: string): ValidationRule<T> {
    return new ValidationRule({
      ...this.config,
      message,
    });
  }
}
