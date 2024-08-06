import React, { useEffect, useRef } from "react";

interface AllCheckboxProps {
  allChecked: boolean;
  indeterminate: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
}

const AllCheckbox: React.FC<AllCheckboxProps> = ({
  allChecked,
  indeterminate,
  onChange,
  label,
}) => {
  const checkboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <label className="flex items-center space-x-2">
      <input
        type="checkbox"
        ref={checkboxRef}
        checked={allChecked}
        onChange={onChange}
      />
      <span>{label}</span>
    </label>
  );
};

export default AllCheckbox;
