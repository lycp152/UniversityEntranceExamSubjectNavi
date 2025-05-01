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
import { render } from '@testing-library/react';
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
    const { container } = render(<CustomLabel {...props} />);

    // コンテナ内のテキストコンテンツを検証
    expect(container.textContent).toContain('テスト科目');
    expect(container.textContent).toContain('3.0%');
  });

  it('右側のグラフで共通テストの場合、正しい形式で表示すること', () => {
    const props = {
      ...defaultProps,
      isRightChart: true,
      name: '共通テスト(数学)',
    };
    const { container } = render(<CustomLabel {...props} />);

    // コンテナ内のテキストコンテンツを検証
    expect(container.textContent).toContain('数学');
  });

  it('右側のグラフで二次テストの場合、正しい形式で表示すること', () => {
    const props = {
      ...defaultProps,
      isRightChart: true,
      name: '二次テスト(物理)',
    };
    const { container } = render(<CustomLabel {...props} />);

    // コンテナ内のテキストコンテンツを検証
    expect(container.textContent).toContain('物理');
  });

  it('displayNameが指定されている場合、displayNameを使用すること', () => {
    const props = {
      ...defaultProps,
      name: 'テスト科目',
      displayName: '表示科目名',
    };
    const { container } = render(<CustomLabel {...props} />);

    // コンテナ内のテキストコンテンツを検証
    expect(container.textContent).toContain('表示科目名');
  });
});
