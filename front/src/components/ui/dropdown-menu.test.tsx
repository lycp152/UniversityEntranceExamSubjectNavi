/**
 * ドロップダウンメニューコンポーネントのテストスイート
 *
 * @module dropdown-menu.test
 * @description
 * ドロップダウンメニューとその関連コンポーネントの機能をテストします。
 * 以下のコンポーネントについて検証します：
 * - DropdownMenu: メインコンテナ
 * - DropdownMenuTrigger: メニューを開くトリガー
 * - DropdownMenuContent: メニューの内容
 * - DropdownMenuItem: メニュー項目
 * - DropdownMenuCheckboxItem: チェックボックス項目
 * - DropdownMenuRadioItem: ラジオボタン項目
 * - DropdownMenuLabel: ラベル
 * - DropdownMenuSeparator: 区切り線
 * - DropdownMenuShortcut: ショートカット
 * - DropdownMenuSub: サブメニュー
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from './dropdown-menu';

describe('DropdownMenuコンポーネント', () => {
  // 基本的なドロップダウンメニューのテスト
  it('基本的なDropdownMenuが正しくレンダリングされる', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>トリガー</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>アイテム</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const trigger = screen.getByText('トリガー');
    expect(trigger).toBeInTheDocument();
    expect(trigger.closest('[data-slot="dropdown-menu-trigger"]')).toBeInTheDocument();
  });

  // メニューコンテンツのテスト
  it('DropdownMenuContentが正しくレンダリングされる', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>トリガー</DropdownMenuTrigger>
        <DropdownMenuContent>コンテンツ</DropdownMenuContent>
      </DropdownMenu>
    );

    const content = screen.getByText('コンテンツ');
    expect(content).toBeInTheDocument();
    expect(content.closest('[data-slot="dropdown-menu-content"]')).toBeInTheDocument();
  });

  // メニュー項目のテスト
  it('DropdownMenuItemが正しくレンダリングされる', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>トリガー</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>アイテム</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const item = screen.getByText('アイテム');
    expect(item).toBeInTheDocument();
    expect(item.closest('[data-slot="dropdown-menu-item"]')).toBeInTheDocument();
  });

  // チェックボックス項目のテスト
  it('DropdownMenuCheckboxItemが正しくレンダリングされる', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>トリガー</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked>チェックボックス</DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const checkboxItem = screen.getByText('チェックボックス');
    expect(checkboxItem).toBeInTheDocument();
    expect(checkboxItem.closest('[data-slot="dropdown-menu-checkbox-item"]')).toBeInTheDocument();
  });

  // ラジオボタン項目のテスト
  it('DropdownMenuRadioItemが正しくレンダリングされる', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>トリガー</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioItem value="radio">ラジオ</DropdownMenuRadioItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const radioItem = screen.getByText('ラジオ');
    expect(radioItem).toBeInTheDocument();
    expect(radioItem.closest('[data-slot="dropdown-menu-radio-item"]')).toBeInTheDocument();
  });

  // ラベルのテスト
  it('DropdownMenuLabelが正しくレンダリングされる', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>トリガー</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>ラベル</DropdownMenuLabel>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const label = screen.getByText('ラベル');
    expect(label).toBeInTheDocument();
    expect(label.closest('[data-slot="dropdown-menu-label"]')).toBeInTheDocument();
  });

  // 区切り線のテスト
  it('DropdownMenuSeparatorが正しくレンダリングされる', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>トリガー</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSeparator />
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const separator = screen.getByRole('separator');
    expect(separator).toBeInTheDocument();
    expect(separator.closest('[data-slot="dropdown-menu-separator"]')).toBeInTheDocument();
  });

  // ショートカットのテスト
  it('DropdownMenuShortcutが正しくレンダリングされる', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>トリガー</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            アイテム
            <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const shortcut = screen.getByText('⌘K');
    expect(shortcut).toBeInTheDocument();
    expect(shortcut.closest('[data-slot="dropdown-menu-shortcut"]')).toBeInTheDocument();
  });

  // サブメニューのテスト
  it('DropdownMenuSubが正しくレンダリングされる', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>トリガー</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>サブメニュー</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>サブコンテンツ</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const subTrigger = screen.getByText('サブメニュー');
    expect(subTrigger).toBeInTheDocument();
    expect(subTrigger.closest('[data-slot="dropdown-menu-sub-trigger"]')).toBeInTheDocument();

    // サブメニューのトリガーをクリックしてコンテンツを表示
    fireEvent.click(subTrigger);

    const subContent = screen.getByText('サブコンテンツ');
    expect(subContent).toBeInTheDocument();
    expect(subContent.closest('[data-slot="dropdown-menu-item"]')).toBeInTheDocument();
  });
});
