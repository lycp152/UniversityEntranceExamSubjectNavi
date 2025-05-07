import { describe, it, expect } from 'vitest';
import {
  API_ERROR_CODES,
  SCORE_ERROR_CODES,
  VALIDATION_ERROR_CODES,
  SEARCH_ERROR_CODES,
  ERROR_MESSAGES,
  type ApiErrorCode,
  type ScoreErrorCode,
  type ValidationErrorCode,
  type SearchErrorCode,
  type ApiErrorMessage,
  type ScoreErrorMessage,
  type ValidationErrorMessage,
  type SearchErrorMessage,
} from './domain';

/**
 * ドメインエラー関連の定数と型定義のテスト
 * バックエンドの実装との整合性を確認します
 * @see back/internal/domain/models/models.go
 */
describe('ドメインエラー関連の定数と型定義', () => {
  describe('APIエラーコードの定義', () => {
    it('ネットワーク関連のエラーコードが正しく定義されている', () => {
      expect(API_ERROR_CODES.NETWORK_ERROR).toBe('NETWORK_ERROR');
      expect(API_ERROR_CODES.TIMEOUT_ERROR).toBe('TIMEOUT_ERROR');
    });

    it('認証関連のエラーコードが正しく定義されている', () => {
      expect(API_ERROR_CODES.UNAUTHORIZED).toBe('UNAUTHORIZED');
      expect(API_ERROR_CODES.FORBIDDEN).toBe('FORBIDDEN');
    });

    it('リソース関連のエラーコードが正しく定義されている', () => {
      expect(API_ERROR_CODES.NOT_FOUND).toBe('NOT_FOUND');
      expect(API_ERROR_CODES.API_VALIDATION_ERROR).toBe('API_VALIDATION_ERROR');
      expect(API_ERROR_CODES.INTERNAL_SERVER_ERROR).toBe('INTERNAL_SERVER_ERROR');
    });
  });

  describe('スコアエラーコードの定義', () => {
    it('スコア値関連のエラーコードが正しく定義されている', () => {
      expect(SCORE_ERROR_CODES.INVALID_SCORE).toBe('INVALID_SCORE');
      expect(SCORE_ERROR_CODES.MISSING_SCORE).toBe('MISSING_SCORE');
      expect(SCORE_ERROR_CODES.INVALID_RANGE).toBe('INVALID_RANGE');
    });

    it('計算関連のエラーコードが正しく定義されている', () => {
      expect(SCORE_ERROR_CODES.INVALID_WEIGHT).toBe('INVALID_WEIGHT');
      expect(SCORE_ERROR_CODES.CALCULATION_ERROR).toBe('CALCULATION_ERROR');
      expect(SCORE_ERROR_CODES.MAX_SCORE_EXCEEDED).toBe('MAX_SCORE_EXCEEDED');
      expect(SCORE_ERROR_CODES.NEGATIVE_SCORE).toBe('NEGATIVE_SCORE');
    });
  });

  describe('バリデーションエラーコードの定義', () => {
    it('形式関連のエラーコードが正しく定義されている', () => {
      expect(VALIDATION_ERROR_CODES.INVALID_VERSION).toBe('INVALID_VERSION');
      expect(VALIDATION_ERROR_CODES.INVALID_NAME).toBe('INVALID_NAME');
      expect(VALIDATION_ERROR_CODES.INVALID_STATUS).toBe('INVALID_STATUS');
    });

    it('必須項目関連のエラーコードが正しく定義されている', () => {
      expect(VALIDATION_ERROR_CODES.REQUIRED_UNIVERSITY_ID).toBe('REQUIRED_UNIVERSITY_ID');
    });

    it('値範囲関連のエラーコードが正しく定義されている', () => {
      expect(VALIDATION_ERROR_CODES.INVALID_ACADEMIC_YEAR).toBe('INVALID_ACADEMIC_YEAR');
      expect(VALIDATION_ERROR_CODES.INVALID_ENROLLMENT).toBe('INVALID_ENROLLMENT');
    });

    it('名前関連のエラーコードが正しく定義されている', () => {
      expect(VALIDATION_ERROR_CODES.INVALID_SCHEDULE_NAME).toBe('INVALID_SCHEDULE_NAME');
      expect(VALIDATION_ERROR_CODES.INVALID_TEST_TYPE).toBe('INVALID_TEST_TYPE');
    });
  });

  describe('検索エラーコードの定義', () => {
    it('検索関連のエラーコードが正しく定義されている', () => {
      expect(SEARCH_ERROR_CODES.API_ERROR).toBe('API_ERROR');
      expect(SEARCH_ERROR_CODES.SEARCH_ERROR).toBe('SEARCH_ERROR');
      expect(SEARCH_ERROR_CODES.SEARCH_SUCCESS).toBe('SEARCH_SUCCESS');
    });
  });

  describe('エラーメッセージの定義', () => {
    it('APIエラーメッセージが正しく定義されている', () => {
      expect(ERROR_MESSAGES[API_ERROR_CODES.NETWORK_ERROR]).toBe(
        'ネットワークエラーが発生しました'
      );
      expect(ERROR_MESSAGES[API_ERROR_CODES.TIMEOUT_ERROR]).toBe(
        'リクエストがタイムアウトしました'
      );
      expect(ERROR_MESSAGES[API_ERROR_CODES.UNAUTHORIZED]).toBe('認証が必要です');
      expect(ERROR_MESSAGES[API_ERROR_CODES.FORBIDDEN]).toBe('アクセス権限がありません');
      expect(ERROR_MESSAGES[API_ERROR_CODES.NOT_FOUND]).toBe('リソースが見つかりません');
      expect(ERROR_MESSAGES[API_ERROR_CODES.API_VALIDATION_ERROR]).toBe('入力内容に誤りがあります');
      expect(ERROR_MESSAGES[API_ERROR_CODES.INTERNAL_SERVER_ERROR]).toBe(
        'サーバーエラーが発生しました'
      );
    });

    it('スコアエラーメッセージが正しく定義されている', () => {
      expect(ERROR_MESSAGES[SCORE_ERROR_CODES.INVALID_SCORE]).toBe('無効なスコアです');
      expect(ERROR_MESSAGES[SCORE_ERROR_CODES.MISSING_SCORE]).toBe('スコアが見つかりません');
      expect(ERROR_MESSAGES[SCORE_ERROR_CODES.INVALID_RANGE]).toBe(
        '点数は0から1000の間で入力してください'
      );
      expect(ERROR_MESSAGES[SCORE_ERROR_CODES.INVALID_WEIGHT]).toBe(
        '重みは0から100の間で入力してください'
      );
      expect(ERROR_MESSAGES[SCORE_ERROR_CODES.CALCULATION_ERROR]).toBe(
        '計算中にエラーが発生しました'
      );
      expect(ERROR_MESSAGES[SCORE_ERROR_CODES.MAX_SCORE_EXCEEDED]).toBe(
        '最大値（1000点）を超えるスコアです'
      );
      expect(ERROR_MESSAGES[SCORE_ERROR_CODES.NEGATIVE_SCORE]).toBe('負の値のスコアは無効です');
    });

    it('バリデーションエラーメッセージが正しく定義されている', () => {
      expect(ERROR_MESSAGES[VALIDATION_ERROR_CODES.INVALID_VERSION]).toBe(
        'バージョンは0より大きい必要があります'
      );
      expect(ERROR_MESSAGES[VALIDATION_ERROR_CODES.INVALID_NAME]).toBe(
        '名前は1-100文字の範囲で、特殊文字を含まない必要があります'
      );
      expect(ERROR_MESSAGES[VALIDATION_ERROR_CODES.REQUIRED_UNIVERSITY_ID]).toBe(
        '大学IDは必須です'
      );
      expect(ERROR_MESSAGES[VALIDATION_ERROR_CODES.INVALID_ACADEMIC_YEAR]).toBe(
        '学年度は2000年から2100年の間である必要があります'
      );
      expect(ERROR_MESSAGES[VALIDATION_ERROR_CODES.INVALID_ENROLLMENT]).toBe(
        '定員は1から9999の間である必要があります'
      );
      expect(ERROR_MESSAGES[VALIDATION_ERROR_CODES.INVALID_STATUS]).toBe('無効なステータスです');
      expect(ERROR_MESSAGES[VALIDATION_ERROR_CODES.INVALID_SCHEDULE_NAME]).toBe(
        '無効なスケジュール名です（前期、中期、後期のいずれか）'
      );
      expect(ERROR_MESSAGES[VALIDATION_ERROR_CODES.INVALID_TEST_TYPE]).toBe(
        '無効な試験区分です（共通、二次のいずれか）'
      );
    });

    it('検索エラーメッセージが正しく定義されている', () => {
      expect(ERROR_MESSAGES[SEARCH_ERROR_CODES.API_ERROR]).toBe('エラーが発生しました');
      expect(ERROR_MESSAGES[SEARCH_ERROR_CODES.SEARCH_ERROR]).toBe('検索中にエラーが発生しました');
      expect(ERROR_MESSAGES[SEARCH_ERROR_CODES.SEARCH_SUCCESS]).toBe('検索を実行しました');
    });
  });

  describe('型定義の検証', () => {
    it('ApiErrorCode型が正しく定義されている', () => {
      const validCode: ApiErrorCode = 'NETWORK_ERROR';
      expect(validCode).toBeDefined();
    });

    it('ScoreErrorCode型が正しく定義されている', () => {
      const validCode: ScoreErrorCode = 'INVALID_SCORE';
      expect(validCode).toBeDefined();
    });

    it('ValidationErrorCode型が正しく定義されている', () => {
      const validCode: ValidationErrorCode = 'INVALID_VERSION';
      expect(validCode).toBeDefined();
    });

    it('ApiErrorMessage型が正しく定義されている', () => {
      const validMessage: ApiErrorMessage = 'ネットワークエラーが発生しました';
      expect(validMessage).toBeDefined();
    });

    it('ScoreErrorMessage型が正しく定義されている', () => {
      const validMessage: ScoreErrorMessage = '無効なスコアです';
      expect(validMessage).toBeDefined();
    });

    it('ValidationErrorMessage型が正しく定義されている', () => {
      const validMessage: ValidationErrorMessage = 'バージョンは0より大きい必要があります';
      expect(validMessage).toBeDefined();
    });

    it('SearchErrorCode型が正しく定義されている', () => {
      const validCode: SearchErrorCode = 'API_ERROR';
      expect(validCode).toBeDefined();
    });

    it('SearchErrorMessage型が正しく定義されている', () => {
      const validMessage: SearchErrorMessage = 'エラーが発生しました';
      expect(validMessage).toBeDefined();
    });
  });
});
