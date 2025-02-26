export const enum ValidationSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

export const enum ValidationCategory {
  REQUIRED = 'required',
  FORMAT = 'format',
  RANGE = 'range',
  DEPENDENCY = 'dependency',
  TIMEOUT = 'timeout',
  SYSTEM = 'system',
}

export interface ValidationErrorContext {
  category: ValidationCategory;
  severity: ValidationSeverity;
  field: string;
  value?: unknown;
  constraints?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export const ERROR_MESSAGES = {
  [ValidationCategory.REQUIRED]: {
    default: '必須項目です',
    field: (field: string) => `${field}は必須項目です`,
  },
  [ValidationCategory.FORMAT]: {
    default: '形式が正しくありません',
    field: (field: string) => `${field}の形式が正しくありません`,
  },
  [ValidationCategory.RANGE]: {
    default: '範囲外の値です',
    field: (field: string, min?: number, max?: number) => {
      if (min !== undefined && max !== undefined) {
        return `${field}は${min}から${max}の間で指定してください`;
      }
      if (min !== undefined) {
        return `${field}は${min}以上で指定してください`;
      }
      if (max !== undefined) {
        return `${field}は${max}以下で指定してください`;
      }
      return `${field}が範囲外です`;
    },
  },
  [ValidationCategory.DEPENDENCY]: {
    default: '依存関係が満たされていません',
    field: (field: string, dependency: string) => `${field}は${dependency}に依存しています`,
  },
  [ValidationCategory.TIMEOUT]: {
    default: 'タイムアウトしました',
    field: (field: string) => `${field}の処理がタイムアウトしました`,
  },
  [ValidationCategory.SYSTEM]: {
    default: 'システムエラーが発生しました',
    field: (field: string) => `${field}の処理中にエラーが発生しました`,
  },
} as const;
