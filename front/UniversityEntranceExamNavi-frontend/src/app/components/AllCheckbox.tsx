import React from "react";

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
  return (
    <label className="block mb-2">
      <input
        type="checkbox"
        checked={allChecked}
        ref={(el) => {
          if (el) {
            el.indeterminate = indeterminate;
          }
        }}
        onChange={onChange}
        className="mr-2"
      />
      {label}
    </label>
  );
};

export default AllCheckbox;
