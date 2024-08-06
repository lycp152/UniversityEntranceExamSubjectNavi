import React, { useState } from "react";
import AllCheckbox from "./AllCheckbox";

interface ScheduleCheckboxProps {
  schedule: string[];
  setSchedule: React.Dispatch<React.SetStateAction<string[]>>;
}

const schedules = ["前期", "中期", "後期"];

const ScheduleCheckbox: React.FC<ScheduleCheckboxProps> = ({
  schedule,
  setSchedule,
}) => {
  const [allChecked, setAllChecked] = useState(false);
  const [isIndeterminate, setIsIndeterminate] = useState(false);

  const handleScheduleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    if (checked) {
      setSchedule([...schedule, value]);
    } else {
      setSchedule(schedule.filter((s) => s !== value));
    }
  };

  const handleAllChange = () => {
    if (allChecked) {
      setSchedule([]);
    } else {
      setSchedule(schedules);
    }
    setAllChecked(!allChecked);
  };

  React.useEffect(() => {
    const allChecked = schedules.every((s) => schedule.includes(s));
    const someChecked = schedules.some((s) => schedule.includes(s));
    setAllChecked(allChecked);
    setIsIndeterminate(someChecked && !allChecked);
  }, [schedule]);

  return (
    <div className="mt-2">
      <label className="block text-gray-700 mb-2">日程</label>
      <AllCheckbox
        allChecked={allChecked}
        indeterminate={isIndeterminate}
        onChange={handleAllChange}
        label="すべて"
      />
      <div className="flex flex-wrap">
        {schedules.map((scheduleName) => (
          <label key={scheduleName} className="mr-4 mb-2">
            <input
              type="checkbox"
              value={scheduleName}
              checked={schedule.includes(scheduleName)}
              onChange={handleScheduleChange}
              className="mr-2"
            />
            {scheduleName}
          </label>
        ))}
      </div>
    </div>
  );
};

export default ScheduleCheckbox;
