export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface RequestConfig {
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: BodyInit | null;
  signal?: AbortSignal;
}
