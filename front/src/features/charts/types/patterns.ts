import { ReactNode } from 'react';
import { SubjectCategory } from '@/constants/constraint/subjects/subject-categories';

/**
 * パターン関連の型定義
 *
 * @remarks
 * - パターンの設定や生成に関する型を定義
 * - 科目別、試験タイプ別のパターン定義に使用
 */

/**
 * パターンの基本プロパティの型定義
 * @property id - 科目カテゴリのID
 * @property children - 子要素（オプション）
 * @property patternTransform - パターンの変形（オプション）
 */
export interface BasePatternProps {
  id: SubjectCategory;
  children?: ReactNode;
  patternTransform?: string;
}

/**
 * パターンの設定型定義
 * @property color - パターンの背景色
 * @property pattern - パターンの詳細設定
 * @property pattern.size - パターンのサイズ
 * @property pattern.transform - パターンの変形（オプション）
 * @property pattern.content - パターンの内容を生成する関数
 */
export type PatternConfig = {
  color: string;
  pattern: {
    size: number;
    transform?: string;
    content: (color: string) => string;
  };
};
