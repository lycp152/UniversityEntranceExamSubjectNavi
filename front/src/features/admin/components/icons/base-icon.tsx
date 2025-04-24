/**
 * アイコンコンポーネントの型定義
 *
 * このインターフェースは、アイコンコンポーネントの共通のプロパティを定義します。
 */
export interface IconProps {
  /** アイコンのスタイルをカスタマイズするためのクラス名 */
  className?: string;
}

/**
 * ベースアイコンコンポーネント
 *
 * このコンポーネントは、SVGアイコンの共通のベースを提供します。
 * すべてのアイコンコンポーネントはこのコンポーネントを継承して使用します。
 */
export const BaseIcon = ({ className, children }: IconProps & { children: React.ReactNode }) => (
  <svg
    data-testid="base-icon"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    strokeWidth="3"
    className={className}
  >
    {children}
  </svg>
);
