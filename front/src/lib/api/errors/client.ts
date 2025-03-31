import { BaseApiError } from './base';
import { API_ERROR_CODES, ERROR_MESSAGES } from '@/constants/domain-error-codes';

/**
 * APIクライアントエラーの基底クラス
 * クライアントサイドで発生するAPI関連のエラーを表現
 *
 * @class ApiClientError
 * @extends BaseApiError
 */
export class ApiClientError extends BaseApiError {
  /**
   * エラーオブジェクトがApiClientErrorのインスタンスかどうかを判定
   *
   * @param {unknown} error - 判定対象のエラーオブジェクト
   * @returns {boolean} ApiClientErrorのインスタンスの場合true
   */
  static isApiClientError(error: unknown): error is ApiClientError {
    return error instanceof ApiClientError;
  }
}

/**
 * ネットワークエラーを表現するクラス
 * 通信エラーや接続エラーを表現
 *
 * @class NetworkError
 * @extends BaseApiError
 */
export class NetworkError extends BaseApiError {
  /**
   * @param {string} [message] - エラーメッセージ（デフォルト: ネットワークエラーの標準メッセージ）
   */
  constructor(message = ERROR_MESSAGES[API_ERROR_CODES.NETWORK_ERROR]) {
    super({
      code: API_ERROR_CODES.NETWORK_ERROR,
      message,
      status: 0,
    });
  }
}

/**
 * タイムアウトエラーを表現するクラス
 * リクエストが指定時間内に完了しなかった場合のエラーを表現
 *
 * @class TimeoutError
 * @extends BaseApiError
 */
export class TimeoutError extends BaseApiError {
  /**
   * @param {string} [message] - エラーメッセージ（デフォルト: タイムアウトエラーの標準メッセージ）
   */
  constructor(message = ERROR_MESSAGES[API_ERROR_CODES.TIMEOUT_ERROR]) {
    super({
      code: API_ERROR_CODES.TIMEOUT_ERROR,
      message,
      status: 408,
    });
  }
}
