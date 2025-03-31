/**
 * バリデーションエラーメッセージの定義
 * アプリケーション全体で使用されるバリデーションエラーメッセージを集約
 *
 * @module validation-messages
 * @description
 * - 共通のバリデーションメッセージ
 * - 文字列、数値、日付などの型別メッセージ
 * - 配列や検索フォームなどの機能別メッセージ
 */

/**
 * バリデーションエラーメッセージの定義オブジェクト
 *
 * @constant {Object} validationMessages
 * @property {Object} 共通メッセージ - 基本的なバリデーションメッセージ
 * @property {Object} string - 文字列バリデーション用メッセージ
 * @property {Object} number - 数値バリデーション用メッセージ
 * @property {Object} date - 日付バリデーション用メッセージ
 * @property {Object} array - 配列バリデーション用メッセージ
 * @property {Object} search - 検索フォーム用メッセージ
 */
export const validationMessages = {
  // 共通メッセージ
  required: '必須項目です',
  invalid_type: '入力形式が正しくありません',
  invalid_string: '文字列を入力してください',
  invalid_number: '数値を入力してください',
  invalid_date: '日付を入力してください',
  invalid_url: '有効なURLを入力してください',
  invalid_enum: '選択肢から選んでください',

  // 文字列バリデーション
  string: {
    min: (min: number) => `${min}文字以上で入力してください`,
    max: (max: number) => `${max}文字以下で入力してください`,
    length: (len: number) => `${len}文字で入力してください`,
    email: 'メールアドレスの形式が正しくありません',
    url: 'URLの形式が正しくありません',
  },

  // 数値バリデーション
  number: {
    min: (min: number) => `${min}以上の数値を入力してください`,
    max: (max: number) => `${max}以下の数値を入力してください`,
    integer: '整数を入力してください',
    positive: '正の数を入力してください',
  },

  // 日付バリデーション
  date: {
    min: (min: string) => `${min}以降の日付を入力してください`,
    max: (max: string) => `${max}以前の日付を入力してください`,
  },

  // 配列バリデーション
  array: {
    min: (min: number) => `${min}個以上選択してください`,
    max: (max: number) => `${max}個以下で選択してください`,
  },

  // 検索フォーム
  search: {
    keyword: {
      min: '検索キーワードを入力してください',
      max: '検索キーワードは100文字以下で入力してください',
    },
    page: 'ページ番号は1以上で入力してください',
    perPage: '1ページあたりの表示件数は1から100の間で入力してください',
  },

  // 追加されたメッセージ
  url: '有効なURLを入力してください',
  enum: '選択肢から選んでください',
} as const;
