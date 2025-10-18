import React from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  onSave: () => void;
}

const ItineraryActions: React.FC<Props> = ({ onSave }) => {
  const navigate = useNavigate();

  return (
    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex justify-between items-center max-w-3xl mx-auto z-10">
      <button
        onClick={() => navigate(-1)}
        className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-gray-300 text-sm"
      >
        ← Back
      </button>
      <button
        onClick={onSave}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
      >
        💾 Save
      </button>
    </div>
  );
};

export default ItineraryActions;
