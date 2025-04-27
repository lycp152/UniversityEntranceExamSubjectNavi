/**
 * 検索機能の型定義
 *
 * このモジュールは、検索フォームの状態管理とバリデーションに関連する型定義を提供します。
 * フォームの入力値、エラーメッセージ、バリデーション結果などの型を定義しています。
 *
 * @module search-form
 * @see {@link SearchFormState} 検索フォームの状態を表す型
 * @see {@link searchFormSchema} 検索フォームのバリデーションスキーマ
 */

import { z } from 'zod';
import { commonRules } from '@/features/search/utils/zod-rules';

/**
 * 検索フォームの状態を表す型
 *
 * この型は、検索フォームの状態を管理するために使用されます。
 * フォームの入力値、エラーメッセージ、バリデーション結果などを含みます。
 *
 * @typedef {Object} SearchFormState
 * @property {string} [message] - フォーム全体のメッセージ（エラーや成功など）
 * @property {Object} [errors] - 各フィールドのエラーメッセージ
 * @property {string[]} [errors.keyword] - キーワード検索のエラーメッセージ
 * @property {string[]} [errors.type] - 検索タイプのエラーメッセージ
 * @property {string[]} [errors.location] - 場所のエラーメッセージ
 * @property {string[]} [errors.region] - 地域のエラーメッセージ
 * @property {string[]} [errors.academicField] - 学問分野のエラーメッセージ
 * @property {string[]} [errors.schedule] - スケジュールのエラーメッセージ
 * @property {string[]} [errors.classification] - 分類のエラーメッセージ
 * @property {string[]} [errors.sortOrder] - ソート順のエラーメッセージ
 * @property {string[]} [errors.page] - ページ番号のエラーメッセージ
 * @property {string[]} [errors.perPage] - 1ページあたりの表示件数のエラーメッセージ
 *
 * @example
 * ```typescript
 * const state: SearchFormState = {
 *   message: '入力内容に誤りがあります',
 *   errors: {
 *     keyword: ['キーワードは必須です'],
 *     region: ['地域を選択してください']
 *   }
 * };
 * ```
 */
export type SearchFormState = {
  message?: string;
  errors?: {
    keyword?: string[];
    type?: string[];
    location?: string[];
    region?: string[];
    academicField?: string[];
    schedule?: string[];
    classification?: string[];
    sortOrder?: string[];
    page?: string[];
    perPage?: string[];
  };
};

/**
 * 検索フォームのバリデーションスキーマ
 *
 * このスキーマは、検索フォームの入力値のバリデーションルールを定義します。
 * Zodを使用して、各フィールドの型チェックとバリデーションを行います。
 *
 * @constant {z.ZodObject} searchFormSchema
 * @property {z.ZodString} keyword - キーワード検索（0-100文字）
 * @property {z.ZodArray} region - 地域の選択（オプショナル）
 * @property {z.ZodArray} academicField - 学問分野の選択（オプショナル）
 * @property {z.ZodArray} schedule - スケジュールの選択（オプショナル）
 * @property {z.ZodArray} classification - 分類の選択（オプショナル）
 * @property {z.ZodArray} sortOrder - ソート順の設定（オプショナル）
 * @property {z.ZodNumber} page - ページ番号（1-100、オプショナル）
 * @property {z.ZodNumber} perPage - 1ページあたりの表示件数（1-100、オプショナル）
 *
 * @example
 * ```typescript
 * const result = searchFormSchema.safeParse({
 *   keyword: '北海道大学',
 *   region: ['北海道'],
 *   page: 1,
 *   perPage: 10
 * });
 * ```
 */
export const searchFormSchema = z.object({
  keyword: commonRules.string.minMax(0, 100, 'キーワードは100文字以内で入力してください'),
  region: z.array(z.string()).optional(),
  academicField: z.array(z.string()).optional(),
  schedule: z.array(z.string()).optional(),
  classification: z.array(z.string()).optional(),
  sortOrder: z
    .array(
      z.object({
        examType: z.string(),
        subjectName: z.string(),
        order: z.string(),
      })
    )
    .optional(),
  page: commonRules.number.minMax(1, 100, 'ページ番号は1から100の間で入力してください').optional(),
  perPage: commonRules.number
    .minMax(1, 100, '1ページあたりの表示件数は1から100の間で入力してください')
    .optional(),
});
