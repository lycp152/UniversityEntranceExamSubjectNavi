export type TestType = '共通' | '二次';

export interface TestScore {
  ID: number;
  subject_id: number;
  test_type: TestType;
  score: number;
  percentage: number;
  CreatedAt?: string;
  UpdatedAt?: string;
  DeletedAt?: string | null;
}

export interface Subject {
  ID: number;
  exam_info_id: number;
  name: string;
  display_order: number;
  test_scores: TestScore[];
  ExamInfo?: ExamInfo;
  CreatedAt?: string;
  UpdatedAt?: string;
  DeletedAt?: string | null;
  majorId?: number;
  scheduleId?: number;
  academicYear?: number;
}

export interface Schedule {
  ID: number;
  name: string;
  display_order: number;
  description: string;
  start_date: string;
  end_date: string;
  CreatedAt?: string;
  UpdatedAt?: string;
  DeletedAt?: string | null;
}

export interface ExamInfo {
  ID: number;
  major_id: number;
  schedule_id: number;
  schedule: Schedule;
  enrollment: number;
  academic_year: number;
  valid_from: string;
  valid_until: string;
  status: 'active' | 'archived' | 'draft';
  subjects: Subject[];
  Major?: Major;
  created_by: string;
  updated_by: string;
  CreatedAt?: string;
  UpdatedAt?: string;
  DeletedAt?: string | null;
}

export interface Major {
  ID: number;
  department_id: number;
  name: string;
  description: string;
  website: string;
  features: string;
  exam_infos: ExamInfo[];
  Department?: Department;
  CreatedAt?: string;
  UpdatedAt?: string;
  DeletedAt?: string | null;
}

export interface Department {
  ID: number;
  university_id: number;
  name: string;
  description: string;
  website: string;
  majors: Major[];
  University?: University;
  CreatedAt?: string;
  UpdatedAt?: string;
  DeletedAt?: string | null;
}

export interface University {
  ID: number;
  name: string;
  description: string;
  website: string;
  departments: Department[];
  CreatedAt?: string;
  UpdatedAt?: string;
  DeletedAt?: string | null;
}
