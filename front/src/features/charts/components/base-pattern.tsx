/**
 * パターンの基本コンポーネント
 *
 * @remarks
 * - チャートのパターン表示の基本構造を提供
 * - 科目カテゴリーに基づいた背景色の設定
 * - パターンのサイズと配置を制御
 */
import { FC } from 'react';
import { SUBJECT_CATEGORIES } from '@/constants/constraint/subject-categories';
import { PATTERN_CONFIG } from '@/features/charts/constants/pattern-config';
import { BasePatternProps } from '../types/patterns';
import { getSubjectBaseCategory } from '@/features/charts/utils/subject-type-validator';

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
const BasePattern: FC<BasePatternProps> = ({ id, children, patternTransform }) => (
  <pattern
    id={`pattern-${id}`}
    patternUnits="userSpaceOnUse"
    width={PATTERN_CONFIG.size}
    height={PATTERN_CONFIG.size}
    patternTransform={patternTransform}
  >
    <rect
      width={PATTERN_CONFIG.size}
      height={PATTERN_CONFIG.size}
      fill={SUBJECT_CATEGORIES[getSubjectBaseCategory(id)].color}
    />
    {children}
  </pattern>
);

export default BasePattern;
