import type {
  University,
  Department,
  Major,
  AdmissionInfo,
  AdmissionSchedule,
  TestType,
  Subject,
} from "@/types/universities/university";
import type {
  APIUniversity,
  APIDepartment,
  APIMajor,
  APIAdmissionSchedule,
  APIAdmissionInfo,
  APITestType,
  APISubject,
} from "@/types/api/models";

export const transformToAPISubject = (subject: Subject): APISubject => ({
  id: subject.id,
  test_type_id: subject.testTypeId,
  name: subject.name,
  score: subject.maxScore,
  percentage: subject.weight,
  display_order: 0,
  created_at: subject.createdAt.toISOString(),
  updated_at: subject.updatedAt.toISOString(),
});

export const transformToAPITestType = (testType: TestType): APITestType => ({
  id: testType.id,
  admission_schedule_id: testType.admissionScheduleId,
  name: testType.name,
  subjects: testType.subjects.map(transformToAPISubject),
  created_at: testType.createdAt.toISOString(),
  updated_at: testType.updatedAt.toISOString(),
});

export const transformToAPIAdmissionSchedule = (
  schedule: AdmissionSchedule
): APIAdmissionSchedule => ({
  id: schedule.id,
  major_id: schedule.majorId,
  name: schedule.name,
  display_order: schedule.displayOrder,
  test_types: schedule.testTypes.map(transformToAPITestType),
  admission_infos: [],
  created_at: schedule.created_at,
  updated_at: schedule.updated_at,
});

export const transformToAPIAdmissionInfo = (
  admissionInfo: AdmissionInfo
): APIAdmissionInfo => ({
  id: admissionInfo.id,
  major_id: admissionInfo.majorId,
  academic_year: admissionInfo.academicYear,
  enrollment: admissionInfo.enrollment,
  status: admissionInfo.status,
  created_at: admissionInfo.created_at,
  updated_at: admissionInfo.updated_at,
});

export const transformToAPIMajor = (major: Major): APIMajor => ({
  id: major.id,
  name: major.name,
  department_id: major.departmentId,
  created_at: major.created_at,
  updated_at: major.updated_at,
  admission_schedules:
    major.admissionSchedules?.map(transformToAPIAdmissionSchedule) || [],
});

export const transformToAPIDepartment = (
  department: Department
): APIDepartment => ({
  id: department.id,
  name: department.name,
  university_id: department.universityId,
  majors: department.majors.map(transformToAPIMajor),
  created_at: department.createdAt.toISOString(),
  updated_at: department.updatedAt.toISOString(),
});

export const transformToAPIUniversity = (
  university: University
): APIUniversity => ({
  id: university.id,
  name: university.name,
  departments: university.departments.map(transformToAPIDepartment),
  created_at: university.createdAt.toISOString(),
  updated_at: university.updatedAt.toISOString(),
});
