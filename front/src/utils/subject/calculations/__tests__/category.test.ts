import { describe, it, expect } from "vitest";
import { SubjectScores, TestType, TEST_TYPES } from "@/types/subject/score";
import { calculateCategoryTotal } from "../category";
import { testData } from "./testData";

describe("category calculations", () => {
  describe("calculateCategoryTotal", () => {
    it.each([
      ["英語", undefined, testData.categories.english.total],
      ["英語", TEST_TYPES.COMMON, testData.categories.english.commonTest],
      ["英語", TEST_TYPES.INDIVIDUAL, testData.categories.english.secondTest],
    ])(
      "カテゴリー: %s, テスト種別: %s の合計点を正しく計算する",
      (category, testType, expected) => {
        const result = calculateCategoryTotal(
          testData.subjects,
          category,
          testType as TestType | undefined
        );
        expect(result).toBe(expected);
      }
    );

    it.each([
      ["存在しない", undefined],
      ["存在しない", TEST_TYPES.COMMON],
      ["存在しない", TEST_TYPES.INDIVIDUAL],
    ])(
      "存在しないカテゴリー %s（テスト種別: %s）の場合は0を返す",
      (category, testType) => {
        const result = calculateCategoryTotal(
          testData.subjects,
          category,
          testType as TestType | undefined
        );
        expect(result).toBe(0);
      }
    );

    it("空のオブジェクトの場合は0を返す", () => {
      const result = calculateCategoryTotal({} as SubjectScores, "英語");
      expect(result).toBe(0);
    });
  });
});
