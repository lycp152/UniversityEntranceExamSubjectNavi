import { describe, it, expect, beforeEach, vi } from "vitest";
import { ScoreValidator } from "./scoreValidator";
import type { BaseSubjectScore } from "@/types/score/score";

describe("ScoreValidator", () => {
  let validator: ScoreValidator;
  let mockErrorLogger: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockErrorLogger = vi.fn();
    validator = new ScoreValidator({ maxSize: 2, ttl: 100 });
    vi.spyOn(validator["errorLogger"], "error").mockImplementation(
      mockErrorLogger
    );
  });

  describe("validateScore", () => {
    it("有効なスコアを検証できること", () => {
      const score: BaseSubjectScore = {
        commonTest: 80,
        secondTest: 70,
      };

      const result = validator.validateScore(score);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.timestamp).toBeDefined();
      expect(typeof result.timestamp).toBe("number");
    });

    it("無効な共通テストのスコアを検出できること", () => {
      const score: BaseSubjectScore = {
        commonTest: -10,
        secondTest: 70,
      };

      const result = validator.validateScore(score);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("共通テストのスコアが無効です");
      expect(mockErrorLogger).toHaveBeenCalledWith(
        "スコアは0以上である必要があります",
        {
          score: -10,
        }
      );
    });

    it("無効な個別試験のスコアを検出できること", () => {
      const score: BaseSubjectScore = {
        commonTest: 80,
        secondTest: -5,
      };

      const result = validator.validateScore(score);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("個別試験のスコアが無効です");
      expect(mockErrorLogger).toHaveBeenCalledWith(
        "スコアは0以上である必要があります",
        {
          score: -5,
        }
      );
    });

    it("キャッシュから結果を取得できること", () => {
      const score: BaseSubjectScore = {
        commonTest: 80,
        secondTest: 70,
      };

      const firstResult = validator.validateScore(score);
      const secondResult = validator.validateScore(score);
      expect(firstResult).toEqual(secondResult);
    });

    it("キャッシュサイズの制限を超えた場合、最も古いエントリーが削除されること", () => {
      const scores = [
        { commonTest: 80, secondTest: 70 },
        { commonTest: 90, secondTest: 80 },
        { commonTest: 70, secondTest: 60 },
      ];

      scores.forEach((score) => {
        validator.validateScore(score);
      });

      // 最初のスコアのキャッシュが削除されているはず
      const firstScore = scores[0];
      const result = validator.validateScore(firstScore);
      expect(result.timestamp).toBeGreaterThan(0);
    });

    it("キャッシュの有効期限が切れた場合、新しい検証が行われること", async () => {
      const score: BaseSubjectScore = {
        commonTest: 80,
        secondTest: 70,
      };

      const firstResult = validator.validateScore(score);

      // TTLの時間だけ待機
      await new Promise((resolve) => setTimeout(resolve, 150));

      const secondResult = validator.validateScore(score);
      expect(secondResult.timestamp).toBeGreaterThan(firstResult.timestamp);
    });

    it("境界値のスコアを検証できること", () => {
      const score: BaseSubjectScore = {
        commonTest: 0,
        secondTest: 0,
      };

      const result = validator.validateScore(score);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("calculateTotal", () => {
    it("有効なスコアの合計を計算できること", () => {
      const score: BaseSubjectScore = {
        commonTest: 80,
        secondTest: 70,
      };

      const total = validator.calculateTotal(score);
      expect(total).toBe(150);
    });

    it("無効なスコアの場合は0を返すこと", () => {
      const score: BaseSubjectScore = {
        commonTest: -10,
        secondTest: 70,
      };

      const total = validator.calculateTotal(score);
      expect(total).toBe(0);
      expect(mockErrorLogger).toHaveBeenCalledWith(
        "スコアは0以上である必要があります",
        {
          score: -10,
        }
      );
    });

    it("境界値のスコアの合計を計算できること", () => {
      const score: BaseSubjectScore = {
        commonTest: 0,
        secondTest: 0,
      };

      const total = validator.calculateTotal(score);
      expect(total).toBe(0);
    });
  });

  describe("clearCache", () => {
    it("キャッシュをクリアできること", () => {
      const score: BaseSubjectScore = {
        commonTest: 80,
        secondTest: 70,
      };

      validator.validateScore(score);
      validator.clearCache();

      // キャッシュがクリアされたので、新しい検証が実行されること
      const result = validator.validateScore(score);
      expect(result.isValid).toBe(true);
    });

    it("キャッシュクリア後に再計算が行われることを確認する", async () => {
      const score: BaseSubjectScore = {
        commonTest: 80,
        secondTest: 70,
      };

      const firstResult = validator.validateScore(score);
      await new Promise((resolve) => setTimeout(resolve, 10)); // 少し待機
      validator.clearCache();
      const secondResult = validator.validateScore(score);

      // キャッシュがクリアされているため、新しい計算が行われている
      expect(validator["cache"].size).toBe(1);
      expect(secondResult.timestamp).toBeGreaterThan(firstResult.timestamp);
    });
  });

  describe("メトリクス", () => {
    it("初期状態のメトリクスを取得できること", () => {
      const metrics = validator.getMetrics();
      expect(metrics).toEqual({
        totalValidations: 0,
        cacheHits: 0,
        cacheMisses: 0,
        errors: 0,
        averageValidationTime: 0,
        totalValidationTime: 0,
      });
    });

    it("メトリクスが正しく更新されること", () => {
      const score: BaseSubjectScore = {
        commonTest: 80,
        secondTest: 70,
      };

      // 最初の検証（キャッシュミス）
      validator.validateScore(score);
      let metrics = validator.getMetrics();
      expect(metrics.totalValidations).toBe(1);
      expect(metrics.cacheMisses).toBe(1);
      expect(metrics.cacheHits).toBe(0);
      expect(metrics.errors).toBe(0);

      // 2回目の検証（キャッシュヒット）
      validator.validateScore(score);
      metrics = validator.getMetrics();
      expect(metrics.totalValidations).toBe(2);
      expect(metrics.cacheMisses).toBe(1);
      expect(metrics.cacheHits).toBe(1);
      expect(metrics.errors).toBe(0);

      // エラーケース
      const invalidScore: BaseSubjectScore = {
        commonTest: -10,
        secondTest: 70,
      };
      validator.validateScore(invalidScore);
      metrics = validator.getMetrics();
      expect(metrics.totalValidations).toBe(3);
      expect(metrics.errors).toBe(1);
    });

    it("メトリクスをリセットできること", () => {
      const score: BaseSubjectScore = {
        commonTest: 80,
        secondTest: 70,
      };

      validator.validateScore(score);
      validator.validateScore(score);
      validator.resetMetrics();

      const metrics = validator.getMetrics();
      expect(metrics).toEqual({
        totalValidations: 0,
        cacheHits: 0,
        cacheMisses: 0,
        errors: 0,
        averageValidationTime: 0,
        totalValidationTime: 0,
      });
    });

    it("平均検証時間が計算されること", () => {
      const score: BaseSubjectScore = {
        commonTest: 80,
        secondTest: 70,
      };

      validator.validateScore(score);
      const metrics = validator.getMetrics();

      expect(metrics.averageValidationTime).toBeGreaterThan(0);
      expect(metrics.totalValidationTime).toBeGreaterThan(0);
    });
  });
});
