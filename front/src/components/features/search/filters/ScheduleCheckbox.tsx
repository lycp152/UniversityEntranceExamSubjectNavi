import GenericCheckboxGroup from "@/components/common/checkbox/SimpleCheckboxGroup";

interface ScheduleCheckboxProps {
  schedule: string[];
  setSchedule: React.Dispatch<React.SetStateAction<string[]>>;
}

const schedules = ["前期", "中期", "後期"];

const ScheduleCheckbox: React.FC<ScheduleCheckboxProps> = ({
  schedule,
  setSchedule,
}) => (
  <GenericCheckboxGroup
    items={schedules}
    selectedItems={schedule}
    setSelectedItems={setSchedule}
    label="日程"
  />
);

export default ScheduleCheckbox;
