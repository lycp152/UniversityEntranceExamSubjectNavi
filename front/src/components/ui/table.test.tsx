import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  TableFooter,
  TableCaption,
} from './table';

describe('Table Components', () => {
  describe('基本的なレンダリング', () => {
    it('テーブルが正しい構造でレンダリングされる', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ヘッダー1</TableHead>
              <TableHead>ヘッダー2</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>セル1</TableCell>
              <TableCell>セル2</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('ヘッダー1')).toBeInTheDocument();
      expect(screen.getByText('セル1')).toBeInTheDocument();
    });

    it('カスタムクラス名が適用される', () => {
      const customClass = 'custom-table';
      render(<Table className={customClass} />);
      expect(screen.getByRole('table')).toHaveClass(customClass);
    });

    it('スナップショットテスト', () => {
      const { container } = render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ヘッダー</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>セル</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(container).toMatchSnapshot();
    });
  });

  describe('アクセシビリティ', () => {
    it('テーブルに適切なアクセシビリティ属性が設定されている', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ヘッダー</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>セル</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const table = screen.getByRole('table');
      expect(table).toHaveAttribute('data-slot', 'table');
      expect(table).toHaveAttribute('aria-label', 'テーブル');
    });

    it('テーブルヘッダーが適切にマークアップされている', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">ヘッダー</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );

      const header = screen.getByRole('columnheader');
      expect(header).toHaveAttribute('scope', 'col');
    });
  });

  describe('インタラクション', () => {
    it('テーブル行のホバー効果が正しく機能する', async () => {
      const user = userEvent.setup();
      render(
        <Table>
          <TableBody>
            <TableRow data-testid="row">
              <TableCell>セル</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const row = screen.getByTestId('row');
      await user.hover(row);
      expect(row).toHaveClass('hover:bg-muted/50');
    });
  });

  describe('エッジケース', () => {
    it('空のテーブルが正しくレンダリングされる', () => {
      render(<Table />);
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('フッターとキャプションが正しくレンダリングされる', () => {
      render(
        <Table>
          <TableFooter>
            <TableRow>
              <TableCell>フッター</TableCell>
            </TableRow>
          </TableFooter>
          <TableCaption>キャプション</TableCaption>
        </Table>
      );

      expect(screen.getByText('フッター')).toBeInTheDocument();
      expect(screen.getByText('キャプション')).toBeInTheDocument();
    });
  });

  describe('スナップショットテスト', () => {
    it('基本的なテーブル構造のスナップショットが一致すること', () => {
      const { container } = render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ヘッダー</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>セル</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(container).toMatchSnapshot();
    });

    it('カスタムクラスを持つテーブルのスナップショットが一致すること', () => {
      const { container } = render(
        <Table className="custom-table">
          <TableHeader>
            <TableRow>
              <TableHead>ヘッダー</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>セル</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(container).toMatchSnapshot();
    });

    it('フッターとキャプションを含むテーブルのスナップショットが一致すること', () => {
      const { container } = render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ヘッダー</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>セル</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>フッター</TableCell>
            </TableRow>
          </TableFooter>
          <TableCaption>キャプション</TableCaption>
        </Table>
      );
      expect(container).toMatchSnapshot();
    });
  });
});
