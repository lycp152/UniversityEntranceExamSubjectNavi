import React, { useState } from "react";
import AllCheckbox from "./AllCheckbox";

interface AcademicFieldCheckboxProps {
  academicField: string[];
  setAcademicField: React.Dispatch<React.SetStateAction<string[]>>;
}

const academicFields = [
  "文学",
  "心理学",
  "哲学",
  "史学・人類学",
  "社会・社会福祉・観光学",
  "語学",
  "法学・政治学",
  "経済・経営・商学",
  "教員養成・教育学",
  "理学",
  "工学",
  "農・林・水産・獣医学",
  "医学",
  "看護・保健・衛生学",
  "歯学",
  "薬学",
  "生活科学",
  "芸術学",
  "体育学",
  "人間・情報科学・総合科学",
];

const AcademicFieldCheckbox: React.FC<AcademicFieldCheckboxProps> = ({
  academicField,
  setAcademicField,
}) => {
  const [allChecked, setAllChecked] = useState(false);
  const [isIndeterminate, setIsIndeterminate] = useState(false);

  const handleAcademicFieldChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value, checked } = e.target;
    if (checked) {
      setAcademicField([...academicField, value]);
    } else {
      setAcademicField(academicField.filter((field) => field !== value));
    }
  };

  const handleAllChange = () => {
    if (allChecked) {
      setAcademicField([]);
    } else {
      setAcademicField(academicFields);
    }
    setAllChecked(!allChecked);
  };

  React.useEffect(() => {
    const allChecked = academicFields.every((field) =>
      academicField.includes(field)
    );
    const someChecked = academicFields.some((field) =>
      academicField.includes(field)
    );
    setAllChecked(allChecked);
    setIsIndeterminate(someChecked && !allChecked);
  }, [academicField]);

  return (
    <div className="mt-2">
      <label htmlFor="academicField" className="block text-gray-700 mb-2">
        学問系統
      </label>
      <AllCheckbox
        allChecked={allChecked}
        indeterminate={isIndeterminate}
        onChange={handleAllChange}
        label="すべて"
      />
      <div className="flex flex-wrap">
        {academicFields.map((field) => (
          <label key={field} className="mr-4 mb-2">
            <input
              type="checkbox"
              value={field}
              checked={academicField.includes(field)}
              onChange={handleAcademicFieldChange}
              className="mr-2"
            />
            {field}
          </label>
        ))}
      </div>
    </div>
  );
};

export default AcademicFieldCheckbox;
