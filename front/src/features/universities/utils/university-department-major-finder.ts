import type { APIUniversity, APIDepartment, APIMajor } from '@/types/api/types';

/**
 * 大学、学部、学科の情報を検索するヘルパー関数
 * 指定されたIDに基づいて、大学データから学部と学科の情報を取得
 *
 * @param {APIUniversity} university - 大学データ
 * @param {string} departmentId - 学部ID（文字列形式）
 * @param {string} majorId - 学科ID（文字列形式）
 * @returns {Object | null} 学部と学科の情報、またはnull（見つからない場合）
 * @returns {APIDepartment} department - 学部情報
 * @returns {APIMajor} major - 学科情報
 */
export const findDepartmentAndMajor = (
  university: APIUniversity,
  departmentId: string,
  majorId: string
): { department: APIDepartment; major: APIMajor } | null => {
  // 学部を検索
  const department = university.departments?.find(
    (d: APIDepartment) => d.id === parseInt(departmentId, 10)
  );

  if (!department) {
    return null;
  }

  // 学科を検索
  const major = department.majors?.find((m: APIMajor) => m.id === parseInt(majorId, 10));

  if (!major) {
    return null;
  }

  return { department, major };
};
