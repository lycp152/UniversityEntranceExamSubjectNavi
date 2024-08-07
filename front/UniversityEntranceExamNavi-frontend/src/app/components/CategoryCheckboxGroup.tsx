import React, { useEffect, useRef } from "react";
import AllCheckbox from "./AllCheckbox";

interface CategoryCheckboxGroupProps<T> {
  categories: Record<string, T[]>;
  selectedItems: T[];
  setSelectedItems: React.Dispatch<React.SetStateAction<T[]>>;
  label: string;
  itemLabel: (item: T) => string;
}

const CategoryCheckboxGroup = <T,>({
  categories,
  selectedItems,
  setSelectedItems,
  label,
  itemLabel,
}: CategoryCheckboxGroupProps<T>) => {
  const allRef = useRef<HTMLInputElement | null>(null);

  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setSelectedItems((prev) =>
      checked
        ? [...prev, value as T]
        : prev.filter((item) => item !== (value as T))
    );
  };

  const handleCategoryChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    categoryItems: T[]
  ) => {
    const { checked } = e.target;
    setSelectedItems(
      checked
        ? [...selectedItems, ...categoryItems]
        : selectedItems.filter((item) => !categoryItems.includes(item))
    );
  };

  const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    if (checked) {
      setSelectedItems([
        ...new Set([...selectedItems, ...Object.values(categories).flat()]),
      ]);
    } else {
      setSelectedItems([]);
    }
  };

  useEffect(() => {
    if (allRef.current) {
      const allItems = Object.values(categories).flat();
      const allChecked = allItems.every((item) => selectedItems.includes(item));
      const someChecked = allItems.some((item) => selectedItems.includes(item));
      allRef.current.indeterminate = someChecked && !allChecked;
      allRef.current.checked = allChecked;
    }
  }, [selectedItems, categories]);

  return (
    <div className="mt-2 mb-4">
      <label htmlFor="category-checkbox" className="block text-gray-700 mb-2">
        {label}
      </label>
      <AllCheckbox
        allChecked={Object.values(categories)
          .flat()
          .every((item) => selectedItems.includes(item))}
        indeterminate={
          Object.values(categories)
            .flat()
            .some((item) => selectedItems.includes(item)) &&
          !Object.values(categories)
            .flat()
            .every((item) => selectedItems.includes(item))
        }
        onChange={handleSelectAllChange}
        label="すべて"
      />
      <div className="flex flex-wrap gap-4">
        {Object.entries(categories).map(([categoryName, categoryItems]) => (
          <div key={categoryName} className="flex-1 min-w-[150px] p-2">
            <AllCheckbox
              allChecked={categoryItems.every((item) =>
                selectedItems.includes(item)
              )}
              indeterminate={
                categoryItems.some((item) => selectedItems.includes(item)) &&
                !categoryItems.every((item) => selectedItems.includes(item))
              }
              onChange={(e) => handleCategoryChange(e, categoryItems)}
              label={categoryName}
            />
            <div className="ml-4">
              {categoryItems.map((item) => (
                <label key={String(item)} className="flex items-center mb-1">
                  <input
                    type="checkbox"
                    value={item as string}
                    checked={selectedItems.includes(item)}
                    onChange={handleItemChange}
                    className="mr-2"
                  />
                  <span>{itemLabel(item)}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryCheckboxGroup;
