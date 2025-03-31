import type {
  APIUniversity,
  APIDepartment,
  APIMajor,
  APIAdmissionSchedule,
  APIAdmissionInfo,
  APITestType,
  APISubject,
} from '@/types/api/api-response-types';
import type {
  University,
  Department,
  Major,
  AdmissionInfo,
  AdmissionSchedule,
  TestType,
  Subject,
} from '@/types/universities/university';
import type { ExamTypeName, SubjectName } from '@/constants/subjects';
import { ADMISSION_INFO_CONSTRAINTS } from '@/constants/admission-schedule';
import type { AdmissionScheduleName, DisplayOrder } from '@/constants/admission-schedule';

// 日付処理用のヘルパー関数
const formatDate = (date: string | null | undefined): string => {
  return date ? new Date(date).toString() : new Date().toString();
};

export const transformUniversity = (apiUniversity: APIUniversity): University => ({
  id: apiUniversity.id,
  name: apiUniversity.name,
  departments: apiUniversity.departments.map(transformDepartment),
  createdAt: formatDate(apiUniversity.created_at),
  updatedAt: formatDate(apiUniversity.updated_at),
  version: apiUniversity.version ?? 1,
  createdBy: apiUniversity.created_by ?? '',
  updatedBy: apiUniversity.updated_by ?? '',
});

export const transformDepartment = (apiDepartment: APIDepartment): Department => ({
  id: apiDepartment.id,
  name: apiDepartment.name,
  universityId: apiDepartment.university_id,
  majors: Array.isArray(apiDepartment.majors) ? apiDepartment.majors.map(transformMajor) : [],
  createdAt: formatDate(apiDepartment.created_at),
  updatedAt: formatDate(apiDepartment.updated_at),
  version: apiDepartment.version ?? 1,
  createdBy: apiDepartment.created_by ?? '',
  updatedBy: apiDepartment.updated_by ?? '',
});

export const transformMajor = (apiMajor: APIMajor): Major => ({
  id: apiMajor.id,
  name: apiMajor.name,
  departmentId: apiMajor.department_id,
  admissionSchedules: apiMajor.admission_schedules?.map(transformAdmissionSchedule) || [],
  createdAt: formatDate(apiMajor.created_at),
  updatedAt: formatDate(apiMajor.updated_at),
  version: apiMajor.version ?? 1,
  createdBy: apiMajor.created_by ?? '',
  updatedBy: apiMajor.updated_by ?? '',
});

export const transformAdmissionInfo = (apiAdmissionInfo: APIAdmissionInfo): AdmissionInfo => ({
  id: apiAdmissionInfo.id,
  admissionScheduleId: apiAdmissionInfo.admission_schedule_id,
  academicYear: apiAdmissionInfo.academic_year,
  enrollment: apiAdmissionInfo.enrollment,
  status: apiAdmissionInfo.status as (typeof ADMISSION_INFO_CONSTRAINTS.VALID_STATUSES)[number],
  testTypes: apiAdmissionInfo.test_types?.map(transformTestType) ?? [],
  createdAt: formatDate(apiAdmissionInfo.created_at),
  updatedAt: formatDate(apiAdmissionInfo.updated_at),
  version: apiAdmissionInfo.version ?? 1,
  createdBy: apiAdmissionInfo.created_by ?? '',
  updatedBy: apiAdmissionInfo.updated_by ?? '',
});

export const transformAdmissionSchedule = (
  apiSchedule: APIAdmissionSchedule
): AdmissionSchedule => ({
  id: apiSchedule.id,
  majorId: apiSchedule.major_id,
  name: apiSchedule.name as AdmissionScheduleName,
  displayOrder: apiSchedule.display_order as DisplayOrder,
  testTypes: apiSchedule.test_types.map(transformTestType),
  admissionInfos: apiSchedule.admission_infos.map(transformAdmissionInfo),
  createdAt: formatDate(apiSchedule.created_at),
  updatedAt: formatDate(apiSchedule.updated_at),
  version: apiSchedule.version ?? 1,
  createdBy: apiSchedule.created_by ?? '',
  updatedBy: apiSchedule.updated_by ?? '',
});

export function transformTestType(apiTestType: APITestType): TestType {
  return {
    id: apiTestType.id,
    admissionScheduleId: apiTestType.admission_schedule_id,
    name: apiTestType.name as ExamTypeName,
    subjects: apiTestType.subjects.map(transformSubject),
    createdAt: formatDate(apiTestType.created_at),
    updatedAt: formatDate(apiTestType.updated_at),
    version: apiTestType.version ?? 1,
    createdBy: apiTestType.created_by ?? '',
    updatedBy: apiTestType.updated_by ?? '',
  };
}

export function transformSubject(apiSubject: APISubject): Subject {
  return {
    id: apiSubject.id,
    testTypeId: apiSubject.test_type_id,
    name: apiSubject.name as SubjectName,
    score: apiSubject.score,
    percentage: apiSubject.percentage,
    displayOrder: apiSubject.display_order,
    createdAt: formatDate(apiSubject.created_at),
    updatedAt: formatDate(apiSubject.updated_at),
    version: apiSubject.version ?? 1,
    createdBy: apiSubject.created_by ?? '',
    updatedBy: apiSubject.updated_by ?? '',
  };
}
