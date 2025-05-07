/**
 * フィルターの型定義のテスト
 *
 * このファイルは、フィルター機能に関連する型定義のテストを含みます。
 * 各型の定義が正しく機能することを確認します。
 */

import { describe, it, expect } from 'vitest';
import {
  FilterType,
  FilterCheckboxProps,
  FilterOptions,
  FilterConfig,
  FilterProps,
} from './filter';

describe('FilterType', () => {
  it('正しい値が定義されていること', () => {
    expect(FilterType.REGION).toBe('region');
    expect(FilterType.SCHEDULE).toBe('schedule');
    expect(FilterType.ACADEMIC_FIELD).toBe('academicField');
    expect(FilterType.CLASSIFICATION).toBe('classification');
  });

  it('すべての値が文字列型であること', () => {
    Object.values(FilterType).forEach(value => {
      expect(typeof value).toBe('string');
    });
  });
});

describe('FilterCheckboxProps', () => {
  it('必須プロパティが正しく定義されていること', () => {
    const props: FilterCheckboxProps = {
      selectedItems: ['item1', 'item2'],
      setSelectedItems: () => {},
    };

    expect(props.selectedItems).toBeInstanceOf(Array);
    expect(typeof props.setSelectedItems).toBe('function');
  });

  it('selectedItemsが文字列の配列であること', () => {
    const props: FilterCheckboxProps = {
      selectedItems: ['item1', 'item2'],
      setSelectedItems: () => {},
    };

    props.selectedItems.forEach(item => {
      expect(typeof item).toBe('string');
    });
  });
});

describe('FilterOptions', () => {
  it('文字列配列として正しく定義できること', () => {
    const options: FilterOptions = ['option1', 'option2'];
    expect(options).toBeInstanceOf(Array);
    options.forEach(option => {
      expect(typeof option).toBe('string');
    });
  });

  it('カテゴリー型として正しく定義できること', () => {
    const options: FilterOptions = {
      category1: ['option1', 'option2'],
      category2: ['option3', 'option4'],
    };

    expect(typeof options).toBe('object');
    Object.values(options).forEach(category => {
      expect(category).toBeInstanceOf(Array);
      category.forEach(option => {
        expect(typeof option).toBe('string');
      });
    });
  });
});

describe('FilterConfig', () => {
  it('必須プロパティが正しく定義されていること', () => {
    const config: FilterConfig = {
      type: FilterType.REGION,
      label: '地域',
      options: ['北海道', '東北'],
      isCategory: false,
    };

    expect(config.type).toBe(FilterType.REGION);
    expect(typeof config.label).toBe('string');
    expect(config.options).toBeDefined();
    expect(typeof config.isCategory).toBe('boolean');
  });

  it('カテゴリー型の設定が正しく定義できること', () => {
    const config: FilterConfig = {
      type: FilterType.CLASSIFICATION,
      label: '設置区分',
      options: {
        国立: ['北海道大学', '東北大学'],
        公立: ['公立大学1', '公立大学2'],
      },
      isCategory: true,
    };

    expect(config.isCategory).toBe(true);
    expect(typeof config.options).toBe('object');
  });
});

describe('FilterProps', () => {
  it('FilterCheckboxPropsを継承し、configプロパティを追加できること', () => {
    const props: FilterProps = {
      selectedItems: ['item1'],
      setSelectedItems: () => {},
      config: {
        type: FilterType.REGION,
        label: '地域',
        options: ['北海道', '東北'],
        isCategory: false,
      },
    };

    expect(props.selectedItems).toBeInstanceOf(Array);
    expect(typeof props.setSelectedItems).toBe('function');
    expect(props.config).toBeDefined();
    expect(props.config.type).toBe(FilterType.REGION);
  });
});
