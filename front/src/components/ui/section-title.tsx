/**
 * SectionTitleコンポーネントのプロパティ
 */
interface SectionTitleProps {
  /** セクションタイトルの内容 */
  children: React.ReactNode;
  /** 追加のCSSクラス */
  className?: string;
}

export const SectionTitle = ({ children, className }: SectionTitleProps) => {
  return <h2 className={`text-lg font-semibold ${className ?? 'mb-1'}`}>{children}</h2>;
};
