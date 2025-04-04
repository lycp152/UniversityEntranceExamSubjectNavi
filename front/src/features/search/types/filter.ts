/**
 * フィルターコンポーネントの型定義
 *
 * このファイルは、フィルター機能に関連するすべての型定義を含みます。
 * チェックボックスフィルターの基本プロパティ、フィルターの種類、設定、および
 * フィルターコンポーネントのプロパティを定義しています。
 */

/**
 * チェックボックスフィルターの基本プロパティ
 *
 * すべてのフィルターコンポーネントで共通して使用される基本プロパティを定義します。
 * 選択状態の管理と更新機能を提供します。
 *
 * @interface FilterCheckboxProps
 * @property {string[]} selectedItems - 現在選択されている項目の配列
 * @property {React.Dispatch<React.SetStateAction<string[]>>} setSelectedItems - 選択項目を更新する関数
 */
export interface FilterCheckboxProps {
  /** 選択されている項目の配列 */
  selectedItems: string[];
  /** 選択項目を更新する関数 */
  setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
}

/**
 * フィルターの種類を定義する型
 *
 * アプリケーションで使用可能なすべてのフィルターの種類を列挙します。
 * 地域、日程、学問系統、設置区分のフィルターが含まれます。
 *
 * @type {('region' | 'schedule' | 'academicField' | 'classification')}
 */
export type FilterType = 'region' | 'schedule' | 'academicField' | 'classification';

/**
 * フィルターの設定を定義するインターフェース
 *
 * 各フィルターコンポーネントの設定情報を定義します。
 * フィルターの種類、表示ラベル、選択肢、およびカテゴリー型かどうかを指定します。
 *
 * @interface FilterConfig
 * @property {FilterType} type - フィルターの種類
 * @property {string} label - フィルターの表示ラベル
 * @property {string[] | Record<string, string[]>} options - フィルターの選択肢（単一レベルまたはカテゴリー型）
 * @property {boolean} isCategory - カテゴリー型のフィルターかどうか
 */
export interface FilterConfig {
  /** フィルターの種類 */
  type: FilterType;
  /** フィルターのラベル */
  label: string;
  /** フィルターの選択肢 */
  options: string[] | Record<string, string[]>;
  /** カテゴリー型かどうか */
  isCategory: boolean;
}

/**
 * フィルターコンポーネントのプロパティを定義するインターフェース
 *
 * フィルターコンポーネントに渡されるプロパティを定義します。
 * 基本プロパティ（FilterCheckboxProps）を継承し、フィルターの設定情報を追加します。
 *
 * @interface FilterProps
 * @extends {FilterCheckboxProps}
 * @property {FilterConfig} config - フィルターの設定情報
 */
export interface FilterProps extends FilterCheckboxProps {
  /** フィルターの設定 */
  config: FilterConfig;
}
