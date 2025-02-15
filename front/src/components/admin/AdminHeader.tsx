interface AdminHeaderProps {
  editMode: {
    universityId: number;
    departmentId: number;
    isEditing: boolean;
  } | null;
  onAddNew: () => void;
}

export const AdminHeader = ({ editMode, onAddNew }: AdminHeaderProps) => (
  <div className="flex justify-between items-center mb-6">
    <h1 className="text-2xl font-bold text-gray-900">大学入試科目ナビ - 管理ページ</h1>
    {!editMode && (
      <button
        onClick={onAddNew}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        新しい項目を追加
      </button>
    )}
  </div>
);
