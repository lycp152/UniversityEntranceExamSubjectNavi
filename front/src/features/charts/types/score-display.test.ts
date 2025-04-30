import { describe, it, expect } from 'vitest';
import type { ChartScoreDisplayProps } from './score-display';
import { SUBJECTS } from '@/constants/constraint/subjects/subjects';

/**
 * スコア表示コンポーネントの型テスト
 *
 * @remarks
 * - チャート用のスコア表示コンポーネントの型定義のテスト
 * - 科目データの表示に関する型のテスト
 */

describe('ChartScoreDisplayProps', () => {
  it('正しい型のプロパティを持つべき', () => {
    const props: ChartScoreDisplayProps = {
      subject: {
        id: 1,
        name: 'テスト科目',
        score: 80,
        percentage: 80,
        displayOrder: 1,
        testTypeId: 1,
        university: {
          id: 1,
          name: 'テスト大学',
        },
        department: {
          id: 1,
          name: 'テスト学部',
        },
        major: {
          id: 1,
          name: 'テスト学科',
        },
        examInfo: {
          id: 1,
          enrollment: 100,
          academicYear: 2024,
          status: 'active',
        },
        admissionSchedule: {
          id: 1,
          name: 'テスト日程',
          displayOrder: 1,
        },
        subjects: {
          [SUBJECTS.MATH]: {
            commonTest: 80,
            secondTest: 90,
          },
        },
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'test',
        updatedBy: 'test',
      },
    };

    expect(props).toBeDefined();
    expect(props.subject).toBeDefined();
    expect(typeof props.subject.id).toBe('number');
    expect(typeof props.subject.name).toBe('string');
    expect(typeof props.subject.score).toBe('number');
    expect(typeof props.subject.percentage).toBe('number');
    expect(typeof props.subject.displayOrder).toBe('number');
    expect(typeof props.subject.testTypeId).toBe('number');
    expect(props.subject.university).toBeDefined();
    expect(props.subject.department).toBeDefined();
    expect(props.subject.major).toBeDefined();
    expect(props.subject.examInfo).toBeDefined();
    expect(props.subject.admissionSchedule).toBeDefined();
    expect(props.subject.subjects).toBeDefined();
  });

  it('subjectプロパティは必須であるべき', () => {
    const props: ChartScoreDisplayProps = {
      subject: {
        id: 1,
        name: 'テスト科目',
        score: 80,
        percentage: 80,
        displayOrder: 1,
        testTypeId: 1,
        university: {
          id: 1,
          name: 'テスト大学',
        },
        department: {
          id: 1,
          name: 'テスト学部',
        },
        major: {
          id: 1,
          name: 'テスト学科',
        },
        examInfo: {
          id: 1,
          enrollment: 100,
          academicYear: 2024,
          status: 'active',
        },
        admissionSchedule: {
          id: 1,
          name: 'テスト日程',
          displayOrder: 1,
        },
        subjects: {
          [SUBJECTS.MATH]: {
            commonTest: 80,
            secondTest: 90,
          },
        },
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'test',
        updatedBy: 'test',
      },
    };

    expect(props).toBeDefined();
    expect(props.subject).toBeDefined();
  });
});
