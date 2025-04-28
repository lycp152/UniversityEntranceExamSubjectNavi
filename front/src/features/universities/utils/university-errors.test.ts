import { describe, it, expect } from 'vitest';
import { UniversityDataError } from './university-errors';

describe('UniversityDataError', () => {
  describe('インスタンス化', () => {
    it('正しいエラー名でインスタンスを作成できること', () => {
      const error = new UniversityDataError('テストエラーメッセージ');
      expect(error.name).toBe('UniversityDataError');
    });

    it('正しいエラーメッセージでインスタンスを作成できること', () => {
      const message = 'テストエラーメッセージ';
      const error = new UniversityDataError(message);
      expect(error.message).toBe(message);
    });

    it('空のメッセージでもインスタンスを作成できること', () => {
      const error = new UniversityDataError('');
      expect(error.message).toBe('');
    });
  });

  describe('継承関係', () => {
    it('Errorクラスを継承していること', () => {
      const error = new UniversityDataError('テストエラーメッセージ');
      expect(error).toBeInstanceOf(Error);
    });

    it('UniversityDataErrorクラスのインスタンスであること', () => {
      const error = new UniversityDataError('テストエラーメッセージ');
      expect(error).toBeInstanceOf(UniversityDataError);
    });
  });

  describe('スタックトレース', () => {
    it('スタックトレースが定義されていること', () => {
      const error = new UniversityDataError('テストエラーメッセージ');
      expect(error.stack).toBeDefined();
    });

    it('スタックトレースにエラー名が含まれていること', () => {
      const error = new UniversityDataError('テストエラーメッセージ');
      expect(error.stack).toContain('UniversityDataError');
    });
  });

  describe('エラーメッセージの形式', () => {
    it('長いメッセージでも正しく設定されること', () => {
      const longMessage = '非常に長いエラーメッセージ'.repeat(100);
      const error = new UniversityDataError(longMessage);
      expect(error.message).toBe(longMessage);
    });

    it('特殊文字を含むメッセージでも正しく設定されること', () => {
      const specialMessage = '特殊文字: !@#$%^&*()_+{}[]|\\:;"\'<>,.?/';
      const error = new UniversityDataError(specialMessage);
      expect(error.message).toBe(specialMessage);
    });
  });
});
