/**
 * API定数のテスト
 * 環境変数とエンドポイントの定義を検証します
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { API_BASE_URL, API_ENDPOINTS, DEFAULT_HEADERS } from './index';

describe('API Constants', () => {
  // 環境変数のモック
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:8080/api');
  });

  describe('API_BASE_URL', () => {
    it('環境変数から正しく取得されること', () => {
      expect(API_BASE_URL).toBe('http://localhost:8080/api');
    });
  });

  describe('API_ENDPOINTS', () => {
    it('UNIVERSITIESエンドポイントが正しく定義されていること', () => {
      expect(API_ENDPOINTS.UNIVERSITIES).toBe('http://localhost:8080/api/universities');
    });

    it('DEPARTMENTSエンドポイントが正しく生成されること', () => {
      const endpoint = API_ENDPOINTS.DEPARTMENTS(1, 2);
      expect(endpoint).toBe('http://localhost:8080/api/universities/1/departments/2');
    });

    it('SUBJECTS_BATCHエンドポイントが正しく生成されること', () => {
      const endpoint = API_ENDPOINTS.SUBJECTS_BATCH(1, 2);
      expect(endpoint).toBe(
        'http://localhost:8080/api/universities/1/departments/2/subjects/batch'
      );
    });
  });

  describe('DEFAULT_HEADERS', () => {
    it('Content-Typeが正しく設定されていること', () => {
      expect(DEFAULT_HEADERS['Content-Type']).toBe('application/json');
    });

    it('Cache-Controlが正しく設定されていること', () => {
      expect(DEFAULT_HEADERS['Cache-Control']).toBe('no-cache');
    });

    it('Pragmaが正しく設定されていること', () => {
      expect(DEFAULT_HEADERS.Pragma).toBe('no-cache');
    });
  });
});
