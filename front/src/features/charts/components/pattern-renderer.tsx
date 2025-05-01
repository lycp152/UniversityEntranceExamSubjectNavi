'use client';

/**
 * チャートのパターン要素をレンダリングするコンポーネント
 *
 * @remarks
 * - 科目と試験タイプのパターンを一括でレンダリング
 * - パターンのサイズと配置を制御
 * - パターンの内容を動的に生成
 * - SVGパターン要素を使用して視覚的な区別を提供
 *
 * @example
 * ```tsx
 * <PatternRenderer />
 * ```
 */
import { FC, useMemo } from 'react';
import { SUBJECT_PATTERNS, TEST_TYPE_PATTERNS } from '../utils/formatters/pattern-definitions';

interface PatternConfig {
  pattern: {
    content: (color: string) => string;
    size: number;
    transform?: string;
  };
  color: string;
}

/**
 * パターン要素を生成する共通関数
 *
 * @param id - パターンの識別子
 * @param config - パターンの設定
 * @param label - パターンの説明ラベル
 * @returns パターン要素
 *
 * @throws {Error} パターン設定が無効な場合
 */
const createPattern = (id: string, config: PatternConfig, label: string) => {
  if (!config?.pattern?.content || !config?.pattern?.size) {
    console.error(`パターン設定が無効です: ${id}`);
    return null;
  }

  try {
    return (
      <pattern
        key={id}
        id={`pattern-${id}`}
        patternUnits="userSpaceOnUse"
        width={config.pattern.size}
        height={config.pattern.size}
        patternTransform={config.pattern.transform}
        aria-label={label}
        aria-hidden="true"
        data-testid={`pattern-${id}`}
        dangerouslySetInnerHTML={{
          __html: config.pattern.content(config.color),
        }}
      />
    );
  } catch (error) {
    console.error(`パターンの生成に失敗しました: ${id}`, error);
    return null;
  }
};

/**
 * パターン要素をレンダリングするコンポーネント
 *
 * @returns パターン要素を含むReact要素
 *
 * @remarks
 * - 科目と試験タイプのパターンを一括でレンダリング
 * - パターンのサイズと配置を制御
 * - パターンの内容を動的に生成
 */
const PatternRenderer: FC = () => {
  // 科目パターンのメモ化
  const subjectPatterns = useMemo(
    () =>
      Object.entries(SUBJECT_PATTERNS).map(([subject, config]) =>
        createPattern(subject, config as PatternConfig, `${subject}科目のパターン`)
      ),
    []
  );

  // テストタイプパターンのメモ化
  const testTypePatterns = useMemo(
    () =>
      Object.entries(TEST_TYPE_PATTERNS).map(([type, config]) =>
        createPattern(type, config as PatternConfig, `${type}試験タイプのパターン`)
      ),
    []
  );

  return (
    <>
      {subjectPatterns}
      {testTypePatterns}
    </>
  );
};

export default PatternRenderer;
