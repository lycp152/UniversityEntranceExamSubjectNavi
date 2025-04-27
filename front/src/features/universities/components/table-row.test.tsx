import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TableRow from './table-row';
import { UISubject } from '@/types/university-subject';
import { Table, TableBody } from '@/components/ui/table';

/**
 * テスト用のモックデータ
 */
const mockSubjects: UISubject['subjects'] = {
  数学: {
    commonTest: 100,
    secondTest: 200,
  },
  英語: {
    commonTest: 150,
    secondTest: 150,
  },
};

const mockTotals = {
  commonTest: 250,
  secondTest: 350,
  total: 600,
};

/**
 * テーブル行コンポーネントのテスト
 */
describe('TableRow', () => {
  const renderTableRow = (type: 'commonTest' | 'secondTest' | 'total', showRatio = false) => {
    return render(
      <Table>
        <TableBody>
          <TableRow subjects={mockSubjects} totals={mockTotals} type={type} showRatio={showRatio} />
        </TableBody>
      </Table>
    );
  };

  describe('配点の表示', () => {
    it('共通テストの配点を正しく表示する', () => {
      renderTableRow('commonTest');

      // 数学の共通テスト配点
      expect(screen.getByText('100')).toBeInTheDocument();
      // 英語の共通テスト配点
      expect(screen.getByText('150')).toBeInTheDocument();
      // 合計の共通テスト配点
      expect(screen.getByText('250')).toBeInTheDocument();
    });

    it('二次試験の配点を正しく表示する', () => {
      renderTableRow('secondTest');

      // 数学の二次試験配点
      expect(screen.getByText('200')).toBeInTheDocument();
      // 英語の二次試験配点
      expect(screen.getByText('150')).toBeInTheDocument();
      // 合計の二次試験配点
      expect(screen.getByText('350')).toBeInTheDocument();
    });

    it('総合の配点を正しく表示する', () => {
      renderTableRow('total');

      // 総合配点の値が正しく表示されていることを確認
      const totalScores = screen.getAllByText('300');
      expect(totalScores).toHaveLength(2); // 数学と英語の総合配点

      // 合計の総合配点
      expect(screen.getByText('600')).toBeInTheDocument();
    });
  });

  describe('割合の表示', () => {
    it('割合を表示する場合、正しい割合を表示する', () => {
      renderTableRow('commonTest', true);

      // 数学の共通テスト割合
      expect(screen.getByText('16.7%')).toBeInTheDocument();
      // 英語の共通テスト割合
      expect(screen.getByText('25.0%')).toBeInTheDocument();
      // 合計の共通テスト割合
      expect(screen.getByText('41.7%')).toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    it('アクセシビリティ属性が正しく設定されている', () => {
      renderTableRow('commonTest');

      // 数学のセルに適切なaria-labelが設定されている
      expect(screen.getByText('100')).toHaveAttribute('aria-label', '数学の共通テスト配点');
    });
  });
});
