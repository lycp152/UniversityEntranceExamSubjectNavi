import { DEFAULT_HEADERS } from '../lib/constants/api';
import { APIError } from '../lib/errors/api';

type RequestHeaders = Record<string, string>;

class APIClient {
  private static instance: APIClient;
  private headers: RequestHeaders = { ...DEFAULT_HEADERS };

  private constructor() {}

  public static getInstance(): APIClient {
    if (!APIClient.instance) {
      APIClient.instance = new APIClient();
    }
    return APIClient.instance;
  }

  public setHeaders(headers: RequestHeaders): void {
    this.headers = { ...this.headers, ...headers };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json();
      throw new APIError(
        errorData.code || 'UNKNOWN_ERROR',
        errorData.message || `APIエラー: ${response.status} ${response.statusText}`,
        errorData.details
      );
    }

    const data = await response.json();
    return data;
  }

  private createRequestInit(method: string, body?: unknown): RequestInit {
    const init: RequestInit = {
      method,
      headers: this.headers,
      credentials: 'same-origin',
      mode: 'cors',
    };

    if (body) {
      init.body = JSON.stringify(body);
    }

    return init;
  }

  public async get<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(endpoint, this.createRequestInit('GET'));
      return this.handleResponse<T>(response);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  public async put<T>(endpoint: string, data: unknown): Promise<T> {
    try {
      const response = await fetch(endpoint, this.createRequestInit('PUT', data));
      return this.handleResponse<T>(response);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  public async post<T>(endpoint: string, data: unknown): Promise<T> {
    try {
      const response = await fetch(endpoint, this.createRequestInit('POST', data));
      return this.handleResponse<T>(response);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  public async delete<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(endpoint, this.createRequestInit('DELETE'));
      return this.handleResponse<T>(response);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  private handleError(error: unknown): never {
    console.error('API Error:', error);
    if (error instanceof APIError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new APIError('UNKNOWN_ERROR', error.message);
    }
    throw new APIError('UNKNOWN_ERROR', '予期せぬエラーが発生しました');
  }
}

export const apiClient = APIClient.getInstance();
