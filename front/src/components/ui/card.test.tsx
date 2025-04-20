/**
 * Cardコンポーネントとその関連コンポーネントのテストスイート
 *
 * @module card.test
 * @description
 * Cardコンポーネントとその子コンポーネントの機能をテストします。
 * 以下のコンポーネントについて検証します：
 * - Card: 基本的なカードコンテナ
 * - CardHeader: カードのヘッダー部分
 * - CardTitle: カードのタイトル
 * - CardDescription: カードの説明文
 * - CardAction: カードのアクション要素
 * - CardContent: カードのメインコンテンツ
 * - CardFooter: カードのフッター部分
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from './card';

describe('Cardコンポーネント', () => {
  // 基本的なカードのレンダリングテスト
  it('デフォルトのCardが正しくレンダリングされる', () => {
    render(<Card>テストカード</Card>);
    const card = screen.getByText('テストカード');
    expect(card).toBeInTheDocument();
    expect(card.closest('[data-slot="card"]')).toBeInTheDocument();
  });

  // ヘッダーコンポーネントのテスト
  it('CardHeaderが正しくレンダリングされる', () => {
    render(
      <Card>
        <CardHeader>ヘッダー</CardHeader>
      </Card>
    );
    const header = screen.getByText('ヘッダー');
    expect(header).toBeInTheDocument();
    expect(header.closest('[data-slot="card-header"]')).toBeInTheDocument();
  });

  // タイトルコンポーネントのテスト
  it('CardTitleが正しくレンダリングされる', () => {
    render(
      <Card>
        <CardTitle>タイトル</CardTitle>
      </Card>
    );
    const title = screen.getByText('タイトル');
    expect(title).toBeInTheDocument();
    expect(title.closest('[data-slot="card-title"]')).toBeInTheDocument();
  });

  // 説明文コンポーネントのテスト
  it('CardDescriptionが正しくレンダリングされる', () => {
    render(
      <Card>
        <CardDescription>説明文</CardDescription>
      </Card>
    );
    const description = screen.getByText('説明文');
    expect(description).toBeInTheDocument();
    expect(description.closest('[data-slot="card-description"]')).toBeInTheDocument();
  });

  // アクションコンポーネントのテスト
  it('CardActionが正しくレンダリングされる', () => {
    render(
      <Card>
        <CardAction>アクション</CardAction>
      </Card>
    );
    const action = screen.getByText('アクション');
    expect(action).toBeInTheDocument();
    expect(action.closest('[data-slot="card-action"]')).toBeInTheDocument();
  });

  // コンテンツコンポーネントのテスト
  it('CardContentが正しくレンダリングされる', () => {
    render(
      <Card>
        <CardContent>コンテンツ</CardContent>
      </Card>
    );
    const content = screen.getByText('コンテンツ');
    expect(content).toBeInTheDocument();
    expect(content.closest('[data-slot="card-content"]')).toBeInTheDocument();
  });

  // フッターコンポーネントのテスト
  it('CardFooterが正しくレンダリングされる', () => {
    render(
      <Card>
        <CardFooter>フッター</CardFooter>
      </Card>
    );
    const footer = screen.getByText('フッター');
    expect(footer).toBeInTheDocument();
    expect(footer.closest('[data-slot="card-footer"]')).toBeInTheDocument();
  });

  // 複合コンポーネントの統合テスト
  it('カードコンポーネントの組み合わせが正しく動作する', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>タイトル</CardTitle>
          <CardDescription>説明文</CardDescription>
          <CardAction>アクション</CardAction>
        </CardHeader>
        <CardContent>コンテンツ</CardContent>
        <CardFooter>フッター</CardFooter>
      </Card>
    );

    expect(screen.getByText('タイトル')).toBeInTheDocument();
    expect(screen.getByText('説明文')).toBeInTheDocument();
    expect(screen.getByText('アクション')).toBeInTheDocument();
    expect(screen.getByText('コンテンツ')).toBeInTheDocument();
    expect(screen.getByText('フッター')).toBeInTheDocument();
  });
});
