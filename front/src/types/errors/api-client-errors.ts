import { BaseApiError } from "./base";
import {
  API_ERROR_CODES,
  ERROR_MESSAGES,
} from "../../constants/domain-error-codes";

export class ApiClientError extends BaseApiError {
  static isApiClientError(error: unknown): error is ApiClientError {
    return error instanceof ApiClientError;
  }
}

export class NetworkError extends BaseApiError {
  constructor(message = ERROR_MESSAGES[API_ERROR_CODES.NETWORK_ERROR]) {
    super({
      code: API_ERROR_CODES.NETWORK_ERROR,
      message,
      status: 0,
    });
  }
}

export class TimeoutError extends BaseApiError {
  constructor(message = ERROR_MESSAGES[API_ERROR_CODES.TIMEOUT_ERROR]) {
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
      code: API_ERROR_CODES.API_VALIDATION_ERROR,
      message: message || ERROR_MESSAGES[API_ERROR_CODES.API_VALIDATION_ERROR],
      status: 400,
      details,
    });
  }
}
