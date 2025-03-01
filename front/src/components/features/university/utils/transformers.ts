import type {
  University,
  Department,
  Major,
  AdmissionInfo,
  AdmissionSchedule,
  TestType,
  Subject,
} from "@/lib/types/university/university";
import type {
  APIUniversity,
  APIDepartment,
  APIMajor,
  APIExamInfo,
  APIAdmissionSchedule,
  APITestType,
  APISubject,
} from "@/lib/types/university/api";

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

export const transformToAPIExamInfo = (
  examInfo: AdmissionInfo
): APIExamInfo => ({
  id: examInfo.id,
  major_id: examInfo.majorId,
  academic_year: examInfo.academicYear,
  enrollment: examInfo.enrollment,
  valid_from: examInfo.validFrom,
  valid_until: examInfo.validUntil,
  status: examInfo.status,
  created_at: examInfo.created_at,
  updated_at: examInfo.updated_at,
});

export const transformToAPIMajor = (major: Major): APIMajor => ({
  id: major.id,
  name: major.name,
  department_id: major.departmentId,
  admission_schedules: major.admissionSchedules.map(
    transformToAPIAdmissionSchedule
  ),
  created_at: major.created_at,
  updated_at: major.updated_at,
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
