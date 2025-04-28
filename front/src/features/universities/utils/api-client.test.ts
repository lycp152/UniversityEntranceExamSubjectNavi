import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient, ApiClientError, NetworkError, TimeoutError } from './api-client';

/**
 * APIクライアントのテスト
 * データフェッチング、エラーハンドリング、キャッシュ制御の動作を検証
 */
describe('ApiClient', () => {
  const mockResponse = { data: { test: 'data' } };
  const mockError = { code: 'ERROR', message: 'エラーが発生しました' };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  /**
   * 正常系のテスト
   */
  describe('正常系', () => {
    it('GETリクエストが成功する', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
        headers: new Headers(),
      });

      const result = await apiClient.get('/test');
      expect(result).toEqual(mockResponse);
    });

    it('POSTリクエストが成功する', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockResponse),
        headers: new Headers(),
      });

      const result = await apiClient.post('/test', { test: 'data' });
      expect(result).toEqual(mockResponse);
    });

    it('キャッシュ制御が正しく設定される', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
        headers: new Headers(),
      });

      await apiClient.get('/test', {
        cache: 'force-cache',
        revalidate: 60,
        tags: ['test'],
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          cache: 'force-cache',
          next: {
            revalidate: 60,
            tags: ['test'],
          },
        })
      );
    });
  });

  /**
   * エラー系のテスト
   */
  describe('エラー系', () => {
    it('ネットワークエラーを適切に処理する', async () => {
      (global.fetch as any).mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(apiClient.get('/test')).rejects.toThrow(NetworkError);
    });

    it('タイムアウトエラーを適切に処理する', async () => {
      const mockTimeoutError = () => Promise.reject(new DOMException('AbortError', 'AbortError'));
      (global.fetch as any).mockImplementationOnce(mockTimeoutError);

      await expect(apiClient.get('/test')).rejects.toThrow(TimeoutError);
    }, 1000);

    it('APIエラーを適切に処理する', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve(mockError),
        headers: new Headers(),
      });

      try {
        await apiClient.get('/test');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiClientError);
        expect(error).toHaveProperty('code', mockError.code);
        expect(error).toHaveProperty('message', mockError.message);
      }
    });
  });

  /**
   * インターセプターのテスト
   */
  describe('インターセプター', () => {
    it('リクエストインターセプターが正しく動作する', async () => {
      const interceptor = vi.fn(config => ({
        ...config,
        headers: { ...config.headers, 'X-Test': 'test' },
      }));

      apiClient.addRequestInterceptor(interceptor);

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
        headers: new Headers(),
      });

      await apiClient.get('/test');
      expect(interceptor).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Test': 'test',
          }),
        })
      );
    });
  });
});
