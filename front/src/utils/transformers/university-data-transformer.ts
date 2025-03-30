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

export const transformUniversity = (apiUniversity: APIUniversity): University => ({
  id: apiUniversity.id,
  name: apiUniversity.name,
  departments: apiUniversity.departments.map(transformDepartment),
  createdAt: apiUniversity.created_at ?? '',
  updatedAt: apiUniversity.updated_at ?? '',
  version: apiUniversity.version ?? 1,
  createdBy: apiUniversity.created_by ?? '',
  updatedBy: apiUniversity.updated_by ?? '',
});

export const transformDepartment = (apiDepartment: APIDepartment): Department => ({
  id: apiDepartment.id,
  name: apiDepartment.name,
  universityId: apiDepartment.university_id,
  majors: Array.isArray(apiDepartment.majors) ? apiDepartment.majors.map(transformMajor) : [],
  createdAt: apiDepartment.created_at ?? '',
  updatedAt: apiDepartment.updated_at ?? '',
  version: apiDepartment.version ?? 1,
  createdBy: apiDepartment.created_by ?? '',
  updatedBy: apiDepartment.updated_by ?? '',
});

export const transformMajor = (apiMajor: APIMajor): Major => ({
  id: apiMajor.id,
  name: apiMajor.name,
  departmentId: apiMajor.department_id,
  admissionSchedules: apiMajor.admission_schedules?.map(transformAdmissionSchedule) || [],
  createdAt: apiMajor.created_at ?? '',
  updatedAt: apiMajor.updated_at ?? '',
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
  createdAt: apiAdmissionInfo.created_at ?? '',
  updatedAt: apiAdmissionInfo.updated_at ?? '',
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
  createdAt: apiSchedule.created_at ?? '',
  updatedAt: apiSchedule.updated_at ?? '',
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
    createdAt: apiTestType.created_at ?? '',
    updatedAt: apiTestType.updated_at ?? '',
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
    createdAt: apiSubject.created_at ?? '',
    updatedAt: apiSubject.updated_at ?? '',
    version: apiSubject.version ?? 1,
    createdBy: apiSubject.created_by ?? '',
    updatedBy: apiSubject.updated_by ?? '',
  };
}

export const transformAPIResponse = (data: APIUniversity[]): University[] => {
  return data.map(transformUniversityFromAPI);
};

const transformUniversityFromAPI = (university: APIUniversity): University => ({
  id: university.id,
  name: university.name,
  departments: university.departments?.map(transformDepartmentFromAPI) ?? [],
  createdAt: (university.created_at ?? new Date()).toString(),
  updatedAt: (university.updated_at ?? new Date()).toString(),
  version: university.version ?? 1,
  createdBy: university.created_by ?? '',
  updatedBy: university.updated_by ?? '',
});

const transformDepartmentFromAPI = (department: APIDepartment): Department => ({
  id: department.id,
  name: department.name,
  universityId: department.university_id,
  majors: Array.isArray(department.majors) ? department.majors.map(transformMajorFromAPI) : [],
  createdAt: (department.created_at ?? new Date()).toString(),
  updatedAt: (department.updated_at ?? new Date()).toString(),
  version: department.version ?? 1,
  createdBy: department.created_by ?? '',
  updatedBy: department.updated_by ?? '',
});

const transformMajorFromAPI = (major: APIMajor): Major => ({
  id: major.id,
  name: major.name,
  departmentId: major.department_id,
  admissionSchedules: major.admission_schedules?.map(transformScheduleFromAPI) ?? [],
  createdAt: major.created_at ?? '',
  updatedAt: major.updated_at ?? '',
  version: major.version ?? 1,
  createdBy: major.created_by ?? '',
  updatedBy: major.updated_by ?? '',
});

const transformScheduleFromAPI = (schedule: APIAdmissionSchedule): AdmissionSchedule => ({
  id: schedule.id,
  name: schedule.name as AdmissionScheduleName,
  majorId: schedule.major_id,
  displayOrder: schedule.display_order as DisplayOrder,
  admissionInfos: schedule.admission_infos?.map(transformAdmissionInfo) ?? [],
  testTypes: schedule.test_types?.map(transformTestTypeFromAPI) ?? [],
  createdAt: schedule.created_at ?? '',
  updatedAt: schedule.updated_at ?? '',
  version: schedule.version ?? 1,
  createdBy: schedule.created_by ?? '',
  updatedBy: schedule.updated_by ?? '',
});

const transformTestTypeFromAPI = (type: APITestType): TestType => ({
  id: type.id,
  name: type.name as ExamTypeName,
  admissionScheduleId: type.admission_schedule_id,
  subjects: type.subjects?.map(transformSubjectFromAPI) ?? [],
  createdAt: (type.created_at ?? new Date()).toString(),
  updatedAt: (type.updated_at ?? new Date()).toString(),
  version: type.version ?? 1,
  createdBy: type.created_by ?? '',
  updatedBy: type.updated_by ?? '',
});

const transformSubjectFromAPI = (subject: APISubject): Subject => ({
  id: subject.id,
  name: subject.name as SubjectName,
  testTypeId: subject.test_type_id,
  score: subject.score,
  percentage: subject.percentage,
  displayOrder: subject.display_order,
  createdAt: new Date(subject.created_at ?? new Date()).toString(),
  updatedAt: new Date(subject.updated_at ?? new Date()).toString(),
  version: subject.version ?? 1,
  createdBy: subject.created_by ?? '',
  updatedBy: subject.updated_by ?? '',
});

export function transformToAPITestType(testType: TestType): APITestType {
  return {
    id: testType.id,
    admission_schedule_id: testType.admissionScheduleId,
    name: testType.name,
    subjects: testType.subjects.map(transformToAPISubject),
    created_at: testType.createdAt,
    updated_at: testType.updatedAt,
    deleted_at: testType.deletedAt ?? null,
    version: testType.version,
    created_by: testType.createdBy,
    updated_by: testType.updatedBy,
  };
}

export function transformToAPISubject(subject: Subject): APISubject {
  return {
    id: subject.id,
    test_type_id: subject.testTypeId,
    name: subject.name,
    score: Number(subject.score) || 0,
    percentage: Number(subject.percentage) || 0,
    display_order: subject.displayOrder,
    created_at: subject.createdAt,
    updated_at: subject.updatedAt,
    deleted_at: subject.deletedAt ?? null,
    version: subject.version,
    created_by: subject.createdBy,
    updated_by: subject.updatedBy,
  };
}

export function apiTestTypeToTestType(apiTestType: APITestType): TestType {
  return {
    id: apiTestType.id,
    admissionScheduleId: apiTestType.admission_schedule_id,
    name: apiTestType.name as ExamTypeName,
    subjects: apiTestType.subjects.map(transformSubject),
    createdAt: new Date(apiTestType.created_at ?? '').toString(),
    updatedAt: new Date(apiTestType.updated_at ?? '').toString(),
    version: apiTestType.version ?? 1,
    createdBy: apiTestType.created_by ?? '',
    updatedBy: apiTestType.updated_by ?? '',
  };
}
