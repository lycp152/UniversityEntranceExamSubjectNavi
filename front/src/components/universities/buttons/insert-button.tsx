import React from "react";

interface InsertUniversityButtonProps {
  onInsert: (index: number) => void;
  index: number;
  isOnly?: boolean;
}

export const InsertUniversityButton: React.FC<InsertUniversityButtonProps> = ({
  onInsert,
  index,
  isOnly = false,
}) => {
  return (
    <div
      className={`relative flex justify-center items-center ${
        isOnly ? "py-8" : ""
      }`}
    >
      {!isOnly && (
        <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-gray-300 dark:border-gray-600" />
      )}
      <button
        type="button"
        onClick={() => onInsert(index)}
        className="relative z-10 inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
        aria-label="ここに追加"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
        ここに追加
      </button>
    </div>
  );
};
