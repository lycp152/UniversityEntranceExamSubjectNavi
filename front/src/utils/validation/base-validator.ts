import type { ValidationContext, ValidationResult } from '@/lib/validation/types';

/**
 * バリデーションの基底クラス
 * 共通のバリデーション機能を提供
 *
 * @module base-validator
 * @description
 * - バリデーションコンテキストの管理
 * - バリデーション結果の型定義
 * - バリデーション実行の抽象化
 *
 * @template T - バリデーション対象の型
 */
export abstract class BaseValidator<T> {
  protected readonly context: ValidationContext;

  /**
   * バリデーターのコンストラクタ
   * @param context - バリデーションコンテキスト
   */
  constructor(
    context: ValidationContext = {
      fieldName: '',
      value: undefined,
      timestamp: Date.now(),
    }
  ) {
    this.context = context;
  }

  /**
   * バリデーションを実行する
   * @param data - バリデーション対象のデータ
   * @returns バリデーション結果のPromise
   */
  abstract validate(data: unknown): Promise<ValidationResult<T>>;

  /**
   * バリデーションコンテキストを取得する
   * @returns 現在のバリデーションコンテキスト
   */
  protected getContext(): ValidationContext {
    return this.context;
  }

  /**
   * バリデーションコンテキストを拡張する
   * @param additionalContext - 追加のコンテキスト
   * @returns 新しいバリデーターインスタンス
   */
  protected withContext(additionalContext: ValidationContext): this {
    return new (this.constructor as new (context: ValidationContext) => this)({
      ...this.context,
      ...additionalContext,
    });
  }
}
