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

    it('UNIVERSITYエンドポイントが正しく生成されること', () => {
      const endpoint = API_ENDPOINTS.UNIVERSITY(1);
      expect(endpoint).toBe('http://localhost:8080/api/universities/1');
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

    it('MAJORエンドポイントが正しく生成されること', () => {
      const endpoint = API_ENDPOINTS.MAJOR(1, 2);
      expect(endpoint).toBe('http://localhost:8080/api/departments/1/majors/2');
    });

    it('ADMISSION_SCHEDULEエンドポイントが正しく生成されること', () => {
      const endpoint = API_ENDPOINTS.ADMISSION_SCHEDULE(1, 2);
      expect(endpoint).toBe('http://localhost:8080/api/majors/1/schedules/2');
    });

    it('ADMISSION_INFOエンドポイントが正しく生成されること', () => {
      const endpoint = API_ENDPOINTS.ADMISSION_INFO(1, 2);
      expect(endpoint).toBe('http://localhost:8080/api/schedules/1/info/2');
    });

    it('型が正しく定義されていること', () => {
      // 型チェックのためのテスト
      const endpoints: typeof API_ENDPOINTS = {
        UNIVERSITIES: 'http://localhost:8080/api/universities',
        UNIVERSITY: (id: string | number) => `http://localhost:8080/api/universities/${id}`,
        DEPARTMENTS: (universityId: number, departmentId: number) =>
          `http://localhost:8080/api/universities/${universityId}/departments/${departmentId}`,
        SUBJECTS_BATCH: (universityId: number, departmentId: number) =>
          `http://localhost:8080/api/universities/${universityId}/departments/${departmentId}/subjects/batch`,
        MAJOR: (departmentId: number, majorId: number) =>
          `http://localhost:8080/api/departments/${departmentId}/majors/${majorId}`,
        ADMISSION_SCHEDULE: (majorId: number, scheduleId: number) =>
          `http://localhost:8080/api/majors/${majorId}/schedules/${scheduleId}`,
        ADMISSION_INFO: (scheduleId: number, infoId: number) =>
          `http://localhost:8080/api/schedules/${scheduleId}/info/${infoId}`,
      };
      expect(endpoints).toBeDefined();
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

    it('型が正しく定義されていること', () => {
      // 型チェックのためのテスト
      const headers: typeof DEFAULT_HEADERS = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      };
      expect(headers).toBeDefined();
    });
  });
});
