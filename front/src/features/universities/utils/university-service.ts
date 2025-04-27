import { apiClient } from '@/features/universities/utils/api-client';
import { API_ENDPOINTS } from '@/features/universities/types/api-endpoints-paths';
import type {
  APIUniversity,
  APIDepartment,
  APISubject,
  GetUniversitiesResponse,
} from '@/types/api/types';

/**
 * 大学関連のデータを取得・更新するサービスクラス
 * APIクライアントを使用して大学、学部、科目のデータを操作
 */
export class UniversityService {
  /**
   * 全大学の一覧を取得
   * @returns {Promise<GetUniversitiesResponse>} 大学一覧のレスポンス
   */
  static async getUniversities(): Promise<GetUniversitiesResponse> {
    return apiClient.get<GetUniversitiesResponse>(API_ENDPOINTS.UNIVERSITIES);
  }

  /**
   * 指定されたIDの大学情報を取得
   * @param {string | number} universityId - 大学ID
   * @returns {Promise<APIUniversity>} 大学情報
   */
  static async getUniversity(universityId: string | number): Promise<APIUniversity> {
    return apiClient.get<APIUniversity>(API_ENDPOINTS.UNIVERSITY(universityId));
  }

  /**
   * 大学情報を更新
   * @param {APIUniversity} university - 更新する大学情報
   * @returns {Promise<APIUniversity>} 更新後の大学情報
   */
  static async updateUniversity(university: APIUniversity): Promise<APIUniversity> {
    return apiClient.put<APIUniversity>(API_ENDPOINTS.UNIVERSITY(university.id), university);
  }

  /**
   * 学部情報を更新
   * @param {number} universityId - 大学ID
   * @param {APIDepartment} department - 更新する学部情報
   * @returns {Promise<APIDepartment>} 更新後の学部情報
   */
  static async updateDepartment(
    universityId: number,
    department: APIDepartment
  ): Promise<APIDepartment> {
    return apiClient.put<APIDepartment>(
      API_ENDPOINTS.DEPARTMENTS(universityId, department.id),
      department
    );
  }

  /**
   * 科目情報を一括更新
   * @param {number} universityId - 大学ID
   * @param {number} departmentId - 学部ID
   * @param {APISubject[]} subjects - 更新する科目情報の配列
   * @returns {Promise<APISubject[]>} 更新後の科目情報の配列
   */
  static async updateSubjects(
    universityId: number,
    departmentId: number,
    subjects: APISubject[]
  ): Promise<APISubject[]> {
    return apiClient.put<APISubject[]>(API_ENDPOINTS.SUBJECTS_BATCH(universityId, departmentId), {
      subjects,
    });
  }
}
