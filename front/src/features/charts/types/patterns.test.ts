import { describe, it, expect } from 'vitest';
import type { BasePatternProps, PatternConfig } from './patterns';
import type { SubjectCategory } from '@/constants/constraint/subjects/subject-categories';

/**
 * パターン関連の型テスト
 *
 * @remarks
 * - パターンの基本プロパティの型定義のテスト
 * - パターンの設定型のテスト
 */

describe('BasePatternProps', () => {
  it('正しい型のプロパティを持つべき', () => {
    const props: BasePatternProps = {
      id: 'SCIENCE' as SubjectCategory,
      children: null,
      patternTransform: 'rotate(45)',
    };

    expect(props).toBeDefined();
    expect(typeof props.id).toBe('string');
    expect(props.children).toBeNull();
    expect(typeof props.patternTransform).toBe('string');
  });

  it('childrenとpatternTransformはオプショナルであるべき', () => {
    const props: BasePatternProps = {
      id: 'SCIENCE' as SubjectCategory,
    };

    expect(props).toBeDefined();
    expect(props.children).toBeUndefined();
    expect(props.patternTransform).toBeUndefined();
  });
});

describe('PatternConfig', () => {
  it('正しい型のプロパティを持つべき', () => {
    const config: PatternConfig = {
      color: '#000000',
      pattern: {
        size: 10,
        transform: 'rotate(45)',
        content: (color: string) => `<circle fill="${color}" />`,
      },
    };

    expect(config).toBeDefined();
    expect(typeof config.color).toBe('string');
    expect(config.pattern).toBeDefined();
    expect(typeof config.pattern.size).toBe('number');
    expect(typeof config.pattern.transform).toBe('string');
    expect(typeof config.pattern.content).toBe('function');
  });

  it('pattern.transformはオプショナルであるべき', () => {
    const config: PatternConfig = {
      color: '#000000',
      pattern: {
        size: 10,
        content: (color: string) => `<circle fill="${color}" />`,
      },
    };

    expect(config).toBeDefined();
    expect(config.pattern.transform).toBeUndefined();
  });
});
