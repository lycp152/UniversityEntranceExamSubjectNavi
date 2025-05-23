import type { University } from '@/features/admin/types/university';
import type { EditMode } from '@/features/admin/types/university-list';

/**
 * 大学データを安定的にソートする関数
 *
 * @param universities - ソート対象の大学データ配列
 * @param editMode - 編集モードの状態
 * @returns ソートされた大学データ配列
 *
 * @remarks
 * - 新規データの場合は指定されたindexの位置を維持
 * - それ以外は既存のID順でソート
 * - 安定ソートを保証するため、配列のコピーを作成してソート
 */
export const sortUniversities = (
  universities: University[],
  editMode: EditMode | null
): University[] => {
  return [...universities].sort((a, b) => {
    // 新規データの場合は指定されたindexの位置を維持
    if (editMode?.isNew) {
      const aIndex = universities.findIndex(u => u.id === a.id);
      const bIndex = universities.findIndex(u => u.id === b.id);
      return aIndex - bIndex;
    }
    // それ以外は既存のID順でソート
    return a.id - b.id;
  });
};
