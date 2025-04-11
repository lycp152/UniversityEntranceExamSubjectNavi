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
import { FC } from 'react';
import { SUBJECT_PATTERNS, TEST_TYPE_PATTERNS } from '../utils/pattern-definitions';

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
const PatternRenderer: FC = () => (
  <>
    {/* 科目別パターン */}
    {Object.entries(SUBJECT_PATTERNS).map(([subject, config]) => (
      <pattern
        key={subject}
        id={`pattern-${subject}`}
        patternUnits="userSpaceOnUse"
        width={config.pattern.size}
        height={config.pattern.size}
        patternTransform={config.pattern.transform}
        dangerouslySetInnerHTML={{
          __html: config.pattern.content(config.color),
        }}
      />
    ))}
    {/* テスト種別パターン */}
    {Object.entries(TEST_TYPE_PATTERNS).map(([type, config]) => (
      <pattern
        key={type}
        id={`pattern-${type}`}
        patternUnits="userSpaceOnUse"
        width={config.pattern.size}
        height={config.pattern.size}
        patternTransform={config.pattern.transform}
        dangerouslySetInnerHTML={{
          __html: config.pattern.content(config.color),
        }}
      />
    ))}
  </>
);

export default PatternRenderer;
