import { describe, it, expect } from 'vitest';
import type { ChartProps, SubjectExamComparisonChartProps } from './chart';
import type { DisplaySubjectScore } from '@/types/score';
import type { UISubject } from '@/types/university-subject';

/**
 * チャート関連の型テスト
 *
 * @remarks
 * - チャートコンポーネントの型定義のテスト
 * - ツールチップのペイロード型のテスト
 * - 科目と試験の比較チャートコンポーネントの型テスト
 */

describe('ChartProps', () => {
  it('正しい型のプロパティを持つべき', () => {
    const props: ChartProps = {
      detailedData: [] as DisplaySubjectScore[],
      outerData: [] as DisplaySubjectScore[],
      isRightChart: true,
    };

    expect(props).toBeDefined();
    expect(props.detailedData).toBeInstanceOf(Array);
    expect(props.outerData).toBeInstanceOf(Array);
    expect(props.isRightChart).toBe(true);
  });

  it('isRightChartはオプショナルであるべき', () => {
    const props: ChartProps = {
      detailedData: [] as DisplaySubjectScore[],
      outerData: [] as DisplaySubjectScore[],
    };

    expect(props).toBeDefined();
    expect(props.isRightChart).toBeUndefined();
  });
});

describe('SubjectExamComparisonChartProps', () => {
  it('正しい型のプロパティを持つべき', () => {
    const props: SubjectExamComparisonChartProps = {
      subjectData: {} as UISubject,
    };

    expect(props).toBeDefined();
    expect(props.subjectData).toBeDefined();
  });
});
