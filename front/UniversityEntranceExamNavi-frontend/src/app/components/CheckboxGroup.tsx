import React, { useEffect, useRef } from "react";
import AllCheckbox from "./AllCheckbox";

interface CheckboxGroupProps<T> {
  items: Record<string, T[]>;
  selectedItems: T[];
  setSelectedItems: React.Dispatch<React.SetStateAction<T[]>>;
  allLabel: string;
  itemLabel: (item: T) => string;
  checkboxType: "region" | "classification";
}

const CheckboxGroup = <T,>({
  items,
  selectedItems,
  setSelectedItems,
  allLabel,
  itemLabel,
  checkboxType,
}: CheckboxGroupProps<T>) => {
  const allRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setSelectedItems((prev) =>
      checked
        ? [...prev, value as T]
        : prev.filter((item) => item !== (value as T))
    );
  };

  const handleAllChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    itemGroup: string
  ) => {
    const { checked } = e.target;
    setSelectedItems(
      checked
        ? [...selectedItems, ...items[itemGroup]]
        : selectedItems.filter((item) => !items[itemGroup].includes(item))
    );
  };

  const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    if (checked) {
      setSelectedItems([
        ...new Set([...selectedItems, ...Object.values(items).flat()]),
      ]);
    } else {
      setSelectedItems([]);
    }
  };

  useEffect(() => {
    if (allRef.current) {
      const allChecked = Object.values(items)
        .flat()
        .every((item) => selectedItems.includes(item));
      const someChecked = Object.values(items)
        .flat()
        .some((item) => selectedItems.includes(item));
      allRef.current.indeterminate = someChecked && !allChecked;
      allRef.current.checked = allChecked;
    }
  }, [selectedItems, items]);

  return (
    <div className="mt-2">
      <label htmlFor={checkboxType} className="block text-gray-700 mb-2">
        {checkboxType === "region" ? "地域・都道府県" : "分類"}
      </label>
      <div className="flex flex-col">
        <div className="flex flex-wrap mb-4">
          <AllCheckbox
            allChecked={Object.values(items)
              .flat()
              .every((item) => selectedItems.includes(item))}
            indeterminate={
              Object.values(items)
                .flat()
                .some((item) => selectedItems.includes(item)) &&
              !Object.values(items)
                .flat()
                .every((item) => selectedItems.includes(item))
            }
            onChange={handleSelectAllChange}
            label={allLabel}
          />
        </div>
        <div className="flex flex-wrap">
          {Object.entries(items).map(([groupName, subItems]) => (
            <div key={groupName} className="flex-1 mb-4">
              <AllCheckbox
                allChecked={subItems.every((item) =>
                  selectedItems.includes(item)
                )}
                indeterminate={
                  subItems.some((item) => selectedItems.includes(item)) &&
                  !subItems.every((item) => selectedItems.includes(item))
                }
                onChange={(e) => handleAllChange(e, groupName)}
                label={groupName}
              />
              <div className="ml-4">
                {subItems.map((subItem) => (
                  <label key={subItem as string} className="block mb-1">
                    <input
                      type="checkbox"
                      value={subItem as string}
                      checked={selectedItems.includes(subItem)}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    {itemLabel(subItem)}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CheckboxGroup;
