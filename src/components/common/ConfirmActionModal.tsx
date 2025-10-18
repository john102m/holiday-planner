import React from "react";
import { GenericModal } from "../GenericModal";

interface ConfirmActionModalProps {
  isOpen: boolean;
  title?: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  isOpen,
  title = "Confirm Action",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <GenericModal
      onClose={onCancel}
      title={title}
      footer={
        <>
          <button onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded">
            {cancelLabel}
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-500 text-white rounded">
            {confirmLabel}
          </button>
        </>
      }
    >
      {message}
    </GenericModal>
  );
};

export default ConfirmActionModal;
