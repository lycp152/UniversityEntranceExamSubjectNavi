import { useCallback } from 'react';
import type { APITestType as TestType, APISubject as Subject } from '@/lib/types/university/api';

export const useSubjectData = () => {
  const calculateUpdatedSubjects = useCallback(
    (subjects: Subject[] | undefined, subjectId: number, value: number): Subject[] => {
      if (!subjects || subjects.length === 0) return [];

      // 科目のスコアを更新
      const updatedSubjects = subjects.map((subject) => ({
        ...subject,
        score: subject.id === subjectId ? value : subject.score,
      }));

      // 合計スコアを計算
      const totalScore = updatedSubjects.reduce((sum, subject) => sum + subject.score, 0);

      // パーセンテージを更新
      return updatedSubjects.map((subject) => ({
        ...subject,
        percentage: totalScore > 0 ? (subject.score / totalScore) * 100 : 0,
      }));
    },
    []
  );

  const findTargetTestType = useCallback((type: TestType, isCommon: boolean): boolean => {
    return isCommon ? type.name === '共通' : type.name === '二次';
  }, []);

  const createNewSubject = useCallback((testTypeId: number, displayOrder: number): Subject => {
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
    };
  }, []);

  const validateSubject = useCallback((subject: Subject): boolean => {
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

  const sortSubjects = useCallback((subjects: Subject[]): Subject[] => {
    return [...subjects].sort((a, b) => a.display_order - b.display_order);
  }, []);

  return {
    calculateUpdatedSubjects,
    findTargetTestType,
    createNewSubject,
    validateSubject,
    sortSubjects,
  };
};
