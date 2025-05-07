/**
 * 入力コンポーネントのテスト
 *
 * @module input.test
 * @description
 * 入力コンポーネントのテストを実装します。
 * 以下のテストケースをカバーします：
 * - デフォルトプロパティでのレンダリング
 * - カスタムクラスの適用
 * - 異なる入力タイプの処理
 * - 追加プロパティの受け渡し
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from './input';

describe('入力コンポーネント', () => {
  it('デフォルトプロパティで入力要素をレンダリングすること', () => {
    render(<Input data-testid="test-input" />);
    const input = screen.getByTestId('test-input');
    expect(input).toBeInTheDocument();
    expect(input).not.toHaveAttribute('type');
  });

  it('カスタムクラスを適用すること', () => {
    const customClass = 'custom-class';
    render(<Input data-testid="test-input" className={customClass} />);
    const input = screen.getByTestId('test-input');
    expect(input).toHaveClass(customClass);
  });

  it('異なる入力タイプを処理すること', () => {
    render(<Input data-testid="test-input" type="password" />);
    const input = screen.getByTestId('test-input');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('追加プロパティを正しく受け渡すこと', () => {
    render(<Input data-testid="test-input" placeholder="テキストを入力" disabled />);
    const input = screen.getByTestId('test-input');
    expect(input).toHaveAttribute('placeholder', 'テキストを入力');
    expect(input).toBeDisabled();
  });
});
