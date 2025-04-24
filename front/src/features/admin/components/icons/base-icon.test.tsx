/**
 * BaseIconコンポーネントのテスト
 *
 * このテストスイートは、BaseIconコンポーネントの
 * 基本的な機能とプロパティの受け渡しを検証します。
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BaseIcon } from './base-icon';

describe('BaseIcon', () => {
  it('基本的なSVG属性が正しく設定されている', () => {
    render(
      <BaseIcon>
        <path d="M0 0h20v20H0z" />
      </BaseIcon>
    );

    const svg = screen.getByTestId('base-icon');
    expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 20 20');
    expect(svg).toHaveAttribute('fill', 'currentColor');
    expect(svg).toHaveAttribute('stroke-width', '3');
  });

  it('classNameプロパティが正しく適用される', () => {
    const testClassName = 'test-class';
    render(
      <BaseIcon className={testClassName}>
        <path d="M0 0h20v20H0z" />
      </BaseIcon>
    );

    const svg = screen.getByTestId('base-icon');
    expect(svg).toHaveClass(testClassName);
  });

  it('子要素が正しくレンダリングされる', () => {
    const testPath = 'M0 0h20v20H0z';
    render(
      <BaseIcon>
        <path d={testPath} />
      </BaseIcon>
    );

    const path = screen.getByTestId('base-icon').querySelector('path');
    expect(path).toHaveAttribute('d', testPath);
  });
});
