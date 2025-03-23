import { ValidationError } from "@/lib/validation/error";
import { ValidationCategory, ValidationSeverity } from "@/types/validation";

interface BatchValidationResult<T> {
  item: T;
  errors: ValidationError[];
  processingTime?: number;
}

interface BatchValidationOptions {
  stopOnFirstError?: boolean;
  maxConcurrent?: number;
  timeoutMs?: number;
  adaptiveBatchSize?: boolean;
}

interface BatchMetrics {
  totalProcessingTime: number;
  averageProcessingTime: number;
  maxProcessingTime: number;
  successRate: number;
  batchSize: number;
}

export class BatchValidator {
  private static readonly DEFAULT_OPTIONS: BatchValidationOptions = {
    stopOnFirstError: false,
    maxConcurrent: 5,
    timeoutMs: 30000,
    adaptiveBatchSize: true,
  };

  private static metrics: BatchMetrics = {
    totalProcessingTime: 0,
    averageProcessingTime: 0,
    maxProcessingTime: 0,
    successRate: 1,
    batchSize: 5,
  };

  private static handleValidationError(
    error: unknown,
    item: unknown,
    processingTime: number,
    stopOnFirstError: boolean
  ): BatchValidationResult<unknown> {
    if (error instanceof ValidationError) {
      if (stopOnFirstError) {
        throw error;
      }
      return { item, errors: [error], processingTime };
    }

    if (error instanceof Array) {
      const validationErrors = error.map((err) =>
        err instanceof ValidationError
          ? err
          : new ValidationError("バリデーションエラー", [
              {
                field: "unknown",
                message: err.message || "不明なエラー",
                category: ValidationCategory.SYSTEM,
                severity: ValidationSeverity.ERROR,
              },
            ])
      );
      if (stopOnFirstError) {
        throw validationErrors[0];
      }
      return { item, errors: validationErrors, processingTime };
    }

    const validationError = new ValidationError(
      "バリデーション中に予期せぬエラーが発生しました",
      [
        {
          field: "unknown",
          message: error instanceof Error ? error.message : "不明なエラー",
          category: ValidationCategory.SYSTEM,
          severity: ValidationSeverity.ERROR,
        },
      ]
    );
    if (stopOnFirstError) {
      throw validationError;
    }
    return { item, errors: [validationError], processingTime };
  }

  static async validateBatch<T>(
    items: T[],
    validator: (item: T) => Promise<void> | void,
    options: BatchValidationOptions = {}
  ): Promise<BatchValidationResult<T>[]> {
    const mergedOptions = { ...this.DEFAULT_OPTIONS, ...options };
    const results: BatchValidationResult<T>[] = [];
    const batchSize = this.calculateOptimalBatchSize(mergedOptions);
    const chunks = this.chunkArray(items, batchSize);

    let totalProcessingTime = 0;

    for (const chunk of chunks) {
      const chunkStartTime = Date.now();
      const chunkPromises = chunk.map(async (item) => {
        const itemStartTime = Date.now();
        try {
          const validationPromise = Promise.resolve(validator(item));
          const timeoutPromise = this.createTimeout(mergedOptions.timeoutMs!);
          await Promise.race([validationPromise, timeoutPromise]);

          const processingTime = Date.now() - itemStartTime;
          results.push({ item, errors: [], processingTime });
        } catch (error) {
          const processingTime = Date.now() - itemStartTime;
          const result = this.handleValidationError(
            error,
            item,
            processingTime,
            mergedOptions.stopOnFirstError!
          );
          results.push(result as BatchValidationResult<T>);
        }
      });

      try {
        await Promise.all(chunkPromises);
        const chunkProcessingTime = Date.now() - chunkStartTime;
        totalProcessingTime += chunkProcessingTime;

        if (mergedOptions.adaptiveBatchSize) {
          this.updateMetrics(results, chunkProcessingTime, chunk.length);
        }
      } catch {
        if (mergedOptions.stopOnFirstError) {
          break;
        }
      }
    }

    this.updateFinalMetrics(results, totalProcessingTime);
    return results;
  }

  private static calculateOptimalBatchSize(
    options: BatchValidationOptions
  ): number {
    if (!options.adaptiveBatchSize) {
      return options.maxConcurrent!;
    }

    // メトリクスに基づいて最適なバッチサイズを計算
    const baseSize = options.maxConcurrent!;
    const successFactor = Math.min(this.metrics.successRate * 1.5, 1);
    const timingFactor = Math.max(
      1 - this.metrics.averageProcessingTime / options.timeoutMs!,
      0.5
    );

    return Math.max(Math.floor(baseSize * successFactor * timingFactor), 1);
  }

  private static updateMetrics<T>(
    results: BatchValidationResult<T>[],
    processingTime: number,
    batchSize: number
  ): void {
    const successCount = results.filter((r) => r.errors.length === 0).length;
    const newSuccessRate = successCount / results.length;

    this.metrics = {
      totalProcessingTime: this.metrics.totalProcessingTime + processingTime,
      averageProcessingTime:
        (this.metrics.averageProcessingTime + processingTime / batchSize) / 2,
      maxProcessingTime: Math.max(
        this.metrics.maxProcessingTime,
        processingTime
      ),
      successRate: (this.metrics.successRate + newSuccessRate) / 2,
      batchSize: Math.round((this.metrics.batchSize + batchSize) / 2),
    };
  }

  private static updateFinalMetrics<T>(
    results: BatchValidationResult<T>[],
    totalProcessingTime: number
  ): void {
    const successCount = results.filter((r) => r.errors.length === 0).length;
    this.metrics.successRate = successCount / results.length;
    this.metrics.totalProcessingTime = totalProcessingTime;
  }

  static getMetrics(): BatchMetrics {
    return { ...this.metrics };
  }

  private static chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private static createTimeout(ms: number): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(
        () =>
          reject(new Error(`バリデーションがタイムアウトしました (${ms}ms)`)),
        ms
      )
    );
  }

  static summarizeResults<T>(results: BatchValidationResult<T>[]): {
    totalItems: number;
    validItems: number;
    invalidItems: number;
    errors: { [key: string]: number };
    metrics: {
      averageProcessingTime: number;
      maxProcessingTime: number;
      totalProcessingTime: number;
    };
  } {
    const summary = {
      totalItems: results.length,
      validItems: 0,
      invalidItems: 0,
      errors: {} as { [key: string]: number },
      metrics: {
        averageProcessingTime: 0,
        maxProcessingTime: 0,
        totalProcessingTime: 0,
      },
    };

    let totalProcessingTime = 0;
    let maxProcessingTime = 0;

    for (const result of results) {
      if (result.errors.length === 0) {
        summary.validItems++;
      } else {
        summary.invalidItems++;
        for (const error of result.errors) {
          const details = error.details || [];
          for (const detail of details) {
            const field = detail.field ?? "unknown";
            summary.errors[field] = (summary.errors[field] || 0) + 1;
          }
        }
      }

      if (result.processingTime) {
        totalProcessingTime += result.processingTime;
        maxProcessingTime = Math.max(maxProcessingTime, result.processingTime);
      }
    }

    summary.metrics = {
      averageProcessingTime: totalProcessingTime / results.length,
      maxProcessingTime,
      totalProcessingTime,
    };

    return summary;
  }
}
