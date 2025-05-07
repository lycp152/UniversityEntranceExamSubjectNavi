/**
 * 基本情報コンポーネント
 *
 * 大学の基本情報を表示・編集するためのコンポーネントです。
 * 大学名、学部名、学科名、日程、募集人数などの情報を表示し、
 * 編集モード時にはこれらの情報を編集できるようにします。
 */
import type { BasicInfoProps } from '@/features/admin/types/basic-info';
import { ADMISSION_SCHEDULE_CONSTRAINTS } from '@/constants/constraint/admission-schedule';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  return value;
};

/**
 * 表示順序を検証します
 * @param order 検証する表示順序
 * @returns 検証結果
 */
const validateDisplayOrder = (order: number): boolean => {
  return (
    order >= ADMISSION_SCHEDULE_CONSTRAINTS.DISPLAY_ORDER_CONSTRAINTS.MIN &&
    order <= ADMISSION_SCHEDULE_CONSTRAINTS.DISPLAY_ORDER_CONSTRAINTS.MAX
  );
};

/**
 * 基本情報コンポーネント
 *
 * @param university - 表示・編集対象の大学
 * @param department - 表示・編集対象の学部
 * @param major - 表示・編集対象の学科
 * @param admissionSchedule - 表示・編集対象の日程
 * @param admissionInfo - 表示・編集対象の募集人数
 * @param isEditing - 編集モードの状態
 * @param onInfoChange - 学部情報の変更を処理するハンドラー
 */
export const BasicInfo = ({
  university,
  department,
  major,
  admissionSchedule,
  admissionInfo,
  isEditing,
  onInfoChange,
}: BasicInfoProps) => {
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
      const value = transformValue(field, e.target.value);
      if (field === 'displayOrder' && !validateDisplayOrder(Number(value))) {
        return;
      }
      onInfoChange(field, value);
    };

  return (
    <div className="px-2 border-l border-gray-300 min-w-[180px]">
      {isEditing ? (
        <>
          <Input
            type="text"
            value={university.name}
            onChange={handleChange('universityName')}
            placeholder="〇〇大学"
            className="w-[164px] p-1 mb-2 bg-background/50 hover:bg-background dark:bg-input/30 dark:hover:bg-input/50"
            aria-label="大学名"
          />
          <div className="flex gap-1">
            <Input
              type="text"
              value={department.name}
              onChange={handleChange('departmentName')}
              placeholder="〇〇学部"
              className="w-[80px] p-1 bg-background/50 hover:bg-background dark:bg-input/30 dark:hover:bg-input/50"
              aria-label="学部名"
            />
            <Input
              type="text"
              value={major.name}
              onChange={handleChange('majorName')}
              placeholder="〇〇学科"
              className="w-[80px] p-1 bg-background/50 hover:bg-background dark:bg-input/30 dark:hover:bg-input/50"
              aria-label="学科名"
            />
          </div>
          <div className="flex gap-1">
            <div className="w-[80px]">
              <label htmlFor="schedule" className="text-xs text-gray-900 dark:text-gray-100">
                日程
              </label>
              <div className="flex items-center">
                <Select
                  value={admissionSchedule.name}
                  onValueChange={value => handleChange('schedule')({ target: { value } } as any)}
                >
                  <SelectTrigger
                    className="w-[65px] p-1 bg-background/50 hover:bg-background"
                    id="schedule"
                    aria-haspopup="listbox"
                  >
                    <SelectValue className="text-sm">
                      {admissionSchedule.name ?? '選択'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {ADMISSION_SCHEDULE_CONSTRAINTS.VALID_NAMES.map(option => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-sm ml-1">期</span>
              </div>
            </div>
            <div className="w-[80px]">
              <label htmlFor="enrollment" className="text-xs text-gray-900 dark:text-gray-100">
                募集人数
              </label>
              <Input
                id="enrollment"
                type="number"
                value={admissionInfo.enrollment || ''}
                onChange={handleChange('enrollment')}
                className="p-1 bg-background/50 hover:bg-background dark:bg-input/30 dark:hover:bg-input/50"
                min="0"
                placeholder="100"
                aria-label="募集人数"
                aria-valuemin={0}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="font-semibold mb-1 truncate">{university.name}</div>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1 truncate">
            {department.name} - {major.name}
          </div>
          <div className="text-xs truncate text-gray-600 dark:text-gray-300">
            日程: {admissionSchedule.name ?? '未設定'}期
          </div>
          <div className="text-xs truncate text-gray-600 dark:text-gray-300">
            募集人数: {admissionInfo.enrollment}人
          </div>
        </>
      )}
    </div>
  );
};
