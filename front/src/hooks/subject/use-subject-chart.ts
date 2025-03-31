/**
 * 科目チャートのデータを生成・管理するフック
 * 科目別チャートと試験別チャートそれぞれの詳細データとカテゴリデータを生成し、適切な順序でソート
 * チャートの表示に必要な全てのデータ構造とその加工処理を提供
 */
import { useMemo } from 'react';
import type { UISubject } from '@/types/universities/university-subjects';
import type { DisplaySubjectScore } from '@/types/score';
import { useChartData } from '@/hooks/chart/use-chart-data';
import { EXAM_TYPES } from '@/constants/subjects';
import { calculatePercentage } from '@/utils/math/percentage';
import {
  sortByCommonSubject,
  getCategoryType,
  sortSubjectDetailedData,
} from '@/utils/charts/chart-utils';

/**
 * チャート表示用のデータから部分的な合計点を計算する関数
 * 表示用に変換済みのスコア（DisplaySubjectScore）の合計を計算
 * チャートの各セクションやカテゴリの合計点を算出する際に使用
 * @param data - 表示用スコアデータの配列
 * @returns 合計スコア
 */
const calculateChartTotalScore = (data: DisplaySubjectScore[]): number => {
  return data.reduce((sum, item) => sum + item.value, 0);
};

/**
 * 試験タイプでソートする関数
 * 共通テストを優先的に表示するためのソート関数
 * @param a - 比較対象のスコアデータ1
 * @param b - 比較対象のスコアデータ2
 * @returns ソート順序を示す数値（-1, 0, 1）
 */
const sortByExamType = (a: DisplaySubjectScore, b: DisplaySubjectScore): number => {
  if (a.name === EXAM_TYPES.COMMON.name) return -1;
  if (b.name === EXAM_TYPES.COMMON.name) return 1;
  return 0;
};

/**
 * 試験別チャートのカテゴリデータを生成する関数
 * 詳細データからカテゴリごとの集計データを生成
 * 各カテゴリの合計点と割合を計算し、共通テスト優先でソート
 * @param detailedData - 詳細データの配列
 * @returns カテゴリごとに集計されたスコアデータの配列
 */
const createExamChartCategory = (detailedData: DisplaySubjectScore[]): DisplaySubjectScore[] => {
  const totalScore = calculateChartTotalScore(detailedData);

  return detailedData
    .reduce<DisplaySubjectScore[]>((acc, current) => {
      const type = getCategoryType(current.name);
      const existingItem = acc.find(item => item.name === type);

      if (existingItem) {
        existingItem.value += current.value;
        existingItem.percentage = calculatePercentage(existingItem.value, totalScore);
      } else {
        acc.push({
          name: type,
          value: current.value,
          category: type,
          percentage: calculatePercentage(current.value, totalScore),
        });
      }

      return acc;
    }, [])
    .sort(sortByExamType);
};

/**
 * 試験別チャートの詳細データを生成する関数
 * 各科目データにカテゴリ情報を付加し、共通科目優先でソート
 * @param detailedData - 詳細データの配列
 * @returns カテゴリ情報が付加されたスコアデータの配列
 */
const createExamChartDetail = (detailedData: DisplaySubjectScore[]): DisplaySubjectScore[] => {
  const mappedData = [...detailedData].map(item => ({
    ...item,
    category: getCategoryType(item.name),
  }));
  return sortByCommonSubject(mappedData);
};

/**
 * チャートデータの型定義
 * 左右のチャートそれぞれの詳細データと外側データを含む
 */
type SubjectChartData = {
  subjectChart: {
    detailedData: DisplaySubjectScore[];
    outerData: DisplaySubjectScore[];
  };
  examChart: {
    detailedData: DisplaySubjectScore[];
    outerData: DisplaySubjectScore[];
  };
};

/**
 * 科目チャートデータを生成・管理するフック
 * @param subjectData - 科目データ
 * @returns 科目別と試験別のチャートデータ
 */
export const useSubjectChart = (subjectData: UISubject): SubjectChartData => {
  /** チャートの基本データを取得 */
  const chartData = useChartData(subjectData);

  /** メモ化された最終的なチャートデータを生成 */
  return useMemo(() => {
    /** 右側チャートのデータを生成 */
    const examChartData = {
      detailedData: createExamChartDetail(chartData.detailedData),
      outerData: createExamChartCategory(chartData.detailedData),
    };

    /** 左右のチャートデータを結合して返却 */
    return {
      subjectChart: {
        detailedData: sortSubjectDetailedData(chartData.detailedData),
        outerData: chartData.outerData.map(item => ({
          ...item,
          category: getCategoryType(item.name),
        })),
      },
      examChart: examChartData,
    };
  }, [chartData]);
};
