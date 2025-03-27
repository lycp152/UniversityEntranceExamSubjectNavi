import type {
  APIUniversity,
  APIDepartment,
  APIMajor,
  APIAdmissionSchedule,
  APIAdmissionInfo,
  APITestType,
  APISubject,
} from "@/lib/api/types/models";
import type {
  University,
  Department,
  Major,
  AdmissionInfo,
  AdmissionSchedule,
  TestType,
  Subject,
} from "@/types/universities/university";
import { UNIVERSITY_STATUS } from "@/lib/config/status";
import type { ExamTypeName } from "@/constants/subjects";
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
  majors: Array.isArray(apiDepartment.majors)
    ? apiDepartment.majors.map(transformMajor)
    : [],
  createdAt: new Date(apiDepartment.created_at ?? ""),
  updatedAt: new Date(apiDepartment.updated_at ?? ""),
});

export const transformMajor = (apiMajor: APIMajor): Major => ({
  id: apiMajor.id,
  name: apiMajor.name,
  departmentId: apiMajor.department_id,
  admissionSchedules:
    apiMajor.admission_schedules?.map(transformAdmissionSchedule) || [],
  created_at: apiMajor.created_at ?? "",
  updated_at: apiMajor.updated_at ?? "",
});

export const transformAdmissionInfo = (
  apiAdmissionInfo: APIAdmissionInfo
): AdmissionInfo => ({
  id: apiAdmissionInfo.id,
  majorId: apiAdmissionInfo.major_id,
  academicYear: apiAdmissionInfo.academic_year,
  enrollment: apiAdmissionInfo.enrollment,
  status: apiAdmissionInfo.status,
  created_at: apiAdmissionInfo.created_at ?? "",
  updated_at: apiAdmissionInfo.updated_at ?? "",
});

export const transformAdmissionSchedule = (
  apiSchedule: APIAdmissionSchedule
): AdmissionSchedule => ({
  id: apiSchedule.id,
  majorId: apiSchedule.major_id,
  name: apiSchedule.name,
  displayOrder: apiSchedule.display_order,
  testTypes: apiSchedule.test_types.map(transformTestType),
  admissionInfos: apiSchedule.admission_infos.map(transformAdmissionInfo),
  startDate: new Date(),
  endDate: new Date(),
  created_at: apiSchedule.created_at ?? "",
  updated_at: apiSchedule.updated_at ?? "",
});

export function transformTestType(apiTestType: APITestType): TestType {
  return {
    id: apiTestType.id,
    admissionScheduleId: apiTestType.admission_schedule_id,
    name: apiTestType.name as ExamTypeName,
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

export const transformAPIResponse = (data: APIUniversity[]): University[] => {
  return data.map(transformUniversityFromAPI);
};

const transformUniversityFromAPI = (university: APIUniversity): University => ({
  id: university.id,
  name: university.name,
  departments: university.departments?.map(transformDepartmentFromAPI) ?? [],
  createdAt: new Date(university.created_at ?? new Date()),
  updatedAt: new Date(university.updated_at ?? new Date()),
  status: UNIVERSITY_STATUS.ACTIVE,
});

const transformDepartmentFromAPI = (department: APIDepartment): Department => ({
  id: department.id,
  name: department.name,
  universityId: department.university_id,
  majors: Array.isArray(department.majors)
    ? department.majors.map(transformMajorFromAPI)
    : [],
  createdAt: new Date(department.created_at ?? new Date()),
  updatedAt: new Date(department.updated_at ?? new Date()),
});

const transformMajorFromAPI = (major: APIMajor): Major => ({
  id: major.id,
  name: major.name,
  departmentId: major.department_id,
  admissionSchedules:
    major.admission_schedules?.map(transformScheduleFromAPI) ?? [],
  created_at: major.created_at ?? "",
  updated_at: major.updated_at ?? "",
});

const transformScheduleFromAPI = (
  schedule: APIAdmissionSchedule
): AdmissionSchedule => ({
  id: schedule.id,
  name: schedule.name,
  majorId: schedule.major_id,
  displayOrder: schedule.display_order,
  admissionInfos: schedule.admission_infos?.map(transformAdmissionInfo) ?? [],
  testTypes: schedule.test_types?.map(transformTestTypeFromAPI) ?? [],
  startDate: new Date(),
  endDate: new Date(),
  created_at: schedule.created_at ?? "",
  updated_at: schedule.updated_at ?? "",
});

const transformTestTypeFromAPI = (type: APITestType): TestType => ({
  id: type.id,
  name: type.name as ExamTypeName,
  admissionScheduleId: type.admission_schedule_id,
  subjects: type.subjects?.map(transformSubjectFromAPI) ?? [],
  createdAt: new Date(type.created_at ?? new Date()),
  updatedAt: new Date(type.updated_at ?? new Date()),
});

const transformSubjectFromAPI = (subject: APISubject): Subject => ({
  id: subject.id,
  name: subject.name,
  testTypeId: subject.test_type_id,
  maxScore: subject.score,
  minScore: 0,
  weight: subject.percentage,
  createdAt: new Date(subject.created_at ?? new Date()),
  updatedAt: new Date(subject.updated_at ?? new Date()),
});

export function transformToAPITestType(testType: TestType): APITestType {
  return {
    id: testType.id,
    admission_schedule_id: testType.admissionScheduleId,
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
    score: Number(subject.maxScore) || 0,
    percentage: Number(subject.weight) || 0,
    display_order: 0,
    created_at: subject.createdAt.toISOString(),
    updated_at: subject.updatedAt.toISOString(),
  };
}

export function apiTestTypeToTestType(apiTestType: APITestType): TestType {
  return {
    id: apiTestType.id,
    admissionScheduleId: apiTestType.admission_schedule_id,
    name: apiTestType.name as ExamTypeName,
    subjects: apiTestType.subjects.map(transformSubject),
    createdAt: new Date(apiTestType.created_at ?? ""),
    updatedAt: new Date(apiTestType.updated_at ?? ""),
  };
}
