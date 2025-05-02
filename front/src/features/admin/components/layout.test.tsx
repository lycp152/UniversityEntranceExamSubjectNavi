import { render, screen } from '@testing-library/react';
import { AdminLayout } from './layout';
import { describe, it, expect } from 'vitest';

/**
 * 管理ページレイアウトコンポーネントのテスト
 *
 * 以下の項目をテストします：
 * - ローディング状態の表示
 * - エラー状態の表示
 * - 空の状態の表示
 * - 成功メッセージの表示
 * - 通常状態の表示
 * - アクセシビリティ属性の確認
 */
describe('AdminLayout', () => {
  it('ローディング状態の時にスピナーを表示すること', () => {
    render(<AdminLayout isLoading={true}>{null}</AdminLayout>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('エラー状態の時にエラーメッセージを表示すること', () => {
    const errorMessage = 'エラーが発生しました';
    render(<AdminLayout error={errorMessage}>{null}</AdminLayout>);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('空の状態の時に空の状態メッセージを表示すること', () => {
    render(<AdminLayout isEmpty={true}>{null}</AdminLayout>);
    expect(screen.getByText('データが見つかりませんでした。')).toBeInTheDocument();
    expect(
      screen.getByText('現在、データベースに大学情報が登録されていません。')
    ).toBeInTheDocument();
  });

  it('成功メッセージが表示されること', () => {
    const successMessage = '保存に成功しました';
    render(<AdminLayout successMessage={successMessage}>{null}</AdminLayout>);
    expect(screen.getByText(successMessage)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByRole('alert')).toHaveAttribute('aria-atomic', 'true');
  });

  it('通常状態の時にコンテンツを表示すること', () => {
    const testContent = 'テストコンテンツ';
    render(<AdminLayout>{testContent}</AdminLayout>);
    expect(screen.getByText(testContent)).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('アクセシビリティ属性が正しく設定されていること', () => {
    render(<AdminLayout>テストコンテンツ</AdminLayout>);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
