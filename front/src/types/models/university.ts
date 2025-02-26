import type { BaseModel } from '../common/base';
import type { Subject } from '@/types/subject/subjects';

export type TestTypeName = 'common' | 'individual';

export interface TestType extends BaseModel {
  admissionSchedule_id: number;
  name: TestTypeName;
  subjects: Subject[];
}

export interface AdmissionSchedule extends BaseModel {
  admission_info_id: number;
  name: string;
  display_order: number;
  test_types: TestType[];
}

export interface AdmissionInfo extends BaseModel {
  major_id: number;
  enrollment: number;
  academic_year: number;
  valid_from: string;
  valid_until: string;
  status: string;
  admissionSchedules: AdmissionSchedule[];
  created_by?: string;
  updated_by?: string;
}

export interface Major extends BaseModel {
  department_id: number;
  name: string;
  exam_infos: AdmissionInfo[];
}

export interface Department extends BaseModel {
  university_id: number;
  name: string;
  majors: Major[];
}

export interface University extends BaseModel {
  name: string;
  departments: Department[];
}
