export class APIError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export const isAPIError = (error: unknown): error is APIError => {
  return error instanceof APIError;
};
