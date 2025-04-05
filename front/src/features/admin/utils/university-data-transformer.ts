/**
 * 大学データ変換
 * APIの大学データをUI表示用に変換
 *
 * @module university-data-transformer
 * @description
 * - 大学情報の変換
 * - 学部情報の変換
 * - 専攻情報の変換
 * - 入試情報の変換
 */

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
} from '@/features/admin/types/university';
import type { SubjectName } from '@/constants/constraint/subjects';
import type { ExamTypeName } from '@/constants/constraint/exam-types';
import { ADMISSION_INFO_CONSTRAINTS } from '@/constants/constraint/admission-info';
import type {
  AdmissionScheduleName,
  DisplayOrder,
} from '@/constants/constraint/admission-schedule';
import type { AdmissionStatus } from '@/constants/constraint/admission-info';

/**
 * 日付文字列をフォーマット
 * @param date - 日付文字列
 * @returns フォーマットされた日付文字列
 */
const formatDate = (date: string | null | undefined): string => {
  return date ? new Date(date).toString() : new Date().toString();
};

/**
 * 大学データをUI表示用に変換
 * @param apiUniversity - APIの大学データ
 * @returns UI表示用の大学データ
 */
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

/**
 * 学部データをUI表示用に変換
 * @param apiDepartment - APIの学部データ
 * @returns UI表示用の学部データ
 */
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

/**
 * 専攻データをUI表示用に変換
 * @param apiMajor - APIの専攻データ
 * @returns UI表示用の専攻データ
 */
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

/**
 * 入試情報をUI表示用に変換
 * @param apiAdmissionInfo - APIの入試情報
 * @returns UI表示用の入試情報
 */
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

/**
 * 入試日程をUI表示用に変換
 * @param apiSchedule - APIの入試日程
 * @returns UI表示用の入試日程
 */
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

/**
 * テストタイプをUI表示用に変換
 * @param apiTestType - APIのテストタイプ
 * @returns UI表示用のテストタイプ
 */
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

/**
 * 科目をUI表示用に変換
 * @param apiSubject - APIの科目データ
 * @returns UI表示用の科目データ
 */
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

/**
 * 入試情報のステータス変更を検証します
 * @param currentStatus 現在のステータス
 * @param newStatus 新しいステータス
 * @returns 検証結果
 */
export const validateStatusTransition = (
  currentStatus: keyof typeof ADMISSION_INFO_CONSTRAINTS.STATUS_TRANSITIONS,
  newStatus: AdmissionStatus
): boolean => {
  const validTransitions = ADMISSION_INFO_CONSTRAINTS.STATUS_TRANSITIONS[
    currentStatus
  ] as readonly AdmissionStatus[];
  return validTransitions.includes(newStatus);
};
