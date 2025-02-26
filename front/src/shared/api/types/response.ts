export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface SingleResponse<T> {
  data: T;
}

export interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp?: string;
}

export type ApiResponse<T> = SingleResponse<T> | PaginatedResponse<T>;

export const isPaginatedResponse = <T>(
  response: ApiResponse<T>
): response is PaginatedResponse<T> => {
  return Array.isArray((response as PaginatedResponse<T>).data);
};
