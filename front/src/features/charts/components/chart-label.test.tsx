/**
 * チャートラベルのテスト
 *
 * @remarks
 * - ラベルの表示形式を検証
 * - パーセンテージの計算を検証
 * - エッジケースの処理を検証
 *
 * @module ChartLabelTest
 */

import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import CustomLabel from './chart-label';
import { CustomLabelProps } from '@/types/pie-chart';

describe('CustomLabel', () => {
  const defaultProps: CustomLabelProps = {
    cx: 100,
    cy: 100,
    midAngle: 0,
    innerRadius: 0,
    outerRadius: 100,
    percent: 0.25,
    name: 'テスト科目',
    displayName: 'テスト科目',
    isRightChart: false,
  };

  it('パーセンテージが2%未満の場合、nullを返すこと', () => {
    const props = { ...defaultProps, percent: 0.01 };
    const { container } = render(<CustomLabel {...props} />);
    expect(container.firstChild).toBeNull();
  });

  it('パーセンテージが2%以上の場合、ラベルを表示すること', () => {
    const props = { ...defaultProps, percent: 0.03 };
    render(<CustomLabel {...props} />);

    // テキスト要素の存在を確認
    const textElements = screen.getAllByText((_, element) => {
      return element?.textContent?.includes('テスト科目') ?? false;
    });
    expect(textElements.length).toBeGreaterThan(0);

    // パーセンテージの存在を確認
    const percentElements = screen.getAllByText((_, element) => {
      return element?.textContent?.includes('3.0%') ?? false;
    });
    expect(percentElements.length).toBeGreaterThan(0);
  });

  it('右側のグラフで共通テストの場合、正しい形式で表示すること', () => {
    const props = {
      ...defaultProps,
      isRightChart: true,
      name: '共通テスト(数学)',
    };
    render(<CustomLabel {...props} />);

    // テキスト要素の存在を確認
    const textElements = screen.getAllByText((_, element) => {
      return element?.textContent?.includes('数学') ?? false;
    });
    expect(textElements.length).toBeGreaterThan(0);
  });

  it('右側のグラフで二次テストの場合、正しい形式で表示すること', () => {
    const props = {
      ...defaultProps,
      isRightChart: true,
      name: '二次テスト(物理)',
    };
    render(<CustomLabel {...props} />);

    // テキスト要素の存在を確認
    const textElements = screen.getAllByText((_, element) => {
      return element?.textContent?.includes('物理') ?? false;
    });
    expect(textElements.length).toBeGreaterThan(0);
  });

  it('displayNameが指定されている場合、displayNameを使用すること', () => {
    const props = {
      ...defaultProps,
      name: 'テスト科目',
      displayName: '表示科目名',
    };
    render(<CustomLabel {...props} />);

    // テキスト要素の存在を確認
    const textElements = screen.getAllByText((_, element) => {
      return element?.textContent?.includes('表示科目名') ?? false;
    });
    expect(textElements.length).toBeGreaterThan(0);
  });
});
