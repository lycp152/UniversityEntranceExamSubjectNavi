import type {
  TransformSource,
  TransformResult,
  Subject as UISubject,
} from "../../types/subject";
import type { SubjectGroup, TestType } from "../../types/subject/subject";
import { TEST_TYPES } from "../../config/subject/types";
import { SUBJECT_DISPLAY_ORDER } from "../../config/subject/constraints";

export class TransformService {
  /**
   * データを変換する
   */
  transform(source: TransformSource): TransformResult {
    const commonSubjects = this.createSubjectGroup(source, TEST_TYPES.COMMON);
    const secondSubjects = this.createSubjectGroup(source, TEST_TYPES.SECOND);

    return {
      subject: this.createSubject(source),
      groups: [commonSubjects, secondSubjects],
      metadata: {
        transformedAt: Date.now(),
        source,
      },
    };
  }

  /**
   * 科目を作成する
   */
  private createSubject(source: TransformSource): UISubject {
    return {
      id: source.subjectId,
      universityId: source.universityId,
      departmentId: source.departmentId,
      majorId: source.majorId,
      admissionScheduleId: source.admissionScheduleId,
      academicYear: source.academicYear,
      subjectId: source.subjectId,
      universityName: source.universityName,
      department: source.department,
      major: source.major,
      admissionSchedule: source.admissionSchedule,
      enrollment: source.enrollment,
      rank: 0,
      subjects: {
        英語L: { commonTest: 0, secondTest: 0 },
        英語R: { commonTest: 0, secondTest: 0 },
        数学: { commonTest: 0, secondTest: 0 },
        国語: { commonTest: 0, secondTest: 0 },
        理科: { commonTest: 0, secondTest: 0 },
        地歴公: { commonTest: 0, secondTest: 0 },
      },
    };
  }

  /**
   * 科目グループを作成する
   */
  private createSubjectGroup(
    source: TransformSource,
    testType: TestType
  ): SubjectGroup {
    const subjects = SUBJECT_DISPLAY_ORDER.map((subjectName) => ({
      ...this.createSubject(source),
      name: subjectName,
      code: subjectName,
    }));

    const totalScore = subjects.reduce((sum, subject) => {
      const scores = Object.values(subject.subjects).reduce(
        (acc, { commonTest, secondTest }) => acc + commonTest + secondTest,
        0
      );
      return sum + scores;
    }, 0);

    return {
      testType,
      subjects,
      totalScore,
      maxTotalScore: totalScore,
      isValid: true,
    };
  }
}
