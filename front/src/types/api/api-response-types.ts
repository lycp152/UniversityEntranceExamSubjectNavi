import {
  University,
  Department,
  Major,
  AdmissionSchedule,
  AdmissionInfo,
  TestType,
  Subject,
} from './api-schemas';

/**
 * 大学一覧取得APIのレスポンス型
 */
export interface GetUniversitiesResponse {
  universities: APIUniversity[];
  total: number;
  page: number;
  limit: number;
}

// APIレスポンスの基本型定義
export interface BaseModel {
  id: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  version: number;
  created_by: string;
  updated_by: string;
}

// APIレスポンスの型定義
export type APIUniversity = University;
export type APIDepartment = Department;
export type APIMajor = Major;
export type APIAdmissionSchedule = AdmissionSchedule;
export type APIAdmissionInfo = AdmissionInfo;
export type APITestType = TestType;
export type APISubject = Subject;
