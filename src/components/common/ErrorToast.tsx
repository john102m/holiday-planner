// components/ErrorToast.tsx
import React from "react";

interface ErrorToastProps {
  errorMessage: string | null;
  onClose: () => void;
}

const ErrorToast: React.FC<ErrorToastProps> = ({ errorMessage, onClose }) => {
  if (!errorMessage) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-800 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 z-50 max-w-xs w-full sm:w-auto">
      <span className="flex-1">{errorMessage}</span>
      <button
        onClick={onClose}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-red-200 text-red-800 hover:bg-red-300 active:bg-red-400 font-bold text-lg"
        aria-label="Close error message"
      >
        ×
      </button>
    </div>
  );
};

export default ErrorToast;
