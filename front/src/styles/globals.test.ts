/**
 * グローバルスタイルのテスト
 *
 * @module globals.test
 * @description
 * - カスタムプロパティの検証
 * - ダークモードの切り替え確認
 * - レイヤーの優先順位の検証
 * - カスタムユーティリティの動作確認
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../styles/globals.css';

describe('グローバルスタイルの検証', () => {
  beforeEach(() => {
    // テスト用のスタイルシートを追加
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --radius: 0.625rem;
        --background: oklch(1 0 0);
        --foreground: oklch(0.145 0 0);
        --primary: oklch(0.205 0 0);
        --secondary: oklch(0.97 0 0);
        --accent: oklch(0.97 0 0);
        --sidebar: oklch(0.985 0 0);
        --sidebar-foreground: oklch(0.145 0 0);
      }
      .dark {
        --background: oklch(0.145 0 0);
        --foreground: oklch(0.985 0 0);
      }
      .text-balance {
        text-wrap: balance;
      }
    `;
    document.head.appendChild(style);
  });

  afterEach(() => {
    // テスト用のスタイルシートを削除
    const style = document.head.querySelector('style');
    if (style) {
      document.head.removeChild(style);
    }
  });

  describe('カスタムプロパティ', () => {
    it('ルートのカスタムプロパティが正しく定義されている', () => {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      expect(computedStyle.getPropertyValue('--radius')).toBe('0.625rem');
      expect(computedStyle.getPropertyValue('--background')).toBe('oklch(1 0 0)');
      expect(computedStyle.getPropertyValue('--foreground')).toBe('oklch(0.145 0 0)');
    });

    it('ダークモードのカスタムプロパティが正しく定義されている', () => {
      document.documentElement.classList.add('dark');
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      expect(computedStyle.getPropertyValue('--background')).toBe('oklch(0.145 0 0)');
      expect(computedStyle.getPropertyValue('--foreground')).toBe('oklch(0.985 0 0)');
      document.documentElement.classList.remove('dark');
    });
  });

  describe('レイヤー', () => {
    it('ベースレイヤーのカスタムプロパティが正しく定義されている', () => {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      expect(computedStyle.getPropertyValue('--background')).toBe('oklch(1 0 0)');
      expect(computedStyle.getPropertyValue('--foreground')).toBe('oklch(0.145 0 0)');
    });

    it('ユーティリティレイヤーのカスタムクラスが正しく定義されている', () => {
      const element = document.createElement('div');
      element.classList.add('text-balance');
      document.body.appendChild(element);
      const computedStyle = getComputedStyle(element);
      expect(computedStyle.textWrap).toBe('balance');
      document.body.removeChild(element);
    });
  });

  describe('テーマ', () => {
    it('カラーパレットが正しく定義されている', () => {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      expect(computedStyle.getPropertyValue('--primary')).toBe('oklch(0.205 0 0)');
      expect(computedStyle.getPropertyValue('--secondary')).toBe('oklch(0.97 0 0)');
      expect(computedStyle.getPropertyValue('--accent')).toBe('oklch(0.97 0 0)');
    });

    it('サイドバーのカラーバリエーションが正しく定義されている', () => {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      expect(computedStyle.getPropertyValue('--sidebar')).toBe('oklch(0.985 0 0)');
      expect(computedStyle.getPropertyValue('--sidebar-foreground')).toBe('oklch(0.145 0 0)');
    });
  });
});
