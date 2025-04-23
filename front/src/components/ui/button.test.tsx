/**
 * Buttonコンポーネントのテストスイート
 *
 * @module button.test
 * @description
 * Buttonコンポーネントの機能をテストします。
 * 以下の項目について検証します：
 * - 基本的なレンダリング
 * - バリアントの適用
 * - サイズの適用
 * - アクセシビリティ対応
 * - インタラクション状態
 * - ダークモード対応
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';

describe('Buttonコンポーネント', () => {
  // 基本的なレンダリングテスト
  it('デフォルトのプロパティで正しくレンダリングされる', () => {
    render(<Button>テストボタン</Button>);
    const button = screen.getByRole('button', { name: 'テストボタン' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary');
  });

  // バリアントのテスト
  it('バリアントが正しく適用される', () => {
    render(<Button variant="destructive">破壊的ボタン</Button>);
    const button = screen.getByRole('button', { name: '破壊的ボタン' });
    expect(button).toHaveClass('bg-destructive');
  });

  // サイズのテスト
  it('サイズが正しく適用される', () => {
    render(<Button size="lg">大きなボタン</Button>);
    const button = screen.getByRole('button', { name: '大きなボタン' });
    expect(button).toHaveClass('h-10');
  });

  // 無効状態のテスト
  it('無効状態が正しく適用される', () => {
    render(<Button disabled>無効ボタン</Button>);
    const button = screen.getByRole('button', { name: '無効ボタン' });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:opacity-50');
  });

  // アクセシビリティのテスト
  it('アクセシビリティ属性が正しく設定される', () => {
    render(<Button aria-label="アクセシビリティテスト">テスト</Button>);
    const button = screen.getByRole('button', { name: 'アクセシビリティテスト' });
    expect(button).toHaveAttribute('aria-label', 'アクセシビリティテスト');
  });

  // asChildプロパティのテスト
  it('asChildプロパティが正しく動作する', () => {
    render(
      <Button asChild>
        <a href="/test">リンクボタン</a>
      </Button>
    );
    const link = screen.getByRole('link', { name: 'リンクボタン' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveClass('bg-primary');
  });

  // フォーカス状態のテスト
  it('フォーカス状態のスタイルが正しく適用される', () => {
    render(<Button>フォーカステスト</Button>);
    const button = screen.getByRole('button', { name: 'フォーカステスト' });
    fireEvent.focus(button);
    expect(button).toHaveClass('focus-visible:ring-ring/50');
  });

  // ダークモードのテスト
  it('ダークモードのスタイルが正しく適用される', () => {
    render(<Button variant="outline">ダークモードテスト</Button>);
    const button = screen.getByRole('button', { name: 'ダークモードテスト' });
    expect(button).toHaveClass('dark:bg-input/30');
  });

  // ホバー状態のテスト
  it('ホバー状態のスタイルが正しく適用される', () => {
    render(<Button>ホバーテスト</Button>);
    const button = screen.getByRole('button', { name: 'ホバーテスト' });
    fireEvent.mouseEnter(button);
    expect(button).toHaveClass('hover:bg-primary/90');
  });
});
