import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import SubjectScoreTable from './subject-score-table';
import { UISubject } from '@/types/university-subject';

/**
 * 科目スコアテーブルコンポーネントのテスト
 *
 * このテストスイートでは、大学の科目スコアを表示するテーブルの
 * レンダリングと表示内容を検証します。
 *
 * @module subject-score-table.test
 */

/**
 * テスト用のモックデータ
 */
const mockSubjectData = {
  id: 1,
  version: 1,
  name: 'テスト科目',
  score: 600,
  percentage: 100,
  displayOrder: 1,
  testTypeId: 1,
  university: {
    id: 1,
    name: 'テスト大学',
    displayOrder: 1,
  },
  department: {
    id: 1,
    name: 'テスト学部',
    displayOrder: 1,
  },
  major: {
    id: 1,
    name: 'テスト学科',
    displayOrder: 1,
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
    数学: {
      commonTest: 100,
      secondTest: 200,
    },
    英語: {
      commonTest: 150,
      secondTest: 150,
    },
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'テストユーザー',
  updatedBy: 'テストユーザー',
} as unknown as UISubject;

/**
 * 科目別配点テーブルコンポーネントのテスト
 */
describe('SubjectScoreTable', () => {
  beforeEach(() => {
    render(<SubjectScoreTable subjectData={mockSubjectData} />);
  });

  it('テーブルのタイトルが正しく表示される', () => {
    const title = screen.getByText('科目別配点と割合');
    expect(title).toBeInTheDocument();
    expect(title.tagName).toBe('H2');
  });

  it('科目名が正しく表示される', () => {
    const math = screen.getByText('数学');
    const english = screen.getByText('英語');
    expect(math).toBeInTheDocument();
    expect(english).toBeInTheDocument();
    expect(math.tagName).toBe('TH');
    expect(english.tagName).toBe('TH');
  });

  it('共通テストの配点が正しく表示される', () => {
    const elements = screen.getAllByText('100');
    expect(elements).toHaveLength(1);
    elements.forEach(element => {
      const cell = element.closest('td');
      expect(cell).toBeInTheDocument();
    });
  });

  it('二次試験の配点が正しく表示される', () => {
    const elements = screen.getAllByText('200');
    expect(elements).toHaveLength(1);
    elements.forEach(element => {
      const cell = element.closest('td');
      expect(cell).toBeInTheDocument();
    });
  });

  it('合計点が正しく表示される', () => {
    const elements = screen.getAllByText('300');
    expect(elements).toHaveLength(2);
    elements.forEach(element => {
      const cell = element.closest('td');
      expect(cell).toBeInTheDocument();
      const ariaLabel = cell?.getAttribute('aria-label');
      expect(ariaLabel).toMatch(/^(数学|英語)の総配点$/);
    });
  });

  it('割合が正しく表示される', () => {
    const elements = screen.getAllByText('33.3%');
    expect(elements).toHaveLength(1);
    elements.forEach(element => {
      const cell = element.closest('td');
      expect(cell).toBeInTheDocument();
      expect(cell).toHaveAttribute('aria-label', '数学の二次試験配点');
    });
  });

  it('アクセシビリティ属性が正しく設定されている', () => {
    // テーブルに適切なroleが設定されている
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    expect(table).toHaveAttribute('aria-label', 'テーブル');

    // ヘッダーセルに適切なscope属性が設定されている
    const headerCells = screen.getAllByRole('columnheader');
    expect(headerCells).toHaveLength(4);
    headerCells.forEach(cell => {
      expect(cell).toHaveAttribute('scope', 'col');
    });
  });
});
