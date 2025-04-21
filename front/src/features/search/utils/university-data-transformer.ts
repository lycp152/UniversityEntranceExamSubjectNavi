import type { UISubject } from '@/types/university-subjects';
import type {
  APIUniversity,
  APIDepartment,
  APIMajor,
  APIAdmissionSchedule,
  APITestType,
} from '@/types/api/api-response-types';
import { transformSubjectData } from '@/utils/transformers/subject-data-transformer';

/**
 * 試験タイプのデータを処理し、UI用の科目データに変換します
 *
 * @param testType - 試験タイプのデータ
 * @param apiUniversity - 大学のデータ
 * @param department - 学部のデータ
 * @param major - 学科のデータ
 * @param schedule - 入試日程のデータ
 * @returns 変換された科目データ、またはデータが不適切な場合はnull
 */
const processTestTypes = (
  testType: APITestType,
  apiUniversity: APIUniversity,
  department: APIDepartment,
  major: APIMajor,
  schedule: APIAdmissionSchedule
): UISubject | null => {
  if (!testType?.subjects?.length) {
    return null;
  }
  const admissionInfo = schedule.admission_infos?.[0];
  if (!admissionInfo) {
    return null;
  }
  return transformSubjectData(
    testType.subjects[0],
    testType.subjects,
    apiUniversity,
    department,
    major,
    admissionInfo,
    schedule
  );
};

/**
 * 入試日程のデータを処理し、関連する科目データを変換します
 *
 * @param schedule - 入試日程のデータ
 * @param apiUniversity - 大学のデータ
 * @param department - 学部のデータ
 * @param major - 学科のデータ
 * @returns 変換された科目データの配列
 */
const processSchedule = (
  schedule: APIAdmissionSchedule,
  apiUniversity: APIUniversity,
  department: APIDepartment,
  major: APIMajor
): UISubject[] => {
  if (!schedule?.test_types) {
    return [];
  }
  return schedule.test_types
    .map((testType: APITestType) =>
      processTestTypes(testType, apiUniversity, department, major, schedule)
    )
    .filter((subject: UISubject | null): subject is UISubject => subject !== null);
};

/**
 * 学科のデータを処理し、関連する科目データを変換します
 *
 * @param major - 学科のデータ
 * @param apiUniversity - 大学のデータ
 * @param department - 学部のデータ
 * @returns 変換された科目データの配列
 */
const processMajor = (
  major: APIMajor,
  apiUniversity: APIUniversity,
  department: APIDepartment
): UISubject[] => {
  if (!major.admission_schedules?.length) {
    return [];
  }
  return major.admission_schedules.flatMap((schedule: APIAdmissionSchedule) =>
    processSchedule(schedule, apiUniversity, department, major)
  );
};

/**
 * 学部のデータを処理し、関連する科目データを変換します
 *
 * @param department - 学部のデータ
 * @param apiUniversity - 大学のデータ
 * @returns 変換された科目データの配列
 */
const processDepartment = (
  department: APIDepartment,
  apiUniversity: APIUniversity
): UISubject[] => {
  if (!department?.majors) {
    return [];
  }
  return department.majors.flatMap((major: APIMajor) =>
    processMajor(major, apiUniversity, department)
  );
};

/**
 * 大学データを変換し、重複のない科目データの配列を生成します
 *
 * @param universities - 変換対象の大学データの配列
 * @returns 重複のない変換済み科目データの配列
 */
export const transformUniversityData = (universities: APIUniversity[]): UISubject[] => {
  const subjectsMap = new Map<string, UISubject>();

  universities.forEach(apiUniversity => {
    if (!apiUniversity?.departments) {
      return;
    }

    apiUniversity.departments
      .flatMap((department: APIDepartment) => processDepartment(department, apiUniversity))
      .forEach((subject: UISubject) => {
        const key = `${subject.university.id}-${subject.department.id}-${subject.major.id}-${subject.admissionSchedule.id}`;
        if (!subjectsMap.has(key)) {
          subjectsMap.set(key, subject);
        }
      });
  });

  return Array.from(subjectsMap.values());
};
