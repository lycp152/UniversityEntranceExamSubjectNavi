import type { DepartmentInfoProps } from './types';

export const ViewMode = ({
  department,
  university,
}: Omit<DepartmentInfoProps, 'isEditing' | 'onInfoChange'>) => {
  const major = department.majors[0];
  const examInfo = major?.exam_infos[0];

  if (!major || !examInfo) {
    return null;
  }

  return (
    <div className="px-2 border-l border-gray-200 min-w-[125px]">
      <div className="font-semibold text-gray-900 mb-1 truncate">{university.name}</div>
      <div className="text-sm font-medium text-gray-700 mb-1 truncate">
        {department.name} - {major.name}
      </div>
      <div className="text-xs text-gray-600 truncate">
        日程: {examInfo.admissionSchedules?.[0]?.name || '未設定'}
      </div>
      <div className="text-xs text-gray-600 truncate">募集人数: {examInfo.enrollment}人</div>
    </div>
  );
};
