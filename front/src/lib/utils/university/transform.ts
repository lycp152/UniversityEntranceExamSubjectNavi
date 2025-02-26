import type {
  APIUniversity,
  APIDepartment,
  APIMajor,
  APIExamInfo,
  APIAdmissionSchedule,
  APITestType,
  APISubject,
} from "../../types/university/api";
import type {
  University,
  Department,
  Major,
  AdmissionInfo,
  AdmissionSchedule,
  TestType,
  Subject,
  TestTypeName,
} from "../../types/university/university";
import {
  UNIVERSITY_STATUS,
  ADMISSION_STATUS,
} from "../../config/university/status";

export const transformUniversity = (
  apiUniversity: APIUniversity
): University => ({
  id: apiUniversity.id,
  name: apiUniversity.name,
  departments: apiUniversity.departments.map(transformDepartment),
  createdAt: new Date(apiUniversity.created_at ?? ""),
  updatedAt: new Date(apiUniversity.updated_at ?? ""),
  status: UNIVERSITY_STATUS.ACTIVE,
});

export const transformDepartment = (
  apiDepartment: APIDepartment
): Department => ({
  id: apiDepartment.id,
  name: apiDepartment.name,
  universityId: apiDepartment.university_id,
  majors: apiDepartment.majors.map(transformMajor),
  createdAt: new Date(apiDepartment.created_at ?? ""),
  updatedAt: new Date(apiDepartment.updated_at ?? ""),
});

export const transformMajor = (apiMajor: APIMajor): Major => ({
  id: apiMajor.id,
  name: apiMajor.name,
  departmentId: apiMajor.department_id,
  examInfos: apiMajor.exam_infos.map(transformExamInfo),
  createdAt: new Date(apiMajor.created_at ?? ""),
  updatedAt: new Date(apiMajor.updated_at ?? ""),
});

export const transformExamInfo = (apiExamInfo: APIExamInfo): AdmissionInfo => ({
  id: apiExamInfo.id,
  majorId: apiExamInfo.major_id,
  academicYear: apiExamInfo.academic_year,
  enrollment: apiExamInfo.enrollment,
  validFrom: apiExamInfo.valid_from,
  validUntil: apiExamInfo.valid_until,
  status: apiExamInfo.status,
  admissionSchedules: apiExamInfo.admissionSchedules.map(
    transformAdmissionSchedule
  ),
  created_at: apiExamInfo.created_at,
  updated_at: apiExamInfo.updated_at,
});

export const transformAdmissionSchedule = (
  apiSchedule: APIAdmissionSchedule
): AdmissionSchedule => ({
  id: apiSchedule.id,
  examInfoId: apiSchedule.admission_info_id,
  name: apiSchedule.name,
  displayOrder: apiSchedule.display_order,
  testTypes: apiSchedule.test_types.map(transformTestType),
  startDate: new Date(),
  endDate: new Date(),
  createdAt: new Date(apiSchedule.created_at ?? ""),
  updatedAt: new Date(apiSchedule.updated_at ?? ""),
  status: ADMISSION_STATUS.UPCOMING,
});

export function transformTestType(apiTestType: APITestType): TestType {
  return {
    id: apiTestType.id,
    admissionScheduleId: apiTestType.admissionSchedule_id,
    name: apiTestType.name as TestTypeName,
    subjects: apiTestType.subjects.map(transformSubject),
    createdAt: apiTestType.created_at
      ? new Date(apiTestType.created_at)
      : new Date(),
    updatedAt: apiTestType.updated_at
      ? new Date(apiTestType.updated_at)
      : new Date(),
  };
}

export function transformSubject(apiSubject: APISubject): Subject {
  return {
    id: apiSubject.id,
    testTypeId: apiSubject.test_type_id,
    name: apiSubject.name,
    maxScore: apiSubject.score,
    minScore: 0,
    weight: apiSubject.percentage,
    createdAt: apiSubject.created_at
      ? new Date(apiSubject.created_at)
      : new Date(),
    updatedAt: apiSubject.updated_at
      ? new Date(apiSubject.updated_at)
      : new Date(),
  };
}

export function transformToAPITestType(testType: TestType): APITestType {
  return {
    id: testType.id,
    admissionSchedule_id: testType.admissionScheduleId,
    name: testType.name,
    subjects: testType.subjects.map(transformToAPISubject),
    created_at: testType.createdAt.toISOString(),
    updated_at: testType.updatedAt.toISOString(),
  };
}

export function transformToAPISubject(subject: Subject): APISubject {
  return {
    id: subject.id,
    test_type_id: subject.testTypeId,
    name: subject.name,
    score: subject.maxScore,
    percentage: subject.weight,
    display_order: 0,
    created_at: subject.createdAt.toISOString(),
    updated_at: subject.updatedAt.toISOString(),
  };
}
