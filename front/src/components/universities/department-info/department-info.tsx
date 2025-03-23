import type { DepartmentInfoProps } from "@/types/universities/department";
import { SCHEDULE_OPTIONS } from "@/types/universities/department";

const transformValue = (field: string, value: string): string | number => {
  if (field === "enrollment") {
    return parseInt(value, 10);
  }
  if (field === "schedule") {
    return `${value}期`;
  }
  return value;
};

export const DepartmentInfo = ({
  department,
  university,
  isEditing,
  onInfoChange,
}: DepartmentInfoProps) => {
  const major = department.majors[0];
  const admissionSchedule = major?.admissionSchedules?.[0];
  const admissionInfo = admissionSchedule?.admissionInfos?.[0];

  if (!major || !admissionSchedule || !admissionInfo) {
    return null;
  }

  const handleChange =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      onInfoChange(field, transformValue(field, e.target.value));
    };

  // 日程から「期」を除いた部分を取得
  const currentSchedule = admissionSchedule.name.replace(
    "期",
    ""
  ) as (typeof SCHEDULE_OPTIONS)[number];

  return (
    <div className="px-2 border-l border-gray-200 min-w-[125px]">
      {isEditing ? (
        <>
          <input
            type="text"
            value={university.name}
            onChange={handleChange("universityName")}
            className="w-[120px] font-semibold text-gray-900 mb-1 px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <div className="flex gap-1 mb-1">
            <input
              type="text"
              value={department.name}
              onChange={handleChange("departmentName")}
              className="w-[60px] text-sm font-medium text-gray-700 px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <input
              type="text"
              value={major.name}
              onChange={handleChange("majorName")}
              className="w-[60px] text-sm font-medium text-gray-700 px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-1">
            <div className="w-[60px]">
              <label htmlFor="schedule" className="text-xs text-gray-600">
                日程
              </label>
              <div className="flex items-center">
                <select
                  id="schedule"
                  value={currentSchedule}
                  onChange={handleChange("schedule")}
                  className="w-[50px] text-xs text-gray-600 px-1 py-1 border border-blue-300 rounded-l focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {SCHEDULE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-gray-600 px-1 py-1 border border-l-0 border-blue-300 rounded-r bg-gray-50">
                  期
                </span>
              </div>
            </div>
            <div className="w-[60px]">
              <label htmlFor="enrollment" className="text-xs text-gray-600">
                募集人数
              </label>
              <input
                id="enrollment"
                type="number"
                value={admissionInfo.enrollment}
                onChange={handleChange("enrollment")}
                className="w-full text-xs text-gray-600 px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                min="0"
              />
            </div>
          </div>
        </>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};
