import React from "react";
import type { EditButtonsProps } from "@/types/universities/university-list";

interface SaveButtonProps {
  onSave: () => void;
}

interface CancelButtonProps {
  onCancel: () => void;
}

export const SaveButton = ({ onSave }: SaveButtonProps) => (
  <button
    onClick={() => window.confirm("変更を保存しますか？") && onSave()}
    className="p-1.5 rounded-full text-green-600 hover:text-green-800 hover:bg-green-50 transition-colors"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  </button>
);

export const CancelButton = ({ onCancel }: CancelButtonProps) => (
  <button
    onClick={() =>
      window.confirm("変更は破棄されますが、よろしいですか？") && onCancel()
    }
    className="p-1.5 rounded-full text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  </button>
);

const EditButton = ({ onEdit }: { readonly onEdit: () => void }) => (
  <button
    onClick={onEdit}
    className="p-1.5 rounded-full text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
    </svg>
  </button>
);

export const EditButtons = ({
  isEditing,
  onEdit,
  onSave,
  onCancel,
}: EditButtonsProps) => {
  if (isEditing) {
    return (
      <div className="flex flex-col space-y-1">
        <SaveButton onSave={onSave} />
        <CancelButton onCancel={onCancel} />
      </div>
    );
  }
  return <EditButton onEdit={onEdit} />;
};
