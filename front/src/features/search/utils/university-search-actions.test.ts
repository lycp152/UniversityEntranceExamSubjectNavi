import { describe, it, expect, vi } from 'vitest';
import { searchUniversities } from './university-search-actions';
import { fetchUniversities } from './university-api-client';
import { ERROR_MESSAGES, SEARCH_ERROR_CODES } from '@/constants/errors/domain';
import { SearchFormState } from '../types/search-form';

// APIクライアントのモック
vi.mock('./university-api-client', () => ({
  fetchUniversities: vi.fn(),
}));

describe('大学検索のServer Action', () => {
  // テストデータの準備
  const createValidFormData = () => {
    const formData = new FormData();
    formData.append('keyword', '東京');
    formData.append('region', '関東');
    formData.append('academicField', '工学');
    formData.append('schedule', '前期');
    formData.append('classification', '国立');
    formData.append(
      'sortOrder',
      JSON.stringify([{ examType: '一般', subjectName: '数学', order: 'asc' }])
    );
    formData.append('page', '1');
    formData.append('perPage', '10');
    return formData;
  };

  describe('正常系', () => {
    it('正常な検索リクエストが成功する', async () => {
      // APIクライアントのモックを設定
      vi.mocked(fetchUniversities).mockResolvedValueOnce({
        success: true,
        timestamp: Date.now(),
        data: {
          page: 1,
          perPage: 10,
          universities: [],
          total: 0,
        },
      });

      const result = await searchUniversities({} as SearchFormState, createValidFormData());

      expect(result).toEqual({
        message: ERROR_MESSAGES[SEARCH_ERROR_CODES.SEARCH_SUCCESS],
      });
      expect(fetchUniversities).toHaveBeenCalledWith({
        keyword: '東京',
        region: ['関東'],
        academicField: ['工学'],
        schedule: ['前期'],
        classification: ['国立'],
        sortOrder: [{ examType: '一般', subjectName: '数学', order: 'asc' }],
        page: 1,
        perPage: 10,
      });
    });

    it('キーワードが空の場合でも検索が成功する', async () => {
      // APIクライアントのモックを設定
      vi.mocked(fetchUniversities).mockResolvedValueOnce({
        success: true,
        timestamp: Date.now(),
        data: {
          page: 1,
          perPage: 10,
          universities: [],
          total: 0,
        },
      });

      const formData = createValidFormData();
      formData.set('keyword', '');

      const result = await searchUniversities({} as SearchFormState, formData);

      expect(result).toEqual({
        message: ERROR_MESSAGES[SEARCH_ERROR_CODES.SEARCH_SUCCESS],
      });
    });
  });

  describe('異常系', () => {
    it('必須項目が不足している場合、エラーを返す', async () => {
      const invalidFormData = new FormData();
      // sortOrderのみ設定（他の必須項目を省略）
      invalidFormData.append(
        'sortOrder',
        JSON.stringify([{ examType: '一般', subjectName: '数学', order: 'asc' }])
      );

      const result = await searchUniversities({} as SearchFormState, invalidFormData);

      expect(result).toEqual({
        errors: {
          keyword: ['Expected string, received null'],
        },
        message: ERROR_MESSAGES[SEARCH_ERROR_CODES.SEARCH_ERROR],
      });
    });

    it('APIエラーが発生した場合、適切なエラーメッセージを返す', async () => {
      const error = new Error('APIエラーが発生しました');
      vi.mocked(fetchUniversities).mockRejectedValueOnce(error);

      const result = await searchUniversities({} as SearchFormState, createValidFormData());

      expect(result).toEqual({
        message: ERROR_MESSAGES[SEARCH_ERROR_CODES.API_ERROR],
        errors: {
          keyword: [error.message],
        },
      });
    });

    it('予期せぬエラーが発生した場合、デフォルトのエラーメッセージを返す', async () => {
      vi.mocked(fetchUniversities).mockRejectedValueOnce('予期せぬエラー');

      const result = await searchUniversities({} as SearchFormState, createValidFormData());

      expect(result).toEqual({
        message: ERROR_MESSAGES[SEARCH_ERROR_CODES.API_ERROR],
        errors: {
          keyword: [ERROR_MESSAGES[SEARCH_ERROR_CODES.SEARCH_ERROR]],
        },
      });
    });
  });
});
