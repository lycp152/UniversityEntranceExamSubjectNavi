import type { TestType, Subject, AdmissionSchedule } from '@/features/admin/types/university';
import type { SubjectName } from '@/constants/constraint/subjects/subjects';

/**
 * テストタイプに新しい科目を追加する関数
 * @param admissionSchedule - 更新対象の入試日程
 * @param internalType - 更新対象のテストタイプ
 * @param newSubject - 追加する科目
 * @returns 更新後の入試日程
 */
export const updateTestTypesWithNewSubject = (
  admissionSchedule: AdmissionSchedule,
  internalType: TestType,
  newSubject: Subject
): AdmissionSchedule => ({
  ...admissionSchedule,
  testTypes: admissionSchedule.testTypes.map(testType => {
    if (testType.id === internalType.id) {
      return {
        ...testType,
        subjects: [...testType.subjects, newSubject],
      };
    }
    return testType;
  }),
});

/**
 * テストタイプの科目名を更新する関数
 * @param testTypes - 更新対象のテストタイプ配列
 * @param subjectId - 更新する科目のID
 * @param name - 新しい科目名
 * @returns 更新後のテストタイプ配列
 */
export const updateTestTypesWithSubjectName = (
  testTypes: TestType[],
  subjectId: number,
  name: string
): TestType[] =>
  testTypes.map(testType => ({
    ...testType,
    subjects: testType.subjects.map(subject =>
      subject.id === subjectId ? { ...subject, name: name as SubjectName } : subject
    ),
  }));
