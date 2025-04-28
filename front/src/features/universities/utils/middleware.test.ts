/**
 * ミドルウェアのテスト
 * インターセプターの動作確認とエラーハンドリングのテスト
 *
 * @module middleware.test
 * @description
 * - リクエストインターセプターのテスト
 * - レスポンスインターセプターのテスト
 * - エラーインターセプターのテスト
 * - エッジケースのテスト
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ApiClientError } from './api-client';
import type { HttpRequestConfig } from '@/types/api/types';
import type { RequestInterceptor, ResponseInterceptor, ErrorInterceptor } from './middleware';
import { InterceptorManager } from './middleware';

describe('InterceptorManager', () => {
  let interceptorManager: InterceptorManager;
  let requestConfig: HttpRequestConfig;

  beforeEach(() => {
    interceptorManager = new InterceptorManager();
    requestConfig = {
      method: 'GET',
      headers: {},
      body: null,
      cache: 'no-store',
      timeout: 5000,
    };
  });

  describe('リクエストインターセプター', () => {
    it('リクエストインターセプターが正しく実行されること', async () => {
      const interceptor: RequestInterceptor = async (config: HttpRequestConfig) => {
        return {
          ...config,
          headers: {
            ...config.headers,
            'X-Test-Header': 'test',
          },
        };
      };

      interceptorManager.addRequestInterceptor(interceptor);
      const result = await interceptorManager.runRequestInterceptors(requestConfig);

      expect(result.headers).toHaveProperty('X-Test-Header', 'test');
    });

    it('複数のリクエストインターセプターが順番に実行されること', async () => {
      const manager = new InterceptorManager();
      const config: HttpRequestConfig = {
        method: 'GET',
        headers: {},
        body: null,
        cache: 'no-store',
      };

      manager.addRequestInterceptor(async config => {
        return { ...config, headers: { 'X-Test1': 'test1' } };
      });

      manager.addRequestInterceptor(async config => {
        return { ...config, headers: { ...config.headers, 'X-Test2': 'test2' } };
      });

      const result = await manager.runRequestInterceptors(config);

      expect(result.headers).toEqual({
        'X-Test1': 'test1',
        'X-Test2': 'test2',
      });
    });

    it('リクエスト設定を正しく加工できる', async () => {
      const interceptor: RequestInterceptor = async config => ({
        ...config,
        headers: {
          ...config.headers,
          'X-Test-Header': 'test-value',
        },
      });

      const manager = new InterceptorManager();
      manager.addRequestInterceptor(interceptor);

      const config: HttpRequestConfig = {
        method: 'GET',
        headers: {},
        body: null,
        cache: 'no-store',
      };

      const result = await manager.runRequestInterceptors(config);
      expect(result.headers?.['X-Test-Header']).toBe('test-value');
    });
  });

  describe('レスポンスインターセプター', () => {
    it('レスポンスインターセプターが正しく実行されること', async () => {
      const mockResponse = new Response(JSON.stringify({ data: 'test' }), {
        status: 200,
        statusText: 'OK',
      });

      const interceptor: ResponseInterceptor = async (response: Response) => {
        const clone = response.clone();
        const data = await clone.json();
        return new Response(JSON.stringify({ ...data, modified: true }), {
          status: response.status,
          statusText: response.statusText,
        });
      };

      interceptorManager.addResponseInterceptor(interceptor);
      const result = await interceptorManager.runResponseInterceptors(mockResponse);
      const data = await result.json();

      expect(data).toHaveProperty('modified', true);
    });

    it('レスポンスを正しく加工できる', async () => {
      const interceptor: ResponseInterceptor = async response => {
        const data = await response.json();
        return new Response(JSON.stringify({ ...data, processed: true }), {
          status: response.status,
          headers: response.headers,
        });
      };

      const manager = new InterceptorManager();
      manager.addResponseInterceptor(interceptor);

      const response = new Response(JSON.stringify({ test: 'data' }), {
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/json' }),
      });

      const result = await manager.runResponseInterceptors(response);
      const data = await result.json();
      expect(data.processed).toBe(true);
    });
  });

  describe('エラーインターセプター', () => {
    it('エラーインターセプターが正しく実行されること', async () => {
      const error = new ApiClientError({
        code: 'TEST_ERROR',
        message: 'テストエラー',
        status: 500,
      });

      const interceptor: ErrorInterceptor = (error: unknown): Promise<never> => {
        throw error instanceof ApiClientError
          ? error
          : new ApiClientError({
              code: 'UNKNOWN_ERROR',
              message: '不明なエラー',
              status: 500,
            });
      };

      interceptorManager.addErrorInterceptor(interceptor);
      await expect(interceptorManager.runErrorInterceptors(error)).rejects.toThrow('テストエラー');
    });

    it('複数のエラーインターセプターが順番に実行されること', async () => {
      const manager = new InterceptorManager();
      const error = new Error('テストエラー');

      const firstInterceptor: ErrorInterceptor = (error: unknown): Promise<never> => {
        throw error instanceof Error ? new Error(`1回目の加工: ${error.message}`) : error;
      };

      const secondInterceptor: ErrorInterceptor = (error: unknown): Promise<never> => {
        throw error instanceof Error ? new Error(`2回目の加工: ${error.message}`) : error;
      };

      manager.addErrorInterceptor(firstInterceptor);
      manager.addErrorInterceptor(secondInterceptor);

      await expect(manager.runErrorInterceptors(error)).rejects.toThrow(
        '2回目の加工: 1回目の加工: テストエラー'
      );
    });

    it('エラーが解決されない場合、元のエラーが投げられること', async () => {
      const manager = new InterceptorManager();
      const error = new Error('テストエラー');

      await expect(manager.runErrorInterceptors(error)).rejects.toThrow('テストエラー');
    });

    it('エラーを正しく加工できる', async () => {
      const interceptor: ErrorInterceptor = (error: unknown): Promise<never> => {
        throw error instanceof ApiClientError
          ? new ApiClientError({
              code: error.code,
              message: '加工されたエラーメッセージ',
              status: error.status,
            })
          : error;
      };

      const manager = new InterceptorManager();
      manager.addErrorInterceptor(interceptor);

      const error = new ApiClientError({
        code: 'TEST_ERROR',
        message: '元のエラーメッセージ',
        status: 500,
      });

      await expect(manager.runErrorInterceptors(error)).rejects.toThrow(
        '加工されたエラーメッセージ'
      );
    });
  });

  describe('エッジケース', () => {
    it('空のインターセプターリストの場合、元の設定が返されること', async () => {
      const manager = new InterceptorManager();
      const config: HttpRequestConfig = {
        method: 'GET',
        headers: {},
        body: null,
        cache: 'no-store',
      };

      const result = await manager.runRequestInterceptors(config);

      expect(result).toEqual(config);
    });

    it('エラーがErrorオブジェクトでない場合、Errorオブジェクトに変換されること', async () => {
      const manager = new InterceptorManager();
      const error = '文字列エラー';

      await expect(manager.runErrorInterceptors(error)).rejects.toThrow('文字列エラー');
    });
  });

  describe('インターセプターの順序テスト', () => {
    it('リクエストインターセプターを正しい順序で実行できる', async () => {
      const manager = new InterceptorManager();
      const results: string[] = [];

      manager.addRequestInterceptor(async config => {
        results.push('first');
        return config;
      });

      manager.addRequestInterceptor(async config => {
        results.push('second');
        return config;
      });

      const config: HttpRequestConfig = {
        method: 'GET',
        headers: {},
      };

      await manager.runRequestInterceptors(config);
      expect(results).toEqual(['first', 'second']);
    });
  });
});
