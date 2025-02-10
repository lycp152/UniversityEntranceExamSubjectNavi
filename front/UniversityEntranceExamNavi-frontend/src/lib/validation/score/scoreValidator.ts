import { BaseValidator } from '../core/validator';
import type { ValidationRule, ValidationContext, ValidationMetadata } from '../core/types';
import type { BaseSubjectScore, ValidationResult, TestType } from '@/lib/types/score';
import { TEST_TYPES, SCORE_CONSTRAINTS } from '@/lib/types/score';
import { ScoreErrorCodes, createErrorMessage, ScoreValidationError } from '@/lib/errors/score';
import { Severity } from '@/features/subject/components/SubjectDetail/Scores/SubjectScoreDonutChart/types/errors';

/**
 * テストスコアの型定義
 */
interface TestScore {
  readonly value: number;
  readonly maxValue: number;
}

/**
 * キャッシュ操作の結果型
 */
interface CacheOperationResult<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: Error;
}

/**
 * スコアのキャッシュデータ型
 */
interface ScoreCache {
  total?: number;
  maxTotal?: number;
  percentage?: number;
  isValid?: boolean;
  validationResult?: ValidationResult<BaseSubjectScore>;
  lastUpdated: number;
  computedAt: number;
}

/**
 * 操作の結果型
 */
interface OperationResult<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: Error;
  readonly timestamp: number;
  readonly context?: {
    readonly operation: string;
    readonly duration?: number;
    readonly phase?: string;
    readonly operationId?: string;
    readonly queueState?: {
      readonly queueLength: number;
      readonly concurrentOperations: number;
    };
  };
}

/**
 * 操作のコンテキスト型
 */
interface OperationContext {
  readonly startTime: number;
  readonly queueLength: number;
  readonly concurrentOperations: number;
  readonly phase?: string;
  readonly metadata?: Record<string, unknown>;
}

/**
 * バリデーション操作の結果型
 */
interface ValidationOperationResult<T> extends OperationResult<T> {
  readonly validationContext?: {
    readonly rules: readonly string[];
    readonly validatedAt: number;
    readonly recoveryAttempted?: boolean;
  };
}

/** キャッシュの設定 */
const CACHE_CONFIG = {
  /** キャッシュの有効期限（5分） */
  TTL: 5 * 60 * 1000,
  /** デバウンス時間（100ms） */
  DEBOUNCE_TIME: 100,
  /** 最大同時実行数 */
  MAX_CONCURRENT: 5,
};

/**
 * リトライ設定
 */
const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  DELAY_MS: 100,
};

/**
 * バリデーション失敗の種類
 */
const enum ValidationFailureType {
  INVALID_FORMAT = 'INVALID_FORMAT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CACHE_ERROR = 'CACHE_ERROR',
  CONCURRENT_ERROR = 'CONCURRENT_ERROR',
}

/**
 * スコアの型ガード
 */
function isValidTestScore(score: unknown): score is TestScore {
  try {
    return (
      typeof score === 'object' &&
      score !== null &&
      'value' in score &&
      'maxValue' in score &&
      typeof (score as TestScore).value === 'number' &&
      typeof (score as TestScore).maxValue === 'number'
    );
  } catch (error) {
    return false;
  }
}

/**
 * スコアの型ガード
 */
function isBaseSubjectScore(score: unknown): score is BaseSubjectScore {
  try {
    return (
      typeof score === 'object' &&
      score !== null &&
      TEST_TYPES.COMMON in score &&
      TEST_TYPES.INDIVIDUAL in score &&
      isValidTestScore((score as BaseSubjectScore)[TEST_TYPES.COMMON]) &&
      isValidTestScore((score as BaseSubjectScore)[TEST_TYPES.INDIVIDUAL])
    );
  } catch (error) {
    return false;
  }
}

/**
 * スコアのバリデーションルールを生成する
 * @param context - バリデーションコンテキスト
 * @returns バリデーションルールの配列
 */
const createScoreRules = (context: ValidationContext = {}): ValidationRule<BaseSubjectScore>[] => [
  {
    code: ScoreErrorCodes.INVALID_SCORE,
    validate: (score) => {
      const commonTest = score[TEST_TYPES.COMMON];
      return (
        commonTest.value >= SCORE_CONSTRAINTS.MIN_VALUE && commonTest.value <= commonTest.maxValue
      );
    },
    message: createErrorMessage(ScoreErrorCodes.INVALID_SCORE, TEST_TYPES.COMMON),
  },
  {
    code: ScoreErrorCodes.INVALID_SCORE,
    validate: (score) => {
      const individualTest = score[TEST_TYPES.INDIVIDUAL];
      return (
        individualTest.value >= SCORE_CONSTRAINTS.MIN_VALUE &&
        individualTest.value <= individualTest.maxValue
      );
    },
    message: createErrorMessage(ScoreErrorCodes.INVALID_SCORE, TEST_TYPES.INDIVIDUAL),
  },
];

/**
 * 操作の実行状態を管理するクラス
 */
class OperationStateManager {
  private readonly operationStates = new Map<
    string,
    {
      startTime: number;
      status: 'pending' | 'running' | 'completed' | 'failed';
      duration?: number;
      error?: string;
      phase?: string;
      severity?: 'info' | 'warning' | 'error';
    }
  >();

  addOperation(operationId: string): void {
    this.operationStates.set(operationId, {
      startTime: Date.now(),
      status: 'pending',
    });
  }

  updateStatus(
    operationId: string,
    status: 'running' | 'completed' | 'failed',
    details?: {
      duration?: number;
      error?: string;
      phase?: string;
      severity?: 'info' | 'warning' | 'error';
    }
  ): void {
    const state = this.operationStates.get(operationId);
    if (state) {
      state.status = status;
      if (details) {
        Object.assign(state, details);
      }
    }
  }

  getOperationState(operationId: string) {
    return this.operationStates.get(operationId);
  }

  cleanup(maxAge: number = 3600000): void {
    const now = Date.now();
    for (const [id, state] of this.operationStates.entries()) {
      if (now - state.startTime > maxAge) {
        this.operationStates.delete(id);
      }
    }
  }
}

/**
 * キャッシュ管理を担当するクラス
 */
class CacheManager {
  private readonly cache: WeakMap<BaseSubjectScore, ScoreCache>;
  private readonly metrics: {
    hits: number;
    misses: number;
    lastCleanup: number;
    totalOperations: number;
    averageAccessTime: number;
    lastAccessTimestamp: number;
  };

  constructor() {
    this.cache = new WeakMap();
    this.metrics = {
      hits: 0,
      misses: 0,
      lastCleanup: Date.now(),
      totalOperations: 0,
      averageAccessTime: 0,
      lastAccessTimestamp: Date.now(),
    };
  }

  get(score: BaseSubjectScore): ScoreCache | undefined {
    const startTime = Date.now();
    const cached = this.cache.get(score);

    this.updateMetrics(startTime, !!cached);

    if (cached) {
      this.metrics.hits++;
      if (!this.isExpired(cached)) {
        return cached;
      }
      // 期限切れの場合は部分的にリセット
      this.partialReset(cached);
    } else {
      this.metrics.misses++;
    }
    return cached;
  }

  private updateMetrics(startTime: number, isHit: boolean): void {
    const accessTime = Date.now() - startTime;
    const totalOps = ++this.metrics.totalOperations;

    // 平均アクセス時間の更新
    this.metrics.averageAccessTime =
      (this.metrics.averageAccessTime * (totalOps - 1) + accessTime) / totalOps;

    this.metrics.lastAccessTimestamp = Date.now();

    if (this.shouldPerformCleanup()) {
      this.cleanup();
    }
  }

  private shouldPerformCleanup(): boolean {
    const timeSinceLastCleanup = Date.now() - this.metrics.lastCleanup;
    return timeSinceLastCleanup > CACHE_CONFIG.TTL * 2;
  }

  private cleanup(): void {
    this.metrics.lastCleanup = Date.now();
    // WeakMapは自動的にガベージコレクションされるため、
    // 明示的なクリーンアップは不要
  }

  getMetrics(): string {
    const hitRate =
      this.metrics.hits + this.metrics.misses > 0
        ? ((this.metrics.hits / (this.metrics.hits + this.metrics.misses)) * 100).toFixed(2)
        : '0';

    return (
      `キャッシュ統計:\n` +
      `- ヒット率: ${hitRate}%\n` +
      `- ヒット数: ${this.metrics.hits}\n` +
      `- ミス数: ${this.metrics.misses}\n` +
      `- 平均アクセス時間: ${this.metrics.averageAccessTime.toFixed(2)}ms\n` +
      `- 総操作数: ${this.metrics.totalOperations}\n` +
      `- 最終アクセス: ${new Date(this.metrics.lastAccessTimestamp).toISOString()}`
    );
  }

  set(score: BaseSubjectScore, value: ScoreCache): void {
    this.cache.set(score, {
      ...value,
      lastUpdated: Date.now(),
      computedAt: Date.now(),
    });
  }

  private isExpired(cache: ScoreCache): boolean {
    const now = Date.now();
    return now - cache.lastUpdated > CACHE_CONFIG.TTL || now < cache.lastUpdated;
  }

  private partialReset(cache: ScoreCache): void {
    cache.validationResult = undefined;
    cache.isValid = undefined;
    cache.lastUpdated = Date.now();
  }
}

type AlertCategory = 'performance' | 'reliability' | 'resources' | 'security' | 'availability';
type AlertType =
  | 'responseTime'
  | 'throughput'
  | 'errorRate'
  | 'memoryUsage'
  | 'cacheEfficiency'
  | 'resourceUtilization'
  | 'concurrency'
  | 'dataIntegrity'
  | 'systemHealth';

type Trend = 'increasing' | 'decreasing' | 'stable';

interface Alert {
  type: AlertType;
  message: string;
  severity: Severity;
  timestamp: number;
  category: AlertCategory;
  threshold: number;
  currentValue: number;
  trend: Trend;
  recommendations: string[];
}

interface AlertHistory extends Alert {
  startTime: number;
  endTime: number;
  duration: number;
  resolutionDetails: string;
  preventiveMeasures: string[];
}

type Priority = 'high' | 'medium' | 'low';
type ErrorSeverity = 'critical' | 'error' | 'warning';

interface PerformanceMetrics {
  trends: {
    responseTime: Array<{ timestamp: number; value: number; operation: string }>;
    throughput: Array<{ timestamp: number; value: number }>;
    errorRate: Array<{ timestamp: number; value: number; errorType: string }>;
    memoryUsage: Array<{ timestamp: number; value: number; type: 'heap' | 'rss' }>;
    cacheEfficiency: Array<{ timestamp: number; hitRate: number; missRate: number }>;
  };
  warnings: Array<{
    timestamp: number;
    message: string;
    category: string;
    priority: Priority;
    impact: string;
  }>;
  alerts: {
    active: Alert[];
    history: AlertHistory[];
  };
  healthScore: {
    current: number;
    history: Array<{
      timestamp: number;
      score: number;
      factors: {
        responseTime: number;
        errorRate: number;
        memoryUsage: number;
        cacheEfficiency: number;
        resourceUtilization: number;
      };
      breakdown: {
        performance: number;
        reliability: number;
        efficiency: number;
      };
    }>;
  };
}

interface ErrorContext {
  errorType: string;
  timestamp: number;
  severity: 'critical' | 'error' | 'warning';
  recoveryAttempts: number;
  stackTrace?: string;
  operationDetails: {
    type: string;
    phase: string;
    duration?: number;
  };
  systemState: {
    memoryUsage: number;
    cacheSize: number;
    activeOperations: number;
  };
}

interface RecoveryResult {
  success: boolean;
  attempts: number;
  duration: number;
  error?: Error;
  recoverySteps: string[];
}

/**
 * スコアバリデーターのメインクラス
 *
 * このクラスは科目スコアのバリデーションと計算を行います。
 * パフォーマンスを最適化するため、計算結果をキャッシュし、
 * 重複するバリデーションを防ぎます。
 *
 * @example
 * ```typescript
 * const validator = new ScoreValidator();
 *
 * // スコアの検証
 * const result = await validator.validateScore({
 *   [TEST_TYPES.COMMON]: { value: 80, maxValue: 100 },
 *   [TEST_TYPES.INDIVIDUAL]: { value: 150, maxValue: 200 }
 * });
 *
 * if (result.isValid) {
 *   // スコアの計算
 *   const total = validator.calculateTotal(score);
 *   const percentage = validator.calculatePercentage(score);
 * }
 * ```
 */
export class ScoreValidator extends BaseValidator<BaseSubjectScore> {
  private readonly cacheManager: CacheManager;
  private readonly errorLogger?: (error: Error) => void;
  private readonly validationPromises: Map<string, Promise<ValidationResult<BaseSubjectScore>>>;
  private concurrentOperations: number = 0;
  private readonly operationQueue: Array<() => Promise<void>> = [];
  private readonly debounceTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private readonly operationStateManager = new OperationStateManager();

  private readonly metrics: {
    performance: PerformanceMetrics;
  } = {
    performance: {
      trends: {
        responseTime: [],
        throughput: [],
        errorRate: [],
        memoryUsage: [],
        cacheEfficiency: [],
      },
      warnings: [],
      alerts: {
        active: [],
        history: [],
      },
      healthScore: {
        current: 100,
        history: [],
      },
    },
  };

  private readonly performanceThresholds = {
    responseTime: {
      warning: 1000, // 1秒
      critical: 3000, // 3秒
    },
    errorRate: {
      warning: 5, // 5%
      critical: 10, // 10%
    },
    memoryUsage: {
      warning: 70, // 70%
      critical: 85, // 85%
    },
    cacheEfficiency: {
      warning: 60, // 60%のヒット率
      critical: 40, // 40%のヒット率
    },
    resourceUtilization: {
      warning: 75, // 75%
      critical: 90, // 90%
    },
  };

  /**
   * スコアバリデーターを初期化
   * @param context - バリデーションコンテキスト
   * @param errorLogger - カスタムエラーロガー
   */
  constructor(context?: ValidationContext, errorLogger?: (error: Error) => void) {
    super(createScoreRules(context), context);
    this.cacheManager = new CacheManager();
    this.validationPromises = new Map();
    this.errorLogger = errorLogger;
  }

  /**
   * 安全なスコアの取得（型安全性強化版）
   */
  private getSafeScore(score: unknown): ValidationOperationResult<BaseSubjectScore> {
    const startTime = Date.now();
    if (!isBaseSubjectScore(score)) {
      return {
        success: false,
        error: new ScoreValidationError('無効なスコアフォーマットです', undefined, { score }),
        timestamp: startTime,
        context: {
          operation: 'getSafeScore',
          phase: 'validation',
        },
      };
    }
    return {
      success: true,
      data: score,
      timestamp: startTime,
      context: {
        operation: 'getSafeScore',
        phase: 'validation',
      },
    };
  }

  /**
   * キャッシュの初期化
   */
  private initializeCache(): ScoreCache {
    const now = Date.now();
    return {
      lastUpdated: now,
      computedAt: now,
      total: undefined,
      maxTotal: undefined,
      percentage: undefined,
      isValid: undefined,
      validationResult: undefined,
    };
  }

  /**
   * キャッシュの取得と有効性チェック（最適化版）
   */
  private getCache(score: BaseSubjectScore): ScoreCache {
    try {
      const cached = this.cacheManager.get(score);
      if (cached) {
        return cached;
      }

      const newCache = this.initializeCache();
      this.cacheManager.set(score, newCache);
      return newCache;
    } catch (error) {
      this.logError(error as Error, {
        operation: 'getCache',
        score,
        timestamp: Date.now(),
        metrics: this.cacheManager.getMetrics(),
      });
      return this.initializeCache();
    }
  }

  /**
   * キャッシュの更新（最適化版）
   */
  private updateCache(score: BaseSubjectScore, updates: Partial<ScoreCache>): void {
    try {
      const cache = this.getCache(score);
      const updatedCache = {
        ...cache,
        ...updates,
        lastUpdated: Date.now(),
        computedAt: Date.now(),
      };

      this.cacheManager.set(score, updatedCache);

      if (process.env.NODE_ENV === 'development') {
        console.debug('キャッシュを更新しました:', {
          metrics: this.cacheManager.getMetrics(),
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      this.logError(error as Error, {
        operation: 'updateCache',
        score,
        updates,
        timestamp: Date.now(),
        metrics: this.cacheManager.getMetrics(),
      });
    }
  }

  /**
   * エラーのログ記録（最適化版）
   */
  private readonly logError = (error: Error, context?: Record<string, unknown>): void => {
    if (this.errorLogger) {
      const enhancedError = this.enhanceError(error, {
        ...context,
        timestamp: Date.now(),
        operationType: 'error_logging',
        systemState: {
          memoryUsage: process.memoryUsage().heapUsed,
          cacheSize: this.cacheManager.getMetrics(),
          activeOperations: this.concurrentOperations,
        },
      });
      this.errorLogger(enhancedError);
      this.updatePerformanceMetrics('error_logging', Date.now());
    }
  };

  private logErrorIfAvailable(error: Error): void {
    if (this.errorLogger) {
      const enhancedError = this.enhanceError(error, {
        timestamp: Date.now(),
        operationType: 'error_logging',
        systemState: {
          memoryUsage: process.memoryUsage().heapUsed,
          cacheSize: this.cacheManager.getMetrics(),
          activeOperations: this.concurrentOperations,
        },
      });
      this.errorLogger(enhancedError);
      this.updatePerformanceMetrics('error_logging', Date.now());
    }
  }

  /**
   * 同時実行数を制御しながら処理を実行（最適化版）
   */
  private async executeWithConcurrencyControl<T>(operation: () => Promise<T>): Promise<T> {
    const operationId = `op_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const startTime = Date.now();

    this.operationStateManager.addOperation(operationId);

    const operationContext = {
      operationId,
      startTime,
      queueLength: this.operationQueue.length,
      concurrentOperations: this.concurrentOperations,
      phase: 'concurrency_control',
      severity: 'info' as const,
    };

    try {
      if (this.concurrentOperations >= CACHE_CONFIG.MAX_CONCURRENT) {
        const queuePromise = new Promise<T>((resolve, reject) => {
          const queuedOperation = async () => {
            try {
              this.operationStateManager.updateStatus(operationId, 'running', {
                phase: operationContext.phase,
                severity: operationContext.severity,
              });
              const result = await this.executeOperation(operation, operationContext);
              resolve(result);
            } catch (error) {
              this.operationStateManager.updateStatus(operationId, 'failed', {
                error: error instanceof Error ? error.message : '不明なエラー',
                phase: operationContext.phase,
                severity: 'error',
              });
              reject(error instanceof Error ? error : new Error(String(error)));
            }
          };
          this.operationQueue.push(queuedOperation);
        });

        // キューに追加された時点で'running'状態として扱う
        this.operationStateManager.updateStatus(operationId, 'running', {
          phase: 'queued',
          severity: 'info',
        });

        return queuePromise;
      }

      this.operationStateManager.updateStatus(operationId, 'running', {
        phase: operationContext.phase,
        severity: operationContext.severity,
      });

      return await this.executeOperation(operation, operationContext);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.operationStateManager.updateStatus(operationId, 'failed', {
        duration,
        error: error instanceof Error ? error.message : '不明なエラー',
        phase: operationContext.phase,
        severity: 'error',
      });

      const errorContext = {
        ...operationContext,
        duration,
        error: error instanceof Error ? error.message : '不明なエラー',
        queueState: {
          queueLength: this.operationQueue.length,
          concurrentOperations: this.concurrentOperations,
          operationStatus: this.operationStateManager.getOperationState(operationId),
        },
      };

      this.logError(error as Error, errorContext);
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      this.operationStateManager.updateStatus(operationId, 'completed', {
        duration,
        phase: operationContext.phase,
        severity: 'info',
      });

      // 古い操作状態をクリーンアップ
      this.operationStateManager.cleanup();
    }
  }

  /**
   * 操作の実行（型安全性強化版）
   */
  private async executeOperation<T>(
    operation: () => Promise<T>,
    context: OperationContext & { operationId: string }
  ): Promise<T> {
    this.concurrentOperations++;
    const startTime = Date.now();

    try {
      const result = await operation();
      this.processNextOperation();
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const operationError: OperationResult<T> = {
        success: false,
        error: error as Error,
        timestamp: Date.now(),
        context: {
          operation: 'execute',
          duration,
          phase: context.phase,
          operationId: context.operationId,
          queueState: {
            queueLength: this.operationQueue.length,
            concurrentOperations: this.concurrentOperations,
          },
        },
      };
      throw operationError;
    } finally {
      this.concurrentOperations--;
      const duration = Date.now() - context.startTime;
      if (duration > CACHE_CONFIG.DEBOUNCE_TIME * 2) {
        this.logError(new Error('操作が予想時間を超過しました'), {
          ...context,
          duration,
          threshold: CACHE_CONFIG.DEBOUNCE_TIME * 2,
          phase: 'operation_execution',
          severity: 'warning',
          operationMetrics: {
            queueLength: this.operationQueue.length,
            concurrentOperations: this.concurrentOperations,
            duration,
          },
        });
      }
    }
  }

  /**
   * キューの次の操作を処理（最適化版）
   */
  private processNextOperation(): void {
    if (this.operationQueue.length > 0 && this.concurrentOperations < CACHE_CONFIG.MAX_CONCURRENT) {
      const nextOperation = this.operationQueue.shift();
      if (nextOperation) {
        nextOperation().catch((error) => {
          this.logError(error as Error, {
            operation: 'processNextOperation',
            queueLength: this.operationQueue.length,
            phase: 'queue_processing',
            severity: 'error',
            queueMetrics: {
              remainingOperations: this.operationQueue.length,
              concurrentOperations: this.concurrentOperations,
              timestamp: Date.now(),
            },
          });
        });
      }
    }
  }

  /**
   * 初期バリデーションチェック
   */
  private validateInitial(score: unknown): ValidationResult<BaseSubjectScore> | null {
    const safeScore = this.getSafeScore(score);
    if (!safeScore.success || !safeScore.data) {
      return {
        isValid: false,
        errors: [
          {
            code: ScoreErrorCodes.VALIDATION_ERROR,
            message: safeScore.error?.message ?? '不明なエラー',
          },
        ],
      };
    }
    return null;
  }

  /**
   * キャッシュされた結果の取得
   */
  private getCachedValidation(score: BaseSubjectScore): ValidationResult<BaseSubjectScore> | null {
    const cache = this.getCache(score);
    const cached = this.cacheManager.get(score);
    if (cache.validationResult && cached && !this.cacheManager['isExpired'](cached)) {
      return cache.validationResult;
    }
    return null;
  }

  /**
   * リトライ可能なエラーの判定
   */
  private isRetryableError(error: unknown): boolean {
    if (error instanceof ScoreValidationError) {
      return (
        error.code !== ScoreErrorCodes.INVALID_SCORE &&
        error.code !== ScoreErrorCodes.MAX_SCORE_EXCEEDED &&
        error.code !== ScoreErrorCodes.DATA_INTEGRITY_ERROR
      );
    }
    return false;
  }

  /**
   * リトライ付きの検証実行
   */
  private async validateWithRetry(
    score: BaseSubjectScore,
    attempt: number = 1
  ): Promise<ValidationResult<BaseSubjectScore>> {
    try {
      const cache = this.getCache(score);
      return await this.performValidation(score, cache);
    } catch (error) {
      if (this.isRetryableError(error) && attempt < RETRY_CONFIG.MAX_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_CONFIG.DELAY_MS * attempt));
        return this.validateWithRetry(score, attempt + 1);
      }
      const failureType = this.determineFailureType(error);
      return this.attemptRecovery(score, failureType);
    }
  }

  /**
   * エラー回復を試みる
   */
  private async attemptRecovery(
    score: BaseSubjectScore,
    failureType: ValidationFailureType
  ): Promise<ValidationResult<BaseSubjectScore>> {
    const startTime = Date.now();
    const operationId = `recovery-${startTime}`;
    const maxAttempts = this.getRecoveryAttempts(failureType);

    this.operationStateManager.addOperation(operationId);
    this.operationStateManager.updateStatus(operationId, 'running', {
      phase: 'recovery-start',
      severity: 'warning',
    });

    try {
      const recoveryResult = await this.executeRecoveryAttempts(
        score,
        failureType,
        maxAttempts,
        operationId
      );

      if (recoveryResult.success) {
        return {
          isValid: true,
          data: score,
          errors: [],
        };
      }

      return this.handleValidationFailure(failureType, recoveryResult.error);
    } catch (error) {
      return this.handleValidationFailure(failureType, error instanceof Error ? error : undefined);
    }
  }

  private async executeRecoveryAttempts(
    score: BaseSubjectScore,
    failureType: ValidationFailureType,
    maxAttempts: number,
    operationId: string
  ): Promise<{ success: boolean; error?: Error }> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        this.operationStateManager.updateStatus(operationId, 'running', {
          phase: `recovery-attempt-${attempt}`,
        });

        const result = await this.executeRecoveryStrategy(score, failureType, attempt);
        if (result.success) {
          return { success: true };
        }
      } catch (error) {
        if (attempt === maxAttempts) {
          return { success: false, error: error instanceof Error ? error : undefined };
        }
      }
    }
    return { success: false };
  }

  private async executeRecoveryStrategy(
    score: BaseSubjectScore,
    failureType: ValidationFailureType,
    attempt: number
  ): Promise<{
    success: boolean;
    error?: Error;
    recoverySteps: string[];
  }> {
    const recoverySteps: string[] = [];
    try {
      await this.executeRecoveryByType(score, failureType, recoverySteps);
      return { success: true, recoverySteps };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error('不明なエラーが発生しました'),
        recoverySteps,
      };
    }
  }

  private async executeRecoveryByType(
    score: BaseSubjectScore,
    failureType: ValidationFailureType,
    recoverySteps: string[]
  ): Promise<void> {
    switch (failureType) {
      case ValidationFailureType.CACHE_ERROR:
        await this.executeCacheRecovery(score, recoverySteps);
        break;
      case ValidationFailureType.CONCURRENT_ERROR:
        await this.executeConcurrentRecovery(recoverySteps);
        break;
      case ValidationFailureType.VALIDATION_ERROR:
        await this.executeValidationRecovery(score, recoverySteps);
        break;
    }
  }

  private async executeCacheRecovery(
    score: BaseSubjectScore,
    recoverySteps: string[]
  ): Promise<void> {
    recoverySteps.push('キャッシュのクリア');
    this.clearCache(score);
  }

  private async executeConcurrentRecovery(recoverySteps: string[]): Promise<void> {
    recoverySteps.push('同時実行数の調整');
    await this.wait(this.calculateDynamicWaitTime());
  }

  private async executeValidationRecovery(
    score: BaseSubjectScore,
    recoverySteps: string[]
  ): Promise<void> {
    recoverySteps.push('検証ルールの再適用');
    await this.validateScore(score);
  }

  private async wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private calculateDynamicWaitTime(): number {
    const baseWaitTime = 1000; // 基本待機時間（ミリ秒）
    const currentLoad = this.operationQueue.length;
    const concurrencyFactor = this.concurrentOperations / CACHE_CONFIG.MAX_CONCURRENT;

    // 負荷に基づいて待機時間を調整
    const loadFactor = Math.min(currentLoad / 10, 1); // 最大10個のキューで正規化
    const waitTime = baseWaitTime * (1 + loadFactor + concurrencyFactor);

    return Math.min(waitTime, 5000); // 最大5秒まで
  }

  private getRecoveryAttempts(failureType: ValidationFailureType): number {
    switch (failureType) {
      case ValidationFailureType.CACHE_ERROR:
        return 3;
      case ValidationFailureType.CONCURRENT_ERROR:
        return 5;
      case ValidationFailureType.VALIDATION_ERROR:
        return 2;
      default:
        return 1;
    }
  }

  /**
   * バリデーション結果を拡張
   */
  private enhanceValidationResult(
    result: ValidationResult<BaseSubjectScore>,
    recoveryContext: Record<string, unknown>
  ): ValidationResult<BaseSubjectScore> {
    return {
      ...result,
      metadata: {
        ...result.metadata,
        validatedAt: Date.now(),
        rules: result.metadata?.rules ?? [],
        failureDetails: {
          ...result.metadata?.failureDetails,
          recoveryContext,
          recoverySuccessful: result.isValid,
        },
      },
    };
  }

  /**
   * スコアの完全な検証を実行（エラー回復機能付き）
   */
  async validateScore(score: unknown): Promise<ValidationResult<BaseSubjectScore>> {
    try {
      const initialValidation = this.validateInitial(score);
      if (initialValidation) {
        return initialValidation;
      }

      const safeScore = this.getSafeScore(score);
      if (!safeScore.success || !safeScore.data) {
        this.logError(new Error('無効なスコアフォーマット'), { score });
        return {
          isValid: false,
          errors: [
            {
              code: 'INVALID_FORMAT',
              message: '無効なスコアフォーマットです',
            },
          ],
        };
      }

      const cache = this.getCache(safeScore.data);
      if (cache?.validationResult) {
        return cache.validationResult;
      }

      return this.performValidation(safeScore.data, cache);
    } catch (error) {
      const enhancedError = this.enhanceError(
        error instanceof Error ? error : new Error('不明なエラーが発生しました'),
        { operation: 'validateScore' }
      );
      this.logError(enhancedError);
      return {
        isValid: false,
        errors: [
          {
            code: 'VALIDATION_ERROR',
            message: enhancedError.message,
          },
        ],
      };
    }
  }

  /**
   * エラーの種類を判定
   */
  private determineFailureType(error: unknown): ValidationFailureType {
    if (error instanceof ScoreValidationError) {
      switch (error.code) {
        case ScoreErrorCodes.CACHE_ERROR:
          return ValidationFailureType.CACHE_ERROR;
        case ScoreErrorCodes.DATA_INTEGRITY_ERROR:
          return ValidationFailureType.INVALID_FORMAT;
        case ScoreErrorCodes.VALIDATION_ERROR:
          return ValidationFailureType.VALIDATION_ERROR;
        case ScoreErrorCodes.MAX_SCORE_EXCEEDED:
        case ScoreErrorCodes.NEGATIVE_SCORE:
          return ValidationFailureType.VALIDATION_ERROR;
        default:
          return ValidationFailureType.VALIDATION_ERROR;
      }
    }
    if (error instanceof Error && error.message.includes('concurrent')) {
      return ValidationFailureType.CONCURRENT_ERROR;
    }
    return ValidationFailureType.VALIDATION_ERROR;
  }

  /**
   * バリデーション失敗のハンドリング
   */
  private handleValidationFailure(
    failureType: ValidationFailureType,
    error?: Error
  ): ValidationResult<BaseSubjectScore> {
    const errorContext = {
      failureType,
      timestamp: new Date().toISOString(),
      errorType: error?.constructor.name,
      errorCode: error instanceof ScoreValidationError ? error.code : 'UNKNOWN',
      field: error instanceof ScoreValidationError ? error.field : undefined,
      details: error instanceof ScoreValidationError ? error.details : undefined,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      context: {
        validationPhase: 'score',
        recoveryAttempted: false,
        severity: this.determineErrorSeverity(error),
        originalError: error?.message,
        operationMetrics: {
          queueLength: this.operationQueue.length,
          concurrentOperations: this.concurrentOperations,
          timestamp: Date.now(),
          memoryUsage: process.memoryUsage(),
          heapUsed: process.memoryUsage().heapUsed,
        },
        systemContext: {
          environment: process.env.NODE_ENV,
          isDebugMode: process.env.DEBUG === 'true',
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
          memoryUsage: process.memoryUsage(),
          cpuUsage: process.cpuUsage(),
        },
        errorTrace: {
          name: error?.name,
          message: error?.message,
          stackTrace: error?.stack,
          cause: error?.cause,
          time: Date.now(),
          type: error instanceof ScoreValidationError ? 'ValidationError' : 'UnknownError',
        },
        validationContext: {
          rules: this.rules.map((rule) => rule.code),
          lastValidation: Date.now(),
          hasCustomErrorLogger: !!this.errorLogger,
          cacheMetrics: this.cacheManager.getMetrics(),
        },
        recoveryInfo: {
          canRetry: this.shouldRetryOperation(failureType, error),
          recoveryOptions: this.getRecoveryOptions(failureType),
          recommendedAction: this.getRecommendedAction(failureType, error),
          previousAttempts: this.getRecoveryAttempts(failureType),
        },
      },
    };

    // エラーの重大度を判定
    const severity = this.determineErrorSeverity(error);
    const shouldRetry = this.shouldRetryOperation(failureType, error);

    // エラー情報をログに記録
    this.logError(error || new Error(`バリデーション失敗: ${failureType}`), {
      ...errorContext,
      severity,
      shouldRetry,
      recoveryOptions: this.getRecoveryOptions(failureType),
    });

    return {
      isValid: false,
      errors: [
        {
          code:
            error instanceof ScoreValidationError ? error.code : ScoreErrorCodes.VALIDATION_ERROR,
          message: error?.message ?? `バリデーション失敗: ${failureType}`,
          field: error instanceof ScoreValidationError ? error.field : 'validation',
        },
      ],
      metadata: {
        validatedAt: Date.now(),
        rules: this.rules.map((rule) => rule.code),
        failureDetails: {
          ...errorContext,
          severity,
          shouldRetry,
          validationContext: errorContext.context,
          recoveryPlan: this.createRecoveryPlan(failureType, error),
        },
      } satisfies ValidationMetadata,
    };
  }

  /**
   * 回復計画を作成
   */
  private createRecoveryPlan(
    failureType: ValidationFailureType,
    error?: Error
  ): {
    strategy: string;
    steps: string[];
    estimatedSuccess: number;
    priority: 'high' | 'medium' | 'low';
  } {
    const severity = this.determineErrorSeverity(error);
    const canRetry = this.shouldRetryOperation(failureType, error);

    switch (failureType) {
      case ValidationFailureType.CACHE_ERROR:
        return {
          strategy: 'cache_rebuild',
          steps: [
            'キャッシュのクリア',
            'メモリの解放',
            'キャッシュの再構築',
            'バリデーションの再実行',
          ],
          estimatedSuccess: 0.8,
          priority: severity === 'critical' ? 'high' : 'medium',
        };
      case ValidationFailureType.CONCURRENT_ERROR:
        return {
          strategy: 'retry_with_backoff',
          steps: ['実行中の操作数の確認', 'バックオフ時間の計算', '待機', '再試行'],
          estimatedSuccess: 0.9,
          priority: 'medium',
        };
      case ValidationFailureType.VALIDATION_ERROR:
        return {
          strategy: canRetry ? 'retry_with_validation' : 'manual_intervention',
          steps: canRetry
            ? ['バリデーションルールの確認', 'データの正規化', '再検証']
            : ['手動での確認', 'データの修正', '管理者への通知'],
          estimatedSuccess: canRetry ? 0.7 : 0.5,
          priority: severity === 'critical' ? 'high' : 'low',
        };
      default:
        return {
          strategy: 'manual_review',
          steps: ['エラーの記録', '管理者への通知', '手動での確認'],
          estimatedSuccess: 0.3,
          priority: 'high',
        };
    }
  }

  /**
   * 推奨アクションを取得
   */
  private getRecommendedAction(failureType: ValidationFailureType, error?: Error): string {
    const severity = this.determineErrorSeverity(error);
    const canRetry = this.shouldRetryOperation(failureType, error);

    if (severity === 'critical') {
      return 'immediate_intervention';
    }
    if (canRetry) {
      return 'automatic_retry';
    }
    return 'manual_review';
  }

  /**
   * エラーの重大度を判定
   */
  private determineErrorSeverity(error: Error | undefined): 'critical' | 'error' | 'warning' {
    if (!error) return 'warning';

    if (error instanceof ScoreValidationError) {
      switch (error.code) {
        case ScoreErrorCodes.DATA_INTEGRITY_ERROR:
        case ScoreErrorCodes.CACHE_ERROR:
          return 'critical';
        case ScoreErrorCodes.MAX_SCORE_EXCEEDED:
        case ScoreErrorCodes.NEGATIVE_SCORE:
          return 'error';
        default:
          return 'warning';
      }
    }
    return 'error';
  }

  /**
   * 操作をリトライすべきか判定
   */
  private shouldRetryOperation(failureType: ValidationFailureType, error?: Error): boolean {
    if (!error) return false;

    if ('code' in error) {
      // キャッシュエラーは状況に応じて判断
      if (error.code === ScoreErrorCodes.CACHE_ERROR) {
        return this.concurrentOperations < CACHE_CONFIG.MAX_CONCURRENT;
      }

      // 計算エラーは一度だけリトライ
      if (error.code === ScoreErrorCodes.CALCULATION_ERROR) {
        return this.getRecoveryAttempts(failureType) < 1;
      }

      // 重大なエラーはリトライ不可
      const nonRetryableCodes = [
        ScoreErrorCodes.VALIDATION_ERROR,
        ScoreErrorCodes.MAX_SCORE_EXCEEDED,
        ScoreErrorCodes.NEGATIVE_SCORE,
        ScoreErrorCodes.DATA_INTEGRITY_ERROR,
      ] as const;

      return !nonRetryableCodes.includes(error.code as (typeof nonRetryableCodes)[number]);
    }

    // その他のエラーはリトライ不可
    return false;
  }

  /**
   * エラーの回復オプションを取得
   */
  private getRecoveryOptions(failureType: ValidationFailureType): string[] {
    switch (failureType) {
      case ValidationFailureType.CACHE_ERROR:
        return ['キャッシュのクリア', 'キャッシュの再構築'];
      case ValidationFailureType.CONCURRENT_ERROR:
        return ['待機後の再試行', 'キュー優先度の調整'];
      case ValidationFailureType.VALIDATION_ERROR:
        return ['バリデーションルールの確認', 'データの修正'];
      default:
        return ['手動での確認が必要'];
    }
  }

  /**
   * バリデーションの実行（型安全性強化版）
   */
  private async performValidation(
    score: BaseSubjectScore,
    cache: ScoreCache
  ): Promise<ValidationResult<BaseSubjectScore>> {
    const startTime = Date.now();
    try {
      const result = await super.validate(score);
      cache.validationResult = result;
      cache.isValid = result.isValid;
      cache.lastUpdated = startTime;

      return {
        ...result,
        metadata: {
          ...result.metadata,
          validatedAt: startTime,
          rules: result.metadata?.rules ?? [],
        },
      };
    } catch (error) {
      const validationError = new ScoreValidationError(
        'スコアの検証中にエラーが発生しました',
        undefined,
        { originalError: error }
      );
      this.logError(validationError, { score });
      return {
        isValid: false,
        errors: [
          {
            code: ScoreErrorCodes.VALIDATION_ERROR,
            message: validationError.message,
          },
        ],
        metadata: {
          validatedAt: startTime,
          rules: [],
        },
      };
    }
  }

  /**
   * キャッシュキーの生成
   */
  private createCacheKey(score: BaseSubjectScore): string {
    return `${score[TEST_TYPES.COMMON].value}-${score[TEST_TYPES.COMMON].maxValue}-${
      score[TEST_TYPES.INDIVIDUAL].value
    }-${score[TEST_TYPES.INDIVIDUAL].maxValue}`;
  }

  /**
   * スコアが有効かどうかを判定
   *
   * 結果はキャッシュされ、エラーが発生した場合はfalseを返します。
   *
   * @param score - 判定するスコア
   * @returns スコアが有効な場合はtrue
   */
  isValidScore(score: unknown): boolean {
    try {
      if (!score || typeof score !== 'object') {
        const error = new Error('無効なスコア形式です');
        if (this.errorLogger) {
          this.errorLogger(error);
        }
        return false;
      }

      if (!isBaseSubjectScore(score)) {
        const error = new Error('スコアの形式が正しくありません');
        if (this.errorLogger) {
          this.errorLogger(error);
        }
        return false;
      }

      const commonTestValid = this.isValidTestScore(score[TEST_TYPES.COMMON]);
      const individualTestValid = this.isValidTestScore(score[TEST_TYPES.INDIVIDUAL]);

      if (!commonTestValid || !individualTestValid) {
        const error = new Error('テストスコアが無効です');
        if (this.errorLogger) {
          this.errorLogger(error);
        }
        return false;
      }

      return true;
    } catch (error) {
      if (this.errorLogger) {
        this.errorLogger(error instanceof Error ? error : new Error('不明なエラーが発生しました'));
      }
      return false;
    }
  }

  /**
   * テストスコアが有効かどうかを判定
   */
  private isValidTestScore(score: { value: number; maxValue: number }): boolean {
    return (
      score.value >= SCORE_CONSTRAINTS.MIN_VALUE &&
      score.value <= score.maxValue &&
      score.maxValue > 0
    );
  }

  /**
   * スコア計算の共通処理
   */
  private calculateWithCache<K extends keyof ScoreCache>(
    score: BaseSubjectScore,
    calculator: () => NonNullable<ScoreCache[K]>,
    cacheKey: K
  ): NonNullable<ScoreCache[K]> {
    try {
      const cache = this.getCache(score);
      if (cache[cacheKey] !== undefined) {
        return cache[cacheKey] as NonNullable<ScoreCache[K]>;
      }

      const result = calculator();
      cache[cacheKey] = result;
      return result;
    } catch (error) {
      this.logError(error as Error, { score });
      return 0 as NonNullable<ScoreCache[K]>;
    }
  }

  /**
   * スコア計算の共通ロジック
   */
  private calculateScoreValue(score: BaseSubjectScore, type: TestType): number {
    return score[type].value;
  }

  /**
   * 最大値の計算の共通ロジック
   */
  private calculateMaxValue(score: BaseSubjectScore, type: TestType): number {
    return score[type].maxValue;
  }

  /**
   * 合計点を計算
   */
  calculateTotal(score: BaseSubjectScore): number {
    return this.calculateWithCache(
      score,
      () => {
        if (!this.isValidScore(score)) return 0;
        return Object.values(TEST_TYPES).reduce<number>((total, type) => {
          return total + this.calculateScoreValue(score, type as TestType);
        }, 0);
      },
      'total'
    );
  }

  /**
   * 最大合計点を計算
   */
  calculateMaxTotal(score: BaseSubjectScore): number {
    try {
      if (!this.isValidScore(score)) {
        const error = new Error('無効なスコア形式での最大合計点の計算');
        if (this.errorLogger) {
          this.errorLogger(error);
        }
        return 0;
      }

      return this.calculateWithCache(
        score,
        () =>
          Object.values(TEST_TYPES).reduce<number>((total, type) => {
            return total + this.calculateMaxValue(score, type as TestType);
          }, 0),
        'maxTotal'
      );
    } catch (error) {
      if (this.errorLogger) {
        this.errorLogger(
          error instanceof Error ? error : new Error('最大合計点の計算中にエラーが発生しました')
        );
      }
      return 0;
    }
  }

  /**
   * パーセンテージを計算
   */
  calculatePercentage(score: BaseSubjectScore): number {
    return this.calculateWithCache(
      score,
      () => {
        const total = this.calculateTotal(score);
        const maxTotal = this.calculateMaxTotal(score);
        if (maxTotal === 0) return 0;
        return Math.round((total / maxTotal) * 100);
      },
      'percentage'
    );
  }

  /**
   * キャッシュをクリア
   */
  clearCache(score?: BaseSubjectScore): void {
    try {
      if (score !== undefined) {
        if (!score || typeof score !== 'object') {
          const error = new Error('無効なスコア形式でのキャッシュクリア');
          this.logErrorIfAvailable(error);
          return;
        }
        if (!isBaseSubjectScore(score)) {
          const error = new Error('無効なスコア形式でのキャッシュクリア');
          this.logErrorIfAvailable(error);
          return;
        }
        const cacheKey = this.createCacheKey(score);
        this.validationPromises.delete(cacheKey);
      } else {
        this.validationPromises.clear();
      }
    } catch (error) {
      if (error instanceof Error) {
        this.logErrorIfAvailable(error);
      } else {
        this.logErrorIfAvailable(new Error('キャッシュのクリア中に不明なエラーが発生しました'));
      }
    }
  }

  private validateCacheInput(score: BaseSubjectScore): void {
    if (!isBaseSubjectScore(score)) {
      const error = new Error('無効なスコア形式でのキャッシュクリア');
      this.logErrorIfAvailable(error);
      throw error;
    }
  }

  private updatePerformanceMetrics(operationType: string, duration: number): void {
    const timestamp = Date.now();
    const metrics = this.metrics.performance;

    // レスポンスタイムの追跡
    metrics.trends.responseTime.push({
      timestamp,
      value: duration,
      operation: operationType,
    });

    // スループットの計算と追跡
    const operationsPerMinute = this.calculateOperationsPerMinute();
    metrics.trends.throughput.push({
      timestamp,
      value: operationsPerMinute,
    });

    // エラー率の計算と追跡
    const errorRate = this.calculateErrorRate();
    metrics.trends.errorRate.push({
      timestamp,
      value: errorRate,
      errorType: operationType,
    });

    // キャッシュ効率の追跡
    const { hitRate, missRate } = this.calculateCacheEfficiency();
    metrics.trends.cacheEfficiency.push({
      timestamp,
      hitRate,
      missRate,
    });

    // メモリ使用率の追跡
    const memoryUsage = process.memoryUsage();
    const heapUsedPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    metrics.trends.memoryUsage.push({
      timestamp,
      value: heapUsedPercent,
      type: 'heap',
    });

    // RSSメモリの追跡
    const rssPercent = (memoryUsage.rss / (1024 * 1024 * 1024)) * 100; // GB単位に変換
    metrics.trends.memoryUsage.push({
      timestamp,
      value: rssPercent,
      type: 'rss',
    });

    // ヘルススコアの更新
    this.calculateHealthScore();

    // アラートのチェック
    this.checkAlerts();

    // 古いデータの削除（24時間以上前のデータ）
    const oneDayAgo = timestamp - 24 * 60 * 60 * 1000;
    this.cleanupOldMetrics(oneDayAgo);
  }

  private calculateCacheEfficiency(): { hitRate: number; missRate: number } {
    const cache = this.cacheManager;
    const hits = cache['metrics'].hits;
    const total = hits + cache['metrics'].misses;
    const hitRate = total > 0 ? (hits / total) * 100 : 0;
    const missRate = total > 0 ? ((total - hits) / total) * 100 : 0;
    return { hitRate, missRate };
  }

  private cleanupOldMetrics(threshold: number): void {
    const metrics = this.metrics.performance;

    // 各トレンドデータのクリーンアップ
    metrics.trends.responseTime = metrics.trends.responseTime.filter(
      (item) => item.timestamp > threshold
    );
    metrics.trends.throughput = metrics.trends.throughput.filter(
      (item) => item.timestamp > threshold
    );
    metrics.trends.errorRate = metrics.trends.errorRate.filter(
      (item) => item.timestamp > threshold
    );
    metrics.trends.memoryUsage = metrics.trends.memoryUsage.filter(
      (item) => item.timestamp > threshold
    );
    metrics.trends.cacheEfficiency = metrics.trends.cacheEfficiency.filter(
      (item) => item.timestamp > threshold
    );

    // 警告とアラート履歴のクリーンアップ
    metrics.warnings = metrics.warnings.filter((warning) => warning.timestamp > threshold);
    metrics.alerts.history = metrics.alerts.history.filter((alert) => alert.startTime > threshold);
    metrics.healthScore.history = metrics.healthScore.history.filter(
      (score) => score.timestamp > threshold
    );
  }

  private addWarning(message: string, category: string, priority: Priority, impact: string): void {
    this.metrics.performance.warnings.push({
      timestamp: Date.now(),
      message,
      category,
      priority,
      impact,
    });
  }

  private getRecommendedActions(type: string): string[] {
    switch (type) {
      case 'HIGH_RESPONSE_TIME':
        return [
          'キャッシュの最適化を検討してください',
          'データベースクエリの最適化を行ってください',
          'バッチ処理の見直しを検討してください',
        ];
      case 'HIGH_ERROR_RATE':
        return [
          'エラーログを確認し、頻出するエラーに対処してください',
          'エラーハンドリングの改善を検討してください',
          'システムの安定性テストを実施してください',
        ];
      case 'HIGH_MEMORY_USAGE':
        return [
          'メモリリークの可能性を調査してください',
          'ガベージコレクションの設定を見直してください',
          'メモリ集中型の処理の最適化を検討してください',
        ];
      default:
        return ['詳細な調査が必要です'];
    }
  }

  private calculateOperationsPerMinute(): number {
    const metrics = this.metrics.performance;
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const recentOperations = metrics.trends.responseTime.filter(
      (item) => item.timestamp > oneMinuteAgo
    ).length;
    return recentOperations;
  }

  private calculateErrorRate(): number {
    const metrics = this.metrics.performance;
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const recentOperations = metrics.trends.responseTime.filter(
      (item) => item.timestamp > oneMinuteAgo
    ).length;
    const recentErrors = metrics.warnings.filter(
      (warning) => warning.timestamp > oneMinuteAgo
    ).length;
    return recentOperations > 0 ? (recentErrors / recentOperations) * 100 : 0;
  }

  private calculateHealthScore(): void {
    const metrics = this.metrics.performance;
    const now = Date.now();

    // 各メトリクスの重み付け
    const weights = {
      responseTime: 0.3, // 応答時間（最重要）
      errorRate: 0.25, // エラー率
      memoryUsage: 0.2, // メモリ使用率
      cacheEfficiency: 0.15, // キャッシュ効率
      resourceUtilization: 0.1, // リソース使用率
    };

    // 各メトリクスのスコアを計算
    const scores = {
      responseTime: this.calculateResponseTimeHealth(),
      errorRate: this.calculateErrorRateHealth(),
      memoryUsage: this.calculateMemoryHealth(),
      cacheEfficiency: this.calculateCacheEfficiencyHealth(),
      resourceUtilization: this.calculateResourceUtilization(),
    };

    // カテゴリー別のスコアを計算
    const categoryScores = {
      performance: scores.responseTime * 0.7 + scores.resourceUtilization * 0.3,
      reliability: scores.errorRate * 0.8 + scores.memoryUsage * 0.2,
      efficiency: scores.cacheEfficiency * 0.6 + scores.resourceUtilization * 0.4,
    };

    // 総合スコアの計算
    const totalScore = Object.entries(scores).reduce(
      (total, [key, score]) => total + score * weights[key as keyof typeof weights],
      0
    );

    // ヘルススコアの更新
    metrics.healthScore.current = Math.round(totalScore);
    metrics.healthScore.history.push({
      timestamp: now,
      score: metrics.healthScore.current,
      factors: scores,
      breakdown: categoryScores,
    });

    // スコアに基づく警告の生成
    this.generateHealthWarnings(scores, categoryScores);

    // 24時間以上前のデータを削除
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    this.cleanupOldMetrics(oneDayAgo);
  }

  private generateHealthWarnings(
    scores: Record<string, number>,
    categoryScores: Record<string, number>
  ): void {
    const criticalThreshold = 60;
    const warningThreshold = 75;

    // システム全体の健全性チェック
    if (this.metrics.performance.healthScore.current < criticalThreshold) {
      this.addAlert(
        'systemHealth',
        `システムの全体的な健全性が危機的状態です（${this.metrics.performance.healthScore.current}%）`,
        'critical',
        Date.now()
      );
    } else if (this.metrics.performance.healthScore.current < warningThreshold) {
      this.addAlert(
        'systemHealth',
        `システムの健全性が低下しています（${this.metrics.performance.healthScore.current}%）`,
        'warning',
        Date.now()
      );
    }

    // 個別メトリクスのチェック
    if (scores.responseTime < criticalThreshold) {
      this.addAlert(
        'responseTime',
        `応答時間が危機的な状態です（${Math.round(scores.responseTime)}%）`,
        'critical',
        Date.now()
      );
    }

    if (scores.errorRate < criticalThreshold) {
      this.addAlert(
        'errorRate',
        `エラー率が危機的な状態です（${Math.round(scores.errorRate)}%）`,
        'critical',
        Date.now()
      );
    }

    if (scores.memoryUsage < warningThreshold) {
      this.addAlert(
        'memoryUsage',
        `メモリ使用率が警告レベルです（${Math.round(scores.memoryUsage)}%）`,
        'warning',
        Date.now()
      );
    }

    // カテゴリー別の警告
    if (categoryScores.performance < warningThreshold) {
      this.addWarning(
        'パフォーマンスが低下しています',
        'performance',
        'high',
        'システムの応答性に重大な影響が出ている可能性があります'
      );
    }

    if (categoryScores.reliability < warningThreshold) {
      this.addWarning(
        'システムの信頼性が低下しています',
        'reliability',
        'high',
        'エラーの発生率が上昇し、システムの安定性が損なわれています'
      );
    }
  }

  private checkAlerts(): void {
    const timestamp = Date.now();
    const metrics = this.metrics.performance;

    // 応答時間の監視
    const recentResponseTimes = metrics.trends.responseTime.slice(-5);
    if (recentResponseTimes.length > 0) {
      const avgResponseTime =
        recentResponseTimes.reduce((sum, item) => sum + item.value, 0) / recentResponseTimes.length;
      if (avgResponseTime > this.getThresholdForAlert('responseTime')) {
        this.addAlert(
          'responseTime',
          `応答時間が閾値を超過: ${Math.round(avgResponseTime)}ms`,
          'warning',
          timestamp
        );
      }
    }

    // エラー率の監視
    const errorRate = this.calculateErrorRate();
    if (errorRate > this.getThresholdForAlert('errorRate')) {
      this.addAlert('errorRate', `エラー率が上昇: ${Math.round(errorRate)}%`, 'warning', timestamp);
    }

    // メモリ使用率の監視
    const memoryUsage = process.memoryUsage();
    const heapUsedPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    if (heapUsedPercent > this.getThresholdForAlert('memoryUsage')) {
      this.addAlert(
        'memoryUsage',
        `メモリ使用率が高騰: ${Math.round(heapUsedPercent)}%`,
        'warning',
        timestamp
      );
    }

    // キャッシュ効率の監視
    const { hitRate } = this.calculateCacheEfficiency();
    if (hitRate < this.getThresholdForAlert('cacheEfficiency')) {
      this.addAlert(
        'cacheEfficiency',
        `キャッシュヒット率が低下: ${Math.round(hitRate)}%`,
        'warning',
        timestamp
      );
    }

    // リソース使用率の監視
    const resourceUtilization = this.calculateResourceUtilization();
    if (resourceUtilization > this.getThresholdForAlert('resourceUtilization')) {
      this.addAlert(
        'resourceUtilization',
        `リソース使用率が上昇: ${Math.round(resourceUtilization)}%`,
        'warning',
        timestamp
      );
    }

    // システム状態の監視
    const systemHealth = this.metrics.performance.healthScore.current;
    if (systemHealth < this.getThresholdForAlert('systemHealth')) {
      this.addAlert(
        'systemHealth',
        `システムの健全性が低下: ${Math.round(systemHealth)}%`,
        'warning',
        timestamp
      );
    }

    this.updateAlertHistory();
  }

  private addAlert(
    type: AlertType,
    message: string,
    severity: 'critical' | 'warning' | 'info',
    timestamp: number
  ): void {
    const category = this.determineAlertCategory(type);
    const threshold = this.getThresholdForAlert(type);
    const currentValue = this.getCurrentValueForAlert(type);
    const trend = this.calculateTrend(type, currentValue);

    const newAlert = {
      type,
      message,
      severity,
      timestamp,
      category,
      threshold,
      currentValue,
      trend,
      recommendations: this.getRecommendedActions(type),
    };

    const metrics = this.metrics.performance;
    const existingAlertIndex = metrics.alerts.active.findIndex(
      (alert) => alert.type === type && Date.now() - alert.timestamp < 5 * 60 * 1000
    );

    if (existingAlertIndex === -1) {
      metrics.alerts.active.push(newAlert);
    } else {
      metrics.alerts.active[existingAlertIndex] = {
        ...newAlert,
        timestamp: Math.max(metrics.alerts.active[existingAlertIndex].timestamp, timestamp),
      };
    }
  }

  private calculateTrend(
    type: AlertType,
    currentValue: number
  ): 'increasing' | 'decreasing' | 'stable' {
    const metrics = this.metrics.performance;
    const trendWindow = 5;

    const getHistoricalValues = () => {
      switch (type) {
        case 'responseTime':
          return metrics.trends.responseTime.slice(-trendWindow).map((item) => item.value);
        case 'errorRate':
          return metrics.trends.errorRate.slice(-trendWindow).map((item) => item.value);
        case 'memoryUsage':
          return metrics.trends.memoryUsage
            .filter((item) => item.type === 'heap')
            .slice(-trendWindow)
            .map((item) => item.value);
        default:
          return [];
      }
    };

    const values = getHistoricalValues();
    if (values.length < 2) return 'stable';

    const recentAvg = values.slice(-2).reduce((a, b) => a + b, 0) / 2;
    const previousAvg = values.slice(0, -2).reduce((a, b) => a + b, 0) / (values.length - 2);
    const threshold = 0.1;

    const change = Math.abs((recentAvg - previousAvg) / previousAvg);
    if (change < threshold) return 'stable';
    return recentAvg > previousAvg ? 'increasing' : 'decreasing';
  }

  private determineAlertCategory(type: AlertType): AlertCategory {
    switch (type) {
      case 'responseTime':
      case 'throughput':
        return 'performance';
      case 'errorRate':
      case 'dataIntegrity':
        return 'reliability';
      case 'memoryUsage':
      case 'resourceUtilization':
        return 'resources';
      case 'concurrency':
        return 'availability';
      case 'systemHealth':
        return 'reliability';
      default:
        return 'performance';
    }
  }

  private getThresholdForAlert(type: AlertType): number {
    switch (type) {
      case 'responseTime':
        return 1000; // 1秒
      case 'errorRate':
        return 5; // 5%
      case 'memoryUsage':
        return 85; // 85%
      case 'cacheEfficiency':
        return 70; // 70%
      case 'resourceUtilization':
        return 80; // 80%
      case 'systemHealth':
        return 75; // 75%
      default:
        return 90;
    }
  }

  private getCurrentValueForAlert(type: AlertType): number {
    switch (type) {
      case 'responseTime':
        return this.metrics.performance.trends.responseTime[0]?.value ?? 0;
      case 'errorRate':
        return this.calculateErrorRate();
      case 'memoryUsage':
        return this.metrics.performance.trends.memoryUsage[0]?.value ?? 0;
      case 'cacheEfficiency':
        return this.calculateHitRate();
      case 'resourceUtilization':
        return this.calculateResourceUtilization();
      case 'systemHealth':
        return this.metrics.performance.healthScore.current;
      default:
        return 0;
    }
  }

  private getResolutionDetails(type: AlertType): string {
    switch (type) {
      case 'responseTime':
        return '応答時間の改善のため、キャッシュの最適化とクエリの効率化を実施しました。';
      case 'errorRate':
        return 'エラー率の低減のため、エラーハンドリングの強化と再試行メカニズムを実装しました。';
      case 'memoryUsage':
        return 'メモリ使用量の削減のため、不要なデータのクリーンアップを実施しました。';
      case 'systemHealth':
        return 'システム全体の健全性を改善するため、パフォーマンスチューニングを実施しました。';
      default:
        return '問題の解決のため、必要な対策を実施しました。';
    }
  }

  private getPreventiveMeasures(type: AlertType): string[] {
    switch (type) {
      case 'responseTime':
        return ['キャッシュ戦略の最適化', 'クエリのインデックス見直し', '非同期処理の活用'];
      case 'errorRate':
        return ['エラーハンドリングの強化', 'ログモニタリングの強化', '自動リカバリーの実装'];
      case 'memoryUsage':
        return [
          '定期的なメモリリーク検査',
          'キャッシュサイズの動的調整',
          'ガベージコレクションの最適化',
        ];
      case 'systemHealth':
        return ['定期的なヘルスチェック', 'パフォーマンスメトリクスの監視', '予防的なスケーリング'];
      default:
        return ['システムの定期的な監視と最適化'];
    }
  }

  private updateAlertHistory(): void {
    const metrics = this.metrics.performance;
    const now = Date.now();

    metrics.alerts.active = metrics.alerts.active.filter((alert) => {
      const isStillActive = this.isAlertStillActive(alert);
      if (!isStillActive) {
        metrics.alerts.history.push({
          ...alert,
          startTime: alert.timestamp,
          endTime: now,
          duration: now - alert.timestamp,
          resolutionDetails: this.getResolutionDetails(alert.type),
          preventiveMeasures: this.getPreventiveMeasures(alert.type),
        });
      }
      return isStillActive;
    });
  }

  private isAlertStillActive(alert: {
    type: AlertType;
    severity: Severity;
    timestamp: number;
  }): boolean {
    const metrics = this.metrics.performance;
    return metrics.alerts.active.some(
      (activeAlert) =>
        activeAlert.type === alert.type &&
        activeAlert.severity === alert.severity &&
        Date.now() - activeAlert.timestamp < 5 * 60 * 1000
    );
  }

  private calculateResponseTimeHealth(): number {
    const metrics = this.metrics.performance;
    const recentResponses = metrics.trends.responseTime.slice(-10);
    if (recentResponses.length === 0) return 100;

    const avgResponseTime =
      recentResponses.reduce((sum, item) => sum + item.value, 0) / recentResponses.length;
    const threshold = this.performanceThresholds.responseTime.warning;

    return Math.max(0, 100 - (avgResponseTime / threshold) * 100);
  }

  private calculateErrorRateHealth(): number {
    const errorRate = this.calculateErrorRate();
    const threshold = this.performanceThresholds.errorRate.warning;
    return Math.max(0, 100 - (errorRate / threshold) * 100);
  }

  private calculateMemoryHealth(): number {
    const memoryUsage = process.memoryUsage();
    const heapUsedPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    const threshold = this.performanceThresholds.memoryUsage.warning;

    return Math.max(0, 100 - (heapUsedPercent / threshold) * 100);
  }

  private calculateCacheEfficiencyHealth(): number {
    const hitRate = this.calculateHitRate();
    return Math.min(100, hitRate);
  }

  private calculateHitRate(): number {
    const cache = this.cacheManager;
    const hits = cache['metrics'].hits;
    const total = hits + cache['metrics'].misses;
    return total > 0 ? (hits / total) * 100 : 0;
  }

  private calculateResourceUtilization(): number {
    const memoryUsage = process.memoryUsage();
    const heapUsedPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    const threshold = this.performanceThresholds.resourceUtilization.warning;

    return Math.max(0, 100 - (heapUsedPercent / threshold) * 100);
  }

  /**
   * エラー情報を強化
   */
  private enhanceError(error: Error, context?: Record<string, unknown>): Error {
    const errorContext: ErrorContext = {
      errorType: error.name || 'UnknownError',
      timestamp: Date.now(),
      severity: this.determineErrorSeverity(error),
      recoveryAttempts: 0,
      operationDetails: {
        type: (context?.operationType as string) || 'unknown',
        phase: 'error_logging',
        duration: context?.duration as number,
      },
      systemState: {
        memoryUsage: process.memoryUsage().heapUsed,
        cacheSize: this.cacheManager ? Number(this.cacheManager.getMetrics()) : 0,
        activeOperations: this.concurrentOperations,
      },
    };

    Object.assign(error, { context: errorContext });
    return error;
  }
}
