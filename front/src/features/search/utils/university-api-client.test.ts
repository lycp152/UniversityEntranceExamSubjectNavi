import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchUniversities, UniversityApiError } from './university-api-client';

/**
 * テスト用のモックデータ
 */
const MOCK_VALID_DATA = {
  keyword: 'テスト大学',
  region: ['関東'],
  academicField: ['工学'],
  schedule: ['前期'],
  classification: ['国立'],
  sortOrder: [
    {
      examType: '一般',
      subjectName: '数学',
      order: 'asc',
    },
  ],
  page: 1,
  perPage: 10,
};

const MOCK_RESPONSE = {
  universities: [
    {
      id: 1,
      name: 'テスト大学',
      region: '関東',
      academicField: '工学',
      schedule: '前期',
      classification: '国立',
    },
  ],
  total: 1,
};

const MOCK_ERROR_RESPONSE = {
  message: 'テストエラー',
  code: 'TEST_ERROR',
};

/**
 * fetchのモック
 */
global.fetch = vi.fn();

/**
 * validateApiResponseのモック
 */
vi.mock('./api-validation', () => ({
  validateApiResponse: vi.fn().mockImplementation(async (_schema, data) => {
    if (data === MOCK_RESPONSE) {
      return MOCK_RESPONSE;
    }
    if (data === MOCK_ERROR_RESPONSE) {
      return MOCK_ERROR_RESPONSE;
    }
    throw new Error('予期せぬエラーが発生しました');
  }),
}));

describe('university-api-client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchUniversities', () => {
    it('正しいデータでAPIリクエストを実行する', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(MOCK_RESPONSE),
      } as Response);

      const result = await fetchUniversities(MOCK_VALID_DATA);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/universities'),
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(MOCK_VALID_DATA),
        })
      );
      expect(result).toEqual(MOCK_RESPONSE);
    });

    it('APIエラー時にUniversityApiErrorをスローする', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve(MOCK_ERROR_RESPONSE),
      } as Response);

      await expect(fetchUniversities(MOCK_VALID_DATA)).rejects.toThrow(UniversityApiError);
    });

    it('予期せぬエラー時に適切なエラーメッセージをスローする', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(fetchUniversities(MOCK_VALID_DATA)).rejects.toThrow(
        '大学情報の取得中にエラーが発生しました'
      );
    });
  });

  describe('UniversityApiError', () => {
    it('正しいエラー情報を持つ例外を生成する', () => {
      const error = new UniversityApiError('テストエラー', 400, 'TEST_ERROR');

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('UniversityApiError');
      expect(error.message).toBe('テストエラー');
      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe('TEST_ERROR');
    });
  });
});
