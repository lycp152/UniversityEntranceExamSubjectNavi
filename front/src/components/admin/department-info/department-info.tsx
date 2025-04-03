/**
 * 学部情報コンポーネント
 *
 * 大学の学部情報を表示・編集するためのコンポーネントです。
 * 大学名、学部名、学科名、日程、募集人数などの情報を表示し、
 * 編集モード時にはこれらの情報を編集できるようにします。
 */
import type { DepartmentInfoProps } from '@/types/universities/department';
import { ADMISSION_SCHEDULE_CONSTRAINTS } from '@/constants/admission-schedule';

/**
 * フィールド値の変換関数
 * 特定のフィールドに対して、表示用または保存用に値を変換します
 *
 * @param field - 変換対象のフィールド名
 * @param value - 変換前の値
 * @returns 変換後の値
 */
const transformValue = (field: string, value: string): string | number => {
  if (field === 'enrollment') {
    return parseInt(value, 10);
  }
  if (field === 'schedule') {
    return `${value}期`;
  }
  return value;
};

/**
 * 学部情報コンポーネント
 *
 * @param department - 表示・編集対象の学部情報
 * @param university - 学部が所属する大学情報
 * @param isEditing - 編集モードの状態
 * @param onInfoChange - 学部情報の変更を処理するハンドラー
 */
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

  /**
   * 入力フィールドの変更を処理するハンドラー
   *
   * @param field - 変更されたフィールド名
   * @returns イベントハンドラー関数
   */
  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      onInfoChange(field, transformValue(field, e.target.value));
    };

  return (
    <div className="px-2 border-l border-gray-200 min-w-[125px]">
      {isEditing ? (
        <>
          <input
            type="text"
            value={university.name}
            onChange={handleChange('universityName')}
            className="w-[120px] font-semibold text-gray-900 mb-1 px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <div className="flex gap-1 mb-1">
            <input
              type="text"
              value={department.name}
              onChange={handleChange('departmentName')}
              className="w-[60px] text-sm font-medium text-gray-700 px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <input
              type="text"
              value={major.name}
              onChange={handleChange('majorName')}
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
                  value={admissionSchedule.name}
                  onChange={handleChange('schedule')}
                  className="w-[50px] text-xs text-gray-600 px-1 py-1 border border-blue-300 rounded-l focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {ADMISSION_SCHEDULE_CONSTRAINTS.VALID_NAMES.map(option => (
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
                onChange={handleChange('enrollment')}
                className="w-full text-xs text-gray-600 px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                min="0"
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="font-semibold text-gray-900 mb-1 truncate">{university.name}</div>
          <div className="text-sm font-medium text-gray-700 mb-1 truncate">
            {department.name} - {major.name}
          </div>
          <div className="text-xs text-gray-600 truncate">
            日程: {admissionSchedule.name || '未設定'}
          </div>
          <div className="text-xs text-gray-600 truncate">
            募集人数: {admissionInfo.enrollment}人
          </div>
        </>
      )}
    </div>
  );
};
