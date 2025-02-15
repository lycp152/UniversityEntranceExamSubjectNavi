import { Department, University } from '@/types/models';

interface DepartmentInfoProps {
  department: Department;
  university: University;
  isEditing: boolean;
  onInfoChange: (field: string, value: string | number) => void;
}

const EditMode = ({
  department,
  university,
  onInfoChange,
}: Omit<DepartmentInfoProps, 'isEditing'>) => {
  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === 'enrollment' ? parseInt(e.target.value, 10) : e.target.value;
    onInfoChange(field, value);
  };

  const major = department.majors[0];
  const examInfo = major?.exam_infos[0];

  if (!major || !examInfo) {
    return null;
  }

  return (
    <div className="px-2 border-l border-gray-200 min-w-[125px]">
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
          <input
            id="schedule"
            type="text"
            value={examInfo.schedule.name}
            onChange={handleChange('schedule')}
            className="w-full text-xs text-gray-600 px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="w-[60px]">
          <label htmlFor="enrollment" className="text-xs text-gray-600">
            募集人数
          </label>
          <input
            id="enrollment"
            type="number"
            value={examInfo.enrollment}
            onChange={handleChange('enrollment')}
            className="w-full text-xs text-gray-600 px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            min="0"
          />
        </div>
      </div>
    </div>
  );
};

const ViewMode = ({
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
      <div className="text-xs text-gray-600 truncate">日程: {examInfo.schedule.name}</div>
      <div className="text-xs text-gray-600 truncate">募集人数: {examInfo.enrollment}人</div>
    </div>
  );
};

export const DepartmentInfo = (props: DepartmentInfoProps) => {
  return props.isEditing ? <EditMode {...props} /> : <ViewMode {...props} />;
};
