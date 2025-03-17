import { describe, it, expect, vi } from "vitest";
import { BatchValidator } from "../BatchValidator";
import { ValidationError } from "../ValidationError";
import type { TestType as TestTypeCreateInput } from "@/lib/types/university/university";
import {
  ValidationCategory,
  ValidationSeverity,
} from "../ValidationErrorTypes";

const createTimeoutValidator = () => {
  return vi
    .fn()
    .mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 2000))
    );
};

describe("BatchValidator", () => {
  describe("validateBatch", () => {
    it("すべての項目が有効な場合、エラーなしで結果を返す", async () => {
      const items = [
        { name: "共通", admissionScheduleId: 1 },
        { name: "二次", admissionScheduleId: 2 },
      ] as TestTypeCreateInput[];

      const validator = vi.fn().mockImplementation(() => Promise.resolve());

      const results = await BatchValidator.validateBatch(items, validator);

      expect(results).toHaveLength(2);
      expect(results.every((r) => r.errors.length === 0)).toBe(true);
      expect(validator).toHaveBeenCalledTimes(2);
    });

    it("一部の項目が無効な場合、エラーを含む結果を返す", async () => {
      const items = [
        { name: "共通", admissionScheduleId: 1 },
        { name: "", admissionScheduleId: 2 }, // 無効な項目
      ] as TestTypeCreateInput[];

      const validator = vi.fn().mockImplementation((item) => {
        if (!item.name) {
          throw new ValidationError("バリデーションエラー", [
            {
              field: "name",
              message: "名前は必須です",
              category: ValidationCategory.REQUIRED,
              severity: ValidationSeverity.ERROR,
            },
          ]);
        }
      });

      const results = await BatchValidator.validateBatch(items, validator);

      expect(results).toHaveLength(2);
      expect(results[0].errors).toHaveLength(0);
      expect(results[1].errors).toHaveLength(1);
      expect(validator).toHaveBeenCalledTimes(2);
    });

    it("stopOnFirstErrorオプションが有効な場合、最初のエラーで処理を中断する", async () => {
      const items = [
        { name: "", admissionScheduleId: 1 }, // 無効な項目
        { name: "二次", admissionScheduleId: 2 },
      ] as TestTypeCreateInput[];

      const validator = vi.fn().mockImplementation((item) => {
        if (!item.name) {
          throw new ValidationError("バリデーションエラー", [
            {
              field: "name",
              message: "名前は必須です",
              category: ValidationCategory.REQUIRED,
              severity: ValidationSeverity.ERROR,
            },
          ]);
        }
      });

      const results = await BatchValidator.validateBatch(items, validator, {
        stopOnFirstError: true,
      });

      expect(results).toHaveLength(1);
      expect(results[0].errors).toHaveLength(1);
      expect(validator).toHaveBeenCalledTimes(1);
    });

    it("タイムアウトした場合、エラーを返す", async () => {
      const items = [
        { name: "共通", admissionScheduleId: 1 },
      ] as TestTypeCreateInput[];
      const validator = createTimeoutValidator();

      const results = await BatchValidator.validateBatch(items, validator, {
        timeoutMs: 100,
      });

      expect(results).toHaveLength(1);
      expect(results[0].errors).toHaveLength(1);
      expect(results[0].errors[0].details[0].message).toContain("タイムアウト");
    });
  });

  describe("summarizeResults", () => {
    it("バリデーション結果を正しく要約する", () => {
      const results = [
        {
          item: { name: "共通", admissionScheduleId: 1 },
          errors: [],
        },
        {
          item: { name: "", admissionScheduleId: 2 },
          errors: [
            new ValidationError("バリデーションエラー", [
              {
                field: "name",
                message: "名前は必須です",
                category: ValidationCategory.REQUIRED,
                severity: ValidationSeverity.ERROR,
              },
            ]),
          ],
        },
      ];

      const summary = BatchValidator.summarizeResults(results);

      expect(summary.totalItems).toBe(2);
      expect(summary.validItems).toBe(1);
      expect(summary.invalidItems).toBe(1);
      expect(summary.errors.name).toBe(1);
    });
  });
});
