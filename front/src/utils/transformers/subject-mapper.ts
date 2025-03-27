import type {
  APISubject,
  APIUniversity,
  APIDepartment,
  APIMajor,
  APIAdmissionInfo,
  APIAdmissionSchedule,
} from "@/lib/api/types/models";
import type { UISubject } from "@/types/universities/subjects";
import type { BaseSubjectScore } from "@/types/score";

const updateSubjectScores = (
  subject: APISubject,
  testType: { id: number; name: string },
  subjects: Record<string, BaseSubjectScore>
) => {
  if (subject.name in subjects) {
    const isCommonTest = testType.name === "共通";
    const currentScores = subjects[subject.name];
    subjects[subject.name] = {
      commonTest: isCommonTest
        ? currentScores.commonTest + subject.score
        : currentScores.commonTest,
      secondTest: !isCommonTest
        ? currentScores.secondTest + subject.score
        : currentScores.secondTest,
    };
  }
};

const calculateSubjectScores = (
  allSubjects: APISubject[],
  schedule: APIAdmissionSchedule
): Record<string, BaseSubjectScore> => {
  const subjects: Record<string, BaseSubjectScore> = {
    英語L: { commonTest: 0, secondTest: 0 },
    英語R: { commonTest: 0, secondTest: 0 },
    数学: { commonTest: 0, secondTest: 0 },
    国語: { commonTest: 0, secondTest: 0 },
    理科: { commonTest: 0, secondTest: 0 },
    地歴公: { commonTest: 0, secondTest: 0 },
  };

  for (const subject of allSubjects) {
    const testType = schedule.test_types.find(
      (tt) => tt.id === subject.test_type_id
    );
    if (testType) {
      updateSubjectScores(subject, testType, subjects);
    }
  }

  return subjects;
};

export const transformSubjectData = (
  targetSubject: APISubject,
  allSubjects: APISubject[],
  university: APIUniversity,
  department: APIDepartment,
  major: APIMajor,
  admissionInfo: APIAdmissionInfo,
  schedule: APIAdmissionSchedule
): UISubject | null => {
  if (
    !targetSubject?.id ||
    !university?.id ||
    !department?.id ||
    !major?.id ||
    !schedule?.id ||
    !admissionInfo?.id
  ) {
    return null;
  }

  const subjects = calculateSubjectScores(allSubjects, schedule);

  return {
    id: targetSubject.id,
    name: targetSubject.name,
    score: targetSubject.score,
    percentage: targetSubject.percentage,
    displayOrder: targetSubject.display_order,
    testTypeId: targetSubject.test_type_id,
    university: {
      id: university.id,
      name: university.name,
    },
    department: {
      id: department.id,
      name: department.name,
    },
    major: {
      id: major.id,
      name: major.name,
    },
    examInfo: {
      id: admissionInfo.id,
      enrollment: admissionInfo.enrollment,
      academicYear: admissionInfo.academic_year,
      status: admissionInfo.status,
    },
    admissionSchedule: {
      id: schedule.id,
      name: schedule.name,
      displayOrder: schedule.display_order,
    },
    subjects,
  };
};
