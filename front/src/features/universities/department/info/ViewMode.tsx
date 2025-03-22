import type { DepartmentInfoProps } from "./types";

export const ViewMode = ({
  department,
  university,
}: Omit<DepartmentInfoProps, "isEditing" | "onInfoChange">) => {
  const major = department.majors[0];
  const admissionSchedule = major?.admissionSchedules?.[0];
  const admissionInfo = admissionSchedule?.admissionInfos?.[0];

  if (!major || !admissionSchedule || !admissionInfo) {
    return null;
  }

  return (
    <div className="px-2 border-l border-gray-200 min-w-[125px]">
      <div className="font-semibold text-gray-900 mb-1 truncate">
        {university.name}
      </div>
      <div className="text-sm font-medium text-gray-700 mb-1 truncate">
        {department.name} - {major.name}
      </div>
      <div className="text-xs text-gray-600 truncate">
        日程: {admissionSchedule.name || "未設定"}
      </div>
      <div className="text-xs text-gray-600 truncate">
        募集人数: {admissionInfo.enrollment}人
      </div>
    </div>
  );
};
