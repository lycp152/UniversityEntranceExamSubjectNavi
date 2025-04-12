'use server';

import { SearchFormSchema } from '@/types/api/api-schemas';
import { ERROR_MESSAGES } from '../constants/error-messages';
import { SearchFormState } from '../types/search-form';
import { fetchUniversities } from './universities';

/**
 * 大学検索のためのServer Action
 *
 * フォームデータを受け取り、バリデーション後にAPIリクエストを実行します。
 * 検索結果または検証エラーを返します。
 *
 * @param prevState - 前回の検索フォームの状態
 * @param formData - フォームから送信されたデータ
 *   - keyword: 検索キーワード
 *   - region: 地域の配列
 *   - academicField: 学問分野の配列
 *   - schedule: 試験日程の配列
 *   - classification: 大学区分の配列
 *   - sortOrder: 並び順の設定
 *   - page: ページ番号
 *   - perPage: 1ページあたりの表示件数
 * @returns {Promise<SearchFormState>} 検索結果または検証エラーを含む状態
 */
export async function searchUniversities(
  _prevState: SearchFormState,
  formData: FormData
): Promise<SearchFormState> {
  const validatedFields = SearchFormSchema.safeParse({
    keyword: formData.get('keyword'),
    region: formData.getAll('region'),
    academicField: formData.getAll('academicField'),
    schedule: formData.getAll('schedule'),
    classification: formData.getAll('classification'),
    sortOrder: formData.get('sortOrder') ? JSON.parse(formData.get('sortOrder') as string) : [],
    page: Number(formData.get('page')) || 1,
    perPage: Number(formData.get('perPage')) || 10,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await fetchUniversities(validatedFields.data);
    return {
      message: ERROR_MESSAGES.SEARCH_SUCCESS,
    };
  } catch (error: unknown) {
    console.error('API Error:', error);
    const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.SEARCH_ERROR;
    return {
      message: ERROR_MESSAGES.API_ERROR,
      errors: {
        keyword: [errorMessage],
      },
    };
  }
}
