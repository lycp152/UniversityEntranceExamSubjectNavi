import type { University, Department, Major, AdmissionInfo, AdmissionSchedule } from './university';

/**
 * 大学一覧取得APIのレスポンス型
 */
export interface GetUniversitiesResponse {
  universities: APIUniversity[];
  total: number;
  page: number;
  limit: number;
}

/**
 * 大学詳細取得APIのレスポンス型
 */
export interface GetUniversityResponse {
  university: University;
}

/**
 * 学部一覧取得APIのレスポンス型
 */
export interface GetDepartmentsResponse {
  departments: Department[];
  total: number;
  page: number;
  limit: number;
}

/**
 * 学科一覧取得APIのレスポンス型
 */
export interface GetMajorsResponse {
  majors: Major[];
  total: number;
  page: number;
  limit: number;
}

/**
 * 入試情報一覧取得APIのレスポンス型
 */
export interface GetExamInfosResponse {
  examInfos: AdmissionInfo[];
  total: number;
  page: number;
  limit: number;
}

/**
 * 入試日程一覧取得APIのレスポンス型
 */
export interface GetAdmissionSchedulesResponse {
  admissionSchedules: AdmissionSchedule[];
  total: number;
  page: number;
  limit: number;
}

/**
 * エラーレスポンスの型定義
 */
export interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// APIレスポンスの基本型定義
export interface BaseModel {
  id: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

// APIレスポンスの型定義
export interface APIUniversity extends BaseModel {
  name: string;
  departments: APIDepartment[];
}

export interface APIDepartment extends BaseModel {
  name: string;
  university_id: number;
  majors: APIMajor[];
}

export interface APIMajor extends BaseModel {
  name: string;
  department_id: number;
  exam_infos: APIExamInfo[];
}

export interface APIExamInfo extends BaseModel {
  major_id: number;
  enrollment: number;
  academic_year: number;
  valid_from: string;
  valid_until: string;
  status: string;
  admissionSchedules: APIAdmissionSchedule[];
  created_by?: string;
  updated_by?: string;
}

export interface APISubject extends BaseModel {
  test_type_id: number;
  name: string;
  score: number;
  percentage: number;
  display_order: number;
}

export interface APITestType extends BaseModel {
  admissionSchedule_id: number;
  name: string;
  subjects: APISubject[];
}

export interface APIAdmissionSchedule extends BaseModel {
  admission_info_id: number;
  name: string;
  display_order: number;
  test_types: APITestType[];
}
