import {
  UniversitiesResponseSchema,
  ErrorResponseSchema,
} from '@/features/search/types/api-response-schemas';
import { validateApiResponse } from '@/features/search/utils/api-validation';
import { SearchFormSchema } from '@/types/api/schemas';
import { z } from 'zod';

/**
 * APIクライアントの設定
 */
const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
} as const;

/**
 * APIエラーの型定義
 */
export class UniversityApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly errorCode?: string
  ) {
    super(message);
    this.name = 'UniversityApiError';
  }
}

/**
 * 大学検索APIを呼び出す関数
 *
 * バリデーション済みの検索条件を使用してAPIリクエストを実行し、
 * レスポンスのバリデーションも行います。
 *
 * @param validatedData - Zodでバリデーション済みの検索条件
 *   - keyword: 検索キーワード
 *   - region: 地域の配列
 *   - academicField: 学問分野の配列
 *   - schedule: 試験日程の配列
 *   - classification: 大学区分の配列
 *   - sortOrder: 並び順の設定
 *   - page: ページ番号
 *   - perPage: 1ページあたりの表示件数
 * @throws {UniversityApiError} APIリクエストが失敗した場合やレスポンスが不正な場合
 * @returns {Promise<z.infer<typeof UniversitiesResponseSchema>>} バリデーション済みの大学情報
 */
export async function fetchUniversities(validatedData: z.infer<typeof SearchFormSchema>) {
  try {
    const response = await fetch(`${API_CONFIG.baseUrl}/api/universities`, {
      method: 'GET',
      headers: API_CONFIG.headers,
      body: JSON.stringify(validatedData),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorData = await validateApiResponse(ErrorResponseSchema, data);
      throw new UniversityApiError(errorData.message, response.status, errorData.code);
    }

    return await validateApiResponse(UniversitiesResponseSchema, data);
  } catch (error) {
    if (error instanceof UniversityApiError) {
      throw error;
    }
    throw new UniversityApiError(
      '大学情報の取得中にエラーが発生しました',
      undefined,
      'UNKNOWN_ERROR'
    );
  }
}
