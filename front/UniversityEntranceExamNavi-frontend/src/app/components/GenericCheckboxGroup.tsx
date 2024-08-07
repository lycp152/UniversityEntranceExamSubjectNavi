import React, { useState, useEffect } from "react";
import AllCheckbox from "./AllCheckbox";

interface GenericCheckboxGroupProps {
  items: string[];
  selectedItems: string[];
  setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
  label: string;
}

const GenericCheckboxGroup: React.FC<GenericCheckboxGroupProps> = ({
  items,
  selectedItems,
  setSelectedItems,
  label,
}) => {
  const [allChecked, setAllChecked] = useState(false);
  const [isIndeterminate, setIsIndeterminate] = useState(false);

  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedItems([...selectedItems, value]);
    } else {
      setSelectedItems(selectedItems.filter((item) => item !== value));
    }
  };

  const handleAllChange = () => {
    if (allChecked) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items);
    }
    setAllChecked(!allChecked);
  };

  useEffect(() => {
    const allChecked = items.every((item) => selectedItems.includes(item));
    const someChecked = items.some((item) => selectedItems.includes(item));
    setAllChecked(allChecked);
    setIsIndeterminate(someChecked && !allChecked);
  }, [selectedItems, items]);

  return (
    <div className="mt-2">
      <label className="block text-gray-700 mb-2">{label}</label>
      <AllCheckbox
        allChecked={allChecked}
        indeterminate={isIndeterminate}
        onChange={handleAllChange}
        label="すべて"
      />
      <div className="flex flex-wrap">
        {items.map((item) => (
          <label key={item} className="mr-4 mb-2">
            <input
              type="checkbox"
              value={item}
              checked={selectedItems.includes(item)}
              onChange={handleItemChange}
              className="mr-2"
            />
            {item}
          </label>
        ))}
      </div>
    </div>
  );
};

export default GenericCheckboxGroup;
