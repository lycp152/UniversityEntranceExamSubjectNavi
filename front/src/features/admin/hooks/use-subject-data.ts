import { useCallback } from 'react';
import type { APISubject } from '@/types/api/types';

/**
 * 科目データの操作と検証機能を提供するカスタムフック
 *
 * @remarks
 * - 科目データの計算、検証、ソート機能を提供
 * - テストタイプの判定機能
 * - パフォーマンス最適化のためのuseCallback使用
 * - データの整合性チェック
 *
 * @returns {Object} 科目データ操作機能を提供するオブジェクト
 * @property {Function} calculateUpdatedSubjects - 科目データの更新計算関数
 * @property {Function} createNewSubject - 新規科目作成関数
 * @property {Function} validateSubject - 科目データ検証関数
 */
export const useSubjectData = () => {
  const calculateUpdatedSubjects = useCallback(
    (subjects: APISubject[] | undefined, subjectId: number, value: number): APISubject[] => {
      if (!subjects || subjects.length === 0) return [];

      // 対象の科目が存在するか確認
      const targetSubject = subjects.find(subject => subject.id === subjectId);
      if (!targetSubject) return subjects;

      // 科目のスコアを更新
      const updatedSubjects = subjects.map(subject => ({
        ...subject,
        score: subject.id === subjectId ? value : subject.score,
      }));

      // 合計スコアを計算
      const totalScore = updatedSubjects.reduce((sum, subject) => sum + subject.score, 0);

      // パーセンテージを更新
      return updatedSubjects.map(subject => ({
        ...subject,
        percentage: totalScore > 0 ? Number(((subject.score / totalScore) * 100).toFixed(2)) : 0,
      }));
    },
    []
  );

  const createNewSubject = useCallback((testTypeId: number, displayOrder: number): APISubject => {
    const now = new Date().toISOString();
    return {
      id: Date.now(),
      test_type_id: testTypeId,
      name: '新規科目',
      score: 0,
      percentage: 0,
      display_order: displayOrder,
      created_at: now,
      updated_at: now,
      deleted_at: null,
      version: 1,
      created_by: '',
      updated_by: '',
    };
  }, []);

  const validateSubject = useCallback((subject: APISubject): boolean => {
    return (
      subject.score >= 0 &&
      subject.score <= 1000 &&
      subject.percentage >= 0 &&
      subject.percentage <= 100 &&
      subject.display_order >= 0 &&
      subject.name.length > 0 &&
      subject.name.length <= 50
    );
  }, []);

  return {
    calculateUpdatedSubjects,
    createNewSubject,
    validateSubject,
  };
};
