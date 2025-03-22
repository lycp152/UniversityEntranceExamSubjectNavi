import { BaseApiError } from "./base";
import { API_ERROR_CODES } from "./codes";

export class ApiClientError extends BaseApiError {
  static isApiClientError(error: unknown): error is ApiClientError {
    return error instanceof ApiClientError;
  }
}

export class NetworkError extends BaseApiError {
  constructor(message = "ネットワークエラーが発生しました") {
    super({
      code: API_ERROR_CODES.NETWORK_ERROR,
      message,
      status: 0,
    });
  }
}

export class TimeoutError extends BaseApiError {
  constructor(message = "リクエストがタイムアウトしました") {
    super({
      code: API_ERROR_CODES.TIMEOUT_ERROR,
      message,
      status: 408,
    });
  }
}

export class ValidationError extends BaseApiError {
  constructor(message: string, details?: Record<string, unknown>) {
    super({
      code: API_ERROR_CODES.VALIDATION_ERROR,
      message,
      status: 400,
      details,
    });
  }
}
