import { PaginatedResponse } from "@/types/api/common/response";

export function isPaginatedResponse<T>(
  response: unknown
): response is PaginatedResponse<T> {
  return (
    typeof response === "object" &&
    response !== null &&
    "pagination" in response
  );
}

export interface PaginationParams {
  page: number;
  limit: number;
}
