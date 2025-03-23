import { describe, it, expect, vi, beforeEach } from "vitest";
import { ValidationRuleCache } from "@/features/subjects/constants/validation-rule-cache";
import type { ValidationRule } from "@/types/validation";

describe("ValidationRuleCache", () => {
  let cache: ValidationRuleCache<string>;

  beforeEach(() => {
    cache = ValidationRuleCache.getInstance();
    cache.clearCache();
  });

  describe("キャッシュの基本操作", () => {
    it("ルールを正しくキャッシュし、取得できる", () => {
      const rules: ValidationRule<string>[] = [
        {
          validate: (value) => value.length > 0,
          message: "値は必須です",
          code: "REQUIRED",
          name: "REQUIRED",
          severity: "error",
          category: "validation",
        },
      ];

      cache.setCachedRules("testKey", rules);
      const cachedRules = cache.getCachedRules("testKey");

      expect(cachedRules).toEqual(rules);
    });

    it("存在しないキーの場合、undefinedを返す", () => {
      const cachedRules = cache.getCachedRules("nonexistentKey");
      expect(cachedRules).toBeUndefined();
    });

    it("キャッシュをクリアすると、すべてのエントリが削除される", () => {
      const rules: ValidationRule<string>[] = [
        {
          validate: (value) => value.length > 0,
          message: "値は必須です",
          code: "REQUIRED",
          name: "REQUIRED",
          severity: "error",
          category: "validation",
        },
      ];

      cache.setCachedRules("testKey", rules);
      cache.clearCache();

      expect(cache.getCacheSize()).toBe(0);
      expect(cache.getCachedRules("testKey")).toBeUndefined();
    });
  });

  describe("メトリクス", () => {
    it("ヒット数とミス数を正しく記録する", () => {
      const rules: ValidationRule<string>[] = [
        {
          validate: (value) => value.length > 0,
          message: "値は必須です",
          code: "REQUIRED",
          name: "REQUIRED",
          severity: "error",
          category: "validation",
        },
      ];

      cache.setCachedRules("testKey", rules);

      // キャッシュヒット
      cache.getCachedRules("testKey");
      cache.getCachedRules("testKey");

      // キャッシュミス
      cache.getCachedRules("nonexistentKey");

      const metrics = cache.getMetrics();
      expect(metrics.hits).toBe(2);
      expect(metrics.misses).toBe(1);
      expect(metrics.totalOperations).toBe(4); // setCachedRules + 2 hits + 1 miss
    });

    it("ヒット率を正しく計算する", () => {
      const rules: ValidationRule<string>[] = [
        {
          validate: (value) => value.length > 0,
          message: "値は必須です",
          code: "REQUIRED",
          name: "REQUIRED",
          severity: "error",
          category: "validation",
        },
      ];

      cache.setCachedRules("testKey", rules);

      // 2回ヒット、1回ミス
      cache.getCachedRules("testKey");
      cache.getCachedRules("testKey");
      cache.getCachedRules("nonexistentKey");

      expect(cache.getHitRate()).toBe(2 / 3); // 2 hits / (2 hits + 1 miss)
    });
  });

  describe("キャッシュクリーンアップ", () => {
    it("アクセス頻度の低いエントリを削除する", () => {
      vi.useFakeTimers();

      const rules: ValidationRule<string>[] = [
        {
          validate: (value) => value.length > 0,
          message: "値は必須です",
          code: "REQUIRED",
          name: "REQUIRED",
          severity: "error",
          category: "validation",
        },
      ];

      cache.setCachedRules("frequentKey", rules);
      cache.setCachedRules("infrequentKey", rules);

      // frequentKeyに頻繁にアクセス
      for (let i = 0; i < 20; i++) {
        cache.getCachedRules("frequentKey");
      }

      // 1時間経過
      vi.advanceTimersByTime(1000 * 60 * 60);

      // プライベートメソッドを直接呼び出す
      (cache as unknown as { cleanupCache: () => void }).cleanupCache();

      expect(cache.getCachedRules("frequentKey")).toBeDefined();
      expect(cache.getCachedRules("infrequentKey")).toBeUndefined();

      vi.useRealTimers();
    });
  });
});
