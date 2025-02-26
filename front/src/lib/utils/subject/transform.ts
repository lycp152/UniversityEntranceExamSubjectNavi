import type {
  APISubject,
  APIUniversity,
  APIDepartment,
  APIMajor,
  APIExamInfo,
  APIAdmissionSchedule,
} from '@/lib/types/university/api';
import type { Subject as UISubject } from '@/lib/types/subject/subject';

export const transformSubjectData = (
  targetSubject: APISubject,
  allSubjects: APISubject[],
  university: APIUniversity,
  department: APIDepartment,
  major: APIMajor,
  admissionInfo: APIExamInfo,
  schedule: APIAdmissionSchedule
): UISubject | null => {
  if (!targetSubject?.id || !university?.id || !department?.id || !major?.id || !schedule?.id) {
    return null;
  }

  const subjects = {
    英語L: { commonTest: 0, secondTest: 0 },
    英語R: { commonTest: 0, secondTest: 0 },
    数学: { commonTest: 0, secondTest: 0 },
    国語: { commonTest: 0, secondTest: 0 },
    理科: { commonTest: 0, secondTest: 0 },
    地歴公: { commonTest: 0, secondTest: 0 },
  };

  // 全科目のスコアを設定
  for (const subject of allSubjects) {
    if (subject.name in subjects) {
      const testType = schedule.test_types.find((tt) => tt.id === subject.test_type_id);
      if (testType) {
        const isCommonTest = testType.name === '共通';
        const currentScores = subjects[subject.name as keyof typeof subjects];
        subjects[subject.name as keyof typeof subjects] = {
          commonTest: isCommonTest
            ? currentScores.commonTest + subject.score
            : currentScores.commonTest,
          secondTest: !isCommonTest
            ? currentScores.secondTest + subject.score
            : currentScores.secondTest,
        };
      }
    }
  }

  return {
    id: targetSubject.id,
    universityId: university.id,
    departmentId: department.id,
    majorId: major.id,
    admissionScheduleId: schedule.id,
    academicYear: admissionInfo.academic_year,
    subjectId: targetSubject.id,
    universityName: university.name,
    department: department.name,
    major: major.name,
    admissionSchedule: schedule.name,
    enrollment: admissionInfo.enrollment,
    rank: 0,
    subjects,
  };
};
