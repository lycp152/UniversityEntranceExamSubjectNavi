/**
 * 大学データ検索に関するカスタムエラークラス
 *
 * @class UniversityDataError
 * @extends Error
 * @description 大学データの検索や操作に関するエラーを表すカスタムエラークラス
 */
export class UniversityDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UniversityDataError';
  }
}
