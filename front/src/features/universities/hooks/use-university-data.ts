import { useState, useEffect } from 'react';
import { transformSubjectData } from '@/utils/transformers/subject-data-transformer';
import { UniversityService } from '@/features/universities/lib/university-service';
import { findDepartmentAndMajor } from '@/features/universities/utils/university-department-major-finder';
import type { APIAdmissionSchedule, APITestType } from '@/types/api/types';
import type { UISubject } from '@/types/university-subject';
import { UniversityPageParams } from '@/features/universities/types/params';

/**
 * 大学データを取得するカスタムフック
 * 大学、学部、学科、入試日程、科目情報を取得し、UI用に変換
 *
 * @param params - 大学ページのパラメータ
 * @returns {Object} 大学データの状態とエラー情報
 * @returns {UISubject | null} selectedSubject - 選択された科目の情報
 * @returns {boolean} loading - データ取得中の状態
 * @returns {string | null} error - エラーメッセージ
 */
export const useUniversityData = (params: UniversityPageParams) => {
  const { academicYear, universityId, departmentId, majorId, schedule } = params;
  const [selectedSubject, setSelectedSubject] = useState<UISubject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 大学データを取得
        const universityData = await UniversityService.getUniversity(universityId);
        const result = findDepartmentAndMajor(universityData, departmentId, majorId);

        if (!result) {
          throw new Error('学部または学科が見つかりません');
        }

        const { department, major } = result;
        const admissionSchedule = major.admission_schedules?.find(
          (s: APIAdmissionSchedule) => s.id === parseInt(schedule, 10)
        );

        if (!admissionSchedule) {
          throw new Error('入試日程が見つかりません');
        }

        const admissionInfo = admissionSchedule.admission_infos?.[0];
        if (!admissionInfo || admissionInfo.academic_year !== parseInt(academicYear, 10)) {
          throw new Error('指定された年度の入試情報が見つかりません');
        }

        if (!admissionSchedule.test_types) {
          throw new Error('入試日程にテストタイプが設定されていません');
        }

        // 科目データを取得
        const allSubjectsData = admissionSchedule.test_types.flatMap(
          (testType: APITestType) => testType.subjects
        );

        if (!allSubjectsData.length) {
          throw new Error('科目データが見つかりません');
        }

        // 科目データをUI用に変換
        const transformedSubject = transformSubjectData(
          allSubjectsData[0],
          allSubjectsData,
          universityData,
          department,
          major,
          admissionInfo,
          admissionSchedule
        );

        if (!transformedSubject) {
          throw new Error('科目データの変換に失敗しました');
        }

        setSelectedSubject(transformedSubject);
      } catch (error) {
        console.error('入試詳細の取得に失敗しました:', error);
        setError(error instanceof Error ? error.message : 'エラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [academicYear, universityId, departmentId, majorId, schedule]);

  return { selectedSubject, loading, error };
};
