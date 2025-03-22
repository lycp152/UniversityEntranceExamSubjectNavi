import {
  Subject,
  SubjectGroup,
  TransformSource,
  TransformResult,
} from "@/features/subjects/schemas";
import { TEST_TYPES } from "@/features/subjects/config/types";

export class TransformService {
  /**
   * 科目を作成する
   */
  private createSubject(source: TransformSource): Subject {
    return {
      id: source.subjectId,
      testTypeId: 1,
      name: source.subjectId.toString(),
      code: source.subjectId.toString(),
      maxScore: 100,
      minScore: 0,
      weight: 1,
      displayOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * 科目グループを作成する
   */
  private createSubjectGroup(
    testType: string,
    subjects: Subject[],
    totalScore: number,
    maxTotalScore: number,
    isValid: boolean
  ): SubjectGroup {
    return {
      testType,
      subjects,
      totalScore,
      maxTotalScore,
      isValid,
    };
  }

  /**
   * 科目データを変換する
   */
  public transform(source: TransformSource): TransformResult {
    const subject = this.createSubject(source);
    const commonSubjects = this.createSubjectGroup(
      TEST_TYPES.COMMON,
      [],
      0,
      100,
      true
    );
    const secondSubjects = this.createSubjectGroup(
      TEST_TYPES.SECOND,
      [],
      0,
      100,
      true
    );

    return {
      subject,
      groups: [commonSubjects, secondSubjects],
      metadata: {
        transformedAt: Date.now(),
        source,
      },
    };
  }
}
