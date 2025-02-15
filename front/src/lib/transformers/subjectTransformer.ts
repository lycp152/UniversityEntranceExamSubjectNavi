import type {
  Subject as APISubject,
  University,
  Department,
  Major,
  ExamInfo,
} from '@/types/models';
import type { Subject as UISubject } from '@/lib/types';

export const transformSubjectData = (
  targetSubject: APISubject,
  allSubjects: APISubject[],
  university: University,
  department: Department,
  major: Major,
  examInfo: ExamInfo
): UISubject => {
  const subjects = {
    英語L: { commonTest: 0, secondTest: 0 },
    英語R: { commonTest: 0, secondTest: 0 },
    数学: { commonTest: 0, secondTest: 0 },
    国語: { commonTest: 0, secondTest: 0 },
    理科: { commonTest: 0, secondTest: 0 },
    地歴公: { commonTest: 0, secondTest: 0 },
  };

  // 全科目のスコアを設定
  allSubjects.forEach((subject) => {
    if (subject.name in subjects) {
      const commonTest = subject.test_scores.find((ts) => ts.test_type === '共通');
      const secondTest = subject.test_scores.find((ts) => ts.test_type === '二次');

      subjects[subject.name as keyof typeof subjects] = {
        commonTest: commonTest?.score ?? 0,
        secondTest: secondTest?.score ?? 0,
      };
    }
  });

  return {
    universityId: university.ID,
    departmentId: department.ID,
    majorId: major.ID,
    scheduleId: examInfo.schedule_id,
    academicYear: examInfo.academic_year,
    subjectId: targetSubject.ID,
    universityName: university.name,
    department: department.name,
    major: major.name,
    schedule: examInfo.schedule.name,
    enrollment: examInfo.enrollment,
    rank: 0,
    subjects,
  };
};
