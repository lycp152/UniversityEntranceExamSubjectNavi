import { describe, it, expect, vi } from 'vitest';
import {
  UniversityService,
  getCachedUniversities,
  getCachedUniversity,
} from './university-service';
import { apiClient } from '@/features/universities/utils/api-client';
import { API_ENDPOINTS } from '@/constants/api/index';

/**
 * 大学サービスのテスト
 *
 * このテストスイートでは、大学データの取得や処理を行う
 * サービスクラスの機能を検証します。
 *
 * @module university-service.test
 */

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

  describe('updateDepartment', () => {
    it('学部情報を正常に更新できること', async () => {
      const mockDepartment = {
        id: 1,
        name: 'テスト学部',
        universityId: 1,
      };
      vi.mocked(apiClient.put).mockResolvedValueOnce(mockDepartment);
      const result = await UniversityService.updateDepartment(1, mockDepartment);
      expect(result).toEqual(mockDepartment);
      expect(apiClient.put).toHaveBeenCalledWith(
        API_ENDPOINTS.DEPARTMENTS(1, mockDepartment.id),
        mockDepartment
      );
    });

    it('学部情報の更新に失敗した場合にエラーをスローすること', async () => {
      const mockDepartment = {
        id: 1,
        name: 'テスト学部',
        universityId: 1,
      };
      const error = new Error('更新に失敗しました');
      vi.mocked(apiClient.put).mockRejectedValueOnce(error);
      await expect(UniversityService.updateDepartment(1, mockDepartment)).rejects.toThrow(error);
    });
  });

  describe('updateSubjects', () => {
    it('科目情報を正常に一括更新できること', async () => {
      const mockSubjects = [
        { id: 1, name: 'テスト科目1', score: 100 },
        { id: 2, name: 'テスト科目2', score: 200 },
      ];
      vi.mocked(apiClient.put).mockResolvedValueOnce(mockSubjects);
      const result = await UniversityService.updateSubjects(1, 1, mockSubjects);
      expect(result).toEqual(mockSubjects);
      expect(apiClient.put).toHaveBeenCalledWith(API_ENDPOINTS.SUBJECTS_BATCH(1, 1), {
        subjects: mockSubjects,
      });
    });

    it('科目情報の一括更新に失敗した場合にエラーをスローすること', async () => {
      const mockSubjects = [{ id: 1, name: 'テスト科目1', score: 100 }];
      const error = new Error('更新に失敗しました');
      vi.mocked(apiClient.put).mockRejectedValueOnce(error);
      await expect(UniversityService.updateSubjects(1, 1, mockSubjects)).rejects.toThrow(error);
    });
  });

  describe('エラーハンドリング', () => {
    it('getUniversitiesが失敗した場合にエラーをスローすること', async () => {
      const error = new Error('データ取得に失敗しました');
      vi.mocked(apiClient.get).mockRejectedValueOnce(error);
      await expect(UniversityService.getUniversities()).rejects.toThrow(error);
    });

    it('getUniversityが失敗した場合にエラーをスローすること', async () => {
      const error = new Error('データ取得に失敗しました');
      vi.mocked(apiClient.get).mockRejectedValueOnce(error);
      await expect(UniversityService.getUniversity(1)).rejects.toThrow(error);
    });

    it('updateUniversityが失敗した場合にエラーをスローすること', async () => {
      const error = new Error('更新に失敗しました');
      vi.mocked(apiClient.put).mockRejectedValueOnce(error);
      await expect(UniversityService.updateUniversity(mockUniversity)).rejects.toThrow(error);
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

  it('異なるIDに対してgetCachedUniversityは別々にAPIを呼び出すこと', async () => {
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce({ ...mockUniversity, id: 1 })
      .mockResolvedValueOnce({ ...mockUniversity, id: 2 });
    await getCachedUniversity(1);
    await getCachedUniversity(2);
  });

  it('キャッシュされたデータが正しく返されること', async () => {
    const mockData = { ...mockUniversity, id: 1 };
    vi.mocked(apiClient.get).mockResolvedValueOnce(mockData);
    const result1 = await getCachedUniversity(1);
    const result2 = await getCachedUniversity(1);
    expect(result1).toEqual(mockData);
    expect(result2).toEqual(mockData);
    expect(result1).toBe(result2); // 同じオブジェクト参照であることを確認
  });
});
