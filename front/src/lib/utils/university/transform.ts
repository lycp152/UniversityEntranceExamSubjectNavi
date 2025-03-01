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
  admissionSchedules:
    apiMajor.admission_schedules?.map(transformAdmissionSchedule) || [],
  created_at: apiMajor.created_at ?? "",
  updated_at: apiMajor.updated_at ?? "",
});

export const transformExamInfo = (apiExamInfo: APIExamInfo): AdmissionInfo => ({
  id: apiExamInfo.id,
  majorId: apiExamInfo.major_id,
  academicYear: apiExamInfo.academic_year,
  enrollment: apiExamInfo.enrollment,
  validFrom: apiExamInfo.valid_from,
  validUntil: apiExamInfo.valid_until,
  status: apiExamInfo.status,
  created_at: apiExamInfo.created_at,
  updated_at: apiExamInfo.updated_at,
});

export const transformAdmissionSchedule = (
  apiSchedule: APIAdmissionSchedule
): AdmissionSchedule => ({
  id: apiSchedule.id,
  majorId: apiSchedule.major_id,
  name: apiSchedule.name,
  displayOrder: apiSchedule.display_order,
  testTypes: apiSchedule.test_types.map(transformTestType),
  admissionInfos: apiSchedule.admission_infos.map(transformExamInfo),
  startDate: new Date(),
  endDate: new Date(),
  created_at: apiSchedule.created_at ?? "",
  updated_at: apiSchedule.updated_at ?? "",
  status: ADMISSION_STATUS.UPCOMING,
});

export function transformTestType(apiTestType: APITestType): TestType {
  return {
    id: apiTestType.id,
    admissionScheduleId: apiTestType.admission_schedule_id,
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

export const transformAPIResponse = (data: APIUniversity[]): University[] => {
  return data.map((university) => ({
    id: university.id,
    name: university.name,
    departments: university.departments?.map((department) => ({
      id: department.id,
      name: department.name,
      universityId: department.university_id,
      majors: department.majors?.map((major) => ({
        id: major.id,
        name: major.name,
        departmentId: major.department_id,
        admissionSchedules: (major.admission_schedules || []).map(
          (schedule) => ({
            id: schedule.id,
            name: schedule.name,
            majorId: schedule.major_id,
            displayOrder: schedule.display_order,
            admissionInfos: (schedule.admission_infos || []).map((info) => ({
              id: info.id,
              majorId: info.major_id,
              academicYear: info.academic_year,
              enrollment: info.enrollment,
              validFrom: info.valid_from,
              validUntil: info.valid_until,
              status: info.status,
            })),
            testTypes: (schedule.test_types || []).map((type) => ({
              id: type.id,
              name: type.name as TestTypeName,
              admissionScheduleId: type.admission_schedule_id,
              subjects: (type.subjects || []).map((subject) => ({
                id: subject.id,
                name: subject.name,
                testTypeId: subject.test_type_id,
                maxScore: subject.score,
                minScore: 0,
                weight: subject.percentage,
                createdAt: new Date(subject.created_at || new Date()),
                updatedAt: new Date(subject.updated_at || new Date()),
              })),
              createdAt: new Date(type.created_at || new Date()),
              updatedAt: new Date(type.updated_at || new Date()),
            })),
            startDate: new Date(),
            endDate: new Date(),
            status: ADMISSION_STATUS.UPCOMING,
            createdAt: new Date(schedule.created_at || new Date()),
            updatedAt: new Date(schedule.updated_at || new Date()),
          })
        ),
        createdAt: new Date(major.created_at || new Date()),
        updatedAt: new Date(major.updated_at || new Date()),
      })),
      createdAt: new Date(department.created_at || new Date()),
      updatedAt: new Date(department.updated_at || new Date()),
    })),
    createdAt: new Date(university.created_at || new Date()),
    updatedAt: new Date(university.updated_at || new Date()),
    status: UNIVERSITY_STATUS.ACTIVE,
  }));
};

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
    score: subject.maxScore,
    percentage: subject.weight,
    display_order: 0,
    created_at: subject.createdAt.toISOString(),
    updated_at: subject.updatedAt.toISOString(),
  };
}

export function apiTestTypeToTestType(apiTestType: APITestType): TestType {
  return {
    id: apiTestType.id,
    admissionScheduleId: apiTestType.admission_schedule_id,
    name: apiTestType.name as TestTypeName,
    subjects: apiTestType.subjects.map(transformSubject),
    createdAt: new Date(apiTestType.created_at ?? ""),
    updatedAt: new Date(apiTestType.updated_at ?? ""),
  };
}
