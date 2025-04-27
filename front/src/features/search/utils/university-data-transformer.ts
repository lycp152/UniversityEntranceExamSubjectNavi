import type { UISubject } from '@/types/university-subject';
import type {
  APIUniversity,
  APIDepartment,
  APIMajor,
  APIAdmissionSchedule,
  APITestType,
} from '@/types/api/types';
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
 * @throws {Error} データの変換に失敗した場合
 */
const processTestTypes = (
  testType: APITestType,
  apiUniversity: APIUniversity,
  department: APIDepartment,
  major: APIMajor,
  schedule: APIAdmissionSchedule
): UISubject | null => {
  try {
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
  } catch (error) {
    console.error('試験タイプのデータ変換に失敗しました:', error);
    return null;
  }
};

/**
 * 入試日程のデータを処理し、関連する科目データを変換します
 *
 * @param schedule - 入試日程のデータ
 * @param apiUniversity - 大学のデータ
 * @param department - 学部のデータ
 * @param major - 学科のデータ
 * @returns 変換された科目データの配列
 * @throws {Error} データの変換に失敗した場合
 */
const processSchedule = (
  schedule: APIAdmissionSchedule,
  apiUniversity: APIUniversity,
  department: APIDepartment,
  major: APIMajor
): UISubject[] => {
  try {
    if (!schedule?.test_types) {
      return [];
    }
    return schedule.test_types
      .map((testType: APITestType) =>
        processTestTypes(testType, apiUniversity, department, major, schedule)
      )
      .filter((subject: UISubject | null): subject is UISubject => subject !== null);
  } catch (error) {
    console.error('入試日程のデータ変換に失敗しました:', error);
    return [];
  }
};

/**
 * 学科のデータを処理し、関連する科目データを変換します
 *
 * @param major - 学科のデータ
 * @param apiUniversity - 大学のデータ
 * @param department - 学部のデータ
 * @returns 変換された科目データの配列
 * @throws {Error} データの変換に失敗した場合
 */
const processMajor = (
  major: APIMajor,
  apiUniversity: APIUniversity,
  department: APIDepartment
): UISubject[] => {
  try {
    if (!major.admission_schedules?.length) {
      return [];
    }
    return major.admission_schedules.flatMap((schedule: APIAdmissionSchedule) =>
      processSchedule(schedule, apiUniversity, department, major)
    );
  } catch (error) {
    console.error('学科のデータ変換に失敗しました:', error);
    return [];
  }
};

/**
 * 学部のデータを処理し、関連する科目データを変換します
 *
 * @param department - 学部のデータ
 * @param apiUniversity - 大学のデータ
 * @returns 変換された科目データの配列
 * @throws {Error} データの変換に失敗した場合
 */
const processDepartment = (
  department: APIDepartment,
  apiUniversity: APIUniversity
): UISubject[] => {
  try {
    if (!department?.majors) {
      return [];
    }
    return department.majors.flatMap((major: APIMajor) =>
      processMajor(major, apiUniversity, department)
    );
  } catch (error) {
    console.error('学部のデータ変換に失敗しました:', error);
    return [];
  }
};

/**
 * 大学データを変換し、重複のない科目データの配列を生成します
 *
 * @param universities - 変換対象の大学データの配列
 * @returns 重複のない変換済み科目データの配列
 * @throws {Error} データの変換に失敗した場合
 */
export const transformUniversityData = (universities: APIUniversity[]): UISubject[] => {
  try {
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
  } catch (error) {
    console.error('大学データの変換に失敗しました:', error);
    return [];
  }
};
