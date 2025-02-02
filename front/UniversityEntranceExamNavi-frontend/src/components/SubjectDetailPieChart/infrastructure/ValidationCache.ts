"use server";

import { ValidationResult, ScoreValidationRules } from "../types/validation";
import { cache } from "react";
import { unstable_cache, revalidateTag } from "next/cache";
import { ValidationError } from "./errors";
import { ValidationResultValidator } from "./validators";
import { ValidationCacheKey } from "./ValidationCacheKey";
import { CacheOptions, StorageProvider, ValidationErrorCodes } from "./types";

export class ValidationCache {
  private readonly ttl: number;
  private readonly revalidateSeconds: number;
  private readonly cacheTag = "validation-cache" as const;
  private readonly storage: StorageProvider;
  private readonly maxCacheSize: number;
  private cacheSize = 0;

  constructor(options: CacheOptions) {
    const { ttl = 5 * 60 * 1000, storage, maxCacheSize = 1000 } = options;

    ValidationResultValidator.validateNumber(
      ttl,
      ValidationErrorCodes.INVALID_NUMBER
    );
    ValidationResultValidator.validateNumber(
      maxCacheSize,
      ValidationErrorCodes.INVALID_NUMBER
    );

    this.ttl = ttl;
    this.revalidateSeconds = Math.floor(ttl / 1000);
    this.maxCacheSize = maxCacheSize;
    this.storage = storage ?? {
      get: async () => null,
      set: async () => {},
      flushAll: async () => {},
    };
  }

  get = cache(
    async (
      value: number,
      rules: ScoreValidationRules
    ): Promise<ValidationResult | null> => {
      if (!Number.isFinite(value) || !rules) {
        throw new ValidationError(
          "無効なパラメータです",
          ValidationErrorCodes.INVALID_PARAMS
        );
      }

      return unstable_cache(
        async () => this.retrieveValidationResult(value, rules),
        [ValidationCacheKey.createKey(value, rules)],
        { revalidate: this.revalidateSeconds, tags: [this.cacheTag] }
      )();
    }
  );

  private async retrieveValidationResult(
    value: number,
    rules: ScoreValidationRules
  ): Promise<ValidationResult | null> {
    const result = await this.fetchValidationResult(value, rules);
    if (!result?.metadata?.validatedAt) return null;
    return Date.now() - result.metadata.validatedAt < this.ttl ? result : null;
  }

  set = async (
    value: number,
    rules: ScoreValidationRules,
    result: ValidationResult
  ): Promise<void> => {
    if (
      !Number.isFinite(value) ||
      !rules ||
      !ValidationResultValidator.isValidResult(result)
    ) {
      throw new ValidationError(
        "無効なパラメータです",
        ValidationErrorCodes.INVALID_PARAMS
      );
    }

    await this.ensureCacheCapacity();
    await this.storeValidationResult(value, rules, result);
  };

  private async ensureCacheCapacity(): Promise<void> {
    if (this.cacheSize >= this.maxCacheSize) {
      await this.clear();
    }
  }

  private async storeValidationResult(
    value: number,
    rules: ScoreValidationRules,
    result: ValidationResult
  ): Promise<void> {
    const validatedResult = {
      ...result,
      metadata: {
        validatedAt: Date.now(),
        rules: result.metadata?.rules ?? [],
      },
    };

    await this.updateValidationCache(value, rules, validatedResult);
    this.cacheSize++;
    revalidateTag(this.cacheTag);
  }

  async clear(): Promise<void> {
    try {
      await this.storage.flushAll();
      this.cacheSize = 0;
      revalidateTag(this.cacheTag);
    } catch (error) {
      throw new ValidationError(
        "キャッシュのクリアに失敗しました",
        ValidationErrorCodes.CACHE_ERROR
      );
    }
  }

  private async fetchValidationResult(
    value: number,
    rules: ScoreValidationRules
  ): Promise<ValidationResult | null> {
    try {
      const cached = await this.storage.get(
        ValidationCacheKey.createKey(value, rules)
      );
      if (!cached) return null;

      const parsed = JSON.parse(cached);
      return ValidationResultValidator.isValidResult(parsed) ? parsed : null;
    } catch (error) {
      throw new ValidationError(
        "キャッシュの取得に失敗しました",
        ValidationErrorCodes.CACHE_ERROR
      );
    }
  }

  private async updateValidationCache(
    value: number,
    rules: ScoreValidationRules,
    result: ValidationResult
  ): Promise<void> {
    try {
      await this.storage.set(
        ValidationCacheKey.createKey(value, rules),
        JSON.stringify(result),
        { ttl: this.ttl }
      );
    } catch (error) {
      throw new ValidationError(
        "キャッシュの更新に失敗しました",
        ValidationErrorCodes.CACHE_ERROR
      );
    }
  }
}
