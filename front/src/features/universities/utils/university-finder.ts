import type { APIUniversity, APIDepartment, APIMajor } from '@/types/api/types';
import { UniversityDataError } from './university-errors';

/**
 * 大学、学部、学科の情報を検索するヘルパー関数
 * 指定されたIDに基づいて、大学データから学部と学科の情報を取得
 *
 * @param {APIUniversity} university - 大学データ
 * @param {string} departmentId - 学部ID（文字列形式）
 * @param {string} majorId - 学科ID（文字列形式）
 * @returns {Object} 学部と学科の情報
 * @returns {APIDepartment} department - 学部情報
 * @returns {APIMajor} major - 学科情報
 * @throws {UniversityDataError} 学部または学科が見つからない場合にエラーをスロー
 */
export const findDepartmentAndMajor = (
  university: APIUniversity,
  departmentId: string,
  majorId: string
): { department: APIDepartment; major: APIMajor } => {
  const departmentIdNum = Number.parseInt(departmentId, 10);
  const majorIdNum = Number.parseInt(majorId, 10);

  if (Number.isNaN(departmentIdNum) || Number.isNaN(majorIdNum)) {
    throw new UniversityDataError(
      `無効なID形式です。学部ID: ${departmentId}, 学科ID: ${majorId}。数値形式で指定してください。`
    );
  }

  // 学部と学科を一度に検索
  const department = university.departments?.find((d: APIDepartment) => {
    if (d.id === departmentIdNum) {
      const major = d.majors?.find((m: APIMajor) => m.id === majorIdNum);
      if (major) {
        return true;
      }
      throw new UniversityDataError(
        `学科が見つかりません。大学: ${university.name}, 学部: ${d.name}, 学科ID: ${majorId}`
      );
    }
    return false;
  });

  if (!department) {
    throw new UniversityDataError(
      `学部が見つかりません。大学: ${university.name}, 学部ID: ${departmentId}`
    );
  }

  // 学科は既に検索済みなので、ここで取得
  const major = department.majors?.find((m: APIMajor) => m.id === majorIdNum);

  return { department, major: major! }; // majorは必ず存在するため、non-null assertionを使用
};
