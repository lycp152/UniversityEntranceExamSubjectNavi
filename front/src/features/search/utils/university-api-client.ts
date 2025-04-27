import {
  UniversitiesResponseSchema,
  ErrorResponseSchema,
} from '@/features/search/types/api-response-schemas';
import { validateApiResponse } from '@/features/search/utils/api-validation';
import { SearchFormSchema } from '@/types/api/schemas';
import { z } from 'zod';

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
 * @throws {Error} APIリクエストが失敗した場合やレスポンスが不正な場合
 * @returns {Promise<z.infer<typeof UniversitiesResponseSchema>>} バリデーション済みの大学情報
 */
export async function fetchUniversities(validatedData: z.infer<typeof SearchFormSchema>) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/universities`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(validatedData),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorData = await validateApiResponse(ErrorResponseSchema, data);
    throw new Error(errorData.message);
  }

  return await validateApiResponse(UniversitiesResponseSchema, data);
}
