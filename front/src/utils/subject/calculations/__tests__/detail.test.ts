import { describe, it, expect } from "vitest";
import { SubjectScores } from "@/types/subject/score";
import { calculateSubjectScores } from "../detail";
import { testData } from "./testData";

describe("detail calculations", () => {
  describe("calculateSubjectScores", () => {
    it("空のオブジェクトの場合は空のオブジェクトを返す", () => {
      const result = calculateSubjectScores({} as SubjectScores);
      expect(result).toEqual({});
    });

    it.each([["国語"], ["理科"], ["地歴公"]])(
      "%s科目の0点を正しく計算する",
      (subject) => {
        const result = calculateSubjectScores(testData.subjects);
        const zeroScoreSubject = result[subject];

        expect(zeroScoreSubject).toEqual({
          commonTest: { score: 0, percentage: 0 },
          secondTest: { score: 0, percentage: 0 },
          total: { score: 0, percentage: 0 },
        });
      }
    );

    it("負の点数の場合はエラーをスローする", () => {
      const invalidSubjects: SubjectScores = {
        ...testData.subjects,
        数学: {
          commonTest: -100,
          secondTest: 300,
        },
      };

      expect(() => calculateSubjectScores(invalidSubjects)).toThrow();
    });
  });
});
