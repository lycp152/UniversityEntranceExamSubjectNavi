import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type {
  APIUniversity,
  APIDepartment,
  APISubject,
  GetUniversitiesResponse,
} from '@/lib/types/university/api';

export class UniversityService {
  static async getUniversities(): Promise<GetUniversitiesResponse> {
    return apiClient.get<GetUniversitiesResponse>(API_ENDPOINTS.UNIVERSITIES);
  }

  static async getUniversity(universityId: string | number): Promise<APIUniversity> {
    return apiClient.get<APIUniversity>(API_ENDPOINTS.UNIVERSITY(universityId));
  }

  static async updateUniversity(university: APIUniversity): Promise<APIUniversity> {
    return apiClient.put<APIUniversity>(API_ENDPOINTS.UNIVERSITY(university.id), university);
  }

  static async updateDepartment(
    universityId: number,
    department: APIDepartment
  ): Promise<APIDepartment> {
    return apiClient.put<APIDepartment>(
      API_ENDPOINTS.DEPARTMENTS(universityId, department.id),
      department
    );
  }

  static async updateSubjects(
    universityId: number,
    departmentId: number,
    subjects: APISubject[]
  ): Promise<APISubject[]> {
    return apiClient.put<APISubject[]>(
      API_ENDPOINTS.SUBJECTS_BATCH(universityId, departmentId),
      subjects
    );
  }
}
