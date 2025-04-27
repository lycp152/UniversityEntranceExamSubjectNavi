import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SectionTitle } from './section-title';

/**
 * セクションタイトルコンポーネントのテスト
 *
 * 以下の項目をテストします：
 * - 基本的なレンダリング
 * - 子要素の表示
 * - カスタムクラスの適用
 * - デフォルトクラスの適用
 * - アクセシビリティの要件
 */
describe('SectionTitle', () => {
  it('基本的なレンダリングが正しく行われること', () => {
    render(<SectionTitle>テストタイトル</SectionTitle>);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('テストタイトル');
  });

  it('子要素が正しく表示されること', () => {
    render(
      <SectionTitle>
        <span>テスト</span>タイトル
      </SectionTitle>
    );
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('テストタイトル');
  });

  it('カスタムクラスが正しく適用されること', () => {
    render(<SectionTitle className="custom-class">テストタイトル</SectionTitle>);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveClass('custom-class');
  });

  it('デフォルトクラスが正しく適用されること', () => {
    render(<SectionTitle>テストタイトル</SectionTitle>);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveClass('text-lg', 'font-semibold', 'mb-1');
  });

  it('アクセシビリティの要件を満たしていること', () => {
    render(<SectionTitle>テストタイトル</SectionTitle>);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveAccessibleName('テストタイトル');
  });
});
