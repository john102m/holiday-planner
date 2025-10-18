import React from "react";

interface Props {
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteConfirmModal: React.FC<Props> = ({ onCancel, onConfirm }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/20 p-4">
      <div className="bg-white rounded-lg w-full max-w-sm p-4 shadow-lg">
        <h3 className="text-lg font-semibold mb-2">Confirm Delete</h3>
        <p className="text-sm text-gray-700 mb-4">
          This activity has a note. Deleting it will remove the note. Are you sure?
        </p>
        <div className="flex justify-end gap-2">
          <button
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
