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
}

// APIレスポンスの型定義
export interface APIUniversity extends BaseModel {
  name: string;
  departments: APIDepartment[];
}

export interface APIDepartment extends BaseModel {
  name: string;
  university_id: number;
  majors?: APIMajor[];
}

export interface APIMajor extends BaseModel {
  name: string;
  department_id: number;
  admission_schedules: APIAdmissionSchedule[];
}

export interface APIAdmissionSchedule extends BaseModel {
  major_id: number;
  name: string;
  display_order: number;
  test_types: APITestType[];
  admission_infos: APIAdmissionInfo[];
}

export interface APIAdmissionInfo extends BaseModel {
  major_id: number;
  enrollment: number;
  academic_year: number;
  status: string;
}

export interface APITestType extends BaseModel {
  admission_schedule_id: number;
  name: string;
  subjects: APISubject[];
}

export interface APISubject extends BaseModel {
  test_type_id: number;
  name: string;
  score: number;
  percentage: number;
  display_order: number;
}
