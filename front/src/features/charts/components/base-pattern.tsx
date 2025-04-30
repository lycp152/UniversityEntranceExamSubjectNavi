/**
 * パターンの基本コンポーネント
 *
 * @remarks
 * - チャートのパターン表示の基本構造を提供
 * - 科目カテゴリーに基づいた背景色の設定
 * - パターンのサイズと配置を制御
 */
import { FC, useMemo, useCallback } from 'react';
import { SUBJECT_CATEGORIES } from '@/constants/constraint/subjects/subject-categories';
import { PATTERN_CONFIG } from '@/features/charts/constants/pattern-config';
import { BasePatternProps } from '../types/patterns';
import { getCategoryFromSubject } from '@/features/charts/utils/extractors/subject-name-extractor';

/**
 * パターンの基本コンポーネント
 *
 * @param props - コンポーネントのプロパティ
 * @param props.id - パターンの識別子
 * @param props.children - パターン内に表示する子要素
 * @param props.patternTransform - パターンの変換属性（オプション）
 *
 * @returns パターンの基本構造を含むReact要素
 */
const BasePattern: FC<BasePatternProps> = ({ id, children, patternTransform }) => {
  const baseCategory = useMemo(() => getCategoryFromSubject(id), [id]);

  const getBackgroundColor = useCallback(() => {
    const category = SUBJECT_CATEGORIES[baseCategory];
    if (!category) {
      console.warn(
        `科目カテゴリー "${baseCategory}" が見つかりません。デフォルトの背景色を使用します。`
      );
      return '#ffffff';
    }
    return category.color;
  }, [baseCategory]);

  const backgroundColor = useMemo(() => getBackgroundColor(), [getBackgroundColor]);

  const patternAttributes = useMemo(
    () => ({
      id: `pattern-${id}`,
      patternUnits: 'userSpaceOnUse',
      width: PATTERN_CONFIG.size,
      height: PATTERN_CONFIG.size,
      patternTransform,
      'aria-label': `科目カテゴリー ${baseCategory} のパターン`,
      'data-testid': `pattern-${id}`,
      role: 'img',
      'aria-hidden': false,
      'aria-describedby': `pattern-${id}-description`,
    }),
    [id, patternTransform, baseCategory]
  );

  const rectAttributes = useMemo(
    () => ({
      width: PATTERN_CONFIG.size,
      height: PATTERN_CONFIG.size,
      fill: backgroundColor,
      'aria-hidden': true,
      'data-testid': `pattern-${id}-rect`,
    }),
    [backgroundColor, id]
  );

  return (
    <>
      <desc id={`pattern-${id}-description`}>
        {`科目カテゴリー ${baseCategory} のパターン要素。背景色は ${backgroundColor} です。`}
      </desc>
      <pattern {...patternAttributes}>
        <rect {...rectAttributes} />
        {children}
      </pattern>
    </>
  );
};

export default BasePattern;
