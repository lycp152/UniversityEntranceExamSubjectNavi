import { ValidationCategory, ValidationSeverity } from "@/types/validation";

export interface ValidationErrorDetail {
  message: string;
  category: ValidationCategory;
  severity: ValidationSeverity;
  field?: string;
  value?: unknown;
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly details: ValidationErrorDetail[]
  ) {
    super(message);
    this.name = "ValidationError";
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  get errors(): ValidationErrorDetail[] {
    return this.details;
  }

  hasErrors(severity: ValidationSeverity = ValidationSeverity.ERROR): boolean {
    return this.details.some((detail) => detail.severity === severity);
  }

  getErrorsByCategory(category: ValidationCategory): ValidationErrorDetail[] {
    return this.details.filter((detail) => detail.category === category);
  }

  getErrorsBySeverity(severity: ValidationSeverity): ValidationErrorDetail[] {
    return this.details.filter((detail) => detail.severity === severity);
  }

  toJSON() {
    return {
      message: this.message,
      details: this.details,
    };
  }
}
