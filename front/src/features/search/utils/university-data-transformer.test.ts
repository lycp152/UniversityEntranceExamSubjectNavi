import { describe, it, expect, vi } from 'vitest';
import { transformUniversityData } from './university-data-transformer';
import type { APIUniversity } from '@/types/api/types';
/**
 * 大学データ変換ユーティリティのテスト
 *
 * このテストスイートでは、APIから取得した大学データを
 * フロントエンドで使用する形式に変換する機能を検証します。
 *
 * @module university-data-transformer.test
 */

// テストデータの定義
const createTestSubject = (id: string) => ({
  id,
  name: `科目${id}`,
  required: true,
});

const createTestType = (id: string) => ({
  id,
  name: `試験タイプ${id}`,
  subjects: [createTestSubject('subject1')],
});

const createTestSchedule = (id: string) => ({
  id,
  name: `入試日程${id}`,
  test_types: [createTestType('test1')],
  admission_infos: [{ id: 'info1', name: '入試情報1' }],
});

const createTestMajor = (id: string) => ({
  id,
  name: `学科${id}`,
  admission_schedules: [createTestSchedule('schedule1')],
});

const createTestDepartment = (id: string) => ({
  id,
  name: `学部${id}`,
  majors: [createTestMajor('major1')],
});

const createTestUniversity = (id: string): APIUniversity => ({
  id,
  name: `大学${id}`,
  departments: [createTestDepartment('dept1')],
});

describe('university-data-transformer', () => {
  describe('transformUniversityData', () => {
    it('正常な大学データを変換できること', () => {
      const universities = [createTestUniversity('uni1')];
      const result = transformUniversityData(universities);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        university: { id: 'uni1', name: '大学uni1' },
        department: { id: 'dept1', name: '学部dept1' },
        major: { id: 'major1', name: '学科major1' },
        admissionSchedule: { id: 'schedule1', name: '入試日程schedule1' },
      });
    });

    it('重複する科目データを除去できること', () => {
      const universities = [createTestUniversity('uni1'), createTestUniversity('uni1')];
      const result = transformUniversityData(universities);
      expect(result).toHaveLength(1);
    });

    it('複数の大学データを正しく変換できること', () => {
      const universities = [createTestUniversity('uni1'), createTestUniversity('uni2')];
      const result = transformUniversityData(universities);
      expect(result).toHaveLength(2);
      expect(result.map(r => r.university.id)).toEqual(['uni1', 'uni2']);
    });

    it('不正なデータを適切に処理できること', () => {
      const invalidUniversities = [
        { id: 'uni1', name: '大学1' },
        { id: 'uni2', name: '大学2', departments: [] },
        { id: 'uni3', name: '大学3', departments: [{ id: 'dept1', name: '学部1' }] },
      ] as APIUniversity[];

      const result = transformUniversityData(invalidUniversities);
      expect(result).toHaveLength(0);
    });

    it('エラーが発生した場合に空の配列を返すこと', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const invalidData = null as unknown as APIUniversity[];

      const result = transformUniversityData(invalidData);
      expect(result).toHaveLength(0);
      expect(consoleSpy).toHaveBeenCalledWith('大学データの変換に失敗しました:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('科目データが空の場合に適切に処理できること', () => {
      const university = createTestUniversity('uni1');
      university.departments[0].majors[0].admission_schedules[0].test_types[0].subjects = [];
      const result = transformUniversityData([university]);
      expect(result).toHaveLength(0);
    });

    it('入試情報が空の場合に適切に処理できること', () => {
      const university = createTestUniversity('uni1');
      university.departments[0].majors[0].admission_schedules[0].admission_infos = [];
      const result = transformUniversityData([university]);
      expect(result).toHaveLength(0);
    });
  });
});
