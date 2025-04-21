/**
 * Next.jsルーターのモックのテスト
 * モックの動作を検証するテスト
 *
 * @module router-mock-test
 * @description
 * - useRouterフックのモック実装の検証
 * - ルーティング関連の関数のモックの検証
 * - App RouterとPages Routerの両方の機能を検証
 *
 * @see {@link ./router.ts} ルーターのモック実装
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRouter } from './router';

describe('Next.jsルーターのモック', () => {
  let router: ReturnType<typeof useRouter>;

  beforeEach(() => {
    router = useRouter();
  });

  describe('App Routerの機能', () => {
    it('useRouterフックが正しくモックされている', () => {
      expect(router).toBeDefined();
      expect(typeof router.push).toBe('function');
      expect(typeof router.replace).toBe('function');
      expect(typeof router.refresh).toBe('function');
    });

    it('デフォルトのルーティング状態が正しく設定されている', () => {
      expect(router.pathname).toBe('/');
      expect(router.query).toEqual({});
      expect(router.asPath).toBe('/');
    });

    it('App Router固有の機能が正しく設定されている', () => {
      expect(router.isReady).toBe(true);
      expect(router.isFallback).toBe(false);
      expect(router.isPreview).toBe(false);
      expect(router.isLocaleDomain).toBe(false);
    });

    it('国際化設定が正しく設定されている', () => {
      expect(router.locale).toBe('ja');
      expect(router.defaultLocale).toBe('ja');
      expect(router.locales).toEqual(['ja']);
    });
  });

  describe('ナビゲーション関数', () => {
    it('push関数が正しく動作する', () => {
      const path = '/test';
      router.push(path);
      expect(router.push).toHaveBeenCalledWith(path);
    });

    it('replace関数が正しく動作する', () => {
      const path = '/test';
      router.replace(path);
      expect(router.replace).toHaveBeenCalledWith(path);
    });

    it('prefetch関数が正しく動作する', () => {
      const path = '/test';
      router.prefetch(path);
      expect(router.prefetch).toHaveBeenCalledWith(path);
    });

    it('back関数が正しく動作する', () => {
      router.back();
      expect(router.back).toHaveBeenCalled();
    });

    it('forward関数が正しく動作する', () => {
      router.forward();
      expect(router.forward).toHaveBeenCalled();
    });

    it('refresh関数が正しく動作する', () => {
      router.refresh();
      expect(router.refresh).toHaveBeenCalled();
    });
  });

  describe('イベント処理', () => {
    it('イベントハンドラが正しく登録される', () => {
      const handler = vi.fn();
      router.events.on('routeChangeStart', handler);
      expect(router.events.on).toHaveBeenCalledWith('routeChangeStart', handler);
    });

    it('イベントハンドラが正しく解除される', () => {
      const handler = vi.fn();
      router.events.off('routeChangeStart', handler);
      expect(router.events.off).toHaveBeenCalledWith('routeChangeStart', handler);
    });

    it('イベントが正しく発火される', () => {
      const handler = vi.fn();
      const path = '/test';

      router.events.on('routeChangeStart', handler);
      router.events.emit('routeChangeStart', path);

      expect(handler).toHaveBeenCalledWith(path);
    });

    it('複数のイベントハンドラが正しく処理される', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const path = '/test';

      router.events.on('routeChangeStart', handler1);
      router.events.on('routeChangeStart', handler2);
      router.events.emit('routeChangeStart', path);

      expect(handler1).toHaveBeenCalledWith(path);
      expect(handler2).toHaveBeenCalledWith(path);
    });
  });

  describe('型安全性', () => {
    it('useRouterの戻り値の型が正しい', () => {
      expect(router).toMatchObject({
        push: expect.any(Function),
        replace: expect.any(Function),
        prefetch: expect.any(Function),
        back: expect.any(Function),
        forward: expect.any(Function),
        refresh: expect.any(Function),
        pathname: expect.any(String),
        query: expect.any(Object),
        asPath: expect.any(String),
        isReady: expect.any(Boolean),
        isFallback: expect.any(Boolean),
        isPreview: expect.any(Boolean),
        isLocaleDomain: expect.any(Boolean),
        locale: expect.any(String),
        defaultLocale: expect.any(String),
        locales: expect.any(Array),
        events: expect.any(Object),
      });
    });

    it('イベントオブジェクトの型が正しい', () => {
      expect(router.events).toMatchObject({
        on: expect.any(Function),
        off: expect.any(Function),
        emit: expect.any(Function),
      });
    });
  });
});
