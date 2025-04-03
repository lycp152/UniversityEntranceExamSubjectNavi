/**
 * セクションタイトルコンポーネント
 *
 * このコンポーネントは、セクションの見出しとして使用されるh2要素を提供します。
 * 一貫したスタイリングと適切なセマンティクスを確保します。
 */
import React from 'react';

/**
 * SectionTitleコンポーネントのプロパティ
 */
interface SectionTitleProps {
  /** セクションタイトルの内容 */
  children: React.ReactNode;
}

export const SectionTitle = ({ children }: SectionTitleProps) => {
  return <h2 className="text-lg font-semibold mb-1">{children}</h2>;
};
