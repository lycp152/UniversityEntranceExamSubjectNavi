import { describe, it, expect, vi } from 'vitest';
import {
  UniversityService,
  getCachedUniversities,
  getCachedUniversity,
} from './university-service';
import { apiClient } from '@/features/universities/utils/api-client';
import { API_ENDPOINTS } from '@/constants/api/index';

// APIクライアントのモック
vi.mock('@/features/universities/utils/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

// cache関数のモック
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    cache: (fn: Function) => {
      const cache = new Map();
      return (...args: any[]) => {
        const key = JSON.stringify(args);
        if (!cache.has(key)) {
          cache.set(key, fn(...args));
        }
        return cache.get(key);
      };
    },
  };
});

// テスト用のモックデータ
const mockUniversity = {
  id: 1,
  name: 'テスト大学',
  departments: [],
};

const mockUniversities = [mockUniversity];

describe('UniversityService', () => {
  describe('getUniversities', () => {
    it('大学一覧を正常に取得できること', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce(mockUniversities);
      const result = await UniversityService.getUniversities();
      expect(result).toEqual(mockUniversities);
      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.UNIVERSITIES);
    });
  });

  describe('getUniversity', () => {
    it('指定されたIDの大学情報を正常に取得できること', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce(mockUniversity);
      const result = await UniversityService.getUniversity(1);
      expect(result).toEqual(mockUniversity);
      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.UNIVERSITY(1));
    });
  });

  describe('updateUniversity', () => {
    it('大学情報を正常に更新できること', async () => {
      vi.mocked(apiClient.put).mockResolvedValueOnce(mockUniversity);
      const result = await UniversityService.updateUniversity(mockUniversity);
      expect(result).toEqual(mockUniversity);
      expect(apiClient.put).toHaveBeenCalledWith(
        API_ENDPOINTS.UNIVERSITY(mockUniversity.id),
        mockUniversity
      );
    });
  });
});

describe('キャッシュ機能', () => {
  it('getCachedUniversitiesはAPIを1回だけ呼び出すこと', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce(mockUniversities);
    await getCachedUniversities();
    await getCachedUniversities();
    expect(apiClient.get).toHaveBeenCalledTimes(1);
  });

  it('getCachedUniversityは同じIDに対してAPIを1回だけ呼び出すこと', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce(mockUniversity);
    await getCachedUniversity(1);
    await getCachedUniversity(1);
    expect(apiClient.get).toHaveBeenCalledTimes(1);
  });
});
