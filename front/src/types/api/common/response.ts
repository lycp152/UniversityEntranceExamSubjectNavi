export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
  httpStatus: number;
  headers?: Record<string, string>;
}

export interface ApiError {
  code: string;
  message: string;
  status: number;
  details?: Record<string, unknown>;
}

export interface SingleResponse<T> {
  data: T;
}

export interface ErrorResponse {
  code: string;
  message: string;
  timestamp?: string;
}

export type ApiResponseType<T> = SingleResponse<T> | PaginatedResponse<T>;

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}
