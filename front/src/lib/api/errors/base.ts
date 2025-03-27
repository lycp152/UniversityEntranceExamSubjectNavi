export interface ApiErrorDetails {
  code: string;
  message: string;
  status?: number;
  details?: Record<string, unknown>;
}

export class BaseApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: Record<string, unknown>;

  constructor(error: ApiErrorDetails) {
    super(error.message);
    this.name = this.constructor.name;
    this.code = error.code;
    this.status = error.status ?? 500;
    this.details = error.details;
  }
}
