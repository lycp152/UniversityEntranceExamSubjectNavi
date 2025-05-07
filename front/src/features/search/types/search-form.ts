/**
 * 検索機能の型定義
 *
 * このモジュールは、検索フォームの状態管理とバリデーションに関連する型定義を提供します。
 * フォームの入力値、エラーメッセージ、バリデーション結果などの型を定義しています。
 *
 * @module search-form
 * @see {@link SearchFormState} 検索フォームの状態を表す型
 */

import { SearchFormSchema } from '@/types/api/schemas';

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

export { SearchFormSchema };
