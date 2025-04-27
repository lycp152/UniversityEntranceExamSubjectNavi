import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import BasicInfo from './basic-info';
import type { UISubject } from '@/types/university-subject';

/**
 * テスト用のモックデータ
 */
const mockSubjectDetail: UISubject = {
  id: 1,
  name: 'テスト科目',
  score: 100,
  percentage: 50,
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
  admissionSchedule: {
    id: 1,
    name: '前期',
    displayOrder: 1,
  },
  examInfo: {
    id: 1,
    enrollment: 100,
    academicYear: 2024,
    status: 'active',
  },
  subjects: {},
  version: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'test',
  updatedBy: 'test',
};

describe('BasicInfo', () => {
  beforeEach(() => {
    render(<BasicInfo subjectDetail={mockSubjectDetail} />);
  });

  describe('基本情報の表示', () => {
    it('大学名が正しく表示されること', () => {
      expect(screen.getByText('テスト大学')).toBeInTheDocument();
    });

    it('学部名が正しく表示されること', () => {
      expect(screen.getByText('テスト学部')).toBeInTheDocument();
    });

    it('学科名が正しく表示されること', () => {
      expect(screen.getByText('テスト学科')).toBeInTheDocument();
    });

    it('入試日程が正しく表示されること', () => {
      expect(screen.getByText('前期期')).toBeInTheDocument();
    });

    it('募集人数が正しく表示されること', () => {
      expect(screen.getByText('100 名')).toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    it('セクションのアクセシビリティ属性が正しく設定されていること', () => {
      const section = screen.getByRole('region');
      expect(section).toHaveAttribute('aria-labelledby', 'university-info-title');
    });

    it('見出しのアクセシビリティ属性が正しく設定されていること', () => {
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveAttribute('id', 'university-info-title');
    });
  });

  describe('エッジケース', () => {
    it('空のデータが渡された場合でもエラーが発生しないこと', () => {
      const emptyData: UISubject = {
        ...mockSubjectDetail,
        university: { id: 1, name: '' },
        department: { id: 1, name: '' },
        major: { id: 1, name: '' },
        admissionSchedule: { id: 1, name: '', displayOrder: 1 },
        examInfo: { id: 1, enrollment: 0, academicYear: 2024, status: 'active' },
      };
      expect(() => render(<BasicInfo subjectDetail={emptyData} />)).not.toThrow();
    });

    it('無効なデータが渡された場合でもエラーが発生しないこと', () => {
      const invalidData: UISubject = {
        ...mockSubjectDetail,
        university: { id: 1, name: 'テスト大学' },
        department: { id: 1, name: 'テスト学部' },
        major: { id: 1, name: 'テスト学科' },
        admissionSchedule: { id: 1, name: '前期', displayOrder: 1 },
        examInfo: { id: 1, enrollment: -1, academicYear: 2024, status: 'active' },
      };
      expect(() => render(<BasicInfo subjectDetail={invalidData} />)).not.toThrow();
    });
  });
});
