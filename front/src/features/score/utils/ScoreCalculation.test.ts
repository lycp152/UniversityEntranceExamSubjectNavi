import { describe, it, expect } from "vitest";
import { SubjectScores, TestType, TEST_TYPES } from "@/types/score/score";
import {
  calculateTotalScore,
  calculateTestTypeTotal,
  calculatePercentage,
} from "./ScoreCalculation";
import { testData } from "@/features/score/utils/samples/sampleTestScores";

describe("base calculations", () => {
  describe("calculateTotalScore", () => {
    it("全科目の合計点を正しく計算する", () => {
      const result = calculateTotalScore(testData.subjects);
      expect(result).toBe(testData.totals.all);
    });

    it("空のオブジェクトの場合は0を返す", () => {
      const result = calculateTotalScore({} as SubjectScores);
      expect(result).toBe(0);
    });
  });

  describe("calculateTestTypeTotal", () => {
    it.each([
      [TEST_TYPES.COMMON, testData.totals.commonTest],
      [TEST_TYPES.INDIVIDUAL, testData.totals.secondTest],
    ])("%sの合計点を正しく計算する", (testType, expected) => {
      const result = calculateTestTypeTotal(
        testData.subjects,
        testType as TestType
      );
      expect(result).toBe(expected);
    });

    it("空のオブジェクトの場合は0を返す", () => {
      const result = calculateTestTypeTotal(
        {} as SubjectScores,
        TEST_TYPES.COMMON
      );
      expect(result).toBe(0);
    });
  });

  describe("calculatePercentage", () => {
    it.each([
      [25, 100, 25],
      [33, 100, 33],
      [25, 0, 0],
    ])("値: %i, 合計: %i の場合、%i%を返す", (value, total, expected) => {
      const result = calculatePercentage(value, total);
      expect(result).toBe(expected);
    });
  });
});
