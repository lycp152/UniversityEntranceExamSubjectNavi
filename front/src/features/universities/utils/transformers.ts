import type {
  University,
  Department,
  Major,
  AdmissionInfo,
  AdmissionSchedule,
  TestType,
  Subject,
} from '@/types/universities/university';
import type {
  APIUniversity,
  APIDepartment,
  APIMajor,
  APIAdmissionSchedule,
  APIAdmissionInfo,
  APITestType,
  APISubject,
} from '@/types/api/api-response-types';

export const transformToAPISubject = (subject: Subject): APISubject => ({
  id: subject.id,
  test_type_id: subject.testTypeId,
  name: subject.name,
  score: subject.score,
  percentage: subject.percentage,
  display_order: subject.displayOrder,
  created_at: subject.createdAt,
  updated_at: subject.updatedAt,
  deleted_at: subject.deletedAt ?? null,
  version: subject.version,
  created_by: subject.createdBy,
  updated_by: subject.updatedBy,
});

export const transformToAPITestType = (testType: TestType): APITestType => ({
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
  created_at: schedule.createdAt,
  updated_at: schedule.updatedAt,
  version: schedule.version,
  created_by: schedule.createdBy,
  updated_by: schedule.updatedBy,
});

export const transformToAPIAdmissionInfo = (admissionInfo: AdmissionInfo): APIAdmissionInfo => ({
  id: admissionInfo.id,
  admission_schedule_id: admissionInfo.admissionScheduleId,
  academic_year: admissionInfo.academicYear,
  enrollment: admissionInfo.enrollment,
  status: admissionInfo.status,
  created_at: admissionInfo.createdAt,
  updated_at: admissionInfo.updatedAt,
  version: admissionInfo.version,
  created_by: admissionInfo.createdBy,
  updated_by: admissionInfo.updatedBy,
  admission_schedule: {
    id: 0,
    major_id: admissionInfo.admissionScheduleId,
    name: '',
    display_order: 0,
    test_types: [],
    admission_infos: [],
    created_at: admissionInfo.createdAt,
    updated_at: admissionInfo.updatedAt,
    version: admissionInfo.version,
    created_by: admissionInfo.createdBy,
    updated_by: admissionInfo.updatedBy,
  },
  test_types: [],
});

export const transformToAPIMajor = (major: Major): APIMajor => ({
  id: major.id,
  name: major.name,
  department_id: major.departmentId,
  created_at: major.createdAt,
  updated_at: major.updatedAt,
  version: major.version,
  created_by: major.createdBy,
  updated_by: major.updatedBy,
  admission_schedules: major.admissionSchedules?.map(transformToAPIAdmissionSchedule) || [],
});

export const transformToAPIDepartment = (department: Department): APIDepartment => ({
  id: department.id,
  name: department.name,
  university_id: department.universityId,
  majors: department.majors.map(transformToAPIMajor),
  created_at: department.createdAt,
  updated_at: department.updatedAt,
  version: department.version,
  created_by: department.createdBy,
  updated_by: department.updatedBy,
});

export const transformToAPIUniversity = (university: University): APIUniversity => ({
  id: university.id,
  name: university.name,
  departments: university.departments.map(transformToAPIDepartment),
  created_at: university.createdAt,
  updated_at: university.updatedAt,
  version: university.version,
  created_by: university.createdBy,
  updated_by: university.updatedBy,
});
